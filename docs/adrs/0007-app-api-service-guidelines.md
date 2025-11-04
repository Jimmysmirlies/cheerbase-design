# ADR 0007 – App API Service Guidelines

## Status

Accepted – 2025-10-24

## Context

The NestJS `app-api` application has grown new feature domains (products, companies, devices, integrations, etc.) quickly. Each domain exposes a `*.service.ts` that encapsulates the business logic, but we have noticed drift in how these services are structured:

- Some services rely on long chains of relative imports (`../..`) while others already use the `@app/*` path aliases defined in `tsconfig.json`.
- New integrations (for example Stripe sync) added dedicated audit log tables, while other domains still rely on ad hoc logging.
- Service classes vary in the way they scope Prisma transactions, emit domain events, and expose helper functions to controllers.

Without an explicit set of guidelines, every new service risks re-litigating the same architectural trades and spreading inconsistencies.

## Decision

We adopt the following conventions for every new or significantly updated service in `apps/app-api`:

1. **Domain-first module layout**
   - Group files by feature/domain under `apps/app-api/src/<domain>` (`products`, `devices`, `companies`, etc.).
   - Keep the Nest module/controller/service trio co-located; shared helpers for the domain live in the same directory tree.
   - Cross-domain logic should go through a service interface, not reach directly into another domain’s private helpers.

2. **Import conventions**
   - Use the `@app/*` path alias for any dependency that lives outside the current domain folder (`@app/prisma/prisma.service`, `@app/audit/audit.service`, etc.).
   - Use relative imports (`./foo`, `../dto/bar`) only when staying within the same domain tree. This keeps boundaries obvious and eliminates brittle `../../..` paths.
   - Order imports as: Node/third-party, Nest framework, `@app/*` aliases, local relatives.

3. **Service surface & responsibilities**
   - Controllers stay thin; all request orchestration, validation beyond DTO-level, and integration calls live in the service.
   - Service methods return domain-friendly shapes (DTOs or typed objects) rather than raw Prisma models where possible.
   - Keep helpers that do not require DI (pure mapping, formatting) outside the class to make them reusable and testable.

4. **Data access & transactions**
   - Inject `PrismaService` (or a narrower repository abstraction) instead of instantiating Prisma clients ad hoc.
   - Compose multi-step writes inside `prisma.$transaction(...)`, passing a `tx` client down to helpers when they need to participate.
   - When calling other services from inside a transaction, prefer passing the transaction client so downstream code avoids nested transactions.

5. **Audit & operational logging**
   - Every domain that mutates state must define an audit/event table alongside its core tables (e.g. `ProductEvent`, `ProductStripeSyncLog`).
   - Create a dedicated audit helper/service (either reuse `AuditService` or add a domain-specific façade) to standardise event payloads and actor metadata.
   - Mirror the Stripe sync pattern: capture success/failure details, store them in an audit table, and surface a consistent API response to callers.
   - Use Nest’s `Logger` (or a future shared logger) for operational insight, but never substitute logs for persisted audit trails.

6. **Error handling**
   - Throw Nest HTTP exceptions (`BadRequestException`, `NotFoundException`, etc.) from services so controllers do not need to translate low-level errors.
   - Normalize external errors (Stripe, integrations) into friendly messages before logging/auditing them.

7. **Testing expectations**
   - Add focused unit tests for pure helpers and transaction orchestration.
   - Integration tests should go through the public controller or resolver surface, not private service methods.

## Consequences

* File structure and imports clearly communicate whether logic is intra-domain or cross-domain.
* New services default to having the right audit tables/logs instead of retrofitting them after incidents.
* Transactions become predictable, reducing data integrity issues from partial updates.
* Controllers and e2e tests stay simpler because services own error translation and response shaping.

## Alternatives Considered

* **Document only in the README** – rejected; ADRs provide durable context and can be referenced from PR discussions.
* **Rely on lint rules** – abandoned because ESLint cannot currently enforce our alias-vs-relative rule or audit table expectations.
* **Split into multiple ADRs immediately** – deferred; we expect future ADRs to go deeper on cross-domain orchestration or logging once patterns stabilise.

## Follow-up Work

1. Add ESLint import-order rules to encode the alias preference (e.g. via `eslint-plugin-import`).
2. Create a checklist item in the PR template asking contributors to link to this ADR when adding/changing a service.
3. Evaluate a shared `AuditService` extension point so each domain can register its audit writers with minimal boilerplate.
