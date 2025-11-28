# Development Workflow & Quality Guardrails

Use these defaults so builds stay clean and fast:

## Daily commands
- `pnpm lint:strict` — lint with zero tolerance for warnings.
- `pnpm typecheck` — run all package type checks.
- `pnpm db:migrate && pnpm db:seed` — keep the local DB in sync with schema/data (uses `DATABASE_URL` in `.env`).
- `pnpm dev:demo` — start the demo app locally.

## Before pushing
1) `pnpm lint:strict`
2) `pnpm typecheck`
3) `pnpm build`

## Patterns to avoid build noise
- Remove unused imports/vars immediately; comment out “future” code instead of leaving it unused.
- Keep hooks at the top level of components/custom hooks—avoid hook calls inside render callbacks; extract small components if needed.
- Normalize nullable data at boundaries (e.g., `foo ?? undefined` for optional props).
- Keep env usage declared (`turbo.json` `globalEnv`) or wrap with a small helper if noisy.
- Prefer typed helpers over `any`; add local types for external shapes when needed.

## Data + Prisma
- `.env` should include `DATABASE_URL="file:./dev.db"` for local SQLite.
- Regenerate/seed: `pnpm db:migrate && pnpm db:seed`.
- Inspect data: `pnpm prisma studio`.

## UI tokens
- Favor semantic tokens (`--primary`, `--accent`, etc.) and reference them in style guide pages to keep hover/active states consistent.
