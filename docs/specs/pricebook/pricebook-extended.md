# Price Book – Extended Pricing & Resolver Spec

> Related architecture:
> - [Domain – Orders & Pricing Integration](../../architecture/domain-orders-pricing.md)
> - [Domain – Price Agreements](../../architecture/domain-price-agreements.md)

*Adds company contracts, deterministic price resolution, and quoting APIs that power orders, invoices, and external integrations.*

---

## 0) Scope & goals

* Support negotiated **company agreements** with optional region, currency, quantity tiers, effective windows, and Stripe parity.
* Provide a single **resolution algorithm** for orders, invoicing, and public APIs.
* Enable **quoting** (`/v1/pricing/quote`) and contract management surfaces in the Price Book UI.
* Snapshot resolved prices onto `OrderItem` for audit and immutability.

Success = Sales/Support can see and edit agreements, the resolver surfaces provenance, and checkout enforces Stripe-synced prices (see `pricebook-unsynced-prices.md`).

---

## 1) Additional data model

### 1.1 Entities

* **PriceAgreement** – company-specific price definition (contract). Supports optional region, min quantity, effective window, sync metadata, and notes.
* **PriceAgreementEvent** – audit log for agreement lifecycle changes.
* **PriceAgreementRequest** (optional future) – workflow for Sales to request approval from Finance.
* **OrderItem** snapshots – store resolved price info for each line item, whether derived from price book, agreement, or bespoke override.

### 1.2 Prisma draft

```prisma
enum PriceScope { GLOBAL REGION COMPANY ORDER }

enum AgreementSyncStatus { UNSYNCED SYNCED FAILED }

model PriceAgreement {
  id             String                @id @default(cuid())
  companyId      String
  productId      String
  currency       String
  region         String?
  unitAmount     Int
  includedUnits  Int?
  minQty         Int?
  active         Boolean               @default(true)
  effectiveStart DateTime?
  effectiveEnd   DateTime?
  notes          String?

  syncStatus     AgreementSyncStatus   @default(UNSYNCED)
  stripePriceId  String?
  lastSyncedAt   DateTime?
  lastSyncError  String?

  product        Product               @relation(fields: [productId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([companyId, productId, currency, region])
  @@index([productId, active])
  @@index([syncStatus])
}

model PriceAgreementEvent {
  id            String   @id @default(cuid())
  agreementId   String
  companyId     String
  productId     String
  type          String   // CREATED | UPDATED | DEACTIVATED | SYNC_SUCCESS | SYNC_FAILED
  actorId       String?
  payload       Json?
  createdAt     DateTime @default(now())

  @@index([agreementId, createdAt])
}

model OrderItem {
  id                String   @id @default(cuid())
  orderId           String
  productId         String
  quantity          Int
  unitPriceCents    Int
  unitLabelSnap     String?
  productNameSnap   String
  includedUnitsSnap Int?
  priceTypeSnap     PriceScope
  priceBookEntryId  String?
  priceAgreementId  String?
  bespokeNotes      String?
}
```

### 1.3 Invariants

* Agreement unique constraint: only one active agreement per `(companyId, productId, currency, region)` overlapping time window. Service-level guard prevents ambiguous matches.
* Editing financial fields on an agreement resets `syncStatus=UNSYNCED` and clears `stripePriceId`.
* Agreements require `unitAmount > 0` and, when `minQty` present, `minQty ≥ 1`.
* Order items must snapshot `unitPriceCents` and provenance fields even when using bespoke overrides (no agreement or price entry link).

---

## 2) Pricing resolution workflow

Resolution is executed by `PricingResolverService` and shared between order creation, checkout, invoicing, and integrations.

### 2.1 Algorithm

1. **Collect context**: companyId (optional), productId, currency, region (optional), quantity, effective date (defaults to now), strictStripe flag.
2. **Eligible company agreements**:
   * Filter active agreements matching company/product/currency, region (exact or null), effective window covering date, `minQty <= qty or null`.
   * Sort by: region specificity (exact > null), higher `minQty`, most recent `updatedAt`.
