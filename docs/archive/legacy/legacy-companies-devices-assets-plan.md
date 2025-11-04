# Legacy Companies / Devices / Assets Integration Plan

This document narrows the broader [legacy mirror strategy](legacy-mirrors.md) to the specific entities we need **right now** for the Support app described in [Sensor Hardware Orders - Product UI Spec](../sensor-hardware-orders/sensor-hardware-orders.md) and the extended suite. It focuses on:

- providing a clear contract for the new lightweight legacy endpoints that will be stood up in `mobilytics-api`,
- defining the minimal mirror schemas we will persist in the NestJS facade, and
- mapping those mirrors to the UI flows (order creation, shipment builder, automation steps).

The guiding principle: **only store and ship the fields the Support experience actually needs, plus the legacy IDs required to delegate back to the old system**.

---

## 0. Scope & Objectives

- Entities: `Company`, `Device`, `Asset`.
- Touchpoints: Support creates orders, Ops prepares shipments, automation executes (from the Sensor Hardware Orders spec, sections Sec.3-Sec.6).
- Deliverables:
  1. New read APIs inside the legacy Django app scoped to the required data slices.
  2. NestJS mirrors + services that read-through/write-through against those endpoints.
  3. FE hooks/components that consume the mirrors (company picker, device/asset pickers, automation execution paths).
- Out of scope: pricing, invoices, fulfillment state machines, analytics history, or any metrics beyond the handful required for device/asset freshness.

---

## 1. Support App Touchpoints (why we need each field)

- **Company pickers & detail panes** (Support dashboard, Order detail Sec.3.1/Sec.4.1):
  - show company name alongside the mirror ID so Support can validate they picked the right customer.
- **Shipment builder & automation formsets** (Sec.4.2, Sec.4.3, Sec.6.4):
  - assign devices to shipments by selecting device IDs/serials; no legacy metadata beyond those identifiers.
  - attach assets to automation steps using asset IDs and labels that Support already trusts (production-only slice).
- **Automation execution** (Sec.6.4):
  - backend resolves mirror IDs to legacy IDs to execute assign/swap/return without exposing that provenance to the rest of the app.

---

## 2. Mirror Schemas (NestJS / Prisma)

We keep the mirrors intentionally sparse: cuid primary keys, corresponding `legacy*Id` fields, and only the identifiers Support already trusts (IDs, serials, friendly names). Everything else stays in the legacy system until we introduce net-new services.

### 2.1 CompanyMirror

| Mirror column     | Legacy source    | Required | Notes                                                          |
| ----------------- | ---------------- | -------- | -------------------------------------------------------------- |
| `id`              | generated        | Yes      | cuid served to FE.                                             |
| `legacyCompanyId` | `Company.id`     | Yes      | stringified int.                                               |
| `name`            | `Company.name`   | Yes      | Only legacy text we surface; Support needs a readable label.   |
| `lastSyncedAt`    | generated        | No       | Used for TTL (24h).                                            |
| `externalEtag`    | derived          | No       | Legacy `updated_at` hash for conditional fetch.                |

> We do not mirror any other legacy fields; only the trusted identifiers come across.

### 2.2 DeviceMirror

| Mirror column     | Legacy source       | Required | Notes                                                                  |
| ----------------- | ------------------- | -------- | ---------------------------------------------------------------------- |
| `id`              | generated           | Yes      | cuid.                                                                  |
| `legacyDeviceId`  | `Device.device_id`  | Yes      | Primary key in legacy.                                                 |
| `serial`          | `Device.device_id`  | Yes      | Alias for display/search.                                              |
| `legacyCompanyId` | `Device.company_id` | No       | Retained for quick joins.                                              |
| `companyId`       | FK -> CompanyMirror | No       | Present when we have a mirrored company.                               |
| `legacyAssetId`   | `Asset.id` via FK   | No       | Populated only when device has a production asset.                     |
| `assignmentObservedAt` | generated      | No       | Timestamp we last confirmed the company/asset link.                    |
| `lastSyncedAt`    | generated           | No       | TTL 1h.                                                                |
| `externalEtag`    | derived             | No       | Combine device `modified_at` with asset `modified_at` when available.  |

> Devices marked retired or tied to decommissioned assets are filtered out before mirroring.

### 2.3 AssetMirror

| Mirror column     | Legacy source     | Required | Notes                                                                 |
| ----------------- | ----------------- | -------- | --------------------------------------------------------------------- |
| `id`              | generated         | Yes      | cuid.                                                                 |
| `legacyAssetId`   | `Asset.id`        | Yes      | stringified int.                                                      |
| `label`           | `Asset.nickname`  | Yes      | Fallback to `"Asset {legacyAssetId}"` if nickname missing.            |
| `legacyCompanyId` | `Asset.company_id`| No       | Kept for lineage.                                                     |
| `companyId`       | FK -> CompanyMirror | No     | Null when company not mirrored yet.                                   |
| `legacyDeviceId`  | `Asset.device_id` | No       | Enables pairing with DeviceMirror.                                    |
| `assignmentObservedAt` | generated    | No       | Timestamp we last confirmed the device link.                          |
| `lastSyncedAt`    | generated         | No       | TTL 1h.                                                               |
| `externalEtag`    | derived           | No       | Based on `Asset.modified_at`.                                         |

