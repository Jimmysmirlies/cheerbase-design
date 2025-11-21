# Cheerbase Demo Data Model

This document describes the current static data model used by the demo app in `apps/demo`.

It focuses on:
- Events and ticket pricing
- Divisions (catalog vs. ticketing)
- Clubs (teams, rosters)
- Registrations and the registration flow

> All types referenced below live in `apps/demo/types` and are instantiated under `apps/demo/data/**`.

---

## Events & Pricing

**Type:** `Event`  
**Source:** `apps/demo/types/events.ts`, instances in `apps/demo/data/events/categories.ts`

```ts
export type Event = {
  id: string;
  name: string;
  organizer: string;
  type: "Championship" | "Friendly Competition";
  date: string;
  location: string;
  teams: string;              // "32 / 48 teams" (display only)
  fee: string;                // event-level fee summary
  image: string;
  slots: {
    filled: number;
    capacity: number;
    statusLabel?: string;
  };
  registrationFeePercent?: number; // platform/organizer fee %
  pricePerParticipant: string;     // human-readable summary
  description: string;
  tags?: string[];
  gallery?: string[];
  availableDivisions?: DivisionPricing[]; // ticket-level pricing rows
};
```

**Notes**
- No standalone “marketing division” field; each event lists multiple divisions via `availableDivisions`.
- `type` is constrained to `"Championship"` or `"Friendly Competition"`.

**Helpers:**
- `findEventById(id)` and `listEvents()` in `apps/demo/data/events/categories.ts`
- `featuredEvents` and `heroSlides` in `apps/demo/data/events/featured.ts` and `hero-slides.ts`

---

## Ticket Pricing (per event)

**Type:** `DivisionPricing`  
**Source:** `apps/demo/types/events.ts`, populated in each event’s `availableDivisions`

```ts
export type DivisionPricing = {
  name: string;            // from divisionFullNames (via eventDivisionNames helper)
  earlyBird?: {
    price: number;
    deadline: string;      // ISO date (YYYY-MM-DD)
  };
  regular: {
    price: number;
  };
};
```

**Notes**
- `availableDivisions` is the source for the registration division dropdown and pricing.
- Names should align to `divisionFullNames` (canonical catalog strings) via `eventDivisionNames` to ensure team eligibility filters work.

---

## Division Catalog (competition structure)

**Types & Source:**  
- `DivisionCategory`, `DivisionTier` in `apps/demo/data/divisions.ts`  
- Flattened registration-facing lists in `apps/demo/data/registration/divisions.ts`

```ts
export type DivisionTier = {
  name: string;      // e.g. "U16"
  levels: string[];  // e.g. ["1", "2", "2ST", "3", ...]
};

export type DivisionCategory = {
  name: string;      // e.g. "All Star Cheer"
  tiers: DivisionTier[];
};

export const divisionCatalog: DivisionCategory[] = [/* ... */];

export const divisionIndex: Record<string, string[]> = {
  // key: `${category.name} - ${tier.name}`
  // value: levels[]
};

// Flat, fully qualified division strings:
export const divisionFullNames: string[] = [
  "All Star Cheer - U18 - 1",
  "All Star Cheer - U18 - 2",
  // ...
];
```

**Registration divisions build on this:**

```ts
// apps/demo/data/registration/divisions.ts
export type DivisionCategory = {
  id: string;        // slug of category name
  label: string;     // category name
  divisions: string[]; // e.g. "U16 - 4"
};

export const divisionCategories: DivisionCategory[] = /* from divisionCatalog */;

export const allDivisions: string[] = [
  // "All Star Cheer - U16 - 4", ...
];
```

These strings are used for:
- `Team.division` (should be a value from `divisionFullNames`)
- `Registration.division`
- Division selection when creating/editing teams

**Constraint to enforce:** Events should expose divisions that come from `divisionFullNames` (or carry a mapping) so pre-made teams only see eligible divisions during registration.

---

## Event Division Names (shared labels)

**Source:** `apps/demo/data/divisions.ts`

