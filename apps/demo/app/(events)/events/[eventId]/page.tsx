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
  const organizer = findOrganizerByName(event.organizer);

  const competitionDate = new Date(event.date);
  const dayBefore = new Date(competitionDate);
  dayBefore.setDate(dayBefore.getDate() - 1);

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

  const locationParts = event.location.split(", ");
  const venueName = locationParts[0] ?? event.location;
  const cityState = locationParts.slice(1).join(", ");

  const registrationDeadlineISO = event.registrationDeadline
    ? new Date(event.registrationDeadline).toISOString()
    : dayBefore.toISOString();

  const registrationClosed = isRegistrationClosed(event);

  const earlyBirdDeadline = event.earlyBirdDeadline
    ? new Date(event.earlyBirdDeadline)
    : null;

  function formatAmount(price?: number | null): string {
    if (price === null || price === undefined) {
      return "—";
    }
    if (price === 0) {
      return "Free";
    }
    return `$${price}`;
  }

  const PRICING_DEADLINE_LABEL = earlyBirdDeadline
    ? earlyBirdDeadline.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Early Bird";

  const divisionsForPricing = event.availableDivisions ?? [];
  const pricingRowsArray = divisionsForPricing.map((division) => {
    const label = division.name;
    const before = division.earlyBird?.price ?? division.regular?.price ?? null;
    const after = division.regular?.price ?? null;
    return {
      label,
      subtitle: "",
      before: formatAmount(before),
      after: formatAmount(after),
    };
  });

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
      hideDateLine
    />
  );
}
