# Mobilytics Automated Testing Strategy

This plan defines our end-to-end (E2E) smoke and critical-path coverage and a robust service/API integration test suite for the App Platform. It aligns with our ADRs (notably ADR‑0004, ‑0005, ‑0006, ‑0007, ‑0009, ‑0010) and current architecture across `apps/app-api` (NestJS + Prisma) and `apps/backoffice-support` (Next.js + React Query). Domain-specific “ground truth” invariants and matching specs live in `docs/testing/module-ground-truth.md`; update both documents when rules or coverage change.

## Current Scope and Placement
- Today we run a single API and a single database. Until we introduce multiple APIs/services, tests will be co-located in the apps they validate:
  - Backend unit + controller integration/e2e tests live in `apps/app-api` (`src/**.spec.ts` and `test/**/*.e2e-spec.ts`).
  - Frontend component/unit tests (if/when added) live in `apps/backoffice-support/src/**.test.ts(x)`.
- Browser E2E flows will start simple and, for now, can live under `apps/backoffice-support/e2e/` (Playwright). When we add additional services or orchestration needs, we will move these to a dedicated test runner package (e.g., `apps/e2e`) to manage multi-service startup and cross-service fixtures.

## Objectives
- Catch regressions early in the core Support workflows (login, navigation, price book, orders, payments, fulfillment, shipments, automation).
- Validate service-layer contracts via controller-surfaced integration tests (per ADR‑0007 testing expectations).
- Keep tests fast and reliable, with deterministic seeds and isolated external dependencies.
- Provide a clear developer workflow and CI gates for high signal on every PR.

## Test Shape (Pyramid)
- Unit tests (existing and incremental): fast, pure functions and guards, domain helpers. Run on every push.
- Service/API integration tests: exercise controllers through HTTP with a real Prisma/Postgres database and DI-overridden external clients. Run on every PR and main.
- E2E browser tests (Playwright): smoke on every PR; critical-path suite on main/nightly.

## Tooling & Frameworks
- Backend: Jest + ts-jest driven by the `ServiceTestHarness`, Supertest, Prisma with Postgres 16 (`docker-compose`), BullMQ Redis queues, and scripted helpers in `scripts/service-test-env.sh`.
- Frontend: Playwright (headless), fixtures for seeded admin login and common UI flows when browser automation is enabled.
- External boundaries:
  - Legacy API: override providers (e.g., `LegacyHttpClient`) or point at a local stub server; avoid ad hoc Prisma mutations.
  - Stripe: leave API keys blank in `.env.test`; simulate syncs and payment events via the webhook helpers.
  - Queues/events: prefer letting BullMQ workers enqueue naturally; when a real worker is unavailable, invoke the exposed HTTP endpoint or worker handler explicitly and document the exception.

## Environments & Data
- Database (dev): `docker-compose` Postgres 16 on `5433` and Redis on `6380`.
- Database (test): dedicated instances `postgres-test` on `5434` and `redis-test` on `6381` defined in `docker-compose.yml`; use `scripts/service-test-env.sh start/reset/flush` to manage them without touching dev workloads.
- Harness workflow: `.env.test` seeds defaults for Postgres/Redis URIs and admin credentials. The `ServiceTestHarness` provisions a fresh schema per suite (`svc_<uuid>`), runs `prisma db push`, seeds base data via `seed-base`, and flushes Redis automatically unless a spec opts out.
- Stripe remains in mock mode while running service tests (`STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` blank); suites hit the `/v1/webhooks/stripe` endpoint or stub the provider when necessary.
- Isolation:
  - Service/API tests: build state exclusively via HTTP/webhook helpers; never share mutable fixtures between specs. The harness drops its schema at teardown.
  - E2E (Playwright): follow the same approach—hydrate through endpoints, rely on the env script between runs, keep tests idempotent.

## E2E Tests (Playwright)
Scope covers login/session, core navigation, and golden-path flows. Kept small for PRs (smoke) and extended for nightly (critical path).

Smoke (PR):
1) Login with seeded admin, redirect to app shell; profile loaded; logout works.
2) Companies list loads; filter/search; open company detail with mirrored IDs visible.
3) Hardware devices list and detail; stale/fresh badge renders per seed.
4) Addresses: list and create minimal address; default set behaviour visible.
5) Price Book: view products and price entries; basic filter works.
6) Support Orders: list renders; open order detail; timeline loads events.

Critical Path (main/nightly), in addition to smoke:
1) Create product and price entry → appears in list; sync status chip reflects mocked Stripe sync.
2) Quote pricing for an order (resolver path): agreement > region fallback; unsynced price blocked when `strictStripe=true`.
3) Create draft order (settings + items) → checkout stub → simulate Stripe webhook → order transitions to paid.
4) Fulfillment created on `order.paid`; shipments screen shows allocation; create shipment; status transitions to in_transit → delivered.
5) Courier tracking update triggers shipment event; automation step enqueued (mocked execution) and renders in automation panel.
6) Contacts & roles: add contact, assign `billing` + `shipping` roles; set primary address; UI chips update.

Runner setup:
- Start backend services with `scripts/start-database.sh`; launch frontend/backend apps as needed.
- For service integration runs, use `scripts/stack.sh clean-test` (or `start-test`) to reset Postgres/Redis, run Prisma migrations, seed base fixtures, and run the legacy sync script so companies/devices exist before the suite executes.
- In CI, start `app-api` and `backoffice-support` before Playwright tests; capture traces/videos on failure.

