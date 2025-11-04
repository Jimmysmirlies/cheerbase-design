# Designer-Friendly AI Prompts

Use these starters in Cursor, Claude, or GPT builds to accelerate demo work. Tweak the wording to match your scenario.

---

## Layout & Navigation

- “Create a `/workspace/kickoff` route with a split layout: hero copy on the left, task checklist on the right.”
- “Generate a responsive navigation bar with a brand mark, two links, and a CTA button using `@workspace/ui` primitives.”
- “Introduce a layout that supports breadcrumb navigation and a sticky action bar for edit pages.”

## Data & Mocking

- “Add a `lib/mock-data.ts` helper that returns placeholder districts, courses, and students for quick demos.”
- “Set up a lightweight Zustand store under `apps/demo/stores` to share mock state across new routes.”
- “Draft a TanStack Query hook that calls the Showcase content API when it’s running, but falls back to mock JSON.”

## Visual Polish

- “Design a hero illustration using basic CSS gradients and animate the background subtly on hover.”
- “Tune the typography scale in `apps/demo/app/globals.css` to better highlight H1/H2 hierarchy.”
- “Create a reusable badge component that matches the Showcase palette and supports success/warning/info states.”

## Collaboration Hand-off

- “Summarize the intent of the new `/workspace/kickoff` page and list engineering TODOs before production.”
- “Draft release notes for the latest demo updates, including screenshots and expected talking points.”
- “Write a QA checklist for the prototype including responsive breakpoints and accessibility smoke tests.”
