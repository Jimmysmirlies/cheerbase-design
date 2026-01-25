# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Cheerbase is a design playground for a cheerleading operations platform. This is a **prototyping repository** using static data - not the production codebase. Focus is on exploring UI flows, component patterns, and product concepts before they reach production.

## Development Commands

```bash
# Start the demo app (primary development surface)
pnpm dev:demo

# Format code (includes Tailwind class sorting)
pnpm format

# Lint
pnpm lint

# Build all packages
pnpm build
```

**Prerequisites:** Node 20+, pnpm 10

**Dev Server:** Always use `localhost:3000`. Before starting the dev server, kill any existing processes on port 3000 to avoid port conflicts. We use LocalStack for local development.

## Architecture

### Monorepo Structure

- **`apps/demo`** - Next.js 15 app router demo showcasing Cheerbase concepts
- **`packages/ui`** - Shared UI components (shadcn/ui based)
- **`packages/ui-experimental`** - Experimental UI components
- **Configuration packages** - Shared TypeScript, ESLint, and Prettier configs

### Demo App Structure (`apps/demo`)

```
apps/demo/
├── app/                    # Next.js app router pages
│   ├── (marketing)/        # Landing page
│   ├── (events)/           # Event browsing and registration
│   ├── (club)/             # Club management
│   ├── (organizer)/        # Organizer dashboard
│   └── style-guide/        # Component documentation
├── components/
│   ├── features/           # Feature-specific components
│   ├── layout/             # Layout components
│   ├── providers/          # React context providers
│   └── ui/                 # Reusable UI primitives
├── data/                   # Static mock data
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
└── lib/                    # Shared libraries (gradients, animations)
```

---

## Component Organization

### File Size Guidelines

- **< 500 lines**: Keep as single file
- **500-800 lines**: Consider splitting if logical sections exist
- **> 800 lines**: Must split into focused modules

### When to Create Subfolders

Create a subfolder when you have **4+ related files**. Use these patterns:

**Page-specific components** - Use `_components/` convention:

```
app/(organizer)/organizer/events/
├── page.tsx                    # Main page (orchestration only)
├── _components/
│   ├── index.ts                # Barrel exports
│   ├── types.ts                # Shared types
│   ├── utils.ts                # Helper functions
│   ├── EventsContent.tsx       # Main content component
│   └── NewEventModal.tsx       # Modal component
```

**Feature components** - Use kebab-case folder names:

```
components/features/clubs/
├── registration-detail/        # Complex feature with 4+ files
│   ├── index.ts
│   ├── types.ts
│   ├── useRegistrationEdit.ts  # Feature-specific hook
│   ├── RegistrationDetailContent.tsx
│   ├── EventDetailsSection.tsx
│   ├── RegisteredTeamsSection.tsx
│   ├── InvoiceSidebar.tsx
│   └── MobileStickyBar.tsx
├── TeamCard.tsx                # Single-file components at root
├── OrganizerCard.tsx
└── TeamSettingsDialog.tsx
```

**Layout components** - Use kebab-case folder names:

```
components/layout/
├── NavBar.tsx                  # Main component (imports from subfolder)
├── nav-bar-components/         # Supporting components
│   ├── index.ts
│   ├── types.ts
│   ├── NavBarSearch.tsx
│   ├── NavBarAuthMenu.tsx
│   └── MenuXToggle.tsx
├── PageHeader.tsx
├── PageTitle.tsx
└── Sidebar.tsx
```

### UI Component Structure (`components/ui/`)

Keep UI primitives **flat** at the root level. Only create subfolders for **4+ related files**:

```
components/ui/
├── index.ts                    # Barrel exports for all UI components
├── GradientAvatar.tsx          # Single-file primitives at root
├── AvatarCluster.tsx
├── CalendarBadge.tsx
├── EmptyStateButton.tsx
├── EventGallery.tsx
├── GalleryLightbox.tsx
├── GlassCard.tsx
├── LayoutToggle.tsx
├── PageTabs.tsx
├── QuickFilterRail.tsx
├── EventHeroCarousel.tsx
├── hero.tsx
├── glass-card-style.ts         # Style utilities
├── cards/                      # 4+ card components
│   ├── EventCard.tsx
│   ├── EventCardV2.tsx
│   ├── EventRegisteredCard.tsx
│   ├── OrganizerGlassCard.tsx
│   ├── OrganizerProfileCard.tsx
│   └── PricingCard.tsx
├── skeletons/                  # 4+ skeleton components
│   └── ...
└── tables/                     # Table system components
    └── ...
```

**Rules:**

- Single components stay at UI root (not in subfolders)
- Use `index.ts` for barrel exports
- Export types alongside components
- Naming: PascalCase for components, kebab-case for folders

---

## Data Layer (`data/`)

### Structure

```
data/
├── index.ts                    # Barrel exports for all data
├── divisions.ts                # Division catalog and types
├── registration/
│   └── divisions.ts            # Pre-computed division categories for UI
├── events/
│   ├── index.ts                # Event barrel exports
│   ├── selectors.ts            # Query functions (getEventsByOrganizerId, etc.)
│   ├── analytics.ts            # Computed metrics and types
│   ├── categories.ts           # Event category data
│   ├── organizers.ts           # Organizer data
│   └── ...
└── clubs/
    ├── teams.ts                # Team data
    ├── registrations.ts        # Registration data
    └── members.ts              # Roster/member data
```

### Import Patterns

Prefer importing from barrel exports:

```typescript
// Good - use barrel export
import { demoTeams, getEventsByOrganizerId } from "@/data";

// Also acceptable - direct import for specific needs
import { divisionCatalog } from "@/data/divisions";
```

### Data Conventions

- **IDs**: Descriptive strings (`'reg_001'`) or UUID format
- **Dates**: ISO string format or JavaScript `Date` objects
- **Currency**: Store as numbers, format with `Intl.NumberFormat`
- **Types**: Define types alongside data, export from barrel

---

## Hooks (`hooks/`)

### Organization

Keep all hooks flat in `hooks/` folder. Only create subfolders if you have a hook system with 4+ related files.

```
hooks/
├── useOrganizer.ts             # Organizer context/data
├── useOrganizerLayout.ts       # Layout preferences
├── useOrganizerSubscription.ts # Subscription state
├── useOrganizerEventDrafts.ts  # Event draft management
├── useGradientSettings.ts      # Brand gradient settings
├── useClubData.ts              # Club data fetching
├── useRegistrationStorage.ts   # Registration state persistence
└── ...
```

### Hook Patterns

**Settings hooks** - Use generic base with convenience wrappers:

```typescript
// Generic hook
export function useGradientSettings(options: GradientSettingsOptions) { ... }

// Convenience hooks
export function useOrganizerGradient(organizerId: string | undefined) {
  return useGradientSettings({
    storageKeyPrefix: "cheerbase-organizer-settings",
    entityId: organizerId,
    eventName: "organizer-settings-changed",
  });
}

export function useClubGradient(clubId: string | undefined) {
  return useGradientSettings({
    storageKeyPrefix: "cheerbase-club-settings",
    entityId: clubId,
    eventName: "club-settings-changed",
  });
}
```

**Storage hooks** - Pair state with localStorage:

```typescript
export function useOrganizerLayout() {
  const [layout, setLayoutState] = useState<"A" | "B">("A");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setLayoutState(stored);
  }, []);

  const setLayout = useCallback((next) => {
    setLayoutState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return { layout, setLayout };
}
```

---

## Types (`types/`)

### Organization

```
types/
├── club.ts                     # Team, Registration, TeamRoster, etc.
├── events.ts                   # Event, Organizer types
└── billing.ts                  # Invoice, Payment types
```

