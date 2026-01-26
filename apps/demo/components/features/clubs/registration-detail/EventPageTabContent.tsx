"use client";

import Link from "next/link";
import { MapPinIcon, ClockIcon, Share2Icon, DownloadIcon } from "lucide-react";

import { Button } from "@workspace/ui/shadcn/button";

import { HeroGallery } from "@/components/ui";
import { PricingCard } from "@/components/ui/cards/PricingCard";
import { Section } from "@/components/layout/Section";
import { formatCurrency } from "@/utils/format";
import type { BrandGradient } from "@/lib/gradients";

import { ClubRegistrationSidebar } from "./ClubRegistrationSidebar";
import type {
  InvoiceLineItem,
  DivisionPricingProp,
  DocumentResource,
} from "./types";

type EventPageTabContentProps = {
  // Event info
  eventName: string;
  eventDescription?: string;
  organizerName: string;
  locationLabel: string;
  eventPageHref: string;
  galleryImages?: string[];
  // Event date/time
  eventDate?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  eventTimezone?: string;
  // Organizer display
  organizerGradient?: BrandGradient;
  // Pricing display
  divisionPricing?: DivisionPricingProp[];
  // Documents
  documents?: DocumentResource[];
  // Sidebar props
  invoiceLineItems: InvoiceLineItem[];
  subtotal: number;
  totalTax: number;
  invoiceTotal: number;
  invoiceHref: string;
  paymentStatus: "Paid" | "Unpaid" | "Overdue";
  paymentDeadlineLabel?: string;
  paidAtLabel: string | null;
};

function computeDateParts(dateString?: string) {
  if (!dateString) {
    return { month: "", day: "", weekday: "", fullDate: "" };
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return { month: "", day: "", weekday: "", fullDate: "" };
  }
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: date.getDate().toString(),
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    fullDate: date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    }),
  };
}