> Only production assets are mirrored; other environments are skipped entirely.

---

## 3. Assignment Drift Strategy (current state)

The legacy FKs (`Device.company_id`, `Asset.device_id`) sometimes reflect stale assignments. Until we own the full temporal model, the integration layer will enforce a **"current assignment, confidence-checked"** view:

- **Mirror only when verified**: During sync we fetch the device/asset plus the latest rows from the legacy history tables (`device_history`, `asset` tracker fields). If the most recent change is older than our `TTL` window and matches the live FK, we mirror the `companyId` / `legacyDeviceId` link. Otherwise we drop the association and return the device/asset as unassigned to avoid misleading Support.
- **Track verification timestamp**: Store `assignmentObservedAt` in the mirror (optional Date). FE can surface a badge like "Verified May 30" or fall back to "Unverified legacy link" if the timestamp is null.
- **Automation feedback loop**: Whenever our Nest automation service executes an assignment/swap/return, we immediately update the mirrors (and `assignmentObservedAt`) so the Support UI reflects the fresh state even if the legacy system lags.
- **Nightly reconciliation job**: Batch job compares mirrors against legacy history. When it detects drift (e.g. legacy reassigned device yesterday), it refreshes the mirror and records a support-facing event so ops can confirm.

This keeps the active view trustworthy without pretending we can reconstruct perfect historical ranges today. The future tables in Sec.9 will capture full temporal records once we migrate off the legacy system.

---

## 4. Legacy API Surfaces (to be built in `mobilytics-api`)

Expose these under a new namespace (e.g. `/api/legacy-adapter/v1`). All responses should include `etag`/`lastModified` to support mirror freshness checks.

> Legacy Django implementation detail: these endpoints will be mounted under `/v1/external/{entity}` and protected by the existing API v5 key auth handler. The naming below mirrors the Nest-facing contract; translate accordingly when wiring DRF routes.

### 4.1 Companies

- `GET /companies`: filters `q` (name) and `ids[]`.
- `GET /companies/{id}`: returns company ID, name, and metadata for caching.

**Sample response (`GET /companies/{id}`)**:

```json
{
  "id": 123,
  "name": "Acme Transit",
  "updated_at": "2024-05-28T17:22:31Z",
  "etag": "W/\"company:123:1716910951\""
}
```

### 4.2 Devices

- `GET /devices`: filters `company_id`, `q` (matches `device_id`), `ids[]`. Legacy suppresses `retired` devices and anything linked to decommissioned assets.
- `GET /devices/{device_id}`: returns mirror payload plus production asset linkage when present.
- `POST /devices/introspect`: optional bulk endpoint accepting `device_ids[]` to hydrate multiple devices in one call (used for automation execution safety).

**Sample response (`GET /devices`)**:

```json
{
  "data": [
    {
      "device_id": "glnt9483c42e1576",
      "company_id": 123,
      "asset_id": 321,
      "updated_at": "2024-05-28T17:15:00Z",
      "etag": "W/\"device:glnt9483c42e1576:1716910500\""
    }
  ]
}
```

### 4.3 Assets

- `GET /assets`: filters `company_id`, `ids[]`, `q` (nickname/id). Only assets with `environment = PRODUCTION` should appear.
- `GET /assets/{id}`: returns mirror payload, including linked device ID if present.

**Sample response (`GET /assets`)**:

```json
{
  "data": [
    {
      "id": 321,
      "nickname": "Fleet-47",
      "company_id": 123,
      "device_id": "glnt9483c42e1576",
      "updated_at": "2024-05-27T23:10:45Z",
      "etag": "W/\"asset:321:1716851445\""
    }
  ]
}
```

Every endpoint should standardize errors following `legacy-mirrors.md` (`LEGACY_UNAVAILABLE`, `LEGACY_NOT_FOUND`, etc.) so the Nest facade can bubble consistent responses.

---

## 5. Sync & Cache Behaviour

- **GET read-through**: On NestJS `GET` request, load from mirror; if `lastSyncedAt` older than TTL or `if-none-match` fails, fetch from legacy, upsert, then return.
  - Companies: TTL 24h or manual refresh.
  - Devices & assets: TTL 1h; provide `/refresh` endpoints (already outlined in `legacy-mirrors.md`) that accept arrays of legacy IDs for Ops to force updates from UI.
- **Write-through**: For now we only *read* these entities. Future ancillary flows (contacts, shipping details, etc.) will land in greenfield services rather than legacy.
- **Staleness flag**: Mirror responses include `stale: true` when legacy fetch fails but cached data exists (per `legacy-mirrors.md` guidance). FE can surface a banner in pickers.
- **Idempotency**: Automation execution records composite keys (`shipmentId:stepId`) to avoid double-calling legacy assign/swap endpoints.

