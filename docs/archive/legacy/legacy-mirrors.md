# 0) Objectives

* **Hide legacy** from the front-end behind a **stable NestJS facade**.
* **Read-through / write-through** pattern with **local mirrors** for performance and joinability.
* Clear **ID strategy** (`legacy*Id` vs new `id`) and **provenance**.
* **Safe writes** with retries, timeouts, and idempotency.
* Minimal **front-end surfaces** to attach companies/devices/assets to orders, shipments, and automation.

---

# 1) Architecture Overview

```
Front-end  →  NestJS API (facade)
                 ├─ companies.controller / service  ──► LegacyCompanyClient (API key)
                 ├─ devices.controller / service    ──► LegacyDeviceClient
                 ├─ assets.controller / service     ──► LegacyAssetClient
                 └─ fulfillment/automation service  ──► legacy device/asset ops
                 + prisma (mirrors + references)
```

* All FE calls go to **/v1/** under NestJS.
* NestJS decides when to serve from **mirror** vs **live legacy**.
* **Service-to-service auth** to legacy via static API key (header), with **timeouts** and **circuit-breakers**.

---

# 2) Data Model (Prisma) — Mirrors & References

(You already have most; add the missing bits.)

```prisma
model CompanyMirror {
  id              String   @id @default(cuid())
  legacyCompanyId String   @unique
  name            String
  primaryEmail    String?
  lastSyncedAt    DateTime?
  externalEtag    String?

  addresses       Address[]  // as defined earlier (companyId optional)
  // joins
  orders          Order[]
}

model DeviceMirror {
  id            String   @id @default(cuid())
  legacyDeviceId String  @unique
  companyId     String?         // optional owner in legacy
  model         String?
  serial        String?
  status        String?         // e.g., 'active','retired'
  lastSyncedAt  DateTime?
  externalEtag  String?
  // no direct relations to keep it light
}

model AssetMirror {
  id            String   @id @default(cuid())
  legacyAssetId String   @unique
  type          String?
  label         String?
  lastSyncedAt  DateTime?
  externalEtag  String?
}
```

> In your **automation** children you continue to store **legacy IDs** (`legacyDeviceId`, `legacyAssetId`) to execute swaps/assignments. Use mirrors for search/labels/joins and to display names in the UI.

---

# 3) ID Strategy

* **Public FE IDs** = new cuids (`CompanyMirror.id`, `DeviceMirror.id`, `AssetMirror.id`).
* Each mirror also stores **`legacy*Id`** (string) — never expose directly to FE.
* When FE needs to *choose* a device/asset, it searches **via mirror** and you translate to legacy IDs when calling legacy.

---

# 4) Sync Patterns

### Read-through cache (on GET)

* If mirror **missing or stale** (`lastSyncedAt > TTL` or **If-None-Match**/`externalEtag` mismatch):

  1. fetch from legacy
  2. upsert mirror
  3. serve response from mirror

### Write-through (on POST/PATCH that must hit legacy)

* Validate → call **legacy** → if success, upsert mirror → return mirror.
* If legacy fails: return **4xx/5xx** with normalized error.

### TTLs

* Companies: 24h (or ETag-driven)
* Devices/Assets search: 1h (or on-demand refresh button for Ops)

---

# 5) Resilience

* **Timeout** legacy calls (e.g., 3–5s) + **retry** (1–2 times) on 5xx/timeout with jitter.
* **Circuit breaker** per client (trip on repeated failures; serve mirrors with `stale=true` hint).
* **Idempotency** on actions (assign/swap/return): use a **composite key** `shipmentId:stepId` recorded in an `AutomationExecution` table or EventLog.

---

# 6) Front-End API Surfaces (what your app calls)

### Companies (facade)

```
GET   /v1/companies?query=&limit=&cursor=      // search (by name/email); read-through refresh
GET   /v1/companies/:id                        // mirror detail (ensures freshness)
GET   /v1/companies/:id/addresses              // mirrored addresses (refresh if stale)
POST  /v1/companies/:id/addresses              // create/update; write-through if legacy owns
```

**Response shape (example)**

```json
{
  "id":"cm_...", "name":"Acme Inc", "primaryEmail":"ops@acme.com",
  "stale": false, "legacy": {"source":"legacy","syncedAt":"..."}
}
```

### Devices

```
GET   /v1/devices?companyId=&q=&status=&limit=&cursor=     // search devices for pickers
GET   /v1/devices/:id                                      // mirror detail (with stale flag)
POST  /v1/devices/refresh                                  // force re-sync by legacyDeviceId[]
```

**For automation UI:** list devices for a **company** and by **query** (model/serial).

### Assets

```
GET   /v1/assets?companyId=&q=&type=&limit=&cursor=
GET   /v1/assets/:id
POST  /v1/assets/refresh
```

### Automation actions (execute on legacy via facade)

