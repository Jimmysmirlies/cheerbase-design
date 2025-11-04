Design System Overview

Goals
- Centralize tokens (colors, spacing, radii, shadows, typography)
- Provide accessible, composable React primitives and patterns
- Document when/why to use each component, with do/don’t examples
- Align production UI to shared tokens and components over time

Approach
- Use `apps/design-lab` as a sandbox for evaluating Figma Make output
- Extract stable primitives into a shared package (`@mobilytics/ui`), backed by tokens
- Document usage and decisions referencing ADR‑0011 (collection UX standards) and ADR‑0010 (data loading)

Outcomes
- Faster, consistent product UI
- Clarity on component choices and patterns
- Enforced use of tokens and accessibility standards

