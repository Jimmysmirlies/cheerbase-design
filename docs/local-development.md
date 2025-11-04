# Local Development

Follow this guide to boot the Mobilytics App Platform locally with both the Backoffice Support web app and the App API.

> Quick start: run `scripts/mobilytics.sh bootstrap`, then `scripts/mobilytics.sh start-dev-stack` (brings up Postgres + Redis, applies the schema, and seeds dev data), and finally `pnpm dev`. The manual steps below explain what those helpers do under the hood.

## Prerequisites
- Node.js 20 or newer
- pnpm 9 or newer (`corepack enable` is recommended)
- Docker Desktop or another runtime that supports `docker compose`

## 1. Install dependencies
```bash
pnpm install
```

## 2. Configure environment variables
1. App API – copy the sample file and adjust values if needed:
   ```bash
   cp apps/app-api/.env.example apps/app-api/.env
   ```
2. Backoffice Support – copy the sample to `.env.local` (Next.js reads this automatically):
   ```bash
   cp apps/backoffice-support/.env.example apps/backoffice-support/.env.local
   ```
`NEXT_PUBLIC_API_BASE` should point at the App API URL you run in the next steps (defaults to `http://localhost:4000`).

The App API `.env` now includes `QUEUE_REDIS_URL` (defaults to the local Compose service on `redis://localhost:6380/0`) and `QUEUE_PREFIX`. Adjust these if you run Redis elsewhere or share a server.

## 3. Start Postgres & Redis
Bring up the local database and queue backing store with Docker (credentials match the `.env.example` file):
```bash
docker compose up -d postgres redis
```
Postgres is exposed on `localhost:5433` (mapped to the container's default `5432`) and seeds a database named `mobilytics_app`. Redis is exposed on `localhost:6380` for BullMQ queues.

## 4. Generate Prisma client and apply schema
```bash
pnpm prisma:app-api:generate
pnpm prisma:app-api:push
```
Need to align the schema quickly? Add `--force-reset` to `pnpm prisma:app-api:push -- --force-reset` to drop and recreate the local database. If you prefer migration files, `pnpm prisma:app-api:migrate` still works when migrations are checked in.

## 5. Run the apps
```bash
pnpm dev
```

`pnpm dev` launches both workspaces via Turborepo:
- App API (NestJS) on http://localhost:4000
- Backoffice Support (Next.js) on http://localhost:3000

> If those ports are busy you can change `PORT` in `apps/app-api/.env` or pass `--port` to the Next.js dev command.

## 6. Seed a default administrator & sample data

To sign into the backoffice you need at least one administrator user. Run:

```bash
pnpm prisma:app-api:seed
```

The seed script honours `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (defaults to `admin@mobilytics.local` / `ChangeMe123!`). You can update the `.env` file afterwards to suit your local needs.

Want end-to-end demo data (companies, orders, shipments, automation steps)? Execute:

```bash
pnpm prisma:app-api:seed:dev
```

This builds on the base seed – run it after `pnpm prisma:app-api:seed` (or simply execute `scripts/mobilytics.sh clean-dev-stack`, which performs a force reset, seeds, and runs the legacy sync). The development seed now hydrates:

- Acme (in transit) and Northwind (completed) fulfillment flows with courier timelines, automation assignments, and returns metadata.
- Globex Logistics order staged in the **Ready to Prepare** lane so Support can rehearse allocation workflows.
- BullMQ job telemetry spanning queued, active, completed, and failed runs across the automation and tracking queues for the Job Monitor and Tracking & Returns dashboards.

## Useful standalone commands
- `pnpm dev:app-api` – run only the NestJS API (watch mode).
- `pnpm dev:web` – run only the Next.js app.
- `pnpm lint` – lint all workspaces.
- `pnpm build` – build all workspaces.
- `pnpm prisma:app-api:seed` – create/update the default administrator user.
- `pnpm prisma:app-api:seed:dev` – populate development fixtures (sample companies, orders, shipments, automation steps).
- `pnpm tracking:replay-usps` – replay the sample USPS webhook payload to your local API (requires the API running on port 4000).

## 6. Shut everything down
Stop the dev servers with `Ctrl+C`, then stop the supporting services:
```bash
scripts/mobilytics.sh stop-dev-stack
```
If you prefer to remove containers entirely use `docker compose down`.

## Troubleshooting
- **Ports already in use** – update `PORT` in `apps/app-api/.env` or pass `--port` to `pnpm --filter @mobilytics/backoffice-support dev`.
- **Database connection errors** – confirm `docker compose ps` shows the `postgres` container running and that `DATABASE_URL` matches the user/password in `docker-compose.yml`.
- **Unauthenticated requests** – if you see 401s in the backoffice UI, ensure the seed administrator exists and that cookies are being set (check `CORS_ORIGINS` / `FRONTEND_URL`).
- **Queue health failing** – GET `http://localhost:4000/health` must report `queues` as `up`. Start Redis (see `docker-compose.yml`) before replaying carrier webhooks.