> These are **server-only** actions invoked by delivery processing or manual override; FE never hits legacy directly.

```
POST  /v1/automation/assign-devices
{
  "companyId":"cm_...",                // our mirror id
  "deviceIds":["dm_...","dm_..."],     // our mirror ids
  "context":{ "shipmentId":"...", "stepId":"..." }
}

POST  /v1/automation/swap-device
{
  "existingDeviceId":"dm_...",
  "replacementDeviceId":"dm_...",
  "assetId":"am_...?",
  "context":{ "shipmentId":"...", "stepId":"..." }
}

POST  /v1/automation/record-return
{
  "deviceId":"dm_...",
  "context":{ "shipmentId":"...", "stepId":"..." }
}
```

The service **maps mirrors → legacy IDs**, calls legacy with API key, logs to `EventLog`, and marks execution idempotent.

---

# 7) NestJS Modules & Clients

```
src/integrations/
  legacy-company.client.ts   // GET /companies, GET /companies/:id, addresses
  legacy-device.client.ts    // search/list, detail (by legacy id)
  legacy-asset.client.ts     // search/list, detail
  http.client.ts             // Axios instance with API key, timeouts, retry, circuit breaker

src/companies/
  companies.controller.ts
  companies.service.ts       // mirror-aware: read-through, write-through

src/devices/
  devices.controller.ts
  devices.service.ts         // search via legacy, cache into mirror

src/assets/
  assets.controller.ts
  assets.service.ts

src/automation/
  automation-exec.service.ts // assign/swap/return using legacy clients
```

**HTTP client config:**

* Header: `x-api-key: <legacy-api-key>`
* `timeout: 5000ms`, `maxRetries: 2`, `retryOn: [ETIMEDOUT, 429, 5xx]`
* Circuit breaker (rolling window) to fail fast after N consecutive errors.

---

# 8) DTOs (examples)

```ts
// CompaniesController
export class SearchCompaniesDto {
  query?: string; limit?: number; cursor?: string;
}
export class CompanyDto {
  id: string; name: string; primaryEmail?: string;
  stale?: boolean; legacy?: { source: 'legacy'; syncedAt?: string };
}

// DevicesController
export class SearchDevicesDto {
  companyId?: string; q?: string; status?: string; limit?: number; cursor?: string;
}
export class DeviceDto {
  id: string; legacyDeviceId: string; serial?: string; model?: string; status?: string;
  stale?: boolean;
}
```

---

# 9) How FE attaches to orders/automation

* **New Order / Shipment**: FE supplies **our mirror IDs** (`companyId`, `addressId`).
* **Automation**: FE adds steps with **mirror IDs** for devices/assets.
  Back-end resolves to legacy IDs **at execution time** (delivery) or when the step is created (your choice—execution time is safer).

---

# 10) Security & Permissions

* **FE auth** (JWT/session) → role-guard routes (`support`, `ops`, `admin`).
* **Legacy S2S auth** via API key in the **clients**, not exposed to FE.
* Log every legacy mutation with `EventLog.actor = 'system:legacy-adapter'` + verb.

---

# 11) Observability

* `EventLog` for all syncs and executions (`kind: SYSTEM | BUSINESS`, `verb`, `payload` excerpt).
* **Health endpoint** `/v1/integrations/legacy/health` that pings a cheap legacy endpoint with timeout.
* Optional **metrics**: total requests, error rate, circuit-breaker state.

---

# 12) Error Handling (normalized)

Return structured errors to FE:

```json
{
  "code":"LEGACY_UNAVAILABLE",
  "message":"Legacy API not reachable",
  "retryAfterMs": 30000,
  "staleDataUsed": true      // if you served mirror anyway
}
```

Other codes:

* `LEGACY_CONFLICT`, `LEGACY_NOT_FOUND`, `LEGACY_VALIDATION`, `TIMEOUT`, `RATE_LIMITED`.

---

# 13) Migration Path

1. Start with **read-through** only (companies, devices, assets).
2. Add **write-through** for addresses (if new system owns addresses).
3. For devices/assets, keep **actions in legacy** (assign/swap/return).
4. When ready to migrate domains, switch clients to new services; your FE remains unchanged.

---

# 14) Quick Checklists

**Build now**

* [ ] Legacy HTTP client with API key, timeouts, retry, breaker
* [ ] Prisma mirrors for Company/Device/Asset (+ indices on `legacy*Id`)
* [ ] Companies: search + detail + addresses (read-through)
* [ ] Devices/Assets: search + detail (read-through)
* [ ] Automation exec endpoints (assign/swap/return) → call legacy
* [ ] EventLog writes + error normalization

**Soon after**

* [ ] Admin job to refresh mirrors nightly
* [ ] Manual “Refresh from Legacy” buttons in Ops (optional)
* [ ] Health check & metrics dashboards
