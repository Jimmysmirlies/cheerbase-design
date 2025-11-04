# Automated Testing TODOs

Tracker for follow-up work aligned with the testing strategy and ADR 0012. Use this list to seed roadmap issues and keep coverage goals visible.

## Setup & Utilities
- ✅ ServiceTestHarness, `.env.test`, and `scripts/service-test-env.sh` landings.
- ⏩ Extend HTTP data builders (`support/data-builders.ts`) to cover invoices, shipments, courier metadata, etc.
- ⏩ Add higher-level scenario helpers (e.g., `createPaidOrder`, `createReturnAuthorization`) composed from the HTTP builders.
- ⏩ Introduce a lint/check script that flags `@tag('requires-justification')` without a matching TODO/issue link (per ADR 0012 follow-up #1).
- ⏩ Document Redis/BullMQ expectations for each worker so specs know whether to await queues or invoke handlers directly.

## Service/API Integration Suite
- ✅ `bootstrap.integration-spec.ts` validates harness bootstrap via the product API.
- ⏩ Add domain coverage specs for:
  - Auth/session guard behaviour (login, profile, forbidden paths).
  - Devices/assets sync triggers (with legacy client stubbed).
  - Contacts & addresses, including default-setting behaviours.
  - Pricing resolver agreement/region rules.
  - Payments edge cases (idempotency, declined webhook).
- ⏩ Track and migrate any temporary white-box specs back to black-box once public endpoints are available.

## End-to-End Flow Tests
- ✅ `order-fulfillment-flow.e2e-spec.ts` covers order → payment → fulfillment → shipment → automation.
- ⏩ Add additional critical flows: returns/exchanges, pricing approvals, automation overrides.
- ⏩ Once backend flows stabilise, re-introduce Playwright smoke/critical suites tied to the same scenarios.

## CI & Tooling
- ⏩ Create a GitHub Actions workflow that runs `pnpm --filter @mobilytics/app-api test:service` alongside unit/e2e suites using the docker-compose Postgres/Redis services.
- ⏩ Capture and publish Jest coverage for the service suite; establish guardrails (start at 70%, ratchet upward).
- ⏩ Publish Playwright traces/videos on CI failure when the browser suite returns.

## Nice-to-haves
- Evaluate Testcontainers or Docker Compose profiles for ephemeral DBs per job to reduce schema cleanup steps.
- Explore Pact or schema contract tests for the frontend API client once domain coverage stabilises.
- Run k6 or similar load tests on the critical API flows and capture target SLOs.
