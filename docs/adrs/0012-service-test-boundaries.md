# ADR 0012 – Service Test Boundaries and Black-Box Exceptions

## Status

Accepted – 2025-02-14

## Context

As we expand automated coverage for the `app-api`, we now run multiple types of tests:

- Critical-path flow specs such as `order-fulfillment-flow.e2e-spec.ts` that exercise the full request/response cycle.
- Emerging service integration suites powered by the new `ServiceTestHarness`, which spin up the Nest application, isolate schemas, and drive behaviour over HTTP.
- Unit tests for pure helpers and individual services.

The team agreed that service-level tests should behave like true black-box checks—only interacting with the system using the public API surface (REST controllers, webhooks) and never mutating Prisma models directly. At the same time, we occasionally hit scenarios where no production endpoint exists yet (e.g., a write API is still in flight) or where a razor-focused resilience check is easier when bypassing normal setup. Without clear guardrails, these exceptions can erode the discipline we are trying to establish.

We need an explicit policy that:

1. Codifies black-box expectations for integration and end-to-end tests.
2. Defines the small set of sanctioned exceptions and how to document them.
3. Clarifies how we distinguish “core flow” tests from “focused integration” tests as coverage grows.

## Decision

We adopt the following hierarchy for backend automated tests:

1. **Core End-to-End Flow Suites (Critical Paths)**
   - Live alongside current flow specs (e.g., `apps/app-api/test/order-fulfillment-flow.e2e-spec.ts`).
   - Exercise user-visible journeys start to finish (create order → payment → fulfillment → shipment).
   - Operate strictly through public HTTP/webhook endpoints, including data setup/teardown.
   - Use the shared `ServiceTestHarness` to provision isolated schemas, authenticate via `/auth/login`, and let Redis/BullMQ run naturally.

2. **Service Integration Suites (Black-Box)**
   - Located under `apps/app-api/test/service-integration/**`.
   - Must build all data via HTTP (`/v1/products`, `/v1/pricebook`, `/v1/orders`, etc.) or published webhooks.
   - May compose smaller scenarios than the core flows but still treat the API as a black box; guard overrides, direct Prisma writes, and domain service stubbing are **not** allowed.
   - Shared helpers (`TestApiClient`, data builders, webhook emitters) are the only permitted abstractions.

3. **Focused Integration Exceptions (White-Box Escape Hatch)**
   - Rare, temporary tests that bypass the API surface to verify behaviours that cannot yet be exercised externally.
   - Allowed only when all of the following hold:
     - The production endpoint or workflow is not available, and waiting would block meaningful coverage.
     - The spec clearly documents the rationale, links to this ADR, and references the follow-up issue/PR that will restore proper API access.
     - Direct database writes go through dedicated helper utilities that mimic expected API validation and are deleted once the endpoint ships.
   - These tests must use `@tag('requires-justification')` (or the equivalent Jest describe label) so we can search for them easily, and reviewers should challenge their continued existence during PRs.

Additional rules:

- Any new exception must be reflected in the test’s docstring/comments, including a TODO with the ticket/issue ID.
- Exceptions may never modify authentication/authorization guards; we still authenticate through `/auth/login` or public webhooks even when data is seeded manually.
- Once an endpoint exists, the exception test must be refactored back into the black-box suite or removed.

## Consequences

- Developers have a clear default (API-first testing) and understand when and how they can deviate.
- Core flow specs remain high-signal regression checks without accumulating special cases.
- Focused tests can still cover edge conditions while remaining visible and self-correcting.
- The documentation and tooling (`ServiceTestHarness`, command scripts) stay aligned with the policy, reducing future ambiguity.

## Alternatives Considered

- **Pure policy with no documented exceptions** – Rejected because it blocks legitimate coverage when API work lags.
- **Separate test runner for white-box scenarios** – Deferred; current discipline plus tagging is sufficient, and an extra runner would add operational overhead.
- **Allow Prisma mutations broadly** – Rejected to avoid divergence between test setup and real customer flows.

## Follow-up Work

1. Add a linter/check that flags `@tag('requires-justification')` usages without a matching TODO/issue link.
2. Expand the `ServiceTestHarness` helpers with high-level flow builders once the necessary endpoints exist, allowing existing exceptions to migrate back to black-box coverage.
3. Review existing specs for compliance and either update them to the new helpers or document their exception status.
