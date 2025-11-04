# Mobilytics App Platform – Agent Guide

This guide gives automation agents the essential conventions, tooling pointers, and guardrails for this repository. Treat it as the “how we work here” checklist before writing code or updating docs.

## 0. MCP / Documentation Lookup

This repository is MCP-aware. Prefer the Context7 MCP server instead of generic web search when you need framework docs.

- **Purpose:** rapid access to official snippets for Next.js, NestJS, shadcn/ui, etc.
- **Access:** Codex CLI already runs `context7` via `npx -y @upstash/context7-mcp`.
- **Workflow:** resolve the library ID, then fetch docs scoped by topic/tokens as needed.
- **Preferred IDs:** Next.js `/vercel/next.js`, NestJS `/nestjs/docs.nestjs.com`, shadcn `/shadcn-ui/ui`.
- **Tips:** use specific topics (e.g., `routing`, `controllers`, `components`) and lean token limits for concise responses. If you know the exact versioned ID, call `get-library-docs` directly.
- **Local setup (humans):**

  ```
  [mcp_servers.context7]
  command = "npx"
  args = ["-y", "@upstash/context7-mcp"]
  ```

## 1. Architectural Decision Records

Always reference the ADRs when working in the affected area:

| ADR      | Summary                          | Where it matters                               |
| -------- | -------------------------------- | ---------------------------------------------- |
| ADR‑0001 | Use `cuid()` for identifiers     | All Prisma models & migrations                 |
| ADR‑0002 | Avoid implicit `any`             | TypeScript linting/builder rules               |
| ADR‑0003 | Human-readable external IDs      | API/UX surfaces exposing IDs                   |
| ADR‑0004 | Prisma schema style guide        | Prisma models, migrations, schema reviews      |
| ADR‑0005 | Authorization & session model    | Auth module, guards, front-end session UX      |
| ADR‑0006 | Centralised configuration module | Config service, env wiring, dependent services |
| ADR‑0007 | App API service guidelines       | Nest services, import patterns, audit logging  |
| ADR‑0008 | Legacy integration via mirrors   | Legacy bridge, Company/Device/Asset domain     |
| ADR‑0009 | Frontend data access conventions | Frontend API clients, query keys, cache policy |
| ADR‑0010 | Frontend data loading strategy   | Next.js pages, React Query hydration           |
| ADR‑0011 | Frontend collection UX standards | Tables, pickers, pagination components         |
| ADR‑0012 | Service test boundaries & exceptions | Backend service/e2e suites, ServiceTestHarness usage |

ADR‑0004 states:
1. Order fields `id`, `createdAt`, `updatedAt`, then scalars, relations, indexes, `@@map`.
2. Map tables/columns to snake_case via `@@map`/`@map`.
3. Use enums (e.g., `Currency`) for common vocab instead of loose strings.

When in doubt, link to the relevant ADR in the PR or spec you’re editing.

## 2. Repository Conventions

### Backend (apps/app-api)
- NestJS + Prisma; run `pnpm lint` and `pnpm build` after changes.
- Inject `AppConfigService` for config access; do not read `process.env` directly (ADR‑0006).
- Keep DTOs aligned with enums (e.g., currency enum); use class-transformer `@Transform` to upper-case user input safely.
- Stripe integration operates in mock mode unless `STRIPE_API_KEY` is set. Use the dedicated services (`StripeSyncService` for catalog sync, `PaymentsService` for checkout/webhooks); don’t inline Stripe SDK calls elsewhere.
- Audit every significant mutation via `AuditService.recordProductEvent` or related helpers; payloads must be JSON‑serialisable.
- Structure services per ADR‑0007: domain directories (`src/products`), use `@app/*` aliases for cross-domain imports, wrap multi-step writes in `prisma.$transaction`, and persist audit events/logs alongside business tables.
- Protect new endpoints with `JwtAuthGuard` + `AuthzGuard`, and annotate required permissions via `@Require(action, resource)` (ADR‑0005).
- Service and e2e test suites follow ADR‑0012: build fixtures through public HTTP/webhook surfaces, rely on the `ServiceTestHarness`, and document any temporary white-box exceptions with TODOs and issue links.

### Frontend (apps/backoffice-support)
- Next.js (App Router) + React Query. Reuse existing UI primitives in `components/ui`.
- Query keys follow the `'pricebook', ...` pattern. Invalidate relevant keys after mutations.
- All currency inputs/selects must use the canonical set [`USD`, `CAD`, `GBP`] from `CurrencyCode`.
- Session guard: keep `AppShell` fetching `/auth/profile` and redirecting to `/login`. Ensure new pages remain under that shell and use React Query’s `useAuthUser` when needed (ADR‑0005).
- API client should include `credentials: 'include'` for cookie-based sessions; surface 401s to trigger logout flows.
- Check lint (`pnpm lint`) before finishing — ESLint is strict on unused imports and union types.

### General
- Prefer `rg` / `pnpm` commands already in repo tooling.
- Do not introduce new identifier formats or timestamp patterns without an ADR update.
- Keep docs/specs referencing ADRs so readers see motivation (example: Price Book spec references ADR‑0004).
- Use the helper shell scripts in `scripts/` (`mobilytics.sh`, `bootstrap.sh`, `stack.sh`, etc.) to keep workflows consistent with onboarding docs.
- Before tackling roadmap-sized work, generate an ephemeral execution plan via `scripts/new-ephemeral-plan.sh "Short Title" [roadmap_refs] [architecture_refs]`. Track progress in the generated file under `workspace/ephemeral/` and archive/delete it once the checklist is complete.
- Git commits run a Husky pre-commit hook that executes `pnpm fix`, `pnpm lint`, and `pnpm typecheck`; let the hook finish or run these manually before committing.

## 3. Workflow Checklist

1. Review relevant ADRs.
2. Implement changes following schema/UI conventions.
3. Update specs/docs with ADR cross-links when behavior changes.
4. Run the repo-wide checks before you wrap:
   - `pnpm fix`
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm --filter @mobilytics/app-api build`
   - `pnpm --filter @mobilytics/backoffice-support lint`
   (Add migrations or test commands when your change requires them.)
5. Note any required follow-up (e.g., migrations) in your summary.

Stick to this guide to keep the codebase predictable and aligned with our decisions.
