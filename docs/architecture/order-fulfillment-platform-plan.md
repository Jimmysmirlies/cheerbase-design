# Order, Fulfillment & Shipment Platform – Implementation Plan

> Product context: [Sensor Hardware Orders UI Spec](../specs/sensor-hardware-orders/sensor-hardware-orders.md)

## 1. Goals & Scope
- Deliver a flexible ordering, fulfillment, and shipping backbone that powers sensor hardware orders end-to-end and leaves clean seams for future services (e.g., Retarget).
- Establish robust contact/address management so companies can operate with multiple shipping/billing destinations and role-based contacts.
- Integrate tightly with pricing (current price book, future price agreements) while blocking checkouts on unsynced Stripe prices.
- Introduce a billing/invoice layer so companies can view invoices, payment history, and balances.
- Provide reliable automation hooks that interact with the legacy bridge for company, device, and asset operations.
- Standardise cross-domain communication via the shared domain event bus (see `domain-event-bus.md`) for timelines, automation, and analytics.
- Prepare resolver and UI surfaces for negotiated pricing (see `domain-price-agreements.md`) so company-specific agreements can activate without refactoring core flows.
- Ensure every modern `Company` wraps a `CompanyMirror` so legacy data stays centralised while new domains work off the same identifier.
- Ship with observability, background processing, and admin tooling suitable for Support/Ops teams.

## 2. Core Domains & Ownership
### 2.1 Companies, Contacts, Addresses
- **Company** remains source of truth in new system, linked to legacy by a required `companyMirrorId` that points to the corresponding `CompanyMirror` snapshot.
- **Contact** belongs to exactly one company (`companyId` mandatory); supports multiple roles through `CompanyContactRole`.
- **Roles (fixed taxonomy):** `billing`, `shipping`, `operations`, `technical`, `executive`. Stored as enum; extendable later via migrations.
- **Address** entries follow spec (`docs/specs/addresses/addresses.md`) with optional `companyId`. Shipments reference address snapshot; orders never store a single shipping address.
- **Defaults:** Company can mark default shipping/billing addresses and primary contacts per role.

### 2.2 Orders & Items
- `Order` tracks company, billing contact/address, payment status, fulfillment status, totals, and audit metadata.
- `OrderItem` captures product reference, quantity, and an immutable price snapshot with provenance:
  - `priceTypeSnap`: `PRICEBOOK_GLOBAL`, `PRICEBOOK_REGIONAL`, `PRICE_AGREEMENT`, `BESPOKE`.
  - `priceBookEntryId?`, `priceAgreementId?`, `stripePriceId?`, `bespokeNotes?`.
- Checkout path revalidates prices using the resolver with `strictStripe=true`; failure blocks session creation with actionable error.

### 2.3 Billing & Invoices
- `Invoice` entities tied to orders maintain financial documents with separate references (`INV-000123`), status machine (`draft → issued → partially_paid/paid → void`), due dates, and PDF artifacts.
- `InvoiceLine` mirrors order items with ability to add adjustments/discounts; `PaymentRecord` stores Stripe/manual payments; `PaymentAllocation` tracks partial settlements.
- Invoice issuance triggered automatically on payment (for prepaid orders) or via Support (manual workflow). Balance updates propagate to order summary.

### 2.4 Fulfillment & Shipments
- `FulfillmentOrder` owns state machine (`ready_to_prepare → awaiting_shipment → in_transit → completed | cancelled`) aligned with spec.
- `FulfillmentItem` mirrors remaining qty per order item.
- `Shipment` references `fulfillmentOrderId`, `addressId?`, and stores an embedded address snapshot (`addressSnapshot`) to support ad-hoc destinations. Status machine: `draft → ready → in_transit → delivered | cancelled`.
- `ShipmentItem` ties allocated qtys to `fulfillmentItemId`.
- Courier support seeded for `USPS`, `DHL`, `ChitChat`, `CanadaPost`; additional couriers defined via config table (`courier_code`, name, tracking template, webhook adapter).

### 2.4 Automation
- `AutomationStep` scoped to `shipmentItemId`, scenario enum (`sensor_vendor_first_time`, `sensor_partner_first_time`, `sensor_vendor_replacement`, `sensor_partner_replacement`, `sensor_return`, etc.).
- Store scenario payload as JSONB with typed accessors; track `status`, `attempts`, `lastAttemptedAt`, `errorMessage?`, and `fallbackTriggeredAt?`.
- Automation execution triggered on shipment delivery events; retry policy derived from scenario config.

