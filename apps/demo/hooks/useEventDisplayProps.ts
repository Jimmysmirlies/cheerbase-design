"use client";

import { useMemo } from "react";
import type { Event } from "@/types/events";
import { brandGradients, type BrandGradient } from "@/lib/gradients";
import { isRegistrationClosed } from "@/data/events";

type RegistrationPhase = "early-bird" | "regular" | "closed";

export type TimelinePhase = {
  id: string;
  title: string;
  subtitle: string | null;
  border: string;
  background: string;
  dot: string;
  usesGradient: boolean;
  gradientBg?: string;
  borderColor?: string;
  dotColor?: string;
  isCurrent: boolean;
};

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
  timelinePhases: TimelinePhase[];
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
  organizerGradient: BrandGradient = "teal",
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

    // Timeline phases computation
    const now = new Date();
    const earlyBirdDeadline = eventData.earlyBirdDeadline
      ? new Date(eventData.earlyBirdDeadline)
      : null;
    const registrationDeadline = eventData.registrationDeadline
      ? new Date(eventData.registrationDeadline)
      : isValidDate
        ? dayBefore
        : new Date();

    const formatTimelineDate = (date: Date) =>
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

    const msUntilEarlyBird = earlyBirdDeadline
      ? earlyBirdDeadline.getTime() - now.getTime()
      : null;
    const earlyBirdActive =
      !!earlyBirdDeadline && !!msUntilEarlyBird && msUntilEarlyBird > 0;

    const msUntilClose = registrationDeadline.getTime() - now.getTime();
    const registrationOpen = msUntilClose > 0;

    const isCardActive = (phaseId: RegistrationPhase): boolean => {
      if (phaseId === "early-bird") return earlyBirdActive;
      if (phaseId === "regular") return registrationOpen && !earlyBirdActive;
      if (phaseId === "closed") return !registrationOpen;
      return false;
    };

    // Gradient styling
    const gradient = brandGradients[organizerGradient] || brandGradients.teal;
    const firstGradientColor =
      gradient.css.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? "#8E69D0";

    const getPhaseStyles = (phaseId: RegistrationPhase) => {
      const isCurrent = isCardActive(phaseId);

      if (!isCurrent) {
        return {
          border: "border-border/30",
          background: "bg-muted/10",
          dot: "bg-muted-foreground/20",
          usesGradient: false,
        };
      }

      return {
        border: "",
        background: "",
        dot: "",
        gradientBg: gradient.css,
        borderColor: firstGradientColor,
        dotColor: firstGradientColor,
        usesGradient: true,
      };
    };

    // Build timeline phases
    type PhaseConfig = {
      id: RegistrationPhase;
      title: string;
      subtitle: string | null;
      show: boolean;
    };

    const allPhasesUnfiltered: PhaseConfig[] = [
      {
        id: "early-bird" as const,
        title: "Early Bird Pricing",
        subtitle: earlyBirdDeadline
          ? `Ends ${formatTimelineDate(earlyBirdDeadline)}`
          : null,
        show: !!earlyBirdDeadline,
      },
      {
        id: "regular" as const,
        title: "Registration Open",
        subtitle: `Ends ${formatTimelineDate(registrationDeadline)}`,
        show: registrationOpen,
      },
      {
        id: "closed" as const,
        title: "Registration Closed",
        subtitle: formatTimelineDate(registrationDeadline),
        show: true,
      },
    ];

    const allPhases = allPhasesUnfiltered.filter((phase) => phase.show);

    const timelinePhases: TimelinePhase[] = allPhases.map((phase) => {
      const phaseStyles = getPhaseStyles(phase.id);
      const isCurrent = isCardActive(phase.id);
      return {
        id: phase.id,
        title: phase.title,
        subtitle: phase.subtitle,
        border: phaseStyles.border,
        background: phaseStyles.background,
        dot: phaseStyles.dot,
        usesGradient: phaseStyles.usesGradient,
        gradientBg: phaseStyles.gradientBg,
        borderColor: phaseStyles.borderColor,
        dotColor: phaseStyles.dotColor,
        isCurrent,
      };
    });

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

    // Documents (static for now)
    const documents = eventData.documents || [
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

    return {
      galleryImages,
      eventDateParts,
      venueName,
      cityState,
      registrationDeadlineISO,
      registrationClosed,
      timelinePhases,
      pricingDeadlineLabel,
      pricingRows,
      documents,
      earlyBirdEnabled: eventData.earlyBirdEnabled ?? false,
    };
  }, [eventData, organizerGradient]);
}
