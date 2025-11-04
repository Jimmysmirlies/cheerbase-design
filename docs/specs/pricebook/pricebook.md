# Price Book – Product & Platform Spec

> Related architecture:
> - [Domain – Orders & Pricing Integration](../../architecture/domain-orders-pricing.md)
> - [Domain – Price Agreements](../../architecture/domain-price-agreements.md)

*A full-scope plan for delivering global/regional pricing, operations tooling, Stripe parity, and programmable APIs for checkout and billing.*

---

## 0) Personas & Principles

* **Finance/Admin** – owns canonical list pricing, approves overrides, monitors Stripe parity.
* **Support (Back Office)** – browses catalog, creates products, adds prices, syncs to Stripe while preparing orders.
* **Sales/Ops** – needs read visibility and ability to request overrides; limited edit authority.
* **Engineering** – maintains resolver, ensures invariants, exposes APIs for other systems.

**Principles**: Single source of truth, deterministic resolution (see `pricebook-extended.md`), explicit sync status, no destructive deletes, strong audit trail, UI-first feedback, modular NestJS services, zero-conf for React Query consumers.

---

## 1) Outcomes & Success Signals

* One authenticated UI at `/settings/price-book` to manage all sellable items.
* API-first design: every action available via REST for automation/importers.
* Stripe sync actions provide deterministic success/failure state and event logging.
* Checkout/new order surfaces can rely on `pricing/quote` without custom logic.
* Release considered complete when Support can create a product, attach multiple regional prices, sync them, and close an order without touching the Stripe dashboard.

---

## 2) Domain Overview

### 2.1 Core entities

* **Product** – sellable item. Holds default price, unit label, domain (hardware/subscription/service), category, activation state, Stripe product pointer, and derived aggregate `syncStatus` (synced if every attached price is synced, failed if any failed, unsynced otherwise).
* **PriceBookEntry** – global or regional price options tied to a Product. Includes currency, region, effective window, sync metadata, activation flags, and notes.
* **ProductStripeSyncLog** – append-only events capturing sync attempts (success/failure, error message, operator) for dashboards and audit.
* **ProductCategory** (optional) – taxonomy reference for filtering and reporting.
* **ProductEvent** – audit timeline records produced for every mutation (products or prices).

See `pricebook-extended.md` for **PriceAgreement** overlays and resolver behaviour.

### 2.2 Schema (Prisma draft)

> See ADR‑0004 for our Prisma style guide (cuid IDs, audit timestamps, snake_case mappings).

```prisma
enum ProductDomain { HARDWARE SUBSCRIPTION SERVICE }
enum PriceSyncStatus { UNSYNCED SYNCED FAILED }

model Product {
  id                   String           @id @default(cuid())
  name                 String
  slug                 String           @unique
  domain               ProductDomain
  category             String?
  description          String?
  unitLabel            String?
  defaultCurrency      String
  defaultUnitAmount    Int
  includedUnits        Int              @default(1)
  active               Boolean          @default(true)
  stripeProductId      String?
  defaultStripePriceId String?
  lastSyncedAt         DateTime?
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt
  priceBookEntries     PriceBookEntry[]
  auditEvents          ProductEvent[]
}

model PriceBookEntry {
  id             String           @id @default(cuid())
  productId      String
  product        Product          @relation(fields: [productId], references: [id])
  currency       String
  region         String?
  unitAmount     Int
  includedUnits  Int               @default(1)
  active         Boolean           @default(true)
  effectiveStart DateTime?
  effectiveEnd   DateTime?
  notes          String?
  isDefault      Boolean           @default(false)
  syncStatus     PriceSyncStatus   @default(UNSYNCED)
  stripePriceId  String?
  lastSyncedAt   DateTime?
  lastSyncError  String?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  @@index([productId, active])
  @@index([currency, region])
  @@index([syncStatus])
}

model ProductEvent {
  id        String   @id @default(cuid())
  productId String
  scope     String   // PRODUCT | PRICE | STRIPE_SYNC
  scopeId   String?
  type      String   // PRODUCT_CREATED | PRICE_CREATED | ...
  actorId   String?
  payload   Json?
  createdAt DateTime @default(now())

  @@index([productId, createdAt])
}
```