## 3. Pricing Integration
- Implement `PricingResolverService` that consumes current price book and stubs for future price agreements.
- Resolver returns `PricingResolution` with source, amount, Stripe IDs, sync status, and descriptive labels.
- `OrdersService` and `/v1/pricing/quote` delegate to resolver. Checkout uses `strictStripe=true` to enforce synced prices only.
- Stub `PriceAgreement` integration points (`priceAgreementId` fields, service interface) so future implementation can plug in without rewriting order logic.

## 4. Async Processing & Eventing
### 4.1 Domain Events
- Wrap Nest `EventEmitter2` with `DomainEventBus`.
- Persist emitted events to `DomainEvent` table (`id`, `eventType`, `aggregateId`, `payload`, `createdAt`, `sourceModule`).
- Use event handlers for cross-domain reactions (e.g., `order.paid` → create fulfillment, `shipment.delivered` → enqueue automation processing).
- Timeline UI and metrics service consume persisted events; bus abstraction allows future swap to Kafka/NATS if scale requires.

### 4.2 Background Jobs with BullMQ
- Adopt BullMQ queues (`orders`, `shipments`, `automation`, `retarget`) backed by Redis.
- Store queue metadata in `JobRun` table:
  - `id` (jobId), `queue`, `name`, `status` (`queued`, `active`, `completed`, `failed`, `delayed`), `progress` (0–100), `attempt`, `maxAttempts`, `lastError?`, `relatedEntity` (polymorphic), timestamps.
- Workers update `JobRun` via hooks to expose status to Support UI.
- Configure retries via queue-level defaults; scenario-specific overrides controlled by automation config.
- Long-running tasks (e.g., Retarget export) chunk work: orchestration job enqueues batch jobs (per subset of sensor locations). Ensure workers are idempotent and heartbeat regularly.
- Leave adapter interface (`JobScheduler`) to enable migration to Temporal if/when complex saga workflows emerge.

## 5. Legacy Integration Bridge Alignment
- Maintain mirrors for **Company**, **Asset**, **Device** only – no syncing of addresses or contacts.
- Mirror tables (`CompanyMirror`, `AssetMirror`, `DeviceMirror`) refreshed through existing read-through flows; provide manual refresh endpoints.
- Automation steps call `LegacyBridgeService` methods to update devices/assets (write-through when necessary). All calls logged with correlation ids and surfaced on timeline.
- Add drift detection job (BullMQ cron) to check staleness and flag inconsistent records; results appear in `LegacySyncReport`.

## 6. API Surface (NestJS)
### 6.1 Contacts & Addresses
- `GET /v1/companies/:id/contacts`, `POST /v1/companies/:id/contacts`, `PATCH /v1/contacts/:id`, `POST /v1/contacts/:id/archive`.
- `POST /v1/contacts/:id/roles` manage fixed role assignments.
- Address endpoints per existing spec (+ ability to save ad-hoc shipment address to company book).

### 6.2 Orders & Fulfillment
- `POST /v1/orders` (draft) → returns order with provisional price snapshots.
- `POST /v1/orders/:id/send-checkout` (creates Stripe checkout session when `strictStripe` validation passes).
- `GET /v1/orders/:id`, `PATCH /v1/orders/:id/status`, `POST /v1/orders/:id/cancel`.
- `POST /v1/fulfillments` auto-created but keep endpoint for manual maintenance; `GET /v1/fulfillments/:id`.
- `POST /v1/fulfillments/:id/shipments`, `PATCH /v1/shipments/:id`, `POST /v1/shipments/:id/status`.
- `POST /v1/shipments/:id/automation-steps`, `PATCH /v1/automation-steps/:id`, `POST /v1/automation-steps/:id/retry`, `POST /v1/automation-steps/:id/fallback`.

### 6.3 Pricing & Quotes
- `POST /v1/pricing/quote` (batch pricing resolution).
- `GET /v1/pricing/resolutions/:orderItemId` for audit.

### 6.4 Background Tasks & Monitoring
- `GET /v1/job-runs?queue=&status=` surfaces BullMQ job metadata for Support.
- `GET /v1/shipments/:id/timeline` aggregates domain events, courier updates, automation results.
- `POST /v1/legacy-sync/:entity/refresh` (company/device/asset) initiates refresh.

