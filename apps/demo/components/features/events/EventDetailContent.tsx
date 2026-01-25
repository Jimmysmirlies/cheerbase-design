"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HeartIcon,
  Share2Icon,
  CheckIcon,
  MapPinIcon,
  CalendarIcon,
} from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";
import { toast } from "@workspace/ui/shadcn/sonner";
import { HeroGallery } from "@/components/ui";
import { UnifiedEventDetailBody } from "./UnifiedEventDetailBody";
import { RegistrationSummaryCard } from "./RegistrationSummaryCard";
import { EventStickyNav } from "./EventStickyNav";
import { EventSectionProvider } from "./EventSectionContext";
import type { BrandGradient } from "@/lib/gradients";
import type { PricingRow } from "./sections";

// ─────────────────────────────────────────────────────────────────────────────
// Event Action Buttons (Favorite & Share)
// ─────────────────────────────────────────────────────────────────────────────

type EventActionButtonsProps = {
  eventName: string;
  /** Render as icon-only glass buttons (for mobile overlay) */
  variant?: "default" | "glass";
};

function useEventActions(eventName: string) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(
      isFavorited ? "Removed from favorites" : "Added to favorites",
      {
        description: isFavorited
          ? `${eventName} has been removed from your favorites.`
          : `${eventName} has been saved to your favorites.`,
      },
    );
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: eventName,
      text: `Check out ${eventName}`,
      url: shareUrl,
    };

    // Try native share first (mobile)
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setJustCopied(true);
      toast.success("Link copied", {
        description: "Event link has been copied to your clipboard.",
      });
      setTimeout(() => setJustCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return { isFavorited, justCopied, handleFavorite, handleShare };
}

function EventActionButtons({
  eventName,
  variant = "default",
}: EventActionButtonsProps) {
  const { isFavorited, justCopied, handleFavorite, handleShare } =
    useEventActions(eventName);

  if (variant === "glass") {
    return (
      <>
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share event"
          className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm transition-colors hover:bg-white/95"
        >
          {justCopied ? (
            <CheckIcon className="size-5 text-green-600" />
          ) : (
            <Share2Icon className="size-5 text-foreground" />
          )}
        </button>
        <button
          type="button"
          onClick={handleFavorite}
          aria-label={
            isFavorited ? "Remove from favorites" : "Add to favorites"
          }
          className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm transition-colors hover:bg-white/95"
        >
          <HeartIcon
            className={
              isFavorited
                ? "size-5 fill-red-500 text-red-500"
                : "size-5 text-foreground"
            }
          />
        </button>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        aria-label="Share event"
      >
        {justCopied ? (
          <CheckIcon className="size-4 text-green-600" />
        ) : (
          <Share2Icon className="size-4" />
        )}
        {justCopied ? "Copied" : "Share"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleFavorite}
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        <HeartIcon
          className={
            isFavorited ? "size-4 fill-red-500 text-red-500" : "size-4"
          }
        />
        {isFavorited ? "Saved" : "Save"}
      </Button>
    </div>
  );
}

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

function buildGoogleMapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
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
  pricingDeadlineLabel: string;
  pricingRows: PricingRow[];
  documents: { name: string; description: string; href: string }[];
  earlyBirdEnabled?: boolean;
  /** Hide the date line in the event header */
  hideDateLine?: boolean;
};

export function EventDetailContent(props: EventDetailContentProps) {
  return (
    <EventSectionProvider initialGradient={props.organizerGradient}>
      {/* Airbnb-style sticky section navigation */}
      <EventStickyNav gradient={props.organizerGradient} />

      <section className="mx-auto flex w-full max-w-7xl flex-col px-4 py-8 lg:px-8">
        {/* Hero Gallery */}
        {props.galleryImages.length > 0 && (
          <HeroGallery
            images={props.galleryImages}
            alt={props.event.name}
            overlayActions={
              <EventActionButtons
                eventName={props.event.name}
                variant="glass"
              />
            }
          />
        )}

        {/* Two-column layout: Left (title + content) | Right (sticky CTA) */}
        <div className="grid gap-10 pt-8 lg:grid-cols-[1fr_320px]">
          {/* Left Column: Title, Meta, and Content */}
          <div className="min-w-0">
            {/* Event Header */}
            <div id="event-title" className="mb-8">
              <h1 className="heading-2 mb-2">{props.event.name}</h1>
              <p className="body-text mb-3">
                Hosted by{" "}
                <Link href="#" className="text-primary hover:underline">
                  {props.event.organizer}
                </Link>
              </p>
              <div className="space-y-2 body-small text-muted-foreground">
                <a
                  href={buildGoogleMapsUrl(props.event.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-foreground"
                >
                  <MapPinIcon className="size-4 shrink-0" />
                  <span className="underline">{props.event.location}</span>
                </a>
                {!props.hideDateLine && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="size-4 shrink-0" />
                    <span>{formatDateLabel(props.event.date)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Sections */}
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
              hideRegistration
              displayProps={{
                galleryImages: props.galleryImages,
                eventDateParts: props.eventDateParts,
                venueName: props.venueName,
                cityState: props.cityState,
                registrationDeadlineISO: props.registrationDeadlineISO,
                registrationClosed: props.registrationClosed,
                pricingDeadlineLabel: props.pricingDeadlineLabel,
                pricingRows: props.pricingRows,
                documents: props.documents,
                earlyBirdEnabled: props.earlyBirdEnabled,
              }}
            />
          </div>

          {/* Right Column: Sticky Registration CTA */}
          <div className="hidden lg:block">
            <div className="sticky top-[152px]">
              <RegistrationSummaryCard
                eventId={props.event.id}
                eventDate={props.event.date}
                eventStartTime="9:00 AM"
                registrationDeadline={props.registrationDeadlineISO}
                isRegistrationClosed={props.registrationClosed}
                hidePricingButton
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Footer CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 shadow-md backdrop-blur-sm lg:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0 flex-1">
            <p className="body-small font-medium text-foreground truncate">
              {props.registrationClosed
                ? "Registration Has Closed"
                : "Registration Open"}
            </p>
            {!props.registrationClosed && (
              <p className="body-small text-muted-foreground truncate">
                Closes{" "}
                {new Date(props.registrationDeadlineISO).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" },
                )}
              </p>
            )}
          </div>
          {props.registrationClosed ? (
            <Button size="lg" disabled className="shrink-0">
              Closed
            </Button>
          ) : (
            <Button asChild size="lg" className="shrink-0">
              <Link
                href={`/events/${encodeURIComponent(props.event.id)}/register`}
              >
                Register Now
              </Link>
            </Button>
          )}
        </div>
      </div>
      {/* Spacer to prevent content from being hidden behind sticky footer */}
      <div
        className="h-24 lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      />
    </EventSectionProvider>
  );
}

// Re-export types for convenience
export type { PricingRow } from "./sections";