3. If a candidate exists and passes `strictStripe` (when true requires `syncStatus=SYNCED` and `stripePriceId`), select and return with provenance `{source:'AGREEMENT', id}`.
4. Else evaluate **PriceBookEntry** for same currency + region, active, effective window valid. Apply `strictStripe` guard.
5. If none, fall back to **global price** (currency only, `region=null`).
6. If still none, return `{ok:false, reason:'NO_PRICE'}`.

Bespoke overrides: order authoring surfaces may allow manual unit price entry; the resolver is bypassed but `priceTypeSnap='ORDER'` recorded.

### 2.2 Pseudo-code

```ts
resolvePrice({ companyId, productId, qty, currency, region, effectiveAt = now, strictStripe }: Params): ResolutionResult {
  const agreements = repository.findAgreements(...);
  const agreement = pickBestAgreement(agreements, qty);
  if (agreement && passesStripeGuard(agreement, strictStripe)) {
    return ok({ source: 'AGREEMENT', price: agreement.unitAmount, stripePriceId: agreement.stripePriceId });
  }

  const regional = repository.findRegionalPrice(...);
  if (regional && passesStripeGuard(regional, strictStripe)) {
    return ok({ source: 'PRICEBOOK_REGIONAL', ... });
  }

  const global = repository.findGlobalPrice(...);
  if (global && passesStripeGuard(global, strictStripe)) {
    return ok({ source: 'PRICEBOOK_GLOBAL', ... });
  }

  return failure('NO_PRICE');
}
```

`passesStripeGuard` returns false when `strictStripe=true` and the candidate lacks a synced Stripe price (`stripePriceId` null or `syncStatus!='SYNCED'`). See enforcement details in the unsynced spec.

### 2.3 Caching

* Optional Redis cache keyed by `(companyId|global, productId, currency, region)` storing resolved price for 5 minutes to reduce DB hits during quoting.
* Cache invalidated on agreement or price entry mutation (publish event on `pricebook.updated`).

---

## 3) Service architecture (NestJS)

* `PriceAgreementsModule` – controllers/services for agreements, includes validation, audit logging, sync triggers.
* `PricingResolverService` – pure domain service called by `OrdersModule`, `QuotesController`, and background tasks.
* `AgreementsStripeSyncService` – wrapper around `StripeSyncModule` to create new Stripe Prices when agreements change.
* `QuoteController` – handles `/v1/pricing/quote`, delegates to resolver, emits metrics.

Orders service integration:

* Draft order creation calls resolver with `strictStripe=false` to prefill `unitPriceCents` and provenance fields.
* Checkout (`POST /v1/orders/:id/checkout`) re-runs resolver with `strictStripe=true`; failure path described in unsynced spec.

---

## 4) API contracts

### 4.1 Agreements CRUD

```http
GET /v1/companies/:companyId/price-agreements?productId=&active=&currency=&region=
→ 200 {
  "agreements": [
    {
      "id": "pagmt_1",
      "productId": "prod_123",
      "currency": "USD",
      "region": "US",
      "unitAmount": 8900,
      "minQty": 5,
      "effectiveStart": "2025-01-01",
      "effectiveEnd": null,
      "syncStatus": "unsynced",
      "stripePriceId": null,
      "updatedAt": "2025-01-02T18:00:00Z"
    }
  ],
  "pagination": { "cursor": null, "hasMore": false }
}
```

```http
POST /v1/companies/:companyId/price-agreements
{
  "productId": "prod_123",
  "currency": "USD",
  "region": "US",
  "unitAmount": 8900,
  "minQty": 5,
  "effectiveStart": "2025-01-01",
  "notes": "2025 renewal"
}
→ 201 { "agreement": { ... }, "auditEventId": "evt_456" }
```

`PATCH /v1/price-agreements/:id` updates fields; `POST /v1/price-agreements/:id/deactivate` toggles active; `POST /v1/price-agreements/:id/sync-stripe` triggers sync for that agreement.

### 4.2 Pricing quote

