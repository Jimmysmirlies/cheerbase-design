# Figma Make App Structure Guide

## Core Philosophy
Build lightweight prototypes with clear component boundaries, mock data, and design system adherence. Scale to real backend only when needed.

---

## File Structure

### Single Page Application (SPA)
```
/
├── App.tsx                          # Main entry point & orchestration
├── styles/
│   └── globals.css                  # Design system variables
├── components/
│   ├── Header.tsx                   # Reusable header component
│   ├── Footer.tsx                   # Reusable footer component
│   ├── EventCard.tsx                # Feature-specific components
│   ├── SearchBar.tsx
│   └── ui/                          # shadcn components (don't modify)
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
└── data/
    └── mockData.ts                  # Mock data arrays & types
```

### Multi-Page Application (with routing)
```
/
├── App.tsx                          # Router setup & global layout
├── styles/
│   └── globals.css                  # Design system variables
├── pages/
│   ├── HomePage.tsx                 # Individual page components
│   ├── EventsPage.tsx
│   ├── EventDetailPage.tsx
│   ├── RegistrationPage.tsx
│   └── DashboardPage.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx               # Shared layout components
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── events/
│   │   ├── EventCard.tsx            # Feature-scoped components
│   │   ├── EventFilters.tsx
│   │   └── EventCarousel.tsx
│   ├── registration/
│   │   ├── RegistrationWizard.tsx
│   │   ├── StepOne.tsx
│   │   └── StepTwo.tsx
│   └── ui/                          # shadcn components (don't modify)
│       └── ...
├── data/
│   ├── mockEvents.ts                # Separated mock data by domain
│   ├── mockOrganizers.ts
│   └── types.ts                     # TypeScript interfaces
└── hooks/
    ├── useEventFilters.ts           # Custom hooks for reusable logic
    └── useRegistration.ts
```

---

## App.tsx Patterns

### Pattern 1: Single Page App
```tsx
// App.tsx
import { Header } from './components/layout/Header';
import { EventMarketplace } from './components/EventMarketplace';
import { Footer } from './components/layout/Footer';

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <EventMarketplace />
      </main>
      <Footer />
    </div>
  );
}
```

### Pattern 2: Multi-Page with React Router
```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { RegistrationPage } from './pages/RegistrationPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/register/:eventId" element={<RegistrationPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
```

### Pattern 3: Tab-Based Navigation (no routing needed)
```tsx
// App.tsx
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { EventCompanyView } from './components/EventCompanyView';
import { ClubManagerView } from './components/ClubManagerView';

export default function App() {
  return (
    <div className="min-h-screen">
      <Tabs defaultValue="club-manager">
        <TabsList>
          <TabsTrigger value="club-manager">Club Manager</TabsTrigger>
          <TabsTrigger value="event-company">Event Company</TabsTrigger>
        </TabsList>
        <TabsContent value="club-manager">
          <ClubManagerView />
        </TabsContent>
        <TabsContent value="event-company">
          <EventCompanyView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Component Organization Rules

### 1. Single Responsibility
Each component does ONE thing well:
- ❌ `EventPage.tsx` (too broad)
- ✅ `EventCard.tsx`, `EventFilters.tsx`, `EventCarousel.tsx`

### 2. Feature-Based Folders
Group by domain, not by type:
```
components/
├── events/              # All event-related components
├── registration/        # All registration-related components
├── dashboard/           # All dashboard-related components
└── layout/             # Shared layout components
```

### 3. Composition Over Monoliths
Break large components into smaller, composable pieces:
```tsx
// ❌ Bad: One massive component
function EventMarketplace() {
  return (
    <div>
      {/* 500 lines of JSX */}
    </div>
  );
}

// ✅ Good: Composed from smaller components
function EventMarketplace() {
  return (
    <div>
      <HeroCarousel />
      <SearchFilters />
      <EventSection title="Featured" events={featuredEvents} />
      <EventSection title="By Region" events={regionalEvents} />
    </div>
  );
}
```

## Cheerbase Demo Alignment

The `apps/demo` workspace now mirrors the guidelines above:

- Next.js App Router uses route groups: `(marketing)` for the home funnel, `(events)` for public event detail/registration, and `(club)` for workspace surfaces. Each group owns its own `layout.tsx` with the appropriate `NavBar` configuration.
- Feature code lives under `apps/demo/components/features/{events,registration,clubs,auth}` while shared shells stay in `components/layout` and primitives remain in `components/ui`.
- Mock data is split by domain: `data/events/*` exposes categories, organizers, hero slides, and helpers via an index barrel; `data/clubs/*` holds team/roster fixtures; `data/registration/divisions.ts` captures shared division metadata.
- Legacy `components/blocks/*` paths have been removed—prefer `@/components/features/...` when wiring new UI so responsibilities stay clear and easy to refactor.
- File naming aligns with the “components in PascalCase, shadcn primitives in kebab-case” rule so imports remain predictable on case-sensitive filesystems.

---

## Data Management Strategy

### Phase 1: Prototype (Mock Data)
```tsx
// data/mockEvents.ts
export interface Event {
  id: string;
  title: string;
  organizer: string;
  date: string;
  location: string;
  divisions: string[];
  imageUrl: string;
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'National Cheer Championship',
    organizer: 'USA Cheer',
    date: '2025-03-15',
    location: 'Dallas, TX',
    divisions: ['Youth', 'Junior', 'Senior'],
    imageUrl: 'https://images.unsplash.com/...',
  },
  // ... more mock data
];

// components/EventMarketplace.tsx
import { mockEvents } from '../data/mockEvents';

export function EventMarketplace() {
  const [events] = useState(mockEvents);
  // Use mock data directly
}
```

### Phase 2: Real Backend (Supabase)
```tsx
// hooks/useEvents.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase.from('events').select('*');
      setEvents(data);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  return { events, loading };
}

// components/EventMarketplace.tsx
import { useEvents } from '../hooks/useEvents';

export function EventMarketplace() {
  const { events, loading } = useEvents();
  // Same component, different data source
}
```

---

## Design System Integration

### CSS Variables (globals.css)
```css
:root {
  /* Colors */
  --color-primary: #your-color;
  --color-secondary: #your-color;
  --color-background: #your-color;
  --color-text: #your-color;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* Typography */
  --font-heading: 'YourFont', sans-serif;
  --font-body: 'YourFont', sans-serif;
  
  /* Borders & Radius */
  --border-radius: 8px;
  --border-width: 1px;
}