### Guidelines

- **Colocate types with data** when they're only used with that data
- **Use types/ folder** for types shared across multiple features
- **Export from barrel** for commonly used types
- **Prefer `type` over `interface`** for consistency

---

## Naming Conventions

### Files and Folders

| Type            | Convention                  | Example                |
| --------------- | --------------------------- | ---------------------- |
| Components      | PascalCase                  | `EventCard.tsx`        |
| Hooks           | camelCase with `use` prefix | `useOrganizer.ts`      |
| Utilities       | camelCase                   | `formatCurrency.ts`    |
| Types           | camelCase                   | `types/club.ts`        |
| Folders         | kebab-case                  | `nav-bar-components/`  |
| Page folders    | kebab-case                  | `registration-detail/` |
| Private folders | `_` prefix                  | `_components/`         |

### Component Names

- **Avoid generic names**: Use `OrganizerGlassCard` not `OrganizerCard` if there's a simpler variant
- **Include context**: `RegistrationDetailContent` not just `DetailContent`
- **Be specific**: `NewEventModal` not just `EventModal`

### Type Names

- **Suffix with purpose**: `EventCardV2Props`, `RegistrationTableRow`
- **Avoid conflicts**: Use `RegistrationDivisionCategory` if `DivisionCategory` exists elsewhere

---

## Barrel Exports (`index.ts`)

### Pattern

Every subfolder with 2+ files should have an `index.ts`:

```typescript
// components/features/clubs/registration-detail/index.ts
export { RegistrationDetailContent } from "./RegistrationDetailContent";
export { EventDetailsSection } from "./EventDetailsSection";
export { InvoiceSidebar } from "./InvoiceSidebar";
export type { RegistrationDetailContentProps, EditModeInvoice } from "./types";
```

### UI Index Structure

```typescript
// components/ui/index.ts

// Hero
export { Hero } from "./hero";
export type { HeroProps, HeroSlide } from "./hero";
export { EventHeroCarousel } from "./EventHeroCarousel";

// Cards
export { OrganizerGlassCard } from "./cards/OrganizerGlassCard";
export { EventCard } from "./cards/EventCard";
export { EventCardV2, getRegistrationStatus } from "./cards/EventCardV2";

// Controls
export { QuickFilterRail } from "./QuickFilterRail";
export { PageTabs } from "./PageTabs";
export { LayoutToggle } from "./LayoutToggle";

// Avatars
export { GradientAvatar } from "./GradientAvatar";
export type { GradientAvatarProps } from "./GradientAvatar";
export { AvatarCluster } from "./AvatarCluster";

// ... grouped by category
```

---

## Key Features & Patterns

### Registration Flow

The `RegistrationFlow` component (`components/features/registration/flow/`) is the core registration pattern:

- **Step 1: Register Teams** - Search, add teams via modal or bulk upload
- **Step 2: Pricing** - Review pricing breakdown with tax calculations

**Reusable across contexts:**

- Event registration (new registrations)
- Club management (viewing/editing existing registrations)

**Key props for context adaptation:**

```typescript
{
  hideStats?: boolean          // Hide participant/team/cost stats
  hideSubmitButton?: boolean   // Hide submit for existing registrations
  showPaymentMethods?: boolean // Show payment options (registered events only)
  stepLabels?: {              // Customize step labels
    step1: string
    step2: string
  }
}
```

### Team Management

Teams use a row-based layout similar to registration flows:

- `TeamCard` - Expandable team row with member avatars
- `CreateTeamModal` - Tiered division selection (Category → Tier → Level)
- `RosterEditorDialog` - Shared dialog for adding/editing team members

### Navigation Consistency

- Back buttons: Ghost icon button with `ArrowLeftIcon`, size `h-10 w-10`, `-ml-2`
- Max width by context:
  - Content pages (dashboard, public events): `max-w-6xl`
  - Form pages (edit, new event): `max-w-4xl`