export function EventPageTabContent({
  eventName,
  eventDescription,
  organizerName,
  locationLabel,
  eventPageHref,
  galleryImages = [],
  eventDate,
  eventStartTime,
  eventEndTime,
  eventTimezone,
  organizerGradient = "teal",
  divisionPricing = [],
  documents = [],
  invoiceLineItems,
  subtotal,
  totalTax,
  invoiceTotal,
  invoiceHref,
  paymentStatus,
  paymentDeadlineLabel,
  paidAtLabel,
}: EventPageTabContentProps) {
  // Build Google Maps URL
  const googleMapsHref = locationLabel
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLabel)}`
    : null;

  // Parse location for venue name
  const locationParts = locationLabel?.split(", ") || [];
  const venueName =
    locationParts[0] || locationLabel || "Location to be announced";
  const cityState = locationParts.slice(1, 3).join(", ");

  // Compute date parts for display
  const eventDateParts = computeDateParts(eventDate);

  // Build pricing cards with gradient styling
  const pricingCards = divisionPricing.map((division) => {
    const hasEarlyBird = !!division.earlyBird;
    const currentPrice = hasEarlyBird
      ? formatCurrency(division.earlyBird!.price)
      : formatCurrency(division.regular.price);
    const originalPrice = hasEarlyBird
      ? formatCurrency(division.regular.price)
      : undefined;

    return {
      label: division.name,
      subtitle:
        hasEarlyBird && division.earlyBird?.deadline
          ? `Early Bird until ${division.earlyBird.deadline}`
          : undefined,
      price: currentPrice,
      originalPrice,
      unit: "/ athlete",
      gradient: organizerGradient,
    };
  });

  return (
    <>
      {/* Gallery - full width */}
      {galleryImages.length > 0 && (
        <div className="pt-6">
          <HeroGallery images={galleryImages} alt={eventName} />
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-10 pt-8 lg:grid-cols-[1fr_320px]">
        {/* Left Column: Event Info + Sections */}
        <div className="min-w-0">
          {/* Organizer info inline */}
          <div className="flex items-center justify-between gap-4 pb-6">
            <p className="body-text">
              Event hosted by{" "}
              <Link
                href={eventPageHref}
                className="font-semibold hover:underline"
              >
                {organizerName}
              </Link>
            </p>
            <Button variant="outline" size="sm">
              Contact
            </Button>
          </div>

          {/* Overview Section */}
          {eventDescription && (
            <Section id="overview" title="Overview" showDivider>
              <p className="body-text text-muted-foreground">
                {eventDescription}
              </p>
            </Section>
          )}

          {/* Event Date & Time Section */}
          {eventDateParts.month && eventDateParts.day && (
            <Section id="date-time" title="Event Date & Time" showDivider>
              <div className="flex items-center gap-4">
                {/* Calendar badge */}
                <div className="flex min-w-[72px] flex-col items-center overflow-hidden rounded-lg border bg-muted/30">
                  <div className="w-full bg-muted px-4 py-1 text-center">
                    <span className="label text-muted-foreground">
                      {eventDateParts.month}
                    </span>
                  </div>
                  <div className="px-4 py-2">
                    <span className="heading-2 font-bold text-foreground">
                      {eventDateParts.day}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="heading-4 text-foreground">
                    {eventDateParts.weekday}, {eventDateParts.fullDate}
                  </span>
                  <span className="body-small text-muted-foreground flex items-center gap-1.5">
                    <ClockIcon className="size-4" />
                    {eventStartTime || "8:00 AM"} - {eventEndTime || "6:00 PM"}{" "}
                    {eventTimezone || "EST"}
                  </span>
                </div>
              </div>
            </Section>
          )}

          {/* Where You'll Be Section */}
          {locationLabel && (
            <Section id="location" title="Where You'll Be" showDivider>
              <div className="flex flex-col gap-4">
                {/* Google Maps embed */}
                <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-border/70 bg-muted/50">
                  {locationLabel !== "Location to be announced" ? (
                    <>
                      <iframe
                        src={`https://www.google.com/maps?q=${encodeURIComponent(locationLabel)}&output=embed`}
                        className="absolute inset-0 h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Map of ${venueName}`}
                      />
                      <Link
                        href={googleMapsHref || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-10"
                        aria-label={`Open ${venueName} in Google Maps`}
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                        <MapPinIcon className="size-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Location to be announced
                      </span>
                    </div>
                  )}
                </div>
                {/* Venue info */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-semibold text-foreground">
                    {venueName}
                  </span>
                  {cityState && (
                    <span className="text-sm text-muted-foreground">
                      {cityState}
                    </span>
                  )}
                </div>
              </div>
            </Section>
          )}

          {/* Registration & Pricing Section */}
          {divisionPricing.length > 0 && (
            <Section
              id="registration-pricing"
              title="Registration & Pricing"
              showDivider
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {pricingCards.map((card) => (
                  <PricingCard key={card.label} {...card} />
                ))}
              </div>
            </Section>
          )}

          {/* Documents and Resources Section */}
          {documents.length > 0 && (
            <Section id="documents" title="Documents & Resources" showDivider>
              <div className="grid gap-3 md:grid-cols-2">
                {documents.map((doc, index) => (
                  <div
                    key={`${doc.name}-${index}`}
                    className="rounded-md border border-border/70 bg-card/60 p-4 sm:p-6 transition-all hover:border-primary/20"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <DownloadIcon className="text-primary/70 size-5 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="body-text font-semibold text-foreground">
                            {doc.name}
                          </p>
                          {doc.description && (
                            <p className="body-small text-muted-foreground">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="self-start sm:self-center shrink-0"
                      >
                        <Link href={doc.href}>Download</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Results and Leaderboard Section */}
          <Section id="results" title="Results & Leaderboard" showDivider>
            <div className="rounded-md border border-border/70 bg-card/60 p-6 transition-all hover:border-primary/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-foreground font-medium">Coming soon</p>
                  <p className="body-small text-muted-foreground">
                    Scores and placements will publish once awards conclude.
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  <Share2Icon className="mr-2 size-4" />
                  Notify me
                </Button>
              </div>
            </div>
          </Section>
        </div>

        {/* Right Column: Sticky Sidebar */}
        <ClubRegistrationSidebar
          invoiceLineItems={invoiceLineItems}
          subtotal={subtotal}
          totalTax={totalTax}
          invoiceTotal={invoiceTotal}
          invoiceHref={invoiceHref}
          paymentStatus={paymentStatus}
          paymentDeadlineLabel={paymentDeadlineLabel}
          paidAtLabel={paidAtLabel}
        />
      </div>
    </>
  );
}
