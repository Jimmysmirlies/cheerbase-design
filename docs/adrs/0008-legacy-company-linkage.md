# ADR 0008 – Legacy Integration Pattern (Company as Example)

## Status
Accepted – 2025-02-18

## Context
The initial modern schemas sometimes stored legacy identifiers directly on new domain tables (for example `Company.legacyCompanyId`). This duplication made it easy for pointers to drift and encouraged ad-hoc legacy lookups throughout the codebase. We already maintain dedicated mirror tables—`CompanyMirror`, `DeviceMirror`, `AssetMirror`—that hydrate from the legacy API. The company domain is the first fully migrated area, so we use it to establish the pattern for all future legacy integrations.

## Decision
1. Mirror tables remain the single source of legacy truth. In the company example, `CompanyMirror` stores `legacyCompanyId`, name, ETag, and any future mirrored fields (billing codes, tax info, etc.).
2. Modern domain tables reference mirrors via required foreign keys. For companies this is `Company.companyMirrorId` (`@unique`, cascade delete). If we wrap other mirrors in the future (e.g., contacts), we follow the same pattern.
3. Bootstrapping flow: before creating/updating a modern record, ensure the mirror exists (refresh from legacy if needed) and then create the modern row pointing to the mirror. `CompaniesService.ensureModernCompany(legacyId)` will encapsulate the company case; similar helpers should exist for other domains when required.
4. Downstream domains never query legacy IDs directly—they traverse the mirror relation (`company.companyMirror`) to access legacy context for automation, reconciliation, or analytics.
5. Legacy integration endpoints continue to expose mirror data; user interfaces and new APIs should operate on modern models that always wrap mirrors.

## Consequences
- Simpler mental model: if a modern record exists, legacy context is guaranteed because it wraps a mirror.
- Adding mirrored metadata no longer impacts modern tables—only the mirror schema changes.
- Bootstrapping workflows must always ensure mirrors exist first, but this matches the refresh process already in place.
- Existing data requires migration/backfill steps to populate the new foreign keys before removing old legacy fields.

## Implementation Notes
- Prisma schema update: `Company` gains `companyMirrorId` (required) and relation; `CompanyMirror` exposes `companies Company[]`.
- Legacy bridge docs and domain plans updated to state that modern companies always wrap mirrors, and future domains should replicate the pattern if they require mirrored data.
- API/services will introduce helper(s) like `CompaniesService.ensureModernCompany(legacyId)` in upcoming phases to wrap the bootstrap sequence; other domains should follow the same helper-first approach when they wrap additional mirrors.

## Follow-up
1. Add migration/backfill steps when we ship this to environments with existing data.
2. Adjust service-layer helpers to return both modern companies and mirrors where appropriate.
3. Update frontend types once company APIs begin returning modern records alongside legacy mirrors.
