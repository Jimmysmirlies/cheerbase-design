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

import { EventDetailContent } from "@/components/features/events/EventDetailContent";
import { findEventById, listEvents, isRegistrationClosed } from "@/data/events";
import {
  findOrganizerByName,
  formatFollowers,
  formatHostingDuration,
} from "@/data/events/organizers";
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

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : null;
  const eventId = resolvedParams?.eventId
    ? decodeURIComponent(resolvedParams.eventId)
    : null;
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

  const galleryImages = buildEventGalleryImages(event);

  // Look up organizer data for gradient and stats
  const organizer = findOrganizerByName(event.organizer);

  const competitionDate = new Date(event.date);
  const dayBefore = new Date(competitionDate);
  dayBefore.setDate(dayBefore.getDate() - 1);

  // Format date parts for the key info row
  const eventDateParts = {
    month: competitionDate
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase(),
    day: competitionDate.getDate().toString(),
    weekday: competitionDate.toLocaleDateString("en-US", { weekday: "long" }),
    fullDate: competitionDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    }),
  };

  // Extract city/state from location for display
  const locationParts = event.location.split(", ");
  const venueName = locationParts[0] ?? event.location;
  const cityState = locationParts.slice(1).join(", ");

  // Use event's registration deadline if available, otherwise day before event
  const registrationDeadlineISO = event.registrationDeadline
    ? new Date(event.registrationDeadline).toISOString()
    : dayBefore.toISOString();

  // Check if registration is closed
  const registrationClosed = isRegistrationClosed(event);

  // Early bird deadline for pricing display
  const earlyBirdDeadline = event.earlyBirdDeadline
    ? new Date(event.earlyBirdDeadline)
    : null;

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

  // Format early bird deadline for pricing table header
  const PRICING_DEADLINE_LABEL = earlyBirdDeadline
    ? earlyBirdDeadline.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Early Bird";
  // Build pricing rows using the actual division names from the event
  const divisionsForPricing = event.availableDivisions ?? [];
  const pricingRowsArray = divisionsForPricing.map((division) => {
    // Use actual division name as the label
    const label = division.name;
    // Use event-specific pricing
    const before = division.earlyBird?.price ?? division.regular?.price ?? null;
    const after = division.regular?.price ?? null;
    return {
      label,
      subtitle: "", // Division names are self-descriptive
      before: formatAmount(before),
      after: formatAmount(after),
    };
  });

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
    <EventDetailContent
      event={{
        id: event.id,
        name: event.name,
        date: event.date,
        description: event.description,
        organizer: event.organizer,
        location: event.location,
      }}
      organizerGradient={organizer?.gradient ?? "teal"}
      organizerFollowers={
        organizer ? formatFollowers(organizer.followers) : "—"
      }
      organizerEventsCount={organizer?.eventsCount}
      organizerHostingDuration={
        organizer ? formatHostingDuration(organizer.hostingYears) : undefined
      }
      galleryImages={galleryImages}
      eventDateParts={eventDateParts}
      venueName={venueName}
      cityState={cityState}
      registrationDeadlineISO={registrationDeadlineISO}
      registrationClosed={registrationClosed}
      pricingDeadlineLabel={PRICING_DEADLINE_LABEL}
      pricingRows={pricingRowsArray}
      documents={documents}
    />
  );
}
