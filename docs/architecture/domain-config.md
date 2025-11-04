# Domain Architecture – Configuration System

> Applies ADRs: 0004 (Prisma/Nest style), 0006 (configuration module), 0007 (service guidelines). Shared dependency for all other domains.

## 1. Purpose
- Provide a single, validated entry point for environment configuration across the App API.
- Expose typed getters so feature modules avoid direct `process.env` usage.
- Support environment-specific defaults (local vs staging vs production) while keeping bootstrap reliable.

## 2. Responsibilities & Boundaries
- **Owns:** Loading `.env` files, validating environment variables, mapping to typed config slices, exposing helper flags (`isDevelopment`, etc.).
- **Collaborates:** Auth/JWT module, Payments (Stripe), Google OAuth, CORS setup in `main.ts`, infrastructure docs.
- **Out of scope:** Front-end env management (backoffice Next.js uses its own config), secrets storage (delegated to deployment pipelines).

## 3. Module Composition
| Component | Location | Description |
| --- | --- | --- |
| AppConfigModule | `src/config/config.module.ts` | Global Nest module wrapping `ConfigModule.forRoot`. |
| configuration.ts | `src/config/configuration.ts` | Defines typed slices via `registerAs` (`app`, `database`, `jwt`, `stripe`, `googleOAuth`). |
| env validation schema | `src/config/env-validation.schema.ts` | `class-validator` schema describing required vars & defaults. |
| env validator | `src/config/env-validation.ts` | Executes validation at bootstrap, throws on invalid/missing values. |
| AppConfigService | `src/config/config.service.ts` | Wrapper exposing typed getters and helper flags. |

### Load Order
```ts
ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  envFilePath: [join(__dirname, '..', '.env'), '.env'],
  load: [appConfig, databaseConfig, jwtConfig, stripeConfig, googleOAuthConfig],
  validate: validateEnvironmentVariables
})
```
- `.env` near compiled source takes precedence, falling back to process CWD.
- Validation executes before any other provider resolves, enforcing ADR‑0006.

## 4. Configuration Slices
| Slice | Interface | Keys | Notes |
| --- | --- | --- | --- |
| `app` | `AppConfig` | `NODE_ENV`, `PORT`, `FRONTEND_URL`, `CORS_ORIGINS`, `COOKIE_DOMAIN` | Provides derived CORS list & environment mode helpers. |
| `database` | `DatabaseConfig` | `DATABASE_URL` | Required; throws if missing. |
| `jwt` | `JwtConfig` | `JWT_SECRET`, `JWT_EXPIRATION` | Supports `ms`-style strings or seconds. |
| `stripe` | `StripeConfig` | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` | Optional; absence triggers mock mode in payments. |
| `googleOAuth` | `GoogleOAuthConfig` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Required for Google login; optional in lower envs via config flag. |

Extend with additional slices (e.g., BullMQ, legacy integration) by following the same pattern: define interface, register loader, update validator, add service getter.

## 5. Consumer Guidelines
1. Inject `AppConfigService` instead of `ConfigService` or `process.env`.
2. Use typed getters (`config.app`, `config.jwt`, etc.) to avoid stringly typed access.
3. Branch on `config.isProduction()` / `isDevelopment()` for environment-specific behaviour.
4. When adding new env vars:
   - Update `env-validation.schema.ts` (decorators + defaults).
   - Document in `.env.example` and `docs/local-development.md`.
   - Update infrastructure secrets (GitHub Actions, Terraform).

## 6. Example Integrations
| Module | Usage |
| --- | --- |
| `auth/auth.module.ts` | Configures `JwtModule.registerAsync` with secret + expiration. |
| `payments/payments.service.ts` | Determines Stripe mode (live vs mock) and webhook secret. |
| `main.ts` | Configures CORS origins, cookie parser domain, and listens on `config.app.port`. |
| `events/domain-event.service.ts` | Reads event bus retry limits (`eventBus` slice to be added). |

## 7. Non-functional Requirements
- Validation must fail fast with descriptive errors (printed via Nest logger).
- Sensitive values (secrets, API keys) should never log aside from presence checks.
- Support hot reload in development by caching config (already enabled).
- Keep `.env` file loading order compatible with Docker/CI (primary from environment variables).

## 8. Future Enhancements
- Add dedicated slices for queues (`BULLMQ_*`), legacy API credentials, observability targets.
- Provide schema export for infrastructure tooling (e.g., generating Terraform variable docs).
- Evaluate secret managers (AWS SSM/Secrets Manager) and integrate into configuration loader.

Use this document along with ADR-0006 to maintain consistency whenever new configuration is introduced.