/* Semantic HTML gets automatic styling */
h1 { font-family: var(--font-heading); }
p { font-family: var(--font-body); }
```

### Using Variables in Components
```tsx
// ✅ Good: Use CSS variables via Tailwind or inline styles
<div className="rounded-[16px]" style={{ 
  backgroundColor: 'var(--color-primary)',
  padding: 'var(--spacing-md)'
}}>

// ❌ Bad: Hardcoded values
<div className="bg-blue-500 p-4 rounded-2xl">
```

### Typography Rules
```tsx
// ✅ Good: Let semantic HTML handle fonts
<h1>Event Title</h1>
<p>Event description</p>

// ❌ Bad: Override with Tailwind font classes
<h1 className="font-bold text-2xl">Event Title</h1>
```

---

## Routing Strategy

### When to use routing:
- Multiple distinct pages (Home, Events, Profile, Dashboard)
- Deep linking needed (share URLs to specific content)
- Browser history matters (back/forward navigation)

### When NOT to use routing:
- Single-page interfaces with modals/overlays
- Tab-based navigation within one page
- Simple prototypes focused on one workflow

### React Router Implementation:
```bash
# Import syntax (version auto-resolved)
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
```

---

## Prompt Template for Multi-Page Apps

Use this template when requesting new features:

```
I need [describe feature/page] for my [app name] application.

STRUCTURE:
- This is a [single-page / multi-page] app
- [If multi-page] Add a new route at [/path] that shows [description]
- The page should include: [list components/features]

COMPONENTS NEEDED:
- [Component name]: [what it does]
- [Component name]: [what it does]

DATA:
- Use mock data for: [list data types]
- Data structure: [describe or provide example]

DESIGN SYSTEM:
- Use CSS variables from /styles/globals.css for all colors, spacing, and typography
- Typography must use only font faces defined in the CSS
- No Tailwind font-size, font-weight, or leading classes unless specifically requested

INTEGRATION:
- [How this connects to existing pages/components]
- [Any shared layout requirements]
```

---

## Example Scenarios

### Scenario 1: Adding a new page to existing app
**Prompt:**
```
Add a Registration Page at /register/:eventId that shows a 3-step wizard for event registration.

STRUCTURE:
- Multi-page app using React Router
- Create /pages/RegistrationPage.tsx
- Add route in App.tsx

COMPONENTS NEEDED:
- RegistrationWizard: Main wizard container with step navigation
- StepOne: Club information form
- StepTwo: Team builder
- StepThree: Athlete roster

DATA:
- Use mock data for available divisions and age groups
- Registration state managed with useState

DESIGN SYSTEM:
- Use CSS variables from globals.css
- Automatic typography from semantic HTML
```

### Scenario 2: Adding a feature to existing page
**Prompt:**
```
Add a filtering sidebar to the EventsPage that filters by division, region, and date.

STRUCTURE:
- Single component added to existing /pages/EventsPage.tsx
- No new routes needed

COMPONENTS NEEDED:
- EventFilters: Sidebar with filter controls
- Update EventsPage to use filters

DATA:
- Filter mock events array based on selected filters
- Use useState for filter state

DESIGN SYSTEM:
- Use CSS variables from globals.css
- Use shadcn Select and Checkbox components
```

---

## Key Takeaways

1. **Start Simple**: Begin with single-page, mock data, minimal components
2. **Component Hierarchy**: App.tsx → Pages → Feature Components → UI Components
3. **Progressive Enhancement**: Add routing, backend, and complexity only when needed
4. **Design System First**: Always reference CSS variables, never hardcode
5. **Feature Folders**: Organize by domain (events, registration) not type (components, utils)
6. **Clear Boundaries**: Each component/page has one job and does it well

---

This structure keeps prototypes lightweight while providing clear paths to scale when needed.
