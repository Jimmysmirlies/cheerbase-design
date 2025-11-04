# Delivery Backlog – Detailed Work Items

This document consolidates the outstanding engineering work across backend, frontend, and operations so it stays aligned with the domain architecture plans. Treat each checkbox as a ticket-sized unit. Reference docs are noted per section.

---

## Phase 3 · Orders, Billing & Fulfillment Core

### Payments & Order State Machine
_Refs: order-fulfillment-platform-plan §Phase 3, domain-orders-pricing.md_
- [x] Replace the mock checkout in `OrdersService.sendCheckout` with live Stripe session creation via `PaymentsService` (handles mock mode fallback when keys absent).
- [x] Implement the Stripe webhook controller (`/v1/webhooks/stripe`) that verifies signatures and drives `order.payment_processing`, `order.paid`, `order.payment_failed`, `order.checkout_expired`.
- [x] Persist payment audit rows (`OrderEvent`, `DomainEvent`, invoices) via `PaymentsService` and `InvoicesService`.
- [x] Update Support UI (order detail, KPI bar) to surface new payment states and failure messaging from the real webhook flow.
- [x] Add integration tests covering draft → checkout → webhook → fulfillment trigger (HTTP surface e2e). (Automation worker assertions tracked separately.)

### Billing & Invoicing Domain
_Refs: domain-billing-invoices.md_
- [x] Add Prisma models/migration for `Invoice`, `InvoiceLine`, `PaymentRecord`, `PaymentAllocation`.
- [x] Implement `InvoicesModule` issuance + Stripe payment recording used by `PaymentsService`.
- [x] Extend invoices API surface: global list with filters (status/company/date), manual lifecycle actions (void, manual payment), and PDF rendering stub.
- [x] Add automated coverage for invoice issuance + payment allocation flows.

### Fulfillment, Shipments & Courier Tracking
_Refs: domain-fulfillment-shipments.md_
- [x] Expand `ShipmentsService` to persist `ShipmentEvent` records, recompute fulfillment status, and emit `shipment.*`/`fulfillment.*` events on transitions.
- [x] Gate fulfillment completion on automation success; `ShipmentsService.recomputeFulfillmentStatus` currently marks `COMPLETED` as soon as every shipment is delivered, even if automation steps remain in-flight.
- [x] Build courier adapter layer (USPS, DHL, Chit Chats, Canada Post) with credentials loaded from `Courier.metadata`; support webhook/polling ingestion and return normalised events to the API.
  - [x] USPS webhook adapter normalises payloads, validates metadata-driven secrets, and enqueues tracking jobs.
  - [x] DHL Express (MyDHL + Unified Tracking) adapter with shared normalisation helpers + credential loader.
  - [x] Canada Post polling adapter (XML normaliser) + Chit Chats polling integration with rate limiting.
- [x] Implement an initial tracking ingestion worker (BullMQ job or cron) that processes those events and updates shipments end-to-end.
  - [x] BullMQ `shipment-tracking` queue + worker persist courier events, update shipment statuses, emit `shipment.event_recorded`, and hydrate `JobRun` telemetry.
  - [x] Trigger automation scenarios when shipments reach terminal states and expose tracking job run summaries via Support API.
- [x] Add read endpoints for shipment timelines (`GET /v1/shipments/:id/events`) and extend `/v1/orders/:id/timeline` using recorded courier events.
- [x] Make Support order summary reflect terminal fulfillment state once automation succeeds (verified via order fulfillment service tests and updated summary presenter).
- [x] Extend automation assertions/endpoints so e2e can verify automation job completion without manual inspection (covered in `order-fulfillment-flow.e2e-spec.ts` and automation telemetry endpoints).

### Testing & Tooling
- [x] Introduce isolated test infra: `postgres-test` (5434) and `redis-test` (6381) in docker-compose; helper script `scripts/start-test-database.sh`.
- [x] Convert order automation e2e to hit real HTTP routes with guards overridden; use per-spec Prisma schema and in-memory queues with worker handlers to exercise production code paths.
- [x] Add shared test utilities (`apps/app-api/test/utils`) for common auth helpers and service stubs; extend with factories as new suites are added.

### Domain Event Bus & Timeline
_Refs: domain-event-bus.md_
- [x] Add `DomainEvent` Prisma model + outbox persistence in `DomainEventService.publish`.
- [x] Implement dispatcher worker that replays undelivered events, retries with backoff, and marks `deadLetter` on failure.
- [x] Register subscribers for payments, fulfillment, shipments, billing to publish events.
- [x] Replace ad-hoc timeline aggregation with reads from `DomainEvent` (orders timeline endpoint) and ensure Support UI renders delivery vs business lanes.

