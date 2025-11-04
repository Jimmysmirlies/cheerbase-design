# ADR 0006 – Centralised Configuration Module

## Status

Accepted – 2025-01-19

## Context

Historically, the App API initialised `ConfigModule.forRoot` directly in `AppModule` and accessed environment variables inline (`process.env`). This approach caused:

1. Duplicated configuration parsing logic across modules.
2. Lack of validation for critical secrets (JWT, Stripe, OAuth).
3. Difficulty sharing configuration between modules (Auth, Stripe, Prisma).

With the move to cookie sessions, Google OAuth, and seeded environments, we need a single source of truth for typed configuration values.

## Decision

1. **AppConfigModule** wraps `ConfigModule.forRoot` and loads typed registries (`app`, `database`, `jwt`, `stripe`, `googleOAuth`).
2. **AppConfigService** exposes typed getters (`app`, `jwt`, `stripe`, `googleOAuth`, `database`, `isDevelopment`, `isProduction`, `isTest`).
3. **Validation** – environment variables are validated via `class-validator` schema in `env-validation.schema.ts` with explicit defaults.
4. **Consumers** – every service requiring configuration (Auth, StripeSync, bootstrap/Prisma) should inject `AppConfigService` instead of `ConfigService` or `process.env`.
5. **CORS Handling** – the config parser normalises `CORS_ORIGINS`, defaulting to `FRONTEND_URL` when custom origins are not provided.

## Consequences

* Environment config is strongly-typed and cached; runtime reads are consistent.
* All modules share the same defaults while being safe to run in different environments (.env, production secrets).
* Adding new config slices requires updates to the module loader and validation schema.

## Alternatives Considered

* “Use raw `ConfigService` everywhere”: rejected due to repetition and lack of validation.
* “Custom configuration objects per module”: rejected because cross-module settings (JWT secret) would drift.

## Follow-up Work

1. Expand documentation around adding new config slices and required validation.
2. Consider bundling derived values (e.g., cookie max-age) into `AppConfigService` helpers to avoid duplication.
