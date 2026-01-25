"use client";

import type { ComponentProps } from "react";

import { Badge } from "@workspace/ui/shadcn/badge";
import { Card, CardContent } from "@workspace/ui/shadcn/card";
import { CalendarDaysIcon, MapPinIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

import { FALLBACK_EVENT_IMAGE } from "@/data/events/fallbacks";

type StatusVariant = "PAID" | "UNPAID" | "OVERDUE";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

const statusBadgeVariants: Record<StatusVariant, BadgeVariant> = {
  PAID: "green",
  UNPAID: "amber",
  OVERDUE: "red",
};

export type EventRegisteredCardProps = {
  image?: string;
  title: string;
  date: string;
  location: string;
  participants: number | string;
  statusLabel: StatusVariant;
  organizer?: string;
  actionHref: string;
  actionLabel?: string;
  disabled?: boolean;
};

export function EventRegisteredCard({
  image,
  title,
  date,
  location,
  participants,
  statusLabel,
  organizer,
  actionHref,
  actionLabel = "View",
  disabled = false,
}: EventRegisteredCardProps) {
  const heroImage = image || FALLBACK_EVENT_IMAGE;
  const heroStyle = { backgroundImage: `url(${heroImage})` };
  const badgeVariant = statusBadgeVariants[statusLabel] ?? "secondary";
  // HERO CANVAS — "Spotlight": background image with status chip
  const linkLabel = actionLabel ? `${actionLabel}: ${title}` : title;
  // CARD INTERACTION — "Lift": hover/focus treatment for clickable cards
  const cardHoverState = disabled
    ? "opacity-65"
    : "hover:-translate-y-[2px] hover:shadow-lg hover:border-primary/40";

  return (
    // WRAPPER — "Clickable Shell": makes the whole card actionable
    <Link
      href={actionHref}
      aria-label={linkLabel}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={`group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        disabled ? "pointer-events-none" : ""
      }`}
    >
      <Card
        className={`flex h-full w-full gap-0 overflow-hidden !rounded-md border border-border/60 p-0 transition duration-200 ease-out ${cardHoverState}`}
      >
        {/* HERO BAND — "Marquee" */}
        <div
          className="relative aspect-[2/1] w-full bg-muted bg-cover bg-center"
          style={heroStyle}
        >
          <Badge
            variant={badgeVariant}
            className="pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-wide leading-none text-center"
          >
            {statusLabel}
          </Badge>
        </div>
        {/* BODY STACK — "Details Rail" */}
        <CardContent className="flex flex-1 flex-col gap-4 px-6 py-6">
          {/* TITLE BLOCK — "Header Duo" */}
          <div className="space-y-1">
            <h3 className="heading-4 text-foreground">{title}</h3>
            {organizer ? (
              <p className="body-text text-muted-foreground">{organizer}</p>
            ) : null}
          </div>
          {/* META GRID — "Quick Facts" */}
          <div className="body-small text-muted-foreground space-y-2.5">
            <p className="flex items-center gap-2">
              <CalendarDaysIcon className="text-primary/70 size-4" />
              {date}
            </p>
            <p className="flex items-start gap-2">
              <MapPinIcon className="text-primary/70 size-4 shrink-0 translate-y-[2px]" />
              <span className="line-clamp-2 break-words leading-tight">
                {location}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <UsersIcon className="text-primary/70 size-4" />
              <span className="font-medium">{participants} participants</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
