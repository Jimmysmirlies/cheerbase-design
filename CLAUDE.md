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

**Route Groups:**
- `(marketing)` - Landing page
- `(events)` - Event browsing and registration flows
- `(club)` - Club management (teams, registrations, settings)
- `(organizer)` - Organizer dashboard and event management
- Style guide pages under `/style-guide`

**Key Directories:**
- `app/` - Next.js app router pages
- `components/` - React components organized by feature
  - `components/features/` - Feature-specific components (registration, clubs, events, auth)
  - `components/ui/` - Reusable UI primitives (cards, avatars, controls, tables)
  - `components/layout/` - Layout components (NavBar, PageHeader, Sidebar)
- `data/` - Static mock data (clubs, teams, events, divisions)
- `types/` - TypeScript type definitions
- `utils/` - Utility functions
- `hooks/` - Custom React hooks

### Data Layer

All data is **static mock data** in `apps/demo/data/`:
- `divisions.ts` - Hierarchical division catalog (Category → Tier → Level)
- `events/` - Event and pricing data
- `clubs/` - Teams, rosters, registrations
- No database or backend services

**Division Structure:**
```typescript
DivisionCategory (e.g., "All Star Cheer")
  → DivisionTier (e.g., "U16")
    → levels: string[] (e.g., ["1", "2", "3"])
```

Full division format: `Category - Tier - Level` (e.g., "All Star Cheer - U16 - 4")

### Key Features & Patterns

#### Registration Flow

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

#### Team Management

Teams use a row-based layout similar to registration flows:
- `TeamCard` - Expandable team row with member avatars
- `CreateTeamModal` - Tiered division selection (Category → Tier → Level)
- `RosterEditorDialog` - Shared dialog for adding/editing team members

#### Component Patterns

**TeamRow variants:**
- Registration context: `TeamRow.tsx` (with lock states, payment deadlines)
- Team management: `TeamCard.tsx` (simpler, management-focused)

**Modal patterns:**
- `RegisterTeamModal` - Register team to event (existing team or upload)
- `CreateTeamModal` - Create new team with tiered division selection
- `RosterEditorDialog` - Edit team members (shared across contexts)

**Navigation consistency:**
- Back buttons: Ghost icon button with `ArrowLeftIcon`, size `h-10 w-10`, `-ml-2`
- Max width: `max-w-7xl` for all main content pages
- Use Next.js `Link` for navigation, `useRouter` for programmatic navigation

### Styling & Design System

**Framework:** Tailwind CSS v4 + shadcn/ui components

**Typography classes** (defined in `globals.css`):
- `heading-1` through `heading-4` - Semantic heading styles
- `body-large`, `body-text`, `body-small` - Body text variants
- `label` - Uppercase label style
- All use CSS variables for consistent theming

**Important rules:**
- **Title Case** for all headings, buttons, and labels (e.g., "Review Pricing", "Register Team")
- **Sentence case** for helper text and descriptions
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

### Payment & Invoice System

**Payment methods** (in `PaymentMethodsCard`):
1. Mail-in cheque (with payee, memo, address)
2. Pay online (Stripe/digital, with action button)
3. E-transfer (email, message instructions)

**Invoice structure:**
- Web view: Uses current design system
- Print view: Simplified, print-friendly variant (hidden via `.no-print` class)
- Located at `/clubs/registrations/[registrationId]/invoice`
- Supports multiple versions with status badges (Paid, Partially Paid, Unpaid)

### State Management

**Client-side state** with React hooks:
- `useState` for component-local state
- `useSearchParams` + `useRouter` for URL-based state (tabs, modals, filters)
- No global state library - intentionally simple for prototyping

**URL patterns:**
- Query params for view states: `?view=teams`, `?action=register`
- Modal open states typically tracked via URL query params
- Use `router.replace()` to update URL without navigation

### Working with Mock Data

**Adding/modifying data:**
1. Edit files in `apps/demo/data/`
2. No database needed - changes reflect immediately
3. Mock data includes realistic structures (invoices, payments, roster members)

**Data conventions:**
- IDs: Use descriptive strings (`'reg_001'`) or UUID format
- Dates: ISO string format or JavaScript `Date` objects
- Currency: Store as numbers, format with `Intl.NumberFormat`

## Common Workflows

### Adding a New Page

1. Create route folder: `apps/demo/app/(group)/path/page.tsx`
2. Use appropriate route group: `(marketing)`, `(events)`, `(club)`, or `(organizer)`
3. Import components from `@workspace/ui`
4. Add mock data to `apps/demo/data/` if needed

### Creating Reusable Components

1. Place in `apps/demo/components/`:
   - `features/` for feature-specific components
   - `ui/` for generic reusable components
2. Export types alongside components
3. Add JSDoc comments explaining purpose and usage
4. Use `'use client'` directive if component needs client-side interactivity

### Modifying Registration Flow

The `RegistrationFlow` is used in multiple contexts:
- **New registration:** `/events/[eventId]/register`
- **View/edit registration:** `/clubs/registrations/[registrationId]`

When modifying, consider:
- Props for context adaptation (`hideStats`, `hideSubmitButton`, etc.)
- Shared components (`RosterEditorDialog`, `TeamRow`, `PricingBreakdownCard`)
- Payment flow differences (new vs. existing registrations)

## Important Notes

- This is a **design playground**, not production code
- Focus on UX patterns and visual design over data persistence
- All authentication is demo-only (localStorage-based role switching)
- Print functionality uses CSS `@media print` queries
- Responsive breakpoints follow Tailwind defaults (`sm:`, `md:`, `lg:`, etc.)
