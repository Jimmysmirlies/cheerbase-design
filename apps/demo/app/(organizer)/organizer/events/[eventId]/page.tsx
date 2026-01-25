"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrganizerEventDetailContent } from "@/components/features/events/OrganizerEventDetailContent";
import { findEventById, isRegistrationClosed } from "@/data/events";
import {
  findOrganizerByName,
  formatFollowers,
  formatHostingDuration,
} from "@/data/events/organizers";
import { buildEventGalleryImages } from "@/app/(events)/events/[eventId]/image-gallery";
import { type BrandGradient } from "@/lib/gradients";
import { useAuth } from "@/components/providers/AuthProvider";

export default function OrganizerEventViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, status } = useAuth();
  const organizerId = user?.organizerId;

  const eventId =
    typeof params?.eventId === "string"
      ? decodeURIComponent(params.eventId)
      : null;

  const [organizerGradient, setOrganizerGradient] = useState<
    BrandGradient | undefined
  >(undefined);

  // Load published event only (drafts visible in edit view)
  const event = useMemo(() => {
    if (!eventId) return null;
    return findEventById(eventId);
  }, [eventId]);

  // Load organizer gradient
  useEffect(() => {
    if (!organizerId) return;

    const loadGradient = () => {
      try {
        const stored = localStorage.getItem(
          `cheerbase-organizer-settings-${organizerId}`,
        );
        if (stored) {
          const settings = JSON.parse(stored);
          if (settings.gradient) {
            setOrganizerGradient(settings.gradient);
            return;
          }
        }
      } catch {
        // Ignore storage errors
      }
      // Fall back to organizer's default gradient
      const organizer = findOrganizerByName(event?.organizer || "");
      if (organizer) {
        setOrganizerGradient(organizer.gradient as BrandGradient);
      }
    };

    loadGradient();

    const handleSettingsChange = (
      settingsEvent: CustomEvent<{ gradient: string }>,
    ) => {
      if (settingsEvent.detail?.gradient) {
        setOrganizerGradient(settingsEvent.detail.gradient as BrandGradient);
      }
    };

    window.addEventListener(
      "organizer-settings-changed",
      handleSettingsChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        "organizer-settings-changed",
        handleSettingsChange as EventListener,
      );
    };
  }, [organizerId, event?.organizer]);

  useEffect(() => {
    if (status === "loading") return;
    if (!user || user.role !== "organizer") {
      router.replace("/organizer/events");
      return;
    }
    if (!eventId || !event) {
      router.replace("/organizer/events");
      return;
    }
  }, [user, status, router, eventId, event]);

  if (status === "loading" || !event) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded bg-muted mt-2" />
      </section>
    );
  }

  const galleryImages = buildEventGalleryImages(event);
  const organizer = findOrganizerByName(event.organizer);

  const competitionDate = new Date(event.date);
  // Handle invalid dates (e.g., from draft events with missing date field)
  const isValidDate = !isNaN(competitionDate.getTime());
  const dayBefore = isValidDate ? new Date(competitionDate) : new Date();
  if (isValidDate) {
    dayBefore.setDate(dayBefore.getDate() - 1);
  }

  const eventDateParts = isValidDate
    ? {
        month: competitionDate
          .toLocaleDateString("en-US", { month: "short" })
          .toUpperCase(),
        day: competitionDate.getDate().toString(),
        weekday: competitionDate.toLocaleDateString("en-US", {
          weekday: "long",
        }),
        fullDate: competitionDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
        }),
      }
    : {
        month: "TBD",
        day: "—",
        weekday: "Date not set",
        fullDate: "Date not set",
      };

  const locationParts = event.location.split(", ");
  const venueName = locationParts[0] ?? event.location;
  const cityState = locationParts.slice(1).join(", ");

  const registrationDeadlineISO = event.registrationDeadline
    ? new Date(event.registrationDeadline).toISOString()
    : dayBefore.toISOString();

  const registrationClosed = isRegistrationClosed(event);

  // Early bird deadline for pricing display
  const earlyBirdDeadline = event.earlyBirdDeadline
    ? new Date(event.earlyBirdDeadline)
    : null;

  const formatAmount = (price?: number | null) => {
    if (price === null || price === undefined) {
      return "—";
    }
    if (price === 0) {
      return "Free";
    }
    return `$${price}`;
  };

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

  const isDraft = event.status === "draft";

  return (
    <OrganizerEventDetailContent
      isDraft={isDraft}
      organizerPageGradient={organizerGradient}
      organizerId={organizerId}
      event={{
        id: event.id,
        name: event.name,
        date: event.date,
        description: event.description,
        organizer: event.organizer,
        location: event.location,
      }}
      organizerGradient={organizerGradient ?? organizer?.gradient ?? "teal"}
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
