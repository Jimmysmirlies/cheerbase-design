/**
 * Event Registration Page
 *
 * Purpose
 * - Dedicated route presenting full event details before a club registers.
 * - Mirrors the registration detail page layout with PageHeader.
 *
 * Structure
 * - PageHeader with gradient banner
 * - Main content: overview, gallery, organizer, details
 * - Aside card: pricing, availability, primary CTA
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Link from "next/link";

import { Button } from "@workspace/ui/shadcn/button";

import {
  CalendarDaysIcon,
  MapPinIcon,
  Share2Icon,
  DownloadIcon,
  ClockIcon,
  HotelIcon,
} from "lucide-react";

import { FadeInSection } from "@/components/ui";
import { EventGallery } from "@/components/ui/gallery/EventGallery";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrganizerCard } from "@/components/features/clubs/OrganizerCard";
import { RegistrationSummaryCard } from "@/components/features/events/RegistrationSummaryCard";
import { findEventById, listEvents, isRegistrationClosed } from "@/data/events";
import { findOrganizerByName, formatFollowers, formatHostingDuration } from "@/data/events/organizers";
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

  // Look up organizer data for gradient and stats
  const organizer = findOrganizerByName(event.organizer);

  // "Milestone Rail": timeline posts for critical event dates shown in the vertical rail.
  const formatTimelineDate = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  const competitionDate = new Date(event.date);
  const dayBefore = new Date(competitionDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  
  // Use event's registration deadline if available, otherwise day before event
  const registrationDeadlineISO = event.registrationDeadline 
    ? new Date(event.registrationDeadline).toISOString()
    : dayBefore.toISOString();
  
  // Check if registration is closed
  const registrationClosed = isRegistrationClosed(event);

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
    <section className="flex flex-1 flex-col">
      {/* PageHeader with organizer's brand gradient */}
      <PageHeader
        title={event.name}
        hideSubtitle
        gradientVariant={organizer?.gradient ?? 'primary'}
        breadcrumbItems={[
          { label: 'Events', href: '/events/search' },
          { label: event.name },
        ]}
        eventStartDate={registrationDeadlineISO}
        hideCountdown
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <article className="space-y-12 px-1">
            {/* Overview Section */}
            <FadeInSection>
              <div className="flex flex-col gap-4">
                <p className="heading-4">Overview</p>
                <p className="text-muted-foreground body-small">
                  {event.description} Added amenities include expanded warm-up rotations, on-site athletic trainers,
                  backstage video replay, and hospitality lounges for club directors. Expect curated judges feedback, vendor
                  experiences, and a champion&apos;s parade following finals.
                </p>
              </div>
            </FadeInSection>

            {/* Gallery Section */}
            <FadeInSection delay={100}>
              <div className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Gallery</p>
                <EventGallery images={galleryImages} alt={event.name} maxImages={4} />
              </div>
            </FadeInSection>

            {/* Organizer Section */}
            <FadeInSection delay={200}>
              <div className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Organizer</p>
                <OrganizerCard
                  name={event.organizer}
                  gradient={organizer?.gradient ?? 'primary'}
                  followers={organizer ? formatFollowers(organizer.followers) : '—'}
                  eventsCount={organizer?.eventsCount}
                  hostingDuration={organizer ? formatHostingDuration(organizer.hostingYears) : undefined}
                />
              </div>
            </FadeInSection>

            {/* Date & Location Section */}
            <FadeInSection delay={300}>
              <div className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Date & Location</p>
                <div className="rounded-md border border-border/70 bg-card/60 p-5 transition-all hover:border-primary/20">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-4">
                      <p className="label text-muted-foreground">Event Details</p>
                      <div className="body-small flex flex-col gap-2.5 text-muted-foreground">
                        <p className="flex items-start gap-2">
                          <MapPinIcon className="text-primary/70 size-4 shrink-0 translate-y-[2px]" />
                          <span className="text-foreground">{event.location}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CalendarDaysIcon className="text-primary/70 size-4 shrink-0" />
                          <span className="text-foreground">{event.date}</span>
                        </p>
                      </div>
                    </div>
                    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border border-border/70 bg-muted/50">
                      <iframe
                        src={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
                        className="absolute inset-0 h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Map of ${event.location}`}
                      />
                      <Link
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-10"
                        aria-label={`Open ${event.location} in Google Maps`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* Event Timeline Section */}
            <FadeInSection delay={400}>
              <div className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Event Timeline</p>
                <div className="flex flex-col gap-3">
                  {timeline.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-md border border-border/70 bg-card/60 p-5 transition-all hover:border-primary/20"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-foreground">{item.label}</p>
                        <div className="body-small flex flex-wrap items-center gap-4 text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <CalendarDaysIcon className="text-primary/70 size-4" />
                            {item.date}
                          </span>
                          {item.time ? (
                            <span className="flex items-center gap-1.5">
                              <ClockIcon className="text-primary/70 size-4" />
                              {item.time}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="body-small text-muted-foreground mt-2">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            {/* Pricing Section */}
            <FadeInSection delay={500}>
              <div className="flex flex-col gap-4" id="pricing">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Pricing</p>
                <div className="overflow-hidden rounded-md border border-border/70">
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
              </div>
            </FadeInSection>

            {/* Documents & Resources Section */}
            <FadeInSection delay={600}>
              <div className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Documents & Resources</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {documents.map((doc) => (
                    <div key={doc.name} className="rounded-md border border-border/70 bg-card/60 p-5 transition-all hover:border-primary/20">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <DownloadIcon className="text-primary/70 size-5 shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-0.5">
                            <p className="body-text font-semibold text-foreground">{doc.name}</p>
                            <p className="body-small text-muted-foreground">{doc.description}</p>
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm" className="shrink-0">
                          <Link href={doc.href}>Download</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            {/* Hotel Accommodations Section */}
            <FadeInSection delay={700}>
              <div className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Hotel Accommodations</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {hotels.map((hotel) => (
                    <div key={hotel.name} className="rounded-md border border-border/70 bg-card/60 p-5 transition-all hover:border-primary/20">
                      <div className="flex items-start gap-3">
                        <HotelIcon className="text-primary/70 size-5 shrink-0" />
                        <div className="flex flex-col gap-1">
                          <p className="text-foreground font-medium">{hotel.name}</p>
                          <p className="body-small text-muted-foreground">{hotel.rate}</p>
                          <p className="body-small text-muted-foreground">{hotel.distance}</p>
                          <Button asChild variant="link" size="sm" className="h-auto px-0 py-1 text-primary">
                            <Link href={hotel.href}>View hotel block</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            {/* Results Section */}
            <FadeInSection delay={800}>
              <div className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Results & Leaderboard</p>
                <div className="rounded-md border border-border/70 bg-card/60 p-5 transition-all hover:border-primary/20">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-foreground font-medium">Coming soon</p>
                      <p className="body-small text-muted-foreground">Scores and placements will publish once awards conclude.</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      <Share2Icon className="mr-2 size-4" />
                      Notify me
                    </Button>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </article>

          {/* Sidebar with Registration CTA (desktop) */}
          <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <FadeInSection delay={200}>
              <div className="flex flex-col gap-4">
                <RegistrationSummaryCard
                  eventId={event.id}
                  registrationDeadline={registrationDeadlineISO}
                  slotLabel={slotLabel}
                  isRegistrationClosed={registrationClosed}
                />
                <p className="text-xs text-muted-foreground">
                  Need help with registration? Contact our events concierge to coordinate rosters, invoices, and travel.
                </p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-foreground">{slotLabel} teams confirmed</p>
            <p className="text-xs text-muted-foreground">
              {registrationClosed 
                ? 'Registration has closed'
                : (() => {
                    const deadlineDate = new Date(registrationDeadlineISO);
                    const now = new Date();
                    const msPerDay = 1000 * 60 * 60 * 24;
                    const daysRemaining = Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / msPerDay));
                    return daysRemaining === 0
                      ? 'Registration closes today'
                      : `Closes in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
                  })()
              }
            </p>
          </div>
          {registrationClosed ? (
            <Button size="sm" disabled>
              Closed
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href={`/events/${encodeURIComponent(event.id)}/register`}>Register</Link>
            </Button>
          )}
        </div>
      </div>
      {/* Spacer to prevent content from being hidden behind sticky footer */}
      <div className="h-20 lg:hidden" />
    </section>
  );
}
