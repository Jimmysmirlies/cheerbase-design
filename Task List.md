# Ralli MVP Task List

## ✅ Completed
- [x] Locked MVP narrative covering Public Marketplace, Club Portal, Organizer Hub, and role routing.
- [x] Implemented marketplace landing page wireframe (`apps/demo/app/page.tsx`) with hero, organizer rail, and categorized event cards.
- [x] Removed legacy `app-shell` wrapper to allow full-bleed layout (`apps/demo/app/layout.tsx`, `apps/demo/app/globals.css`).
- [x] Published shadcn-based style guide (`apps/demo/app/style-guide/page.tsx`) with color, type, spacing tokens plus global access button.
- [x] Defined reusable UI components and documentation (Hero, OrganizerCard, EventCard, QuickFilterRail).

## 🚧 In Progress / Needs Alignment
- [ ] Draft API contract tables for key flows (event discovery, registration lifecycle, organizer onboarding) with request/response shapes and UI states.

## ⏭️ Upcoming MVP Surfaces
- [ ] Wireframe authenticated Club Portal (dashboard, roster manager, payments) using the shared components.
- [ ] Outline Organizer Hub screens (event builder, registration management, approvals messaging).
- [ ] Capture Private Event flow requirements (invite tokens, visibility toggles, approval states).
- [ ] Plan admin approval workflow for `Host Events` inquiries (review queue, notifications).

## 🧪 Validation & Documentation
- [ ] Prepare empty/loading/error states for marketplace and detail pages to pair with API contracts.
- [ ] Align Figma documentation with token names and component specs for cross-discipline reference.
- [ ] Determine testing strategy for MVP (component snapshot coverage + end-to-end path for discovery → registration).
