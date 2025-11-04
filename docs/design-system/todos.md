Design Lab TODOs

Purpose
- Track concrete work to evaluate the Figma Make kit, preview components in a safe sandbox, and formalize a shared design system.
- Mirror the backlog style used elsewhere (checklist, refs, acceptance criteria where helpful).

Refs
- AGENTS.md (Frontend section; ADR‑0010, ADR‑0011)
- docs/design-system/overview.md, docs/design-system/inventory.md, docs/design-system/component-template.md

Setup & Sandbox
- [x] Scaffold Next.js sandbox app at `apps/design-lab` with Tailwind v4 + tokens mapping.
- [x] Add monorepo scripts: `dev:design-lab`, `build:design-lab`, `start:design-lab`.
- [x] Run on port 4001 to avoid clashing with backoffice.
- [x] Add ThemeProvider (next-themes) and import Figma kit globals into lab `globals.css`.
- [x] Add file explorer route `apps/design-lab/src/app/examples/figma-kit` to browse pasted kit files.
- [x] Add showcase routes: `shadcn-showcase`, `design-system-showcase`.

Figma Kit Integration
- [x] Paste the full kit under `apps/design-lab/src/reference/figma-make` (minus vite/package files).
- [x] Normalize imports in showcased files (remove version-suffixed specifiers like `lucide-react@0.x`).
- [ ] Bulk-normalize imports across all kit components:
  - Replace `@radix-ui/react-*/@version` → `@radix-ui/react-*`.
  - Replace `lucide-react@*` → `lucide-react`.
  - Replace other pinned imports (e.g., `react-hook-form@*`, `cmdk@*`, `input-otp@*`, `vaul@*`, `embla-carousel-react@*`, `recharts@*`, `react-day-picker@*`, `react-resizable-panels@*`).
  - Acceptance: `pnpm dev:design-lab` compiles with any missing deps clearly listed.
- [ ] Install optional deps for demos as needed (scoped to lab):
  - `react-hook-form`, `cmdk`, `input-otp`, `vaul`, `embla-carousel-react`, `recharts`, `react-day-picker`, `react-resizable-panels`.
  - Acceptance: targeted showcase pages render without runtime errors.
- [ ] Create auto-gallery that detects common exports under `components/ui` and renders them if present.

Showcases & Documentation
- [ ] Expand `design-system-showcase` to cover additional composites (CommandPalette, SimpleTable, Pagination, SecondaryNav).
- [ ] For each composite, add brief “when/why” notes using `docs/design-system/component-template.md` as reference.
- [ ] Update `docs/design-system/inventory.md` with component status (alpha/beta/stable) as we review.

Tokens & Theming
- [ ] Reconcile tokens between lab (`src/styles/tokens.css`) and kit (`reference/figma-make/styles/globals.css`).
  - Decide source of truth and naming (semantic vs. raw, OKLCH vs. hex).
  - Map to Tailwind v4 theme variables consistently.
  - Acceptance: a single tokens source drives both lab showcases and backoffice theming without visual regressions.
- [ ] Add light/dark previews and a token “foundations” page in the lab.

Shared Packages (Extraction)
- [ ] Create `packages/tokens` exporting CSS tokens + a small TS map for categories/enums.
- [ ] Create `packages/ui` with core primitives (Button, Input, Label, Select, Tabs, Dialog, Card, Separator, Table, Toast) using tokens; keep Radix + Tailwind only.
- [ ] Publish locally and switch lab and backoffice to import from `@mobilytics/ui` where possible.
  - Acceptance: backoffice compiles; initial screens using shared primitives match current visuals.

Storybook (Design System)
- [ ] Add `apps/design-system` (Storybook 8) with Foundations and component stories.
- [ ] Enable a11y test runner (axe) and optional visual regression (Chromatic/Percy).
  - Acceptance: `pnpm --filter apps/design-system build` succeeds; stories render tokens and key components.

Governance & CI
- [ ] ESLint rules for UI packages:
  - Disallow raw hex/OKLCH in component styles (require tokens).
  - Disallow arbitrary margins on leaf components; prefer composition.
- [ ] CI checks: build lab, lint UI package, build Storybook, run a11y tests; optional VRT.

Backoffice Adoption
- [ ] Add import alias or re-export bridge to migrate `apps/backoffice-support` gradually to `@mobilytics/ui`.
- [ ] Migrate 2–3 primitives on one screen as a reference (e.g., Settings › Addresses), then proceed screen-by-screen.
- [ ] Document migration guidance and dos/don’ts under `docs/design-system`.

Decisions To Lock In (propose ADR‑0012)
- [ ] Tokens source-of-truth location and naming scheme.
- [ ] Component API stability policy and versioning for `@mobilytics/ui`.
- [ ] Storybook as canonical docs vs. Next-based docs.
- [ ] Accessibility baseline (roles, labels, focus, contrast) for acceptance.

How to Run
- Sandbox: `pnpm dev:design-lab` → http://localhost:4001
- Showcases: `/examples/shadcn-showcase`, `/examples/design-system-showcase`, `/examples/figma-kit`

Notes
- The kit’s `App.tsx` and `main.tsx` (Vite app) are reference-only; the lab uses Next.js routes to render components.
- The kit’s compiled `index.css` is not imported; `styles/globals.css` is used for base styles.