- Use Next.js `Link` for navigation, `useRouter` for programmatic navigation

---

## Styling & Design System

**Framework:** Tailwind CSS v4 + shadcn/ui components

**Typography classes** (defined in `globals.css`):

- `heading-1` through `heading-4` - Semantic heading styles
- `body-large`, `body-text`, `body-small` - Body text variants
- `label` - Uppercase label style
- All use CSS variables for consistent theming

**Important rules:**

- **Title Case** for all headings, buttons, and labels (e.g., "Review Pricing", "Register Team")
- **Sentence case** for helper text and descriptions
- **Always use typography classes** - Never use raw Tailwind font-size/weight classes (e.g., `text-2xl font-semibold`). Always use the defined typography classes (`heading-1` through `heading-4`, `body-large`, `body-text`, `body-small`, `label`)
- Import components from `@workspace/ui/shadcn/[component]`
- Use `cn()` utility from `@workspace/ui/lib/utils` for conditional classes

**Common patterns:**

- Cards: shadcn `Card` with `border-border/60` and rounded corners
- Badges: `Badge` with `variant="secondary"` for divisions
- Icons: lucide-react, typically `size-4` or `size-5`
- Toasts: `toast` from `@workspace/ui/shadcn/sonner`

**Design aesthetic:**

- Minimal, black-on-white surfaces with thin, light borders
- Use typography for hierarchy (bold for primary, muted for secondary)
- Generous spacing and air
- Inline meta rows with subtle dividers
- Smooth scroll/Lenis only on marketing pages; native scroll in app areas

---

## State Management

**Client-side state** with React hooks:

- `useState` for component-local state
- `useSearchParams` + `useRouter` for URL-based state (tabs, modals, filters)
- No global state library - intentionally simple for prototyping

**URL patterns:**

- Query params for view states: `?view=teams`, `?action=register`
- Modal open states typically tracked via URL query params
- Use `router.replace()` to update URL without navigation

**LocalStorage patterns:**

- Settings: `cheerbase-{context}-settings-{id}` (e.g., `cheerbase-organizer-settings-sapphire`)
- Layout: `cheerbase-{context}-layout` (e.g., `cheerbase-organizer-layout`)
- Use custom events for cross-component sync: `organizer-settings-changed`

---

## Common Workflows

### Adding a New Page

1. Create route folder: `apps/demo/app/(group)/path/page.tsx`
2. Use appropriate route group: `(marketing)`, `(events)`, `(club)`, or `(organizer)`
3. If page exceeds 500 lines, create `_components/` subfolder
4. Add mock data to `apps/demo/data/` if needed

### Creating Reusable Components

1. **Determine location:**

   - `ui/` - Generic, reusable across features
   - `features/{feature}/` - Specific to one feature area
   - `layout/` - Page structure components

2. **File organization:**

   - Single file if < 300 lines
   - Create subfolder if 4+ related components
   - Always include barrel export (`index.ts`)

3. **Implementation:**
   - Export types alongside components
   - Add JSDoc comments for complex props
   - Use `'use client'` only when needed

### Splitting a Large Component

When a file exceeds 500-800 lines:

1. Create a subfolder with the component name (kebab-case)
2. Extract into focused files:

   - `types.ts` - Shared types and interfaces
   - `use{Feature}.ts` - Custom hook for complex state logic
   - `{Section}Section.tsx` - Logical UI sections
   - `{Component}.tsx` - Main orchestrating component
   - `index.ts` - Barrel exports

3. Update the original file to re-export from new location (for backwards compatibility if needed)

---

## Important Notes

- This is a **design playground**, not production code
- Focus on UX patterns and visual design over data persistence
- All authentication is demo-only (localStorage-based role switching)
- Print functionality uses CSS `@media print` queries
- Responsive breakpoints follow Tailwind defaults (`sm:`, `md:`, `lg:`, etc.)