```http
POST /v1/pricing/quote
{
  "companyId": "comp_123",
  "strictStripe": false,
  "items": [
    { "productId": "prod_123", "qty": 6, "currency": "USD", "region": "US" },
    { "productId": "prod_456", "qty": 1, "currency": "USD" }
  ]
}
→ 200 {
  "ok": true,
  "lines": [
    {
      "productId": "prod_123",
      "unitAmount": 8900,
      "source": "AGREEMENT",
      "priceAgreementId": "pagmt_1",
      "stripePriceId": null,
      "syncStatus": "unsynced"
    },
    {
      "productId": "prod_456",
      "unitAmount": 12900,
      "source": "PRICEBOOK_GLOBAL",
      "priceBookEntryId": "pb_789",
      "stripePriceId": "price_999",
      "syncStatus": "synced"
    }
  ]
}
```

If any line fails in strict mode, respond `422` with `{ "code": "UNSYNCED_PRICES", "lines": [...] }` (details in unsynced spec).

---

## 5) Front-end surfaces

### 5.1 Product detail – Company agreements tab

* Table columns: Company, Currency, Region, Unit Amount, Min Qty, Active, Effective window, Stripe status, Updated, Actions.
* Toolbar actions: `New Agreement`, filter by company (searchable), `Sync selected`. Support quick filters for active/unsynced.
* Row actions: `Edit`, `Deactivate`, `Clone`, `Sync to Stripe`, `History` (drawer of `PriceAgreementEvent`).
* Empty state: prompt to “Create a company-specific contract”.

### 5.2 Company profile page (future-ready)

* New tab `Pricing` on `/support/companies/:id` listing agreements scoped to company.
* Provides CTA `Create Agreement` (prefills companyId) and `Open product` link.
* Shows agreements grouped by product with sync badges.

### 5.3 New order wizard integration

* Items step fetches quote with `strictStripe=false`; lines display chips: `Company price`, `Regional price`, `Global price`, or `Bespoke`.
* When manual override entered, UI asks for note (required) and sets `priceTypeSnap='ORDER'` upon save.
* On review step, display resolved amount + provenance details (source label, region, effective window).

### 5.4 Checkout banner

* If checkout fails with `UNSYNCED_PRICES`, show inline banner listing offending lines with CTA linking to Price Book filtered to the relevant product/company (pass query params).

---

## 6) Stripe sync for agreements

* Agreements reuse `StripeSyncModule` but separate queue (`price-agreement-sync`).
* Sync strategy: create new Stripe Price whenever financial fields change; old Stripe prices remain but mark agreement inactive.
* Metadata on Stripe price: `mobilyticsAgreementId`, `companyId`, `productId`, `minQty`, `region`.
* UI shows sync badge: 🟢 synced, 🟠 unsynced, 🔴 failed (with tooltip of `lastSyncError`).
* Optionally allow `Save & Sync` from modal; backend processes create/update via queue.

---

## 7) Data migration & backfill

* Create migration for PriceAgreement models.
* Backfill script to import existing overrides from spreadsheets (CSV importer hitting POST endpoint or direct SQL load followed by `syncStatus=FAILED` until synced).
* For each imported agreement, write `PriceAgreementEvent` of type `IMPORTED` with payload containing source file reference.

---

## 8) Testing & observability

* Unit tests for resolver covering combinations (agreements vs regional vs global, overlapping windows, strictStripe true/false).
* Integration tests hitting `/v1/pricing/quote` with seeded data.
* Contract tests for `/v1/companies/:companyId/price-agreements` ensuring permission enforcement (Support vs Sales vs Admin).
* Metrics: `price_agreement_sync_success_total`, `price_agreement_sync_failed_total`, `price_quote_requests_total`, `price_quote_resolution_ms` histogram.
* Dashboards correlate unsynced agreements to blocking checkouts.

---

## 9) Implementation plan

1. **Phase A – Schema & repository**: add Prisma models, repositories, and audit logging for agreements.
2. **Phase B – Resolver service**: implement algorithm, cover with unit tests, expose to orders service.
3. **Phase C – Agreements CRUD API**: Nest controllers, DTOs, permissions, events.
4. **Phase D – Front-end surfaces**: product detail tab, agreement dialog, company page integration, React Query hooks.
5. **Phase E – Stripe sync**: queue integration, `Save & Sync`, sync status chips, failure flows.
6. **Phase F – End-to-end**: update order wizard + checkout to call resolver, ensure snapshot fields set, run UAT with Sales/Support/Finance.

Completion criteria: Support can create a company agreement, quote it inside an order, sync to Stripe, and successfully check out when all lines are synced.
