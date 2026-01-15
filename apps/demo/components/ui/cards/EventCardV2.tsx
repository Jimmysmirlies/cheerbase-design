"use client";

import type { ComponentProps } from "react";

import { Badge } from "@workspace/ui/shadcn/badge";
import Link from "next/link";

import { FALLBACK_EVENT_IMAGE } from "@/data/events/fallbacks";

export type RegistrationStatus = "OPEN" | "CLOSING SOON" | "CLOSED" | "FULL" | "DRAFT";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

const statusBadgeVariants: Record<RegistrationStatus, BadgeVariant> = {
  OPEN: "green",
  "CLOSING SOON": "amber",
  CLOSED: "secondary",
  FULL: "red",
  DRAFT: "secondary",
};

/**
 * Derives registration status from event data
 */
export function getRegistrationStatus(event: {
  registrationDeadline?: string;
  date: string;
  slots: { filled: number; capacity: number };
}): RegistrationStatus {
  const now = new Date();

  // Check if slots are full
  if (event.slots.filled >= event.slots.capacity) {
    return "FULL";
  }

  // Check registration deadline
  if (event.registrationDeadline) {
    const deadline = new Date(event.registrationDeadline);
    deadline.setHours(23, 59, 59, 999);

    if (now > deadline) {
      return "CLOSED";
    }

    // Check if closing soon (within 7 days)
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    if (deadline <= sevenDaysFromNow) {
      return "CLOSING SOON";
    }
  }

  // Check if event date has passed
  const eventDate = new Date(event.date);
  eventDate.setHours(23, 59, 59, 999);
  if (now > eventDate) {
    return "CLOSED";
  }

  return "OPEN";
}

export type EventCardV2Props = {
  id: string;
  image?: string;
  title: string;
  date: string;
  location: string;
  teamsFilled: number;
  teamsCapacity: number;
  statusLabel: RegistrationStatus;
  disabled?: boolean;
  status?: "draft" | "published";
};

export function EventCardV2({
  id,
  image,
  title,
  date,
  location,
  teamsFilled,
  teamsCapacity,
  statusLabel,
  disabled = false,
  status,
}: EventCardV2Props) {
  const heroImage = image || FALLBACK_EVENT_IMAGE;
  const heroStyle = { backgroundImage: `url(${heroImage})` };
  const displayStatus = status === "draft" ? "DRAFT" : statusLabel;
  const badgeVariant = statusBadgeVariants[displayStatus] ?? "secondary";
  const linkLabel = `View event: ${title}`;

  return (
    <Link
      href={`/organizer/events/${id}`}
      aria-label={linkLabel}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={`group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl ${
        disabled ? "pointer-events-none opacity-65" : ""
      }`}
    >
      {/* Image with badge overlay */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out group-hover:scale-105"
          style={heroStyle}
        />
        <Badge
          variant={badgeVariant}
          className="pointer-events-none absolute left-3 top-3 rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-wide leading-none text-center"
        >
          {displayStatus}
        </Badge>
      </div>

      {/* Text content - no card wrapper */}
      <div className="px-1 pt-3 space-y-0.5">
        <h3 className="body-text font-semibold text-foreground line-clamp-2">
          {title}
        </h3>
        <p className="body-small text-muted-foreground">{date}</p>
        <p className="body-small text-muted-foreground line-clamp-1">
          {location}
        </p>
        <p className="body-small text-muted-foreground">
          {teamsFilled} / {teamsCapacity} teams
        </p>
      </div>
    </Link>
  );
}