### Metrics, Seeds & Ops
- [x] Provide real metrics endpoint (`/v1/orders/metrics`) sourcing outstanding orders, active fulfillments, shipments in-flight, returns pending.
- [x] Extend dev seed (`pnpm dev-seed`) with invoices, payments, courier events to support full demo flows.
- [x] Seed job monitor telemetry (automation + tracking queues) and a ready-to-prepare fulfillment example for Support demos.
- [x] Document Stripe key management, courier credential storage, and BullMQ requirements in `docs/onboarding.md`.

---

## Frontend Alignment (ADR‑0009/0010/0011)
- [x] Migrate remaining API clients (orders detail, fulfillments, shipments, price book, assets/devices) to `createResourceClient`.
- [x] Adopt server-side data loading + React Query hydration on the remaining App Router pages (orders list/detail, fulfillment board, shipments, price book).
- [ ] Introduce shared TanStack Table & combobox primitives, migrate first screen (e.g., Settings › Addresses) as reference, then roll out per screen plan.
- [ ] Update invalidation registry / query helpers to cover orders ↔ fulfillments ↔ shipments ↔ invoices.
- [ ] Extend `AGENTS.md` with guidance on the data layer conventions and enforce via ESLint rule/codemod.
- [ ] Add Storybook (or docs) examples illustrating SSR + hydration pattern and table/picker components.

### Phase 3 UI Surfaces
- [ ] Order detail screen: render real payment status states, surface Stripe failure details, wire “Resend checkout” to `ordersV1Api.sendCheckout`.
- [x] Orders list/KPI bar: pull metrics from `/v1/orders/metrics` and surface failure/in-flight payment counts.
- [ ] Invoice list/detail pages: consume `/v1/invoices`, render invoice lines, payment history, and link back to order/company.
- [ ] Shipment timeline: adopt dual-lane rendering (business vs courier) using `DomainEvent` timeline data and courier links.
- [ ] Fulfillment board/detail: display courier labels from `/v1/couriers`, shipment event history, automation job status chips.
- [ ] Automation UI: show job progress and fallback actions in shipment automation panel once telemetry is live.

### Phase 4 UI – Shipments & Automation
- [ ] Enhance shipment builder with allocation guardrails, credential awareness, and inline automation scenario selection.
- [ ] Surface automation job progress/fallback controls in shipment/fulfillment views once BullMQ workers land.
- [ ] Provide courier tracking event feed with filtering by courier vs business events.
- [ ] Add automation scenario configuration views for Support (read-only) showing retries/payloads.

### Phase 5 UI – Background Jobs & Monitoring
- [ ] Build Support “Background Jobs” dashboard showing queue health, job runs, and drill-down detail.
- [ ] Add job run badges/status banners to related entities (orders, shipments, automation steps).
- [ ] Expose retry/cancel actions in the UI with confirmation modals tied to job-run APIs.

### Phase 6 UI – Billing Hardening & Retarget Prep
- [ ] Extend invoice pages with manual actions (issue/void, record payment), PDF downloads, overdue warnings.
- [ ] Add AR widgets (outstanding balances, overdue invoices) to company and Support dashboards.
- [ ] Scaffold retarget orchestration monitoring UI (batch progress, export links) once backend queue is ready.

### Phase 7 UI – Price Agreements
- [ ] Implement price agreement list/detail forms aligned with `domain-price-agreements`.
- [ ] Integrate agreement status indicators into order pricing flows and highlight unsynced/expiring deals.
- [ ] Add analytics widgets and notifications for price agreement performance (upcoming expiry, sync failures).

### Data Access (ADR‑0009)
- [x] Convert remaining API clients to use `createResourceClient`.
- [ ] Replace ad-hoc React Query keys with helpers from `lib/query-keys.ts`; migrate existing hooks to central key definitions.
- [ ] Extend mutation invalidation helpers so orders ↔ fulfillments ↔ shipments ↔ invoices stay consistent.
- [ ] Add guardrails (lint rule or codemod) preventing direct `apiClient` usage in feature code.
- [x] Migrate order pricing flows (new order wizard) off `/api/*` mocks to the new `/v1` clients.

### Data Loading (ADR‑0010)
- [x] Update `/customers/companies/[companyId]` to fetch company, addresses, and contacts server-side.
- [x] Update `/settings/addresses` and `/settings/contacts` pages to SSR + hydrate React Query.
- [x] Adopt the server-first + client hydration pattern on orders list/detail, fulfillment board/detail, shipments, price book, automation.
- [ ] Document an example SSR + hydration implementation (guide or Storybook MDX).
- [x] Wire order creation/checkout flow to `/v1/orders` + `/v1/pricing/quote`.

