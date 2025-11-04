# Mobilytics App Platform - Onboarding Guide

Welcome aboard! This guide walks you through the first day setup so you can run the Mobilytics app platform locally. It builds on the automation scripts in `scripts/` and the existing architectural decision records.

## 1. Prerequisites

- Node.js 20+
- pnpm 9+ (`corepack enable` recommended)
- Docker Desktop or another runtime that provides `docker compose`
- Stripe test credentials (optional, only needed for live sync testing)
- Redis (for BullMQ queues; `brew install redis` on macOS)

### Credentials & Secrets

#### Stripe
- The App API falls back to mock mode when `STRIPE_API_KEY` is absent, which is fine for local UI development.
- To validate live checkout and webhook handling set, in `apps/app-api/.env`:
  ```env
  STRIPE_API_KEY=sk_test_your_key
  STRIPE_WEBHOOK_SECRET=whsec_your_secret
  ```
- When running in live mode wire the Stripe CLI to the local webhook endpoint:
  ```bash
  stripe listen --forward-to http://localhost:4000/v1/webhooks/stripe
  ```

#### Courier Integrations
- Courier definitions are stored in the `couriers` table. Default rows (USPS, DHL, Chit Chats, Canada Post) are seeded automatically.
- API keys and auth tokens live in the `metadata` JSON column. Update them with Prisma Studio or `psql`, for example:
  ```sql
  update couriers
     set metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{apiKey}', '"sandbox-key"', true)
   where code = 'DHL';
  ```
- Set `supportsWebhooks` to `true` once the carrier pushes tracking events back into the platform.

#### BullMQ / Redis
- Background jobs (automation workers, courier polling, future retarget flows) rely on Redis. Start a local instance (`redis-server`) before running workers.
- Configure the connection via `QUEUE_REDIS_URL` in `apps/app-api/.env` (defaults to `redis://localhost:6379/0`). Worker processes will refuse to boot if the URL is missing.

Ensure `pnpm`, `docker`, and `docker compose` resolve on your `$PATH`:

```bash
pnpm --version
docker --version
docker compose version
```

## 2. Clone and bootstrap the workspace

```bash
git clone git@github.com:mobilytics/app-platform.git
cd mobilytics-app-platform
scripts/mobilytics.sh bootstrap
```

Need a refresher on available commands? Run:

```bash
scripts/mobilytics.sh help
```

The bootstrap script:
- Installs workspace dependencies with `pnpm install`
- Copies `.env.example` files for both the App API and the backoffice app (without overwriting existing files)
- Generates the Prisma client for the App API

### Environment tweaks

After bootstrap completes, edit:
- `apps/app-api/.env` - adjust `FRONTEND_URL`, `DATABASE_URL`, or Stripe keys as needed.
- `apps/backoffice-support/.env.local` - ensure `NEXT_PUBLIC_API_BASE` points to the App API URL (`http://localhost:4000` by default).

## 3. Start supporting services

```bash
scripts/mobilytics.sh start-dev-stack
```

This brings up the dev Postgres/Redis services, applies the current Prisma schema, runs the development seed (which includes the base seed), and syncs data from the legacy bridge. You can check container status at any time with:

```bash
docker compose ps
```

## 4. Prepare sample data

If you need a full reset with a force push and Redis flush, use:

```bash
scripts/mobilytics.sh clean-dev-stack
```

When the command completes you can sign in with the credentials printed by the seed step (defaults to `admin@mobilytics.local` / `ChangeMe123!`).

## 5. Run the dev servers

```bash
pnpm dev
```

This uses Turborepo to start both apps:

- App API (NestJS) - http://localhost:4000
- Backoffice Support (Next.js) - http://localhost:3000

Stop everything with `Ctrl+C` when you are done.

## 6. Read the architectural context

| Document | Why it matters |
| --- | --- |
| `docs/adrs/` (especially ADR‑0005, ADR‑0006, ADR‑0007) | Core decisions about auth, config, and service design. |
| `docs/local-development.md` | Extra detail on commands, troubleshooting, and manual setup. |
| `docs/auth/overview.md` | Full auth/session flow for backoffice support. |
| `docs/config/overview.md` | How configuration is loaded and validated. |
| `AGENTS.md` | Fast reference to conventions, lint rules, and required workflows. |

## 7. Validation checklist

- [ ] Run `pnpm lint` and `pnpm --filter @mobilytics/app-api test` to ensure your environment is healthy.
- [ ] Log into the backoffice UI using the seeded admin credentials.
- [ ] Execute `pnpm --filter @mobilytics/app-api sync:legacy` manually once to understand the output (optional if `scripts/mobilytics.sh clean-dev-stack` already ran).
- [ ] Verify `pnpm fix`, `pnpm lint`, and `pnpm typecheck` all succeed (the Husky pre-commit hook will run these automatically on commits).

If anything fails, capture the command output and drop a note in the `#mobilytics-platform` Slack channel so we can help unblock you quickly.

## 8. Next steps

- Fork or branch from `main`.
- Review open ADRs and specs for the area you will be working in.
- Run the relevant scripts again whenever you need to refresh dependencies (`scripts/mobilytics.sh bootstrap`) or reseed data (`scripts/mobilytics.sh clean-dev-stack`).
