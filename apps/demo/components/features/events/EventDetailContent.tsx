"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LayoutToggle } from "@/components/ui/LayoutToggle";
import { UnifiedEventDetailBody } from "./UnifiedEventDetailBody";
import type { BrandGradient } from "@/lib/gradients";
import type { TimelinePhase, PricingRow } from "./sections";

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
  const [layout, setLayout] = useState<"A" | "B">("A");

  return (
    <section className="flex flex-1 flex-col gap-6 py-8">
      <PageHeader
        title={props.event.name}
        gradient={props.organizerGradient}
        dateLabel={props.event.date}
        locationLabel={props.event.location}
        topRightAction={
          <LayoutToggle
            variants={["A", "B"] as const}
            value={layout}
            onChange={setLayout}
            showTutorial={false}
          />
        }
      />

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
        layout={layout}
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
  );
}

// Re-export types for convenience
export type { TimelinePhase, PricingRow } from "./sections";