### 2.3 Invariants

* `unitAmount > 0`, `includedUnits ≥ 1`.
* Only one `PriceBookEntry.isDefault = true` per product; default must remain active.
* Active prices cannot overlap for the same (product, currency, region) window; enforce on create/update.
* Products cannot be deactivated while an active price exists that is referenced by an open order/checklist.
* Deletions are soft (set `active = false`) to preserve audit integrity.

---

## 3) Back-end Responsibilities (NestJS)

### 3.1 Modules & services

* `ProductsModule` – CRUD for products, validation, slug generation, orchestrates Stripe product creation when requested.
* `PriceBookModule` – CRUD for price entries, overlap guards, default management, audit writes.
* `StripeSyncModule` – Integrates with Stripe SDK, exposes idempotent helpers `syncProduct(productId)` and `syncPrice(entryId)`.
* `PricingModule` – Houses the resolver consumed by orders (details in `pricebook-extended.md`).
* `AuditModule` – Persists ProductEvent records and exposes query API.

Modules share DTOs using `class-validator`, emit camelCase responses, and raise domain exceptions mapped to HTTP 4xx/5xx.

### 3.2 Commands (mutations)

* `POST /v1/products` – create product; seeds default `PriceBookEntry` for provided currency/amount; raises `409` if duplicate slug.
* `PATCH /v1/products/:id` – update fields; prevents removing the last active price; toggling `active=false` requires confirm flag.
* `POST /v1/pricebook` – create price entry; validates unique tuple `(productId, currency, region, overlap)`.
* `PATCH /v1/pricebook/:id` – edits entry; any change to financial fields resets `syncStatus` to `UNSYNCED` and clears `stripePriceId` unless `saveAndSync` option present.
* `POST /v1/pricebook/:id/deactivate` – soft deactivate after ensuring at least one other active price (unless product inactive).
* `POST /v1/pricebook/:id/set-default` – toggles default pointer and updates product `defaultStripePriceId` if synced.
* `POST /v1/stripe/sync/products` – triggers sync for a product (and optionally selected price entries); logs events for monitoring.

All mutations respond with the updated entity plus `auditEventId` for timeline linking.

### 3.3 Queries

* `GET /v1/products` – filters: domain, active, search term, syncStatus; returns aggregated counts (total, active, unsynced).
* `GET /v1/products/:id` – returns product, attached price entries (paginated), aggregate stats, and derived sync badges.
* `GET /v1/pricebook` – list entries with filters currency, region, active, syncStatus, effective window.
* `GET /v1/events?productId=<id>` – fetch recent ProductEvent records (default 50).

List endpoints support cursor pagination (`cursor`, `limit ≤ 100`) and sorting by `updatedAt` descending.

### 3.4 Background jobs

* Optional nightly job `pricebook-sync-status` ensures `syncStatus` stays fresh (e.g., mark stale failed entries).
* Future: `pricebook-metrics` job caches metrics for dashboard header.
* Queue executions (BullMQ recommended) for Stripe sync to keep HTTP responses fast and allow retries.

---

## 4) API Contracts (examples)

