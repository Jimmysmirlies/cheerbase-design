# 📣 Cheerbase Design Playground

Cheerbase is a cheerleading operations platform focused on event registration, roster management, and program tooling. This repository is the design workspace for exploring product flows, component patterns, and UI ideas before they reach the production stack. It ships with a single demo surface powered by static data so designers and product teams can iterate quickly.

---

## What's Included

- `apps/demo` — a Next.js 15 demo app that showcases Cheerbase concepts like clubs, teams, events, and pricing.
- `packages/ui` & `packages/ui-experimental` — reusable UI primitives tailored for cheerleading workflows (dashboards, rosters, registration flows).
- Shared configuration for Turborepo, TypeScript, ESLint, and Prettier to keep prototypes consistent.

---

## Getting Started

1. Install prerequisites: Node 20+, pnpm 10, and (optionally) Docker Desktop if you plan to mock backend services.
2. Install dependencies at the repo root:
   ```bash
   pnpm install
   ```
3. Start the Cheerbase demo surface:
   ```bash
   pnpm dev:demo
   ```
4. Demo content lives in `apps/demo/data/*`. Update those files to tweak sample clubs, events, and divisions—no database needed.

---

## Working in the Demo

- **Add a feature page** — Create a folder under `apps/demo/app` and add a `page.tsx` with your concept (e.g., `events/[eventId]/page.tsx`).
- **Use the design system** — Import components from `@workspace/ui` to match Cheerbase styling and interactions.
- **Document intent** — Leave a short JSX comment or README blurb describing the scenario so engineers understand the goal when translating it to production.
- **Reusable prompts** — Browse `docs/designer-prompts.md` for AI prompt ideas that reference Cheerbase terminology.
- **Title case rule** — All page headers, section headings, and button labels must use Title Case (e.g., “Review Pricing,” “Register Team”). Keep helper/description text sentence case.

---

## Design Branding (Aesthetic Guardrails)

- Minimal, black-on-white surfaces with thin, light borders; avoid heavy cards unless necessary.
- Use typography for hierarchy (bold for primary, muted for secondary) instead of heavy chrome; add generous spacing/air.
- Inline meta rows (e.g., Division/Level/Members) with subtle dividers; align actions with headers, not extra labels.
- Keep smooth scroll/Lenis only on marketing; native scroll in app/club/portal areas so modals/dialogs behave normally.
- When dialogs are open, prefer native scrolling inside the dialog (body lock + overscroll containment as needed).

---

## Scripts & Tooling

- `pnpm dev:demo` — Run the demo application.
- `pnpm lint` — Apply Cheerbase lint rules.
- `pnpm format` — Format files with Prettier + Tailwind plugins.
- `pnpm build` — Build the demo via Turborepo.

---

## Troubleshooting

- Seeing odd cache behavior? Delete the `.turbo` folder and rerun your command.
- If Docker is needed for mocks, ensure the repo path is shared in Docker Desktop → Settings → Resources → File Sharing.