## Service/API Integration Tests (Jest + Supertest)
Guidelines:
- Always bootstrap through `ServiceTestHarness` (per-suite schema, Redis flush, login helper) and drive behaviour with Supertest.
- Authenticate through `/auth/login` using the seeded administrator credentials; guard overrides are reserved for rare white-box exceptions documented in the spec. Every spec should fetch a company via `/v1/companies` and build the rest of its fixtures via HTTP calls (addresses, contacts, products, etc.), mirroring the pattern in `order-fulfillment-flow.e2e-spec.ts`.
- Manage Postgres/Redis with the stack helper (`scripts/stack.sh clean-test` for a full reset or `start-test` to reuse state); suites assume containers are running but own their schema lifecycle via the shared data builders.
- Exercise async subsystems by default: allow BullMQ queues to enqueue jobs and, when needed, trigger webhook endpoints instead of calling workers directly.
- Build fixtures exclusively through public HTTP/webhook helpers—no direct Prisma mutations. The harness drops the throwaway schema during teardown.
- See [ADR 0012](../adrs/0012-service-test-boundaries.md) for the black-box policy and the requirements for any temporary escape hatch.

Coverage by domain (representative cases):
- Auth: email/password login; cookie session set; `/auth/profile` returns user; guards block without session; `@Require` enforcement paths.
- Companies: search by name and legacy ID; get detail returns mirror linkage.
- Devices/Assets: search + pagination; refresh endpoints enqueue sync (mocked legacy client); presenter shapes.
- Addresses: CRUD; set default; list by company; validation errors.
- Contacts: CRUD; add/remove roles; set primary address; list by company.
- Price Book: product CRUD; price entry CRUD; serializers; sync status transitions recorded in audit.
- Pricing Resolver: agreement preferred; region fallback; strict mode blocks unsynced; totals and currency math.
- Orders: create draft; add items; state machine constraints; audit events emitted.
- Payments: checkout session created (mocked Stripe); webhook events update order and invoice; idempotency behaviour.
- Fulfillment: created on `order.paid`; allocation rules; status transitions; events.
- Shipments: create/update; track status; tracking number update; courier event ingests; presenter shapes.
- Couriers: CRUD; validation.
- Events/Timeline: persisted events and listing grouped by entity.

## CI Integration
- For now (single API/DB):
  - Unit + API integration: Node 20; start Postgres; `pnpm prisma:app-api:push` + seed; run Jest (unit + controller e2e) in `@mobilytics/app-api`; collect coverage.
  - Optional browser E2E: build and start `app-api` and `backoffice-support`; run Playwright smoke (if present) under `apps/backoffice-support/e2e` on PR; extend to critical-path on main/nightly later.
- Future (multi-service orchestration): introduce `apps/e2e` with its own job to start/coordinate multiple APIs/DBs.
- Caching: pnpm store + Playwright browsers; Prisma client cache.
- Artifacts: Playwright traces/videos and Jest reports on failure.
- Quality gates: per-package coverage thresholds (start at 70% rising to 80%+), required smoke suite green.

## Developer Workflow
- Start dev DBs: `scripts/start-database.sh`
- Start service-test DB/Redis: `scripts/service-test-env.sh start`
- Reset + seed service-test stack: `scripts/service-test-env.sh reset`
- Run backend unit/integration: `pnpm --filter @mobilytics/app-api test` and `pnpm --filter @mobilytics/app-api test:e2e`
- Run service integration suite: `scripts/run-service-integration-tests.sh` (wraps stack reset + `pnpm --filter @mobilytics/app-api test:e2e` until we split the command)
- Browser E2E (when enabled): `pnpm --filter @mobilytics/backoffice-support e2e`

## Example Pattern (Order → Payment → Fulfillment → Shipment → Automation)
- Bootstrap harness → authenticate admin via `TestApiClient.login`.
- Create product/price data with `createHardwareProduct` + `createPriceEntry`.
- Issue order drafts through `createOrderDraft` helper (backs onto `POST /v1/orders`) and trigger checkout via `sendOrderCheckout`.
- Simulate payment success by posting to `/v1/webhooks/stripe` with the webhook helper.
- Fetch fulfillment IDs through `getOrder` and create shipments via `/v1/fulfillments/:id/shipments`.
- Drive courier updates using `emitUspsWebhook`, allowing tracking workers to process BullMQ jobs; fall back to direct worker invocation only when explicitly justified.

## Milestones
Phase 0 – Foundations (Complete)
- ServiceTestHarness, env scripts, and `.env.test` defaults landed.
- ADR 0012 codified black-box expectations and exception handling.

Phase 1 – Service/API Coverage (In Progress)
- Add HTTP-first specs for remaining domains (auth, devices, contacts, invoices, etc.) using shared builders.
- Flesh out webhook simulators for additional integrations as they appear.

Phase 2 – Critical Path E2E
- Grow the flow suite beyond `order-fulfillment-flow.e2e-spec.ts` to cover additional journeys (pricing resolver, returns, automation review).
- Revisit Playwright smoke/critical suites once we stabilise high-signal backend flows.

Phase 3 – Hardening
- Negative-path coverage (failed payments, invalid shipments), rate limiting, circuit breaker behaviour, retry resilience.
- Migrate any temporary white-box specs back to black-box once the requisite API surfaces exist.

## Notes
- Keep ADR cross-links in tests where patterns are encoded (e.g., guards, pricing resolver behaviour).
- Prefer testing via public surfaces; avoid white-box coupling to private helpers unless they are pure and stable.