```http
POST /v1/products
Content-Type: application/json
{
  "name": "Sensor Pro Kit",
  "domain": "HARDWARE",
  "category": "Sensors",
  "defaultCurrency": "USD",
  "defaultUnitAmount": 9900,
  "unitLabel": "kit",
  "description": "Core sensors bundle",
  "includedUnits": 1,
  "syncToStripe": false
}
→ 201
{
  "product": {
    "id": "prod_123",
    "name": "Sensor Pro Kit",
    "active": true,
    "domain": "HARDWARE",
    "defaultCurrency": "USD",
    "defaultUnitAmount": 9900,
    "includedUnits": 1,
    "syncStatus": "unsynced",
    "stripeProductId": null,
    "defaultStripePriceId": null,
    "createdAt": "2025-01-04T11:00:00Z",
    "updatedAt": "2025-01-04T11:00:00Z"
  },
  "defaultPrice": {
    "id": "pricebook_abc",
    "currency": "USD",
    "region": null,
    "unitAmount": 9900,
    "syncStatus": "unsynced"
  }
}
```

```http
POST /v1/stripe/sync/products
{
  "productId": "prod_123",
  "priceEntryIds": ["pricebook_abc"]
}
→ 200
{
  "synced": [
    {
      "priceBookEntryId": "pricebook_abc",
      "stripePriceId": "price_456",
      "syncedAt": "2025-01-05T22:04:00Z"
    }
  ],
  "failed": []
}
```

Additional quote/checkout contracts live in the extended and unsynced specs.

---

## 5) Front-end Experience (Next.js)

### 5.1 Navigation & routing

* Surface lives at `apps/backoffice-support/src/app/(app)/settings/price-book` with nested routes for product detail (`/products/:id`).
* Data hooks in `src/data/pricebook` using `@tanstack/react-query` for list, detail, create, update, sync.
* Shared UI primitives from `@/components/ui` (table, dialog, dropdown, toast, banner).

### 5.2 Price Book index

* Header: breadcrumbs, title, description, `New Product` button, and `Sync to Stripe` dropdown (`Sync all`, `Sync selection`).
* Filter bar (sticky under header): Domain segmented control, Currency select, Region select (async search), Active toggle, Sync status chip filter, text search.
* Table: virtualized using TanStack Table, columns `Product | Domain | Category | Default Price | Active | Active Prices | Stripe | Updated | Actions`.
* Row actions: `View` (navigate), `Edit Product` (modal), `Add Price` (modal), `Deactivate Product` (confirm).
* Bulk toolbar: appears when rows selected → `Sync selected`, `Deactivate`, `Export CSV`.
* Empty state: `IllustratedEmpty` with CTA `New Product`.
* Loading: skeleton rows; error: `Banner` with retry.

### 5.3 Product detail

* Route `/settings/price-book/products/:id` using nested layout.
* Left column `ProductSummaryCard`: name, domain, category, description, default price, Stripe mapping, unsynced count.
* Right column tabs:
  1. **Price Book** – table of entries with quick filters, badges for `syncStatus`, bulk activate/deactivate, CSV export.
  2. **Audit Log** – timeline from `/v1/events` with actor, diff, sync outcomes.
  3. **Company Agreements** – see `pricebook-extended.md` (agreements table, create/edit modal).
* Entry row actions: `Edit`, `Deactivate`, `Clone`, `Set default`, `History` (opens `AuditDrawer`).

### 5.4 Dialogs & modals

* `NewProductDialog`: multi-section form (General, Pricing), validates required fields, preview of default price.
* `EditProductDialog`: same surface, read-only slug and product ID, toggles active state with confirmation.
* `PriceEntryDialog`: fields for currency, region, unit amount, included units, active, effective dates, notes; includes conflict warning if overlap detected.
* Dialog footer buttons: `Save`, `Save & Sync`, `Cancel` (closes without changes). When `Save & Sync`, front-end calls create/update then triggers sync mutation.
* `ConfirmDialog`: used for deactivation, set default, remove Stripe mapping (if needed).

### 5.5 Notices & banners

* Global info banner surfaces unsynced counts with link to apply `syncStatus=unsynced` filter.
* Toast notifications after create/update/sync; error toasts show first error message returned.
* When `stripeProductId` missing and operator requests `Save & Sync`, UI prompts to create the Stripe product first (confirmation modal triggers backend call).

### 5.6 Component helpers

