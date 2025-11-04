# Configuration Module Overview

Applies: ADR‑0006 (Centralised configuration), ADR‑0007 (Service guidelines)

This document explains how configuration is loaded, validated, and consumed in the App API.

## Goals
- Single source of truth for typed configuration.
- Early validation of required environment variables.
- Consumers inject a typed service instead of reading `process.env`.

## Module Layout
- `AppConfigModule` wraps `ConfigModule.forRoot` and registers typed slices.
- `AppConfigService` exposes getters: `app`, `database`, `jwt`, `stripe`, `googleOAuth`, plus helpers (`isDevelopment`, `isProduction`).
- Validation: `env-validation.schema.ts` validates variables and defaults.

## Common Slices
- `app`: `NODE_ENV`, `PORT`, `FRONTEND_URL`, `CORS_ORIGINS`, `COOKIE_DOMAIN`
- `database`: `DATABASE_URL`
- `jwt`: `JWT_SECRET`, `JWT_EXPIRATION`
- `stripe`: `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`
- `googleOAuth`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`

## Usage
Inject `AppConfigService` into modules/services and rely on typed getters rather than stringly‑typed lookups or raw `ConfigService`.

## Deeper Architecture
- Domain details and examples: `docs/architecture/domain-config.md`
- Decision record: `docs/adrs/0006-config-module.md`