```ts
export const eventDivisionNames = {
  // All values come from divisionFullNames (Category - Tier - Level)
  worlds: 'All Star Cheer - Open - 4',
  chaperone: 'All Star Cheer - Paracheer (adapted or specialized) - 1',
  stuntIndyDuo: 'Specialty - Stunt - All Divisions - All Levels',
  prepNovice: 'Initiation/Prep Cheer - U12 Prep - 1',
  allStarScholastic: 'Scolaire Cheer - Secondaire Juvenile - 3',
  adaptive: 'ICU Cheer - Adaptive Abilities - Advanced',
} as const;
```

**Usage:**
- Referenced in `apps/demo/data/events/categories.ts` as `availableDivisions[].name`.
- All values are canonical `divisionFullNames` strings, so pre-made teams only see divisions they’re eligible for.

---

## Clubs: Teams & Rosters

**Types:** `Team`, `Person`, `TeamRoster`  
**Source:** `apps/demo/types/club.ts`  
**Data:** `apps/demo/data/clubs/teams.ts`, `apps/demo/data/clubs/members.ts`

```ts
export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dob?: string;
};

export type Team = {
  id: string;
  name: string;
  division: string;  // value from allDivisions[] / divisionFullNames
  size: number;
  coedCount: number;
};

export type TeamRoster = {
  teamId: string;
  coaches: Person[];
  athletes: Person[];
  reservists: Person[];
  chaperones: Person[];
  updatedAt?: string;
};
```

---

## Registrations (historical records)

**Type:** `Registration`  
**Source:** `apps/demo/types/club.ts`  
**Data:** `apps/demo/data/clubs/registrations.ts`

```ts
export type Registration = {
  id: string;
  eventId: string;        // links to Event.id
  eventName: string;
  eventDate: string;
  location: string;
  division: string;       // competition division string
  teamId: string;
  athletes: number;
  invoiceTotal: string;
  paymentDeadline: string;
  status?: 'pending' | 'paid';
  paidAt?: string;
  snapshotTakenAt?: string;
  snapshotSourceTeamId?: string;
  snapshotRosterHash?: string;
};
```

---

## Registration Flow (UI wiring)

**Component:** `RegistrationFlow`  
**Source:** `apps/demo/components/features/registration/flow/RegistrationFlow.tsx`

Key props:

```ts
type RegistrationFlowProps = {
  divisionPricing: DivisionPricing[]; // from event.availableDivisions
  teams: TeamOption[];                // simplified Team[]
  rosters?: TeamRoster[];
  initialEntries?: RegistrationEntry[];
  // plus finalizeConfig, flags, etc.
};
```

Internal mappings:
- `divisionOptions`: set of `divisionPricing.name` → used for the division dropdown.
- `divisionPriceMap`: `name` → per-athlete price (prefers `regular.price`, falls back to `earlyBird.price`).
- Totals: participants, cost (before taxes), team count.

---

## Relationships (at a glance)

- **Event → DivisionPricing**
- `Event.availableDivisions: DivisionPricing[]`
- Each row uses canonical division strings (via `eventDivisionNames`) sourced from `divisionFullNames`.

- **Event → RegistrationFlow**
  - `event.availableDivisions` → `RegistrationFlow.divisionPricing`
  - `divisionPricing.name` drives the division select in the registration UI.

- **Event → Registration**
  - `Event.id` → `Registration.eventId`
  - `Registration` stores historical snapshots of pricing & rosters (demo only).

- **DivisionCatalog → Registration Divisions → Team / Registration**
  - `divisionCatalog` → `divisionCategories` / `allDivisions`
  - `Team.division` and `Registration.division` are strings from `allDivisions`.

- **Team → TeamRoster / Registration**
  - `Team.id` → `TeamRoster.teamId`
  - `Team.id` → `Registration.teamId`

---

This file is the canonical place to refine the data model.  
We can evolve fields, rename entities, or add new relationships here first, then propagate changes into the TypeScript types and mock data.
