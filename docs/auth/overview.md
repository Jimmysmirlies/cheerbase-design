# Authentication & Authorization Overview

Applies: ADR‑0005 (Authorization & session model), ADR‑0006 (Configuration), ADR‑0007 (Service guidelines)

This document summarizes how authentication and authorization work across the Mobilytics backoffice and App API, with links to deeper architecture notes.

## Goals
- Cookie-based JWT sessions for first‑party apps.
- Centralized allow/deny policy enforcement via guards.
- Clear front‑end contract for login, profile, and logout.

## Server Components
- Endpoints: `/auth/login`, `/auth/logout`, `/auth/profile`, `/auth/google`, `/auth/google/callback`.
- Guards: `JwtAuthGuard` validates sessions, `AuthzGuard` enforces `@Require(action, resource)`.
- Authorization context: roles (`ADMINISTRATOR`, `SUPPORT`, `OPERATIONS`) mapped to allow/deny templates at login.
- Session transport: HTTP‑only cookie containing a signed JWT with roles and policy claims.

## Frontend Integration
- App Shell: the backoffice `AppShell` fetches `/auth/profile` and redirects unauthenticated users to `/login`.
- API client: include cookies on every request (`credentials: 'include'`) and surface 401s to trigger logout.
- React Query: cache the profile and invalidate on logout or session changes.

## Configuration
Use `AppConfigService` for all auth‑related settings (ADR‑0006):
- `JWT_SECRET`, `JWT_EXPIRATION`
- Cookie domain and environment flags
- Google OAuth keys (optional in lower envs)

## Deeper Architecture
- Domain details and flow diagrams: `docs/architecture/domain-auth.md`
- Policy design and rationale: `docs/adrs/0005-authz-and-session-architecture.md`

