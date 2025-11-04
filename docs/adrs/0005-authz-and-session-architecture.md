# ADR 0005 – Authorization & Session Model

## Status

Accepted – 2025-01-19

## Context

The initial Mobilytics App API used a simple username/password flow that returned bearer tokens directly to clients. It lacked:

1. Role-based authorization beyond basic JWT checks.
2. Support for multi-provider identities (email + Google OAuth).
3. Secure cookie session management for the backoffice app.

As we expand to support platform administrators, support, and operations staff, we need a shared authorization service, global policy enforcement, and a login flow compatible with first-party SPAs hosted on the same domain.

## Decision

We adopt the following architecture for authentication and authorization:

1. **Session Transport** – issue JWTs via HTTP-only, same-site cookies. Any SPA or server-side consumer authenticates purely by presenting the cookie; APIs never expose raw access tokens.
2. **Identity Store** – manage users and `UserIdentity` records in Prisma, keyed by provider (`EMAIL`, `GOOGLE`). Users can authenticate via email/password or Google OAuth.
3. **Authorization Context** – build roles and permission templates at login time using `AuthorizationService`. Roles include `ADMINISTRATOR`, `SUPPORT`, `OPERATIONS`; each maps to policy rules (glob + action strings) stored alongside the JWT payload.
4. **Global Guards** – wrap protected controllers with `JwtAuthGuard` (validates sessions from header or cookie) and `AuthzGuard` (enforces `@Require` metadata with allow/deny sets).
5. **Front-end Guard** – the backoffice app’s `AppShell` loads the `/auth/profile` endpoint on route mount and redirects unauthenticated users to `/login?next=`.

## Consequences

* Backoffice clients gain instant session refresh and logout via cookie-based auth.
* Controllers must annotate endpoints with `@Require(action, resource)` to define policies. Skipping guards or metadata bypasses enforcement.
* Authorization logic centralises around `AuthorizationService`, which must be updated when new roles or resources are introduced.

## Alternatives Considered

* “Keep bearer tokens in localStorage”: rejected due to CSRF exposure and manual token handling in the SPA.
* “Use simple role flags only”: rejected because the allow/deny model provides more granular control (resource path matching).

## Follow-up Work

1. Externalise policy templates into configuration to avoid hardcoding strings in decorators.
2. Implement support/operations management UI to assign staff roles.
3. Add e2e tests covering login + protected route access.
