"use client";

import { PageTitle } from "@/components/layout/PageTitle";
import { UnifiedEventDetailBody } from "./UnifiedEventDetailBody";
import { EventStickyNav } from "./EventStickyNav";
import { EventSectionProvider } from "./EventSectionContext";
import type { BrandGradient } from "@/lib/gradients";
import type { TimelinePhase, PricingRow } from "./sections";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDateLabel(date: string): string {
  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) return "";
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export type EventDetailContentProps = {
  event: {
    id: string;
    name: string;
    date: string;
    description: string;
    organizer: string;
    location: string;
  };
  organizerGradient: BrandGradient;
  organizerFollowers: string;
  organizerEventsCount?: number;
  organizerHostingDuration?: string;
  galleryImages: string[];
  eventDateParts: {
    month: string;
    day: string;
    weekday: string;
    fullDate: string;
  };
  venueName: string;
  cityState: string;
  registrationDeadlineISO: string;
  registrationClosed: boolean;
  timelinePhases: TimelinePhase[];
  pricingDeadlineLabel: string;
  pricingRows: PricingRow[];
  documents: { name: string; description: string; href: string }[];
  earlyBirdEnabled?: boolean;
};

export function EventDetailContent(props: EventDetailContentProps) {
  return (
    <EventSectionProvider initialGradient={props.organizerGradient}>
      {/* Airbnb-style sticky section navigation */}
      <EventStickyNav
        gradient={props.organizerGradient}
        titleElementId="event-title"
      />

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:px-8">
        <div id="event-title">
          <PageTitle
            title={props.event.name}
            gradient={props.organizerGradient}
            dateLabel={formatDateLabel(props.event.date)}
            locationLabel={props.event.location}
          />
        </div>

        <UnifiedEventDetailBody
          eventData={{
            id: props.event.id,
            name: props.event.name,
            date: props.event.date,
            description: props.event.description,
            organizer: props.event.organizer,
            location: props.event.location,
            earlyBirdEnabled: props.earlyBirdEnabled,
          }}
          organizerGradient={props.organizerGradient}
          organizerFollowers={props.organizerFollowers}
          organizerEventsCount={props.organizerEventsCount}
          organizerHostingDuration={props.organizerHostingDuration}
          displayProps={{
            galleryImages: props.galleryImages,
            eventDateParts: props.eventDateParts,
            venueName: props.venueName,
            cityState: props.cityState,
            registrationDeadlineISO: props.registrationDeadlineISO,
            registrationClosed: props.registrationClosed,
            timelinePhases: props.timelinePhases,
            pricingDeadlineLabel: props.pricingDeadlineLabel,
            pricingRows: props.pricingRows,
            documents: props.documents,
            earlyBirdEnabled: props.earlyBirdEnabled,
          }}
        />
      </section>
    </EventSectionProvider>
  );
}

// Re-export types for convenience
export type { TimelinePhase, PricingRow } from "./sections";