### Collection UX (ADR‑0011)
- [ ] Scaffold shared TanStack Table utilities (`components/ui/table-toolkit`) and migrate a reference screen (Settings › Addresses).
- [ ] Introduce shared combobox picker (virtualised `Command`) and replace large selects (company picker, address picker, contact roles, courier picker).
- [ ] Produce migration plan + tracking table for remaining lists (orders, fulfillment board, shipments, price book, automation jobs).
- [ ] Add Storybook stories (or docs) covering the new table toolkit and combobox components.

### Tooling & Docs
- [ ] Extend `AGENTS.md` with guidance on resource clients, query keys, SSR hydration.
- [ ] Add ESLint rule (or codemod checks) enforcing query key imports from `lib/query-keys`.
- [ ] Capture UI-specific runbooks in `docs/onboarding.md` (environment variables, API base, Storybook usage).

---

## Phase 4 · Shipments & Automation
_Refs: order-fulfillment-platform-plan §Phase 4, domain-automation-async.md, domain-fulfillment-shipments.md_
- [x] Finalise `AutomationScenarioConfig` seeding (max attempts, delays, fallback instructions) and wire configs into `AutomationService`.
- [x] Implement BullMQ bootstrap for automation + shipment tracking queues (Redis config, health checks, graceful shutdown).
- [x] Build `AutomationWorker` handlers for all sensor scenarios (first-time, replacements, returns) with legacy bridge integrations and event emission.
  - [ ] Call legacy bridge clients per scenario (device provisioning, replacements, returns) and surface structured outcomes in `AutomationAttempt`. _(Stubbed in runner; full bridge integration deferred.)_
  - [x] Handle failure → fallback transitions with DomainEvent emission and Support-facing messaging.
- [x] Introduce enriched shipment tracking workers that pull courier events from BullMQ, emit JobRun telemetry, and enqueue automation when deliveries complete.
- [x] Persist `JobRun` / `JobRunEvent` updates from queue listeners and expose `/v1/job-runs` list/detail APIs.
- [x] Expand Support UI to monitor automation jobs (status chips, retry/fallback controls) and surface automation payload tooling.
- [ ] Define manual fallback workflow (notes, notifications, SLA) and codify in docs/runbooks.
- [ ] Add integration tests covering shipment delivery → automation queue → success/failure paths (BullMQ + sqlite harness).
- [x] Courier tracking implementation plan:
  - [x] Lock shipping configuration model (per-carrier credentials, webhook settings, polling cadence) and management API.
  - [x] Build carrier adapters (USPS webhooks, DHL Express webhook/unified API, Canada Post & Chit Chats pollers) that normalise events and enqueue `tracking.update` jobs on BullMQ.
  - [x] Extend shipment tracking worker to persist normalised events, trigger automation when terminal states land, and update `JobRun` telemetry for Support UI.
- [ ] Ship a local development courier event simulator (script, scheduled task, or UI trigger) that replays webhook/polling successes to exercise end-to-end flows.

---

## Phase 5 · Background Jobs & Support Monitoring
_Refs: order-fulfillment-platform-plan §Phase 5, domain-automation-async.md_
- [x] Implement background job scheduler registry (cron/EventBridge handoff) for shipment tracking refresh, legacy sync drift checks, automation retries.
- [x] Extend `JobRun` APIs with filter/pagination, include related entity summaries (order, shipment, automation step).
- [x] Build Support-facing job monitor UI (queues overview, job detail drawer, manual retry controls).
- [x] Emit queue health metrics (depth, failure counts, processing latency) and wire into Grafana/alerts.
- [ ] Document operational runbooks for restarting workers, clearing dead-letter events, and handling stuck jobs.

---

