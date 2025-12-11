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
  UsersIcon,
  ExternalLinkIcon,
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
  
  // Format date parts for the key info row
  const eventDateParts = {
    month: competitionDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: competitionDate.getDate().toString(),
    weekday: competitionDate.toLocaleDateString("en-US", { weekday: "long" }),
    fullDate: competitionDate.toLocaleDateString("en-US", { day: "numeric", month: "long" }),
  };
  
  // Extract city/state from location for display
  const locationParts = event.location.split(", ");
  const venueName = locationParts[0];
  const cityState = locationParts.slice(1).join(", ");
  
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

  return (
    <section className="flex flex-1 flex-col">
      {/* PageHeader with organizer's brand gradient */}
      <PageHeader
        title={event.name}
        hideSubtitle
        gradientVariant={organizer?.gradient ?? 'primary'}
        eventStartDate={event.date}
        showEventDateAsBreadcrumb
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

            {/* Organizer Section */}
            <FadeInSection delay={100}>
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
            <FadeInSection delay={200}>
              <div className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Date & Location</p>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    {/* Date */}
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 flex-col items-center justify-center rounded-md border bg-muted/30 overflow-hidden">
                        <span className="text-[10px] font-medium text-muted-foreground leading-none">{eventDateParts.month}</span>
                        <span className="text-lg font-semibold text-foreground leading-none">{eventDateParts.day}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {eventDateParts.weekday}, {eventDateParts.fullDate}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-md border bg-muted/30">
                        <MapPinIcon className="size-5 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <Link
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-foreground hover:underline inline-flex items-center gap-1"
                        >
                          {venueName}
                          <ExternalLinkIcon className="size-3" />
                        </Link>
                        <span className="text-xs text-muted-foreground">{cityState}</span>
                      </div>
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
            </FadeInSection>

            {/* Gallery Section */}
            <FadeInSection delay={300}>
              <div className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Gallery</p>
                <EventGallery images={galleryImages} alt={event.name} maxImages={4} />
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
                  <table className="w-full table-auto text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3 font-medium sm:px-4">Division</th>
                        <th className="px-3 py-3 font-medium sm:px-4">{`Before ${PRICING_DEADLINE_LABEL}`}</th>
                        <th className="px-3 py-3 font-medium sm:px-4">{`After ${PRICING_DEADLINE_LABEL}`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingRowsArray.length ? (
                        pricingRowsArray.map((row) => (
                          <tr key={row.label} className="border-t">
                            <td className="text-foreground px-3 py-3 sm:px-4">{row.label}</td>
                            <td className="px-3 py-3 sm:px-4">{row.before}</td>
                            <td className="px-3 py-3 sm:px-4">{row.after}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t">
                          <td className="px-3 py-6 text-center text-sm text-muted-foreground sm:px-4" colSpan={3}>
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
              <RegistrationSummaryCard
                eventId={event.id}
                eventDate={event.date}
                eventStartTime="9:00 AM"
                registrationDeadline={registrationDeadlineISO}
                isRegistrationClosed={registrationClosed}
              />
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
