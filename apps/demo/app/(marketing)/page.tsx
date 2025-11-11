// Home page composition
// This file composes high‑level, reusable sections for the demo home.
// It intentionally keeps data and UI responsibilities separate:
//   - Data lives in `apps/demo/data/*`
//   - Feature-scoped components live in `apps/demo/components/features/*`
//   - Atomic UI primitives live in `apps/demo/components/ui/*` and shadcn in `packages/ui/src/shadcn/*`
import Link from "next/link";
import { Hero } from "@/components/ui";
import OrganizersSection from "@/components/features/events/sections/OrganizersSection";
import EventCategoriesSection from "@/components/features/events/sections/EventCategoriesSection";
import { eventCategories, heroSlides, organizers } from "@/data/events";

export default function HomePage() {
  return (
    <main className="bg-background text-foreground">
      {/* Hero: Featured experiences carousel with CTA */}
      <Hero slides={heroSlides} />

      {/* Section: Organizer Rail
          Purpose: Promote event organizers; encourages following and hosting.
          Contents: Title, subtitle, CTA link, horizontally scrollable organizer cards.
      */}
      <OrganizersSection organizers={organizers} />

      {/* Section: Event Categories
          Purpose: Curate event groups; each block contains a header and a responsive grid of event cards.
      */}
      <EventCategoriesSection categories={eventCategories} />

      {/* Footer: Global links and product tagline */}
      <footer className="border-t border-border bg-card/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">Ralli</p>
            <p className="text-sm text-muted-foreground">
              The discovery-first platform connecting clubs, organizers, and communities.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-medium text-muted-foreground">
            <Link className="hover:text-foreground" href="#categories">
              Browse Events
            </Link>
            <Link className="hover:text-foreground" href="/register">
              Register Club
            </Link>
            <Link className="hover:text-foreground" href="/host/apply">
              Host Events
            </Link>
            <Link className="hover:text-foreground" href="/terms">
              Terms
            </Link>
            <Link className="hover:text-foreground" href="/privacy">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
