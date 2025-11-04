# 🎨 WWT Showcase — Designer Playground

This workspace keeps the Tailored Learning Platform (TLP) foundation—backend, shared packages, build tooling—but wipes the slate clean. You start with a single Next.js demo surface, the design system, and an optional API so you and your AI pair can prototype from scratch.

---

## What's Included

- `apps/demo` — a minimalist Next 15 app seeded with static data for rapid prototyping
- `packages/ui` & `packages/ui-experimental` — ready-to-import design system libraries
- Shared configs for Turbo, TypeScript, ESLint, and Prettier to keep everything aligned

---

## Quick Start

1. Install prerequisites: Node 20+, pnpm 10, Docker Desktop (optional for the API), and Turbo CLI (`pnpm dlx turbo login`) if you use remote caching.
2. Install dependencies from the repo root:
   ```bash
   pnpm install
   ```
3. Launch the demo canvas:
   ```bash
   pnpm dev:demo
   ```
4. Want to reset to clean demo data? The content lives in `apps/demo/data/*` – tweak or regenerate as needed (no database required).

---

## Designer Workflow Cheatsheet

- **Add a page** — Create a folder under `apps/demo/app` and drop in a `page.tsx`.
- **Pull in the UI kit** — Import components from `@workspace/ui/components/*` and follow the examples in `packages/ui`.
- **Leverage prompts** — `docs/designer-prompts.md` has ready-to-use instructions for Cursor, Claude, or GPT.
- **Hand off smoothly** — Leave a short comment at the top of new pages describing the scenario so engineers can extend it later.

---

## Scripts & Tooling

- `pnpm dev:demo` — Start the Next.js demo surface.
- `pnpm lint` — Shared lint rules.
- `pnpm format` — Prettier with Tailwind/import sorting plug-ins.
- `pnpm build` — Production build via Turborepo.

---

## Troubleshooting

- Turbo cache quirks? Delete `.turbo` (if present) and rerun `pnpm dev`.
- Docker path issues on macOS? Share the project folder in Docker Desktop → Settings → Resources → File Sharing.

---

Happy showcasing! Ping the team if you’d like a scripted “reset to clean demo data” command or more tailored AI prompt packs.