## Legacy Integration & Data Hygiene
_Refs: ADR‑0008, notes.md legacy section_
- [x] Finish company bootstrap sync to create modern `Company` records for every `CompanyMirror` and ensure sequence counters stay in sync (`SyncService.syncCompanies` / `CompaniesService.ensureModernCompanyRecord`).
- [x] Schedule recurring sync jobs (Nest cron → future EventBridge) so `SyncService.syncAll` runs nightly in each environment.
- [x] Update `/v1/devices` and `/v1/assets` to accept modern company IDs and translate to legacy IDs internally.
- [ ] Remove legacy identifiers from `/v1/devices` and `/v1/assets` responses and require modern IDs for all queries, leaving legacy usage to mirror/export layers only.
- [ ] Extract legacy sync responsibilities (mirror refresh, assignment replication) into a dedicated integration module driven by the event bus so core `DevicesService`, `AssetsService`, and `CompaniesService` no longer reference legacy concepts directly and side effects remain isolated.
- [ ] Instrument circuits & metrics for legacy bridge calls (success/failure counts, breaker state).
- [x] Replace automation step JSON payloads with structured tables (`automation_device_assignments`, `automation_replacement_actions`, `automation_return_actions`) linked to the new assignment domain.
- [x] Ship `DeviceAssignmentService` + Prisma models (`Device`, `Asset`, `DeviceAssignment`) so modern assignment history is authoritative and legacy mirrors become write-through.
- [ ] Mirror devices and assets into modern wrappers with historical assignment windows (device↔company, device↔asset) and treat this API as the source of truth while syncing back to legacy.
- [ ] Extend `/external/v1` legacy endpoints to accept mirrored automation updates (assignments, replacements, returns) with idempotency keys and publish contract docs/tests.
- [ ] Introduce Prometheus exporter for legacy bridge metrics (success/failure, circuit state) and expose aggregated counters.
- [ ] Migrate BullMQ/job monitor metrics to Prometheus gauges/counters and keep Redis as the queue backing store only.
- [ ] Persist legacy automation idempotency keys/events so retries survive restarts and surface in audit trails.
- [ ] Add automated reconciliation job/tests to flag modern vs legacy assignment drift and log actionable alerts when mismatches appear.

---

## Testing, Observability & CI
- [ ] Add backend integration test suites for payments workflow, fulfillment aggregation, invoice issuance, automation queue (sqlite + BullMQ).
- [ ] Cover domain event dispatcher retry/dead-letter behaviour with service-level tests.
- [ ] Add frontend RTL/Playwright coverage for order wizard, shipment creation, timeline dual-lane rendering, and invoice views.
- [ ] Wire Prometheus/Grafana dashboards for key metrics (orders paid latency, shipment SLA, automation failures, queue depth).
- [ ] Expand CI pipeline to run lint, typecheck, backend integration tests, frontend tests, and build artifacts.
- [ ] Provision private ACM cert + TLS termination for internal ALB, remove `aws-elb-http-not-used` suppression once complete (ref ADR‑0005, infra/terraform/phase0).

---

## Documentation & Enablement
- [ ] Refresh `docs/onboarding.md` to cover Stripe, courier credentials, BullMQ, dev seed usage, and the new event bus.
- [ ] Add architecture-to-implementation traceability notes per domain (link modules, DTOs, workers).
- [ ] Publish runbooks for payment webhook recovery, courier ingestion failures, and automation fallback procedures.
- [ ] Keep `docs/roadmap-todo.md` and `docs/backlog-misc.md` in sync as ownership shifts between roadmap and miscellaneous work.
- [ ] Expand courier tracking documentation (shipping configuration model, adapter workers, BullMQ flow) in `domain-automation-async.md` and related guides.
- [ ] Document and ship the staff account provisioning/authz model (architecture notes + API surface).

---

## Phase 6 · Billing Enhancements & Retarget Prep
_Refs: order-fulfillment-platform-plan §Phase 6, domain-billing-invoices.md, domain-automation-async.md_
- [ ] Extend billing to support manual invoices (draft → issue → void), partial payments, and PDF generation (render + signed URL storage).
- [ ] Add overdue reminder jobs with configurable cadence and notification channels (Support digest, Slack/email).
- [ ] Instrument comprehensive logging/metrics for payments, invoices, automation failures, and shipment SLA breaches.
- [ ] Harden system with smoke/end-to-end tests covering order → payment → fulfillment → invoice + automation success/failure.
- [ ] Scaffold retarget orchestration module (BullMQ or Temporal-ready) with chunked export workflow and monitoring hooks.
- [ ] Automate Stripe webhook proxy setup (Stripe CLI listener or similar) during dev/test stack bootstrap so local checkouts trigger webhooks without manual steps.
- [ ] Implement Stripe webhook fan-out so the new API ingests events and forwards required payloads to the legacy service until migration completes.
- [ ] Build a customer-facing billing portal app to handle checkout success/failure redirects and expose invoice/payment history for companies.

---

## Phase 7 · Price Agreements Delivery
_Refs: order-fulfillment-platform-plan §Phase 7, domain-price-agreements.md, pricebook docs_
- [ ] Implement Price Agreement CRUD (prisma models already present) with audit trail, effective dates, and company/product scoping.
- [ ] Integrate agreements into pricing resolver strict mode, including Stripe sync enforcement and error reporting.
- [ ] Build Support UI for creating/updating agreements, viewing sync status, and highlighting expiring/unsynced deals.
- [ ] Emit analytics/notifications for unsynced or expiring agreements and surface in dashboards.
- [ ] Add integration tests covering agreement lifecycle, resolver precedence, and checkout enforcement paths.

---

Update this ledger as items land or scope shifts. Mark tasks complete with `[x]`, and provide links to PRs or tickets when applicable.
