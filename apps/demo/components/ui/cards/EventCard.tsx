"use client";

/**
 * EventCard
 *
 * Purpose
 * - Compact marketplace card displaying event media, metadata, and a primary action.
 *
 * Structure
 * - Media banner with hero image
 * - Content: title, organizer, details (date/location/teams)
 */
import { cn } from "@workspace/ui/lib/utils";
import { Card, CardContent } from "@workspace/ui/shadcn/card";
import { Skeleton } from "@workspace/ui/shadcn/skeleton";

import { CalendarDaysIcon, MapPinIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

import { FALLBACK_EVENT_IMAGE } from "@/data/events/fallbacks";

type EventCardProps = {
  image: string;
  title: string;
  organizer: string;
  date: string;
  location: string;
  teams: string;
  href?: string;
  onRegister?: () => void;
  size?: "default" | "compact";
  /** Show loading skeleton instead of content */
  isLoading?: boolean;
};

export function EventCard({
  image,
  title,
  organizer,
  date,
  location,
  teams,
  href,
  onRegister,
  size = "default",
  isLoading = false,
}: EventCardProps) {
  const isCompact = size === "compact";
  const mediaImage = image || FALLBACK_EVENT_IMAGE;
  const heroStyle = { backgroundImage: `url(${mediaImage})` };

  // CARD INTERACTION — "Lift": hover/focus treatment for clickable cards
  const cardHoverState =
    "hover:-translate-y-[2px] hover:shadow-lg hover:border-primary/40";
  const linkLabel = `View event: ${title}`;

  // Loading skeleton
  if (isLoading) {
    return (
      <Card
        className={cn(
          "flex h-full w-full gap-0 overflow-hidden !rounded-md border border-border/60 p-0",
        )}
      >
        <Skeleton
          className={cn(
            "w-full rounded-none",
            isCompact ? "aspect-[2.5/1]" : "aspect-[2/1]",
          )}
        />
        <CardContent
          className={cn(
            "flex flex-1 flex-col px-6 py-6",
            isCompact ? "gap-3" : "gap-4",
          )}
        >
          <div className={cn("space-y-2", isCompact && "space-y-1.5")}>
            <Skeleton
              className={cn("rounded", isCompact ? "h-5 w-4/5" : "h-6 w-3/4")}
            />
            <Skeleton
              className={cn("rounded", isCompact ? "h-3 w-1/2" : "h-4 w-2/5")}
            />
          </div>
          <div className={cn("space-y-2.5", isCompact && "space-y-2")}>
            <div className="flex items-center gap-2">
              <Skeleton
                className={cn(
                  "rounded-full",
                  isCompact ? "size-3.5" : "size-4",
                )}
              />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton
                className={cn(
                  "rounded-full",
                  isCompact ? "size-3.5" : "size-4",
                )}
              />
              <Skeleton className="h-3.5 w-36 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton
                className={cn(
                  "rounded-full",
                  isCompact ? "size-3.5" : "size-4",
                )}
              />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cardContent = (
    <Card
      className={cn(
        "flex h-full w-full gap-0 overflow-hidden !rounded-md border border-border/60 p-0 transition duration-200 ease-out",
        cardHoverState,
      )}
    >
      {/* HERO BAND — "Marquee" */}
      <div
        className={cn(
          "relative w-full bg-muted bg-cover bg-center",
          isCompact ? "aspect-[2.5/1]" : "aspect-[2/1]",
        )}
        style={heroStyle}
      />
      {/* BODY STACK — "Details Rail" */}
      <CardContent
        className={cn(
          "flex flex-1 flex-col px-6 py-6",
          isCompact ? "gap-3" : "gap-4",
        )}
      >
        {/* TITLE BLOCK — "Header Duo" */}
        <div className={cn("space-y-1", isCompact && "space-y-0.5")}>
          <h3
            className={cn(
              "text-foreground",
              isCompact ? "body-text font-semibold leading-tight" : "heading-4",
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "text-muted-foreground",
              isCompact ? "text-xs" : "body-text",
            )}
          >
            {organizer}
          </p>
        </div>
        {/* META GRID — "Quick Facts" */}
        <div
          className={cn(
            "body-small text-muted-foreground space-y-2.5",
            isCompact && "space-y-2 text-xs",
          )}
        >
          <p className="flex items-center gap-2">
            <CalendarDaysIcon
              className={cn("text-primary/70 size-4", isCompact && "size-3.5")}
            />
            {date}
          </p>
          <p className="flex items-start gap-2">
            <MapPinIcon
              className={cn(
                "text-primary/70 size-4 shrink-0 translate-y-[2px]",
                isCompact && "size-3.5",
              )}
            />
            <span className="line-clamp-2 break-words leading-tight">
              {location}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <UsersIcon
              className={cn("text-primary/70 size-4", isCompact && "size-3.5")}
            />
            <span className="font-medium">{teams}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // If onRegister callback provided, use button behavior
  if (onRegister) {
    return (
      <button
        type="button"
        onClick={onRegister}
        aria-label={linkLabel}
        className="group block h-full rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {cardContent}
      </button>
    );
  }

  // WRAPPER — "Clickable Shell": makes the whole card actionable
  if (href) {
    return (
      <Link
        href={href}
        aria-label={linkLabel}
        className="group block h-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {cardContent}
      </Link>
    );
  }

  // Fallback: non-interactive card
  return cardContent;
}
