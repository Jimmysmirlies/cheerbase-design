# Miscellaneous Backlog & Quality Tasks

Lower-priority or cross-cutting items that sit outside the phased roadmap but still need tracking.

## Test Coverage Plan (aligned with `docs/testing/strategy.md` & `docs/testing/todos.md`)

### E2E Critical Path (`apps/app-api/test/order-fulfillment-flow.e2e-spec.ts`)
- [x] Emit Stripe signatures in helpers whenever `STRIPE_WEBHOOK_SECRET` is present (retain JSON fallback for mock mode).
- [x] Improve helper logging so failing webhook calls capture status + body.
- [x] Source USPS webhook secret from `USPS_WEBHOOK_SECRET` for seeds/tests.
- [x] After shipments deliver, assert automation/job telemetry via `/v1/job-runs`.
- [x] Add bootstrap guardrails to confirm Redis workers and payments mode are configured per suite expectations.

### Service/API Integration Suite (ServiceTestHarness – `apps/app-api/test/service-integration/**`)
- All specs interact with the system strictly through public HTTP/webhook endpoints, per ADR‑0012; no direct Prisma writes or guard overrides.
- [ ] `payments.integration.spec.ts`: replay checkout + payment-intent events, verify invoice issuance, idempotency, and legacy fan-out queue. (Initial happy-path coverage implemented; TODO to extend once fan-out lands.)
- [x] `automation-tracking.integration.spec.ts`: simulate shipment delivery, assert tracking + automation job telemetry (now including shipment-linked automation runs and device assignment updates).
- [x] `courier-ingestion.integration.spec.ts`: exercise USPS/DHL webhooks and Canada Post/Chit Chats polling via HTTP helpers, ensuring BullMQ updates shipments end-to-end.
- [x] `legacy-sync.integration.spec.ts`: exercise the device-assignment HTTP surfaces (assign, reassign, close) and verify device listings/histories reflect the lifecycle; follow-up parity check with legacy mirrors will land once replication hooks are ready.
- [ ] `domain-events.integration.spec.ts`: cover outbox retry/backoff, dead-letter handling, and subscriber notifications. (TODO placeholder pending outbox hooks.)
- [ ] Introduce per-spec schema/Redis isolation for the service suite so we can remove `--runInBand` and restore parallel execution without shared-state flakiness.
- [x] `job-monitor.integration.spec.ts`: hit `/v1/job-runs` list/detail, asserting queue/status filtering, entity hydration, and job event exposure. (Remaining follow-up: forward/back pagination + cursor edge cases.)
- [ ] `authz.integration.spec.ts`: login/profile happy path, unauthenticated rejection, role-based allow/deny matrix, and `authzEpoch` refresh behaviour. (Initial auth smoke test added; TODO role matrix + epoch refresh.)

### Unit & Guard Tests
- [ ] `auth/guards/__tests__/authz.guard.spec.ts`: wildcard/deny precedence matrix per ADR‑0007.
- [x] `payments/__tests__/payments.service.spec.ts`: handle payment intent + checkout sessions, illegal transitions, idempotency.
- [ ] `invoices/__tests__/invoices.service.spec.ts`: record stripe payment allocations, duplicate detection, sequence integrity.
- [x] `orders/__tests__/orders.service.spec.ts`: state-machine guards, pricing resolution caching, fulfillment linkage.
- [ ] `auth/guards/__tests__/jwt-auth.guard.spec.ts` & decorators: ensure role-based read/write rules and `authzEpoch` invalidation.
- [x] `automation/__tests__/automation.executor.spec.ts` & worker: payload parsing, retries, status transitions.
- [x] `device-assignments/__tests__/device-assignment.service.spec.ts`: assignment lifecycle, identifier resolution, swap handling.
- [x] `device-assignments/__tests__/device-assignments.controller.spec.ts`: request validation, response formatting, timeline defaults.
- [x] `devices/__tests__/devices.service.spec.ts`: current assignment resolution against modern records.
- [x] `tracking/__tests__/tracking.worker.spec.ts`: courier code normalization, duplicate event dedupe.
- [x] `jobs/__tests__/job-monitor.service.spec.ts`: lifecycle transitions, event logging, entity attachment.
- [x] `common/sequence/__tests__/sequence.service.spec.ts`: sequence incrementation and formatting.
- [x] `events/__tests__/domain-event.service.spec.ts`: retry policy, dead-letter routing, subscriber fan-out.
- [ ] Extract strongly typed Jest helper factories for Prisma/Nest mocks to eliminate repeated `eslint-disable` blocks in service/controller specs.

### Playwright (future per strategy)
- [ ] Re-introduce smoke + critical Playwright suites mirroring scenarios in `docs/testing/strategy.md` once service/API coverage above is stable.
