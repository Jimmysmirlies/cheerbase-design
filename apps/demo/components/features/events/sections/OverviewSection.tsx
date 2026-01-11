"use client";

import { Input } from "@workspace/ui/shadcn/input";
import { Textarea } from "@workspace/ui/shadcn/textarea";
import { Label } from "@workspace/ui/shadcn/label";
import type { Event } from "@/types/events";
import type { BaseSectionProps } from "./types";

export type OverviewSectionProps = BaseSectionProps;

/**
 * OverviewSection displays the event title and description.
 * Supports both view and edit modes.
 */
export function OverviewSection({
  mode,
  eventData,
  onUpdate,
}: OverviewSectionProps) {
  // VIEW MODE
  if (mode === "view") {
    return (
      <p className="text-muted-foreground body-text">{eventData.description}</p>
    );
  }

  // EDIT MODE
  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-2">
        <Label htmlFor="event-title">Event Title</Label>
        <Input
          id="event-title"
          value={eventData.name || ""}
          onChange={(e) => onUpdate?.({ name: e.target.value })}
          placeholder="Enter event name..."
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="event-description">Description</Label>
        <Textarea
          id="event-description"
          value={eventData.description || ""}
          onChange={(e) => onUpdate?.({ description: e.target.value })}
          placeholder="Describe your event..."
          rows={6}
          className="w-full"
        />
      </div>
    </div>
  );
}

/** Check if section has data to display */
OverviewSection.hasData = (eventData: Partial<Event>): boolean => {
  return !!(eventData.name || eventData.description);
};

/** Empty state configuration */
OverviewSection.emptyTitle = "Add event title and description";
OverviewSection.emptyDescription =
  "Give your event a name and describe what makes it special";
