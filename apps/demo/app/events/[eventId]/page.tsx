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

import { Badge } from "@workspace/ui/shadcn/badge";
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

import { NavBar } from "@/components/nav-bar";
import { EventHeroCarousel } from "@/components/ui";
import { RegistrationSummaryCard } from "@/components/events/RegistrationSummaryCard";
import { findEventById, listEvents } from "@/data/event-categories";
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

  const slotLabel = `${event.slots.filled}/${event.slots.capacity} teams`;
  const galleryImages = buildEventGalleryImages(event);
  const tags = event.tags ?? [];

  const timeline = [
    { label: "Registration opens", date: "Jan 08, 2025", detail: "Online portal opens at 9:00 AM ET" },
    { label: "Roster freeze", date: "Mar 22, 2025", detail: "Last day to update athlete lineups" },
    { label: "Coach check-in", date: "Apr 18, 2025", detail: "Credential pickup from 4:00 – 7:00 PM" },
    { label: "Competition day", date: event.date, detail: "Warm-ups begin 90 minutes before report time" },
  ];

  const pricing = [
    { type: "All-Star", early: "$425 (before Feb 15)", regular: "$475 (after Feb 15)" },
    { type: "Novice", early: "$295 (before Feb 15)", regular: "$335 (after Feb 15)" },
    { type: "University", early: "$360 (before Feb 15)", regular: "$410 (after Feb 15)" },
  ];

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
      <NavBar />

      <EventHeroCarousel images={galleryImages} alt={event.name} />

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-16 pt-6 sm:px-10 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <article className="space-y-8">
          <header className="space-y-4">
            <Badge variant="outline" className="text-xs uppercase tracking-wide">
              {event.type}
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{event.name}</h1>
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
              {tags.length ? (
                <div className="flex flex-wrap gap-2 pt-3">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </header>

          <section className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="text-foreground text-lg font-semibold">Overview</h2>
            <p>
              {event.description} Added amenities include expanded warm-up rotations, on-site athletic trainers,
              backstage video replay, and hospitality lounges for club directors. Expect curated judges feedback, vendor
              experiences, and a champion’s parade following finals.
            </p>
          </section>

          <section className="space-y-4 text-sm text-muted-foreground">
            <h2 className="text-foreground text-lg font-semibold">Location</h2>
            <div className="grid gap-4 rounded-3xl border border-dashed border-border/60 p-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-foreground">
                  <MapPinIcon className="text-primary/70 size-4" />
                  {event.location}
                </p>
                <p>Directly attached to public transit with adjacent parking options and athlete drop-off zones.</p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer">
                    Open in Google Maps
                  </Link>
                </Button>
              </div>
              <div className="relative h-48 overflow-hidden rounded-2xl bg-muted">
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                  Map preview coming soon
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-lg font-semibold">Event timeline</h2>
            <ol className="border-border/70 relative border-l pl-6 text-sm text-muted-foreground">
              {timeline.map((item) => (
                <li key={item.label} className="relative mb-6 last:mb-0">
                  <div className="absolute -left-[10px] flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background">
                    <ClockIcon className="size-3 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">{item.label}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground/70">{item.date}</p>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="space-y-4" id="pricing">
            <h2 className="text-foreground text-lg font-semibold">Pricing</h2>
            <div className="overflow-hidden rounded-3xl border border-border/70">
              <table className="w-full table-fixed text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="p-4 text-left font-semibold">Division</th>
                    <th className="p-4 text-left font-semibold">Early bird</th>
                    <th className="p-4 text-left font-semibold">Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {pricing.map((row) => (
                    <tr key={row.type}>
                      <td className="p-4 font-medium text-foreground">{row.type}</td>
                      <td className="p-4">{row.early}</td>
                      <td className="p-4">{row.regular}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-lg font-semibold">Documents & resources</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {documents.map((doc) => (
                <Card key={doc.name} className="border-border/70">
                  <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
                    <DownloadIcon className="text-primary/70 size-5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-foreground font-medium">{doc.name}</p>
                      <p>{doc.description}</p>
                      <Button asChild variant="link" size="sm" className="px-0 text-primary">
                        <Link href={doc.href}>Download</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-lg font-semibold">Hotel accommodations</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {hotels.map((hotel) => (
                <Card key={hotel.name} className="border-border/70">
                  <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
                    <HotelIcon className="text-primary/70 size-5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-foreground font-medium">{hotel.name}</p>
                      <p>{hotel.rate}</p>
                      <p>{hotel.distance}</p>
                      <Button asChild variant="link" size="sm" className="px-0 text-primary">
                        <Link href={hotel.href}>View hotel block</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3 text-sm text-muted-foreground">
            <h2 className="text-foreground text-lg font-semibold">Results & leaderboard</h2>
            <Card className="border-border/70">
              <CardContent className="flex items-center justify-between gap-4 p-6">
                <div>
                  <p className="text-foreground font-medium">Coming soon</p>
                  <p>Scores and placements will publish once awards conclude.</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  <Share2Icon className="mr-2 size-4" />
                  Notify me
                </Button>
              </CardContent>
            </Card>
          </section>
        </article>

        <aside className="space-y-6" id="register">
          <RegistrationSummaryCard
            eventId={event.id}
            fee={event.fee}
            pricePerParticipant={event.pricePerParticipant}
            slotLabel={slotLabel}
          />
          <p className="text-xs text-muted-foreground">
            Need help with registration? Contact our events concierge to coordinate rosters, invoices, and travel.
          </p>
        </aside>
      </section>
    </main>
  );
}
