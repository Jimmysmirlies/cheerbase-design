"use client";

import Link from "next/link";
import { ArrowUpRightIcon, CalendarDaysIcon, MapPinIcon } from "lucide-react";
import { motion } from "framer-motion";

import { OrganizerCard } from "@/components/features/clubs/OrganizerCard";
import { fadeInUp } from "@/lib/animations";
import type { BrandGradient } from "@/lib/gradients";

type EventDetailsSectionProps = {
  organizerName: string;
  organizerGradientVariant: BrandGradient;
  organizerFollowersLabel: string;
  organizerEventsCount: number;
  organizerHostingLabel: string;
  locationLabel: string;
  googleMapsHref: string | null;
  eventDateLabel: string;
  eventDateWeekday: string | null;
  eventPageHref: string;
  showDivider?: boolean;
};

export function EventDetailsSection({
  organizerName,
  organizerGradientVariant,
  organizerFollowersLabel,
  organizerEventsCount,
  organizerHostingLabel,
  locationLabel,
  googleMapsHref,
  eventDateLabel,
  eventDateWeekday,
  eventPageHref,
  showDivider = false,
}: EventDetailsSectionProps) {
  return (
    <motion.div className="w-full" variants={fadeInUp}>
      <div className="flex flex-col gap-4 px-1">
        <div className="flex flex-col gap-4">
          {showDivider && <div className="h-px w-full bg-border" />}
          <div className="flex items-center justify-between gap-4">
            <p className="heading-4">Event Details</p>
            <Link
              href={eventPageHref}
              className="body-small inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              View Event Listing
              <ArrowUpRightIcon className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Row 1: Organizer */}
          <OrganizerCard
            name={organizerName}
            gradient={organizerGradientVariant}
            followers={organizerFollowersLabel}
            eventsCount={organizerEventsCount}
            hostingDuration={organizerHostingLabel}
          />

          {/* Row 2: Date & Location (combined) */}
          <div className="rounded-md border border-border/70 bg-card/60 p-5 transition-all hover:border-primary/20">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Left: Date & Location Details */}
              <div className="flex flex-col gap-4">
                <p className="label text-muted-foreground">Date and Location</p>
                <div className="body-text flex flex-col gap-2.5 text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <MapPinIcon
                      className="text-primary/70 size-5 shrink-0 translate-y-[2px]"
                      aria-hidden
                    />
                    <span className="text-foreground">{locationLabel}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDaysIcon
                      className="text-primary/70 size-5 shrink-0"
                      aria-hidden
                    />
                    <span className="text-foreground">
                      {eventDateLabel}
                      {eventDateWeekday ? `, ${eventDateWeekday}` : ""}
                    </span>
                  </p>
                </div>
              </div>

              {/* Right: Map (3:2 aspect ratio) */}
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border border-border/70 bg-muted/50">
                {locationLabel &&
                locationLabel !== "Location to be announced" ? (
                  <>
                    <iframe
                      src={`https://www.google.com/maps?q=${encodeURIComponent(locationLabel)}&output=embed`}
                      className="absolute inset-0 h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map of ${locationLabel}`}
                    />
                    <Link
                      href={googleMapsHref ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-10"
                      aria-label={`Open ${locationLabel} in Google Maps`}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                    Location to be announced
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
