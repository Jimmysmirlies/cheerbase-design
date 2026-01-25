"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { MapPinIcon } from "lucide-react";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import { InlineEditCard } from "./InlineEditCard";

type EditableEventTitleSectionProps = {
  /** Event name */
  name?: string;
  /** Event organizer name */
  organizer?: string;
  /** Event location (display only) */
  location?: string;
  /** Callback when data is updated */
  onUpdate: (data: { name?: string }) => void;
};

function buildGoogleMapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function EditableEventTitleSection({
  name,
  organizer,
  location,
  onUpdate,
}: EditableEventTitleSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState("");

  const handleStartEdit = useCallback(() => {
    setLocalName(name || "");
    setIsEditing(true);
  }, [name]);

  const handleSave = useCallback(() => {
    onUpdate({ name: localName });
    setIsEditing(false);
  }, [localName, onUpdate]);

  const handleCancel = useCallback(() => {
    setLocalName("");
    setIsEditing(false);
  }, []);

  // Edit mode
  if (isEditing) {
    return (
      <div className="border-b border-border/60 pb-8">
        <InlineEditCard onSave={handleSave} onCancel={handleCancel}>
          <div className="space-y-2">
            <Label htmlFor="event-title">Event Title</Label>
            <Input
              id="event-title"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Enter event name..."
              className="w-full"
            />
          </div>
        </InlineEditCard>
      </div>
    );
  }

  // View mode
  return (
    <div className="border-b border-border/60 pb-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          {/* Event name */}
          <h1 className="heading-2">
            {name || "Untitled Event"}
          </h1>

          {/* Hosted by */}
          {organizer && (
            <p className="body-text">
              Hosted by{" "}
              <Link href="#" className="text-primary hover:underline">
                {organizer}
              </Link>
            </p>
          )}

          {/* Location */}
          {location && (
            <a
              href={buildGoogleMapsUrl(location)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-2 body-small text-muted-foreground hover:text-foreground"
            >
              <MapPinIcon className="size-4 shrink-0" />
              <span className="underline">{location}</span>
            </a>
          )}
        </div>

        {/* Edit link */}
        <button
          type="button"
          onClick={handleStartEdit}
          className="text-sm text-foreground underline hover:no-underline shrink-0"
        >
          Edit Event Title
        </button>
      </div>
    </div>
  );
}
