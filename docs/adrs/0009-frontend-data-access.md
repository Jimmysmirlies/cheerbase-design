# 0009 – Frontend Data Access Conventions

## Status
Accepted

## Context
- The backoffice app has grown a diverse set of bespoke API clients, query keys, and cache invalidation calls, which slows feature work and introduces bugs when related data fails to refresh.
- Upcoming phases (pricing, fulfillment) will add more cross-domain mutations and depend on predictable client-side caching.
- We need consistent guidance so all contributors follow the same conventions for API clients, query params, React Query keys, and invalidation logic.

## Decision
We standardise all frontend data access on the following patterns:

1. **API Client Helper**: Introduce `createResourceClient` that composes `apiClient` with a base path, shared query-parameter builder, and typed request/response contracts. Every domain client (companies, addresses, contacts, pricing, etc.) must use the helper.
2. **Query Parameter Serialization**: Use a shared `buildQueryParams` utility that handles arrays, booleans, dates, and removes undefined values. Service-specific clients pass plain objects and never build `URLSearchParams` manually.
3. **React Query Keys**: Centralise key creation under `queryKeys` (e.g., `queryKeys.companies.list(filters)`), returning tuples that encode entity + identifier. Hooks must import and reuse these builders.
4. **Invalidation Registry**: Provide `invalidateResource` that looks up related query keys via a registry (`resourceLinks`). Mutations publish resource touch-points (`{ resource: 'company', id }`), and the registry handles which keys to invalidate (e.g., `companies.detail`, `addresses.byCompany`, `contacts.byCompany`).

## Consequences
- New API clients are trivial to author and automatically follow the same serialization rules.
- Query keys are consistent, meaning cache hits and invalidations are predictable.
- Mutations no longer need to know the full set of related queries. Adding a new consumer only requires updating the registry.
- Existing clients/hooks must be migrated incrementally to the helper and key builders (targeting Phase 2).
- Documentation and linting should encourage developers to use the shared utilities; direct `apiClient.get('/v1/...')` calls become legacy code to phase out.
