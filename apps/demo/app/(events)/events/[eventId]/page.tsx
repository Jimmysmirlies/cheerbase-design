/**
 * Event Registration Page
 *
 * Purpose
 * - Dedicated route presenting full event details before a club registers.
 * - Mirrors the marketplace modal layout while allowing persistent navigation.
 *
 * Structure
 * - Hero banner featuring event imagery + tags
 * - Main content: summary, metadata, overview
 * - Aside card: pricing, availability, primary CTA
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Link from "next/link";

import { Button } from "@workspace/ui/shadcn/button";
import { Card, CardContent } from "@workspace/ui/shadcn/card";
import { Separator } from "@workspace/ui/shadcn/separator";

import {
  CalendarDaysIcon,
  MapPinIcon,
  Share2Icon,
  DownloadIcon,
  ClockIcon,
  HotelIcon,
  TrophyIcon,
} from "lucide-react";

import { EventHeroCarousel, FadeInSection } from "@/components/ui";
import { RegistrationSummaryCard } from "@/components/features/events/RegistrationSummaryCard";
import { findEventById, listEvents } from "@/data/events";
import { divisionPricingDefaults } from "@/data/divisions";
import { buildEventGalleryImages } from "./image-gallery";

type EventPageParams = {
  eventId: string;
};

type EventPageProps = {
  params?: Promise<EventPageParams>;
};

export async function generateStaticParams() {
  return listEvents().map((event) => ({
    eventId: event.id,
  }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : null;
  const eventId = resolvedParams?.eventId ? decodeURIComponent(resolvedParams.eventId) : null;
  const event = eventId ? findEventById(eventId) : null;
  if (!event) {
    return {
      title: "Event not found",
    };
  }

  return {
    title: `${event.name} · Register`,
    description: event.description,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const resolvedParams = params ? await params : null;
  if (!resolvedParams) {
    notFound();
  }

  const eventId = decodeURIComponent(resolvedParams.eventId);
  const event = findEventById(eventId);

  if (!event) {
    notFound();
  }

  const slotLabel = `${event.slots.filled}/${event.slots.capacity}`;
  const galleryImages = buildEventGalleryImages(event);

  // "Milestone Rail": timeline posts for critical event dates shown in the vertical rail.
  const formatTimelineDate = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  const competitionDate = new Date(event.date);
  const dayBefore = new Date(competitionDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  const registrationDeadlineDate = new Date(dayBefore);
  const registrationDeadlineISO = registrationDeadlineDate.toISOString();

  const timeline = [
    {
      label: "Coach Check-In",
      date: formatTimelineDate(dayBefore),
      time: "4:00 – 7:00 PM",
      detail: "Credential pickup, schedule walkthroughs, and packet distribution.",
    },
    {
      label: "Warm-Up Access",
      date: formatTimelineDate(competitionDate),
      time: "7:00 – 10:00 AM",
      detail: "Warm-up rotations begin 90 minutes before each report time.",
    },
    {
      label: "Finals & Awards",
      date: formatTimelineDate(competitionDate),
      time: "5:00 – 8:00 PM",
      detail: "Division finals, award ceremony, and judges feedback lounge.",
    },
  ];

  // "Pricing Grid": divisions and tiered fees rendered in the table body.
  const formatAmount = (price?: number | null) => {
    if (price === null || price === undefined) {
      return "—";
    }
    if (price === 0) {
      return "Free";
    }
    return `$${price}`;
  };

  const PRICING_DEADLINE_LABEL = "Oct 12";
  const divisionsForPricing = event.availableDivisions ?? [];
  const pricingRowsMap = divisionsForPricing.reduce((map, division) => {
    const defaults = divisionPricingDefaults[division.name as keyof typeof divisionPricingDefaults];
    const label = defaults?.label ?? division.name;
    if (map.has(label)) {
      return map;
    }
    const before = defaults?.before ?? division.earlyBird?.price ?? null;
    const after = defaults?.after ?? division.regular?.price ?? null;
    map.set(label, {
      label,
      before: formatAmount(before),
      after: formatAmount(after),
    });
    return map;
  }, new Map<string, { label: string; before: string; after: string }>());
  const pricingRowsArray = Array.from(pricingRowsMap.values());

  // "Prep Pack": downloadable resources for coaches and admins.
  const documents = [
    {
      name: "Event information packet",
      description: "Schedule overview, scoring rubric, venue policies",
      href: "#",
    },
    {
      name: "Routine music licensing form",
      description: "Submit proof of music licensing for each team",
      href: "#",
    },
    {
      name: "Insurance waiver",
      description: "Collect signed waivers for athletes and staff",
      href: "#",
    },
  ];

  // "Stay Options": curated hotel blocks with quick CTA links.
  const hotels = [
    {
      name: "Downtown Convention Marriott",
      rate: "$189/night",
      distance: "0.3 mi from venue",
      href: "#",
    },
    {
      name: "Cambridge Suites",
      rate: "$164/night",
      distance: "0.6 mi from venue",
      href: "#",
    },
    {
      name: "Garden Inn Waterfront",
      rate: "$172/night",
      distance: "1.1 mi from venue",
      href: "#",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Rail: hero carousel keeps brand visuals consistent with marketplace listing */}
      <EventHeroCarousel images={galleryImages} alt={event.name} />

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-16 pt-6 sm:px-10 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <article className="space-y-8">
          <FadeInSection>
            <header className="space-y-4">
            {/* Event Header: primary identity block showing title, organizer, and quick tags */}
            <div className="space-y-2">
              <h1 className="heading-1 text-foreground sm:heading-2">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <TrophyIcon className="text-primary/70 size-4" />
                  {event.organizer}
                </span>
                <Separator orientation="vertical" className="hidden h-4 sm:flex" />
                <span className="flex items-center gap-2">
                  <CalendarDaysIcon className="text-primary/70 size-4" />
                  {event.date}
                </span>
                <Separator orientation="vertical" className="hidden h-4 sm:flex" />
                <span className="flex items-center gap-2">
                  <MapPinIcon className="text-primary/70 size-4" />
                  {event.location}
                </span>
              </div>
            </div>
          </header>
          </FadeInSection>

          <FadeInSection delay={100}>
            <section className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            {/* Overview Blurb: narrative intro highlighting experience upgrades */}
            <h2 className="heading-3 text-foreground">Overview</h2>
            <p className="text-muted-foreground body-text">
              {event.description} Added amenities include expanded warm-up rotations, on-site athletic trainers,
              backstage video replay, and hospitality lounges for club directors. Expect curated judges feedback, vendor
              experiences, and a champion&apos;s parade following finals.
            </p>
          </section>
          </FadeInSection>

          <FadeInSection delay={200}>
            <section className="space-y-4 text-sm text-muted-foreground">
            {/* Venue Snapshot: quick address plus future map embed */}
            <h2 className="heading-3 text-foreground">Location</h2>
            <div className="grid gap-4 rounded-lg border border-dashed border-border/60 p-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-foreground">
                  <MapPinIcon className="text-primary/70 size-4" />
                  {event.location}
                </p>
                <p className="body-text">
                  Directly attached to public transit with adjacent parking options and athlete drop-off zones.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer">
                    Open in Google Maps
                  </Link>
                </Button>
              </div>
              <div className="relative h-48 overflow-hidden rounded-lg bg-muted">
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                  Map preview coming soon
                </div>
              </div>
            </div>
          </section>
          </FadeInSection>

          <FadeInSection delay={300}>
            <section className="space-y-4">
            {/* Date Rail: key operational milestones for planners */}
            <h2 className="heading-3 text-foreground">Event Timeline</h2>
            <div className="grid gap-3 text-sm text-muted-foreground">
              {timeline.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border/70 bg-card/80 p-5 transition hover:border-primary/40"
                >
                  <div className="flex flex-col gap-1">
                    <p className="heading-4 text-foreground">{item.label}</p>
                    <div className="body-text flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="text-primary/70 size-4" />
                        {item.date}
                      </span>
                      {item.time ? (
                        <span className="flex items-center gap-1">
                          <ClockIcon className="text-primary/70 size-4" />
                          {item.time}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="body-text mt-2">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
          </FadeInSection>

          <FadeInSection delay={400}>
            <section className="space-y-4" id="pricing">
            {/* Fee Matrix: division-based pricing with early/standard tiers */}
            <h2 className="heading-3 text-foreground">Pricing</h2>
            <div className="overflow-hidden rounded-lg border border-border/70">
              <table className="w-full table-fixed text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="p-4 text-left font-semibold">Division</th>
                    <th className="p-4 text-left font-semibold">{`Before ${PRICING_DEADLINE_LABEL}`}</th>
                    <th className="p-4 text-left font-semibold">{`After ${PRICING_DEADLINE_LABEL}`}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {pricingRowsArray.length ? (
                    pricingRowsArray.map((row) => (
                      <tr key={row.label}>
                        <td className="p-4 font-medium text-foreground">{row.label}</td>
                        <td className="p-4">{row.before}</td>
                        <td className="p-4">{row.after}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-6 text-center text-sm text-muted-foreground" colSpan={3}>
                        Pricing information will be available soon.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          </FadeInSection>

          <FadeInSection delay={500}>
            <section className="space-y-4">
            {/* Download Deck: resource cards for compliance and preparation */}
            <h2 className="heading-3 text-foreground">Documents & Resources</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {documents.map((doc) => (
                <Card key={doc.name} className="border-border/70">
                  <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
                    <DownloadIcon className="text-primary/70 size-5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-foreground font-medium">{doc.name}</p>
                      <p className="body-text">{doc.description}</p>
                      <Button asChild variant="link" size="sm" className="px-0 text-primary">
                        <Link href={doc.href}>Download</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
          </FadeInSection>

          <FadeInSection delay={600}>
            <section className="space-y-4">
            {/* Stay Finder: nearby hotel options with quick booking links */}
            <h2 className="heading-3 text-foreground">Hotel Accommodations</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {hotels.map((hotel) => (
                <Card key={hotel.name} className="border-border/70">
                  <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
                    <HotelIcon className="text-primary/70 size-5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-foreground font-medium">{hotel.name}</p>
                      <p className="body-text">{hotel.rate}</p>
                      <p className="body-text">{hotel.distance}</p>
                      <Button asChild variant="link" size="sm" className="px-0 text-primary">
                        <Link href={hotel.href}>View hotel block</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
          </FadeInSection>

          <FadeInSection delay={700}>
            <section className="space-y-3 text-sm text-muted-foreground">
            {/* Results Teaser: placeholder until scoring pipeline posts data */}
            <h2 className="heading-3 text-foreground">Results & Leaderboard</h2>
            <Card className="border-border/70">
              <CardContent className="flex items-center justify-between gap-4 p-6">
                <div>
                  <p className="text-foreground font-medium">Coming soon</p>
                  <p className="body-text">Scores and placements will publish once awards conclude.</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  <Share2Icon className="mr-2 size-4" />
                  Notify me
                </Button>
              </CardContent>
            </Card>
          </section>
          </FadeInSection>
        </article>

        <FadeInSection delay={100}>
          <aside className="space-y-6" id="register">
          {/* Checkout Rail: sticky registration summary and CTA */}
          <RegistrationSummaryCard
            eventId={event.id}
            registrationDeadline={registrationDeadlineISO}
            slotLabel={slotLabel}
          />
          <p className="text-xs text-muted-foreground">
            Need help with registration? Contact our events concierge to coordinate rosters, invoices, and travel.
          </p>
        </aside>
        </FadeInSection>
      </section>
    </main>
  );
}