* `PriceBadge`: `USD • US-East · $99` or `USD · Global · $99` when no region.
* `SyncStatusChip`: statuses `synced` (green/check), `unsynced` (amber/clock), `failed` (red/alert) using design tokens from `sensor-hardware-orders` spec.
* `EffectiveWindowTag`: displays `Active · Jan 1 – Dec 31` or `Scheduled · Starts Feb 1`.

---

## 6) Stripe Sync Semantics

* `Sync all` iterates visible products, enqueues jobs via BullMQ queue `pricebook-stripe-sync`; responses stored in `ProductStripeSyncLog`.
* Each sync creates/updates Stripe Product and any PriceBookEntry lacking `stripePriceId`. Metadata includes `mobilyticsProductId` and `mobilyticsPriceBookEntryId` for reconciliation.
* Update local records with `stripeProductId`, `stripePriceId`, `syncStatus='SYNCED'`, `lastSyncedAt`. Failures capture `lastSyncError`, mark status `FAILED`.
* Event log receives `SYNC_STARTED`, `SYNC_SUCCESS`, `SYNC_FAILED` entries with payload (stripe ids, error detail, actor).
* When new default price is set, update product `defaultStripePriceId` and emit event; old Stripe prices remain but internal entries may be deactivated (never deleted) for audit.

---

## 7) Auditability & history

* Every mutation writes to `ProductEvent` with structured payload diff (`before`, `after`).
* UI timeline groups events by day; clicking event reveals JSON payload for debugging.
* Store `actorId` from JWT; UI resolves to display name using cached user list.
* Retain at least 24 months of history; optional archive job later.

---

## 8) Permissions & roles

* `Admin` – full CRUD and Stripe sync.
* `Support` – create/edit products and prices, run sync; cannot deactivate locked products (future `financeLock` flag).
* `Sales` – read-only; surfaces request CTA (creates ticket) when lacking permission.
* Enforcement via Nest guards; UI hides buttons when unauthorized and displays tooltip.

---

## 9) Metrics, alerts & observability

* Emit Prometheus metrics: `pricebook_sync_success_total`, `pricebook_sync_failed_total`, `pricebook_unsynced_entries` gauge.
* Structured logs tagged `pricebook` with productId, priceEntryId, actor, sync result.
* Alert when `pricebook_sync_failed_total` exceeds threshold within 1h; send to Ops Slack channel.
* Health endpoint `GET /v1/pricebook/health` returns counts for unsynced, failed, total products for dashboards.

---

## 10) Implementation roadmap

1. **Phase 0 – Data scaffolding**
   * Add Prisma models and migrations; create seeds for sample products/prices.
   * Introduce repositories/services with unit tests.
2. **Phase 1 – API CRUD**
   * Build Nest controllers/services for products and price entries with validation and audit logging.
   * Wire React Query hooks targeting mock endpoints (MSW) before backend ready.
3. **Phase 2 – UI delivery**
   * Implement Price Book index table, filters, empty/loading states.
   * Build product detail page, tabs, dialogs, and component catalog.
4. **Phase 3 – Stripe integration**
   * Wire `StripeSyncModule`, BullMQ queue, and sync logs.
   * Implement `Sync all` and per-entry `Save & Sync` flows with optimistic feedback.
5. **Phase 4 – Hardening**
   * Add service/e2e tests, metrics, alerting, and guard rails (overlap validator, permission checks).
   * Conduct accessibility review (keyboard, screen reader) and copy polish with Ops.
6. **Phase 5 – Extended pricing & checkout enforcement**
   * Deliver company agreements, resolver, and strict checkout guardrails per `pricebook-extended.md` and `pricebook-unsynced-prices.md`.
   * Run UAT with Support/Finance to sign off on Stripe parity and auditing.

Deliverable: Production-ready Price Book with reliable Stripe parity and a deterministic pricing foundation for downstream ordering flows.