---

## 6. Implementation Breakdown

### 6.1 NestJS (app-api)

- Extend Prisma schema with the mirror models above (plus indices on `legacy*Id`, `companyId`).
- Create `LegacyHttpClient` (timeouts, retry, breaker) and entity-specific clients with DTOs.
- Implement `companies`, `devices`, `assets` modules:
  - Services that orchestrate read-through logic, TTL checks, and mirror upserts.
  - Controllers that expose `/v1/companies`, `/v1/devices`, `/v1/assets` as defined in `legacy-mirrors.md`.
  - Add `/refresh` POST handlers for devices/assets (batch legacy fetch + mirror update).
- Hook automation execution service to translate mirror IDs -> legacy IDs and call new legacy endpoints.
- Instrument `EventLog` entries for every legacy read/write attempt (success/failure metadata).
- Persist `assignmentObservedAt` whenever we verify the device->company or device->asset link.
- Shape outbound DTOs so the rest of the app only sees mirrored IDs plus trusted labels (company name, device serial, asset nickname).

### 6.2 Legacy Django (mobilytics-api)

- Add dedicated DRF serializers/viewsets for companies, devices, and assets that expose only the whitelisted fields.
- Implement filtering plus lightweight limits (pagination optional given <5k rows) and ETag headers (`Last-Modified`, `ETag`).
- Mount the routes under `/v1/external/{entity}` and secure them with the API v5 key auth handler.
- Ensure new views reside behind API-key protected gateway (same key as Nest client).
- Filter retired/decommissioned data server-side so mirrors never see it.
- When servicing device/asset reads, pull the latest relevant history rows to determine whether the FK is still valid and include an `assignment_observed_at` field in the response.
- Unit tests for each endpoint (serialization, filtering, permissions).

### 6.3 Backoffice Support Frontend (Next.js app)

- Create React Query hooks (`useCompanies`, `useDevices`, `useAssets`) that consume the Nest facade.
- Wire company picker to the facade (IDs + names).
- Update Shipment Builder and Automation Formset to rely on device/asset mirrors (drop any lingering mock data).
- Display assignment verification status (e.g. show timestamp or "Unverified") when `assignmentObservedAt` is missing.
- Surface `stale` indicators and provide "Refresh from Legacy" CTA that hits `/v1/devices/refresh` or `/v1/assets/refresh`.

### 6.4 Ops / Infra

- Store legacy API key in centralized secrets manager; expose to Nest via `LEGACY_API_KEY`.
- Schedule nightly batch job (Nest cron or Temporal) to refresh all companies + active devices/assets.
- Add `/v1/integrations/legacy/health` ping -> new legacy health endpoint (cheap `GET /companies?limit=1`).

---

## 7. Observability & Guardrails

- **Logging**: log structured events for every legacy call (`entity`, `operation`, `durationMs`, `status`, `staleFallback`).
- **Metrics**: failure rate per legacy endpoint, time spent syncing, number of stale responses served.
- **Alerts**: trip when circuit breaker open > 1 minute or when sync job fails.
- **Audit trail**: `EventLog` entries capture automation actions with legacy IDs to trace flows end-to-end.

---

## 8. Confirmed Constraints & Decisions

1. **Contacts**: do not ingest legacy contact data; mirror remains ID + name only. Future contact service will own the experience.
2. **Device filtering**: drop retired devices and anything tied to decommissioned assets at the legacy endpoint level.
3. **Asset filtering**: only mirror assets in the `PRODUCTION` environment.
4. **Volume**: tables stay under ~5k rows, so simple limits (no pagination concern) are acceptable.
5. **Writes**: this integration stays read-only; future greenfield services will own mutations.

With these guardrails locked, the tasks in Sec.6 can kick off immediately.

---

## 9. Future Data Model Evolution (post-legacy)

- **Temporal assignments instead of direct FKs**: When we migrate fully off the Python API, introduce first-class tables such as `CompanyDeviceAssignment` and `DeviceAssetAttachment` with `effectiveFrom`/`effectiveTo`, status, and provenance fields. This preserves historical billing/automation context without overloading the core `Device`/`Asset` records.
- **Mirror behaviour**: Keep mirrors pointing to the *current active* assignment only (by storing the relevant assignment IDs), while background jobs archive completed assignments into the history tables for reporting.
- **API shape**: Expose assignment resources separately (`GET /v1/devices/:id/assignments`, `POST /v1/device-assignments`) so Support tools can schedule future swaps without mutating the device record directly.
- **Migration path**: During transition, populate the new assignment tables from legacy history tables, then gradually detach the hard foreign keys in both systems once confidence is high.

---

**Next step**: kick off Django endpoint work and Nest mirror scaffolding in parallel, keeping responses limited to the trusted fields above.
