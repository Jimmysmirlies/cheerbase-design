"use client";

import { useMemo } from "react";
import type { Event } from "@/types/events";
import type { BrandGradient } from "@/lib/gradients";
import { isRegistrationClosed } from "@/data/events";

export type PricingRow = {
  label: string;
  subtitle: string;
  before: string;
  after: string;
};

export type EventDateParts = {
  month: string;
  day: string;
  weekday: string;
  fullDate: string;
};

export type EventDisplayProps = {
  galleryImages: string[];
  eventDateParts: EventDateParts;
  venueName: string;
  cityState: string;
  registrationDeadlineISO: string;
  registrationClosed: boolean;
  pricingDeadlineLabel: string;
  pricingRows: PricingRow[];
  documents: { name: string; description: string; href: string }[];
  earlyBirdEnabled: boolean;
};

/**
 * Hook that computes all display props from raw event data.
 * Used by the editor to provide live WYSIWYG preview.
 */
export function useEventDisplayProps(
  eventData: Partial<Event>,
  _organizerGradient: BrandGradient = "teal",
): EventDisplayProps {
  return useMemo(() => {
    // Gallery images
    const galleryImages = eventData.gallery || [];

    // Date computation
    const competitionDate = eventData.date
      ? new Date(eventData.date)
      : new Date();
    const isValidDate = !isNaN(competitionDate.getTime());

    const eventDateParts: EventDateParts = isValidDate
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

    // Location parsing
    const location = eventData.location || "";
    const locationParts = location.split(", ");
    const venueName = locationParts[0] || "Venue TBD";
    const cityState = locationParts.slice(1).join(", ") || "";

    // Registration deadline
    const dayBefore = new Date(competitionDate);
    dayBefore.setDate(dayBefore.getDate() - 1);

    const registrationDeadlineISO = eventData.registrationDeadline
      ? new Date(eventData.registrationDeadline).toISOString()
      : isValidDate
        ? dayBefore.toISOString()
        : new Date().toISOString();

    // Registration closed check
    const registrationClosed = eventData.date
      ? isRegistrationClosed({
          registrationDeadline: eventData.registrationDeadline,
          date: eventData.date,
        })
      : false;

    // Early bird deadline for pricing
    const earlyBirdDeadline = eventData.earlyBirdDeadline
      ? new Date(eventData.earlyBirdDeadline)
      : null;

    // Pricing rows computation
    const formatAmount = (price?: number | null) => {
      if (price === null || price === undefined) return "—";
      if (price === 0) return "Free";
      return `$${price}`;
    };

    const pricingDeadlineLabel = earlyBirdDeadline
      ? earlyBirdDeadline.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Early Bird";

    const divisionsForPricing = eventData.availableDivisions ?? [];
    const pricingRows: PricingRow[] = divisionsForPricing.map((division) => ({
      label: division.name,
      subtitle: "",
      before: formatAmount(
        division.earlyBird?.price ?? division.regular?.price ?? null,
      ),
      after: formatAmount(division.regular?.price ?? null),
    }));

    // Documents - empty by default, populated from event data
    const documents = eventData.documents || [];

    return {
      galleryImages,
      eventDateParts,
      venueName,
      cityState,
      registrationDeadlineISO,
      registrationClosed,
      pricingDeadlineLabel,
      pricingRows,
      documents,
      earlyBirdEnabled: eventData.earlyBirdEnabled ?? false,
    };
  }, [eventData]);
}