## 7. Data Model Summary (Prisma Draft)
```
model Company {
  id                 String   @id @default(cuid())
  name               String
  companyMirrorId    String
  contacts           Contact[]
  addresses          Address[]
  orders             Order[]
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model Contact {
  id           String   @id @default(cuid())
  companyId    String
  company      Company  @relation(fields: [companyId], references: [id])
  firstName    String
  lastName     String
  email        String
  phone        String?
  notes        String?
  active       Boolean  @default(true)
  roles        CompanyContactRole[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model CompanyContactRole {
  id        String           @id @default(cuid())
  companyId String
  contactId String
  role      ContactRoleEnum
  createdAt DateTime         @default(now())

  @@unique([companyId, contactId, role])
}

enum ContactRoleEnum {
  BILLING
  SHIPPING
  OPERATIONS
  TECHNICAL
  EXECUTIVE
}
```
*(Additional models for Address, Order, Fulfillment, Shipment, AutomationStep, JobRun, DomainEvent, PricingResolutionSnapshot will follow same conventions; see appendices for schema specifics.)*

## 8. Automation Retry Policy
- Scenario configs defined in code or DB table (`AutomationScenarioConfig`) with fields:
  - `scenario`, `maxAttempts`, `retryDelaySeconds`, `timeoutSeconds`, `fallbackDescription`.
- Worker fetches config before execution; on failure increments attempt count, schedules retry if below max.
- On exceeding attempts: mark step `failed`, emit `AutomationStepFailed` event, and create manual task for Ops (displayed in UI and optionally sent via notification).
- Manual fallback endpoint allows Ops to mark step `fallback_triggered`, record notes, and optionally launch legacy operations.

## 9. Observability & Support Tooling
- Metrics via Prometheus: order throughput, fulfillment lead time, shipment delivery SLA, automation success rate, queue latency.
- Background job scheduler (Nest cron wrappers) orchestrates automation retries, shipment tracking refresh, and nightly legacy mirror sync.
- `JobRun` UI embedded in Support app:
  - Queue overview (per queue counts, in-progress jobs) with wait/processing time averages.
  - Detail view showing progress updates, next retry ETA, last error.
  - Links back to related domain records (order, shipment, automation step).
- Domain event timeline surfaces courier events (from webhook polling) alongside business events.
- Alerting: Slack notifications for automation failures over threshold, queue backlog alerts, legacy sync failures.

## 10. Implementation Phases
### Phase 0 – Foundations
- Finalize Prisma schema for companies/contacts/addresses/orders/fulfillment/shipments/automation/jobs/events.
- Run migrations and seed base data (couriers, contact role enum metadata) plus development fixtures (sample companies, orders, shipments) to exercise the UI end-to-end.
- Set up Nest modules skeletons with contracts but stubbed services.
- Implement DomainEventBus wrapper + persistent store and register foundational subscribers (orders → fulfillment, billing).

### Phase 1 – Contacts & Addresses
- Implement contacts API + UI components (leveraging existing address spec).
- Build address picker with ad-hoc save capability and default handling.
- Add validation rules and dedupe safeguards.

### Phase 2 – Pricing Resolver Integration
- Build resolver service, tests, and `/v1/pricing/quote`.
- Integrate with order creation (draft) storing price snapshots.
- Enforce strict Stripe check during checkout to block unsynced lines.
- Stub price agreements hooks so resolver and UI display placeholders pending dedicated build.

### Phase 3 – Orders, Billing & Fulfillment Core
- **Payments & Order State Machine**
  - [x] Harden order status transitions, failure handling, and retries around Stripe checkout/webhooks.
  - [x] Persist detailed payment audit events and ensure Support UI reflects `order.payment_processing`, `order.payment_failed`, and recovery paths.
- **Fulfillment Orchestration**
  - [x] Create fulfillment orders/items immediately on `order.paid`, allocate quantities, and expose fulfillment status APIs.
  - [x] Implement shipment creation flows, courier configuration (USPS, DHL, ChitChat, Canada Post), and tracking number capture.
- **Billing & Invoicing**
  - [x] Deliver invoice schema/service, automatic issuance on payment, and payment reconciliation via Stripe allocations.
  - [x] Surface invoice list/detail endpoints and connect to Support UI.
- **Timeline & Events**
  - [x] Persist cross-domain events (orders, fulfillment, billing) and expose timeline/notification surfaces for Support and Ops.

### Phase 4 – Shipments & Automation
- [x] Build shipment builder (address selection, allocation guardrails, automation formset).
- [x] Implement automation worker using BullMQ, scenario configs, retry/fallback logic. _(Legacy bridge calls remain stubbed pending integration.)_
- [x] Hook shipment delivery events (webhooks/manual) to enqueue automation processing.
- [x] Expose automation status and manual retry/fallback endpoints.
- [ ] Provide a local development courier event simulator (script, task, or UI trigger) so engineers can replay webhook/polling success flows against the app stack.

