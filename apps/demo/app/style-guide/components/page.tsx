import { EventCard, Hero, HeroSlide, OrganizerCard, QuickFilterRail } from "@/components/ui";
import OrganizersSection from "@/components/features/events/sections/OrganizersSection";
import EventCategoriesSection from "@/components/features/events/sections/EventCategoriesSection";
import { eventCategories, organizers } from "@/data/events";
import { getLocalEventImage } from "@/utils/localImages";

const heroExampleSlides: HeroSlide[] = [
  {
    id: "style-guide-hero-1",
    eyebrow: "Campaign spotlight",
    headline: "Hero component with split layout and carousel controls.",
    description:
      "Use slides to highlight product moments or experience tiers. Content stays consistent across sizes.",
    highlights: [
      "Left column for messaging, bullets, and CTAs",
      "Right column for imagery or media",
      "Dots and arrows stay anchored below the hero",
    ],
    image: getLocalEventImage("style-guide-hero-1"),
    primaryAction: { label: "Primary CTA", href: "#" },
    secondaryActions: [{ label: "Secondary", href: "#", variant: "secondary" }],
  },
  {
    id: "style-guide-hero-2",
    eyebrow: "Alternate slide",
    headline: "Swap imagery or messaging per slide without layout shifts.",
    description: "Slides animate with transforms so each card feels tactile as it enters view.",
    highlights: [
      "Masked edges hint at additional slides",
      "Spacing scales from mobile to desktop",
      "Supports single or multiple actions",
    ],
    image: getLocalEventImage("style-guide-hero-2"),
    primaryAction: { label: "Learn more", href: "#" },
  },
];

export default function ComponentsPage() {
  return (
    <section className="space-y-10">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Component Library</h2>
        <p className="text-sm text-muted-foreground">
          Reusable building blocks shared across Ralli surfaces. Examples below use real components from
          `@/components/ui` so you can inspect props and token usage directly.
        </p>
      </header>

      <section className="space-y-4">
        <header>
          <h3 className="text-xl font-semibold">Hero</h3>
          <p className="text-sm text-muted-foreground">
            Split hero layout pairing long-form messaging with a feature visual. Supports carousel slides out of the box.
          </p>
        </header>
        <div className="overflow-hidden rounded-3xl border border-border">
          <Hero slides={heroExampleSlides} />
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Props:</span> slides[] | (eyebrow, headline, description,
            highlights, image, primaryAction, secondaryActions)
          </p>
          <p>
            <span className="font-semibold text-foreground">Tokens:</span> Display typography, Primary / Secondary button
            variants, Pill radius.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <header>
          <h3 className="text-xl font-semibold">Organizer Card</h3>
          <p className="text-sm text-muted-foreground">
            Compact card for organizer rails and recommendations. Initials auto-generate from organizer name.
          </p>
        </header>
        <div className="flex flex-wrap gap-4 rounded-3xl border border-border bg-card/60 p-6">
          <OrganizerCard
            accentGradient="from-rose-400 via-rose-500 to-rose-600"
            name="Cheer Elite Events"
            region="National"
            visibility="Public"
          />
          <OrganizerCard
            accentGradient="from-indigo-400 via-indigo-500 to-indigo-600"
            name="Spirit Sports Co."
            region="Southeast"
            visibility="Public"
          />
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Props:</span> name, region, visibility, accentGradient
          </p>
          <p>
            <span className="font-semibold text-foreground">Tokens:</span> Radius LG, Small text, Muted chip background.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <header>
          <h3 className="text-xl font-semibold">Event Card</h3>
          <p className="text-sm text-muted-foreground">
            Marketplace-ready card that surfaces event metadata, pricing, and an action button.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Default</p>
            <EventCard
              date="Nov 14, 2025"
              href="#"
              image={getLocalEventImage("style-guide-event-default")}
              location="Madison Square Garden, NY"
              organizer="Cheer Elite Events"
              teams="32 / 48 teams"
              title="National Cheerleading Championship"
              size="default"
            />
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Compact</p>
            <EventCard
              date="Jul 19, 2025"
              href="#"
              image={getLocalEventImage("style-guide-event-compact")}
              location="Austin Sports Center, TX"
              organizer="Southern Spirit"
              teams="18 / 32 teams"
              title="Summer Series Classic"
              size="compact"
            />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Props:</span> image, title, organizer, date, location, teams,
            fee, href, size
          </p>
          <p>
            <span className="font-semibold text-foreground">Tokens:</span> Radius LG, Subheading title, Small metadata,
            Primary CTA button.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <header>
          <h3 className="text-xl font-semibold">Quick Filter Rail</h3>
          <p className="text-sm text-muted-foreground">
            Pill-based filter controls for top-of-page filtering or dashboard subsets. Handles active styling internally.
          </p>
        </header>
        <div className="rounded-3xl border border-border bg-card/60 p-6">
          <QuickFilterRail
            filters={[
              { label: "All", href: "#", active: true },
              { label: "Upcoming", href: "#" },
              { label: "Past", href: "#" },
              { label: "Invite-only", href: "#" },
            ]}
          />
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Props:</span> filters[] (label, href, active)
          </p>
          <p>
            <span className="font-semibold text-foreground">Tokens:</span> Pill radius, Small text, Border transitions on
            hover/active.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <header>
          <h3 className="text-xl font-semibold">Section: Organizers</h3>
          <p className="text-sm text-muted-foreground">
            Reusable section that renders a horizontal organizer rail with CTA and copy.
          </p>
        </header>
        <div className="overflow-hidden rounded-3xl border border-border">
          <OrganizersSection organizers={organizers} />
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Props:</span> organizers[], id?, title?, subtitle?, ctaHref?,
            ctaLabel?
          </p>
          <p>
            <span className="font-semibold text-foreground">Composes:</span> OrganizerCard
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <header>
          <h3 className="text-xl font-semibold">Section: Event Categories</h3>
          <p className="text-sm text-muted-foreground">
            Grid-based section that lists categories and renders event cards per category.
          </p>
        </header>
        <div className="overflow-hidden rounded-3xl border border-border">
          <EventCategoriesSection categories={eventCategories} />
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Props:</span> categories[], id?
          </p>
          <p>
            <span className="font-semibold text-foreground">Composes:</span> EventCard
          </p>
        </div>
      </section>

      <footer className="rounded-2xl border border-border bg-card/60 p-5 text-xs text-muted-foreground">
        Looking for implementation details? Browse the component source in `apps/demo/components/ui` or port them to the
        shared UI package when ready.
      </footer>
    </section>
  );
}
