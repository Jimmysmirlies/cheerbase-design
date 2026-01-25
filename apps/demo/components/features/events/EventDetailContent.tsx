"use client";

import { useState } from "react";
import { HeartIcon, Share2Icon, CheckIcon } from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";
import { toast } from "@workspace/ui/shadcn/sonner";
import { PageTitle } from "@/components/layout/PageTitle";
import { HeroGallery } from "@/components/ui";
import { UnifiedEventDetailBody } from "./UnifiedEventDetailBody";
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
};

export function EventDetailContent(props: EventDetailContentProps) {
  return (
    <EventSectionProvider initialGradient={props.organizerGradient}>
      {/* Airbnb-style sticky section navigation */}
      <EventStickyNav gradient={props.organizerGradient} />

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:px-8">
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

        <div id="event-title">
          <PageTitle
            title={props.event.name}
            gradient={props.organizerGradient}
            dateLabel={formatDateLabel(props.event.date)}
            locationLabel={props.event.location}
            actions={
              <div className="hidden md:flex">
                <EventActionButtons eventName={props.event.name} />
              </div>
            }
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
export type { PricingRow } from "./sections";