### Phase 5 – Background Jobs & Support Monitoring
- [x] Implement `JobRun` persistence, queue hooks, and support-facing endpoints.
- [x] Build UI modules for Support to monitor queue health and job details.
- [x] Add scheduled jobs (legacy sync drift detection, fulfillment completion checks).
- [x] Emit queue metrics endpoints for Grafana/alerts (waiting depth, failure counts, processing latency).

### Phase 6 – Billing Enhancements, Hardening & Retarget Prep
- [ ] Add metrics, logging, alerts, and audit coverage.
- [ ] Extend billing with manual invoices, partial payments, PDF generation, and overdue tracking.
- [ ] Expand integration tests (orders → shipment → automation) and smoke tests.
- [ ] Scaffold Retarget orchestration module leveraging BullMQ chunking for future heavy workflows.
- [ ] Automate Stripe webhook proxying in local dev (e.g., Stripe CLI listener) when the stack boots so checkout flows round-trip without manual steps.
- [ ] Establish dual-delivery or fan-out for Stripe webhooks so the new API forwards events to the legacy service until migration completes.
- [ ] Launch a customer-facing billing portal app to serve checkout success/failure callbacks and surface historical invoices and payment details.
- [ ] Modernise device and asset mirrors with historical assignment tracking, treating this API as the source of truth and syncing back to legacy as needed.

### Phase 7 – Price Agreements Delivery
- [ ] Implement agreement CRUD, Stripe sync, and audit per `domain-price-agreements.md`.
- [ ] Integrate resolver strict mode, checkout enforcement, and Support/Company UI surfaces.
- [ ] Add analytics/notifications for unsynced or expiring agreements.

## 11. Risks & Mitigations
- **Price sync blockers:** Strict Stripe enforcement may block checkout if upstream sync queue lags. Mitigate by instrumenting sync queue SLAs and providing rapid Support tooling to identify unsynced entries.
- **Automation integration with legacy:** Legacy API instability could stall deliveries. Mitigate with circuit breaker already in bridge, idempotent retries, manual fallback tools.
- **Long-running jobs:** Retarget exports must checkpoints progress to avoid redo. Use chunked jobs with idempotent offsets and persist last processed markers.
- **Event bus growth:** Start with in-process emitter; monitor volume. If event throughput grows, plan for external bus but interface remains stable.

## 12. Deliverables Checklist
- Prisma migrations + ERD diagrams (appendix).
- Nest modules with unit/integration tests for resolver, orders, fulfillment, shipments, automation.
- Shared React components (address picker, contact manager, job monitor) aligned with specs.
- BullMQ worker scripts + infrastructure config (Redis setup, queue dashboards locked down).
- Observability dashboards (Grafana/Metabase) and alert routing.
- Documentation updates for API endpoints, background job operations, automation fallback playbooks.

---

**Appendix A – Key Table Fields** *(summaries)*
- `Address`: per spec plus `validationStatus`, `lastUsedAt`.
- `Order`: `billingContactId`, `billingAddressId`, no shipping address; shipments own destinations.
- `Shipment`: `addressSnapshot JSONB`, `courierCode`, `trackingNumber`, `trackingUrl`, status timestamps.
- `JobRun`: see Section 4.2 fields.
- `AutomationStep`: `scenario`, `payload JSONB`, `status`, `attempts`, `maxAttempts` (denormalized from config), `lastError`.

**Appendix B – Queue Configuration Defaults**
- Orders: concurrency 5, attempts 5, backoff exponential starting 60s.
- Shipments (tracking updates): concurrency 10, attempts 3, backoff linear 5m.
- Automation: concurrency 5, scenario-specific attempts (default 3) with 10m delay.
- Retarget (future): concurrency 2, attempts 8, backoff exponential 5m–30m.

**Appendix C – Timeline Event Catalog**
- `order.created`, `order.checkout_sent`, `order.payment_processing`, `order.paid`, `order.payment_failed`, `order.checkout_expired`, `fulfillment.created`, `shipment.drafted`, `shipment.ready`, `shipment.in_transit`, `shipment.delivered`, `automation.step_queued`, `automation.step_succeeded`, `automation.step_failed`, `legacy.sync_requested`, `legacy.sync_completed`.
