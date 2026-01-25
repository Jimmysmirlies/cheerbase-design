"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { MapPinIcon } from "lucide-react";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import {
  GlassSelect,
  type GlassSelectOption,
} from "@workspace/ui/components/glass-select";
import type { Event, EventVenue } from "@/types/events";
import type { BaseSectionProps } from "./types";

const US_STATES: GlassSelectOption[] = [
  { value: "Alabama", label: "Alabama" },
  { value: "Alaska", label: "Alaska" },
  { value: "Arizona", label: "Arizona" },
  { value: "Arkansas", label: "Arkansas" },
  { value: "California", label: "California" },
  { value: "Colorado", label: "Colorado" },
  { value: "Connecticut", label: "Connecticut" },
  { value: "Delaware", label: "Delaware" },
  { value: "Florida", label: "Florida" },
  { value: "Georgia", label: "Georgia" },
  { value: "Hawaii", label: "Hawaii" },
  { value: "Idaho", label: "Idaho" },
  { value: "Illinois", label: "Illinois" },
  { value: "Indiana", label: "Indiana" },
  { value: "Iowa", label: "Iowa" },
  { value: "Kansas", label: "Kansas" },
  { value: "Kentucky", label: "Kentucky" },
  { value: "Louisiana", label: "Louisiana" },
  { value: "Maine", label: "Maine" },
  { value: "Maryland", label: "Maryland" },
  { value: "Massachusetts", label: "Massachusetts" },
  { value: "Michigan", label: "Michigan" },
  { value: "Minnesota", label: "Minnesota" },
  { value: "Mississippi", label: "Mississippi" },
  { value: "Missouri", label: "Missouri" },
  { value: "Montana", label: "Montana" },
  { value: "Nebraska", label: "Nebraska" },
  { value: "Nevada", label: "Nevada" },
  { value: "New Hampshire", label: "New Hampshire" },
  { value: "New Jersey", label: "New Jersey" },
  { value: "New Mexico", label: "New Mexico" },
  { value: "New York", label: "New York" },
  { value: "North Carolina", label: "North Carolina" },
  { value: "North Dakota", label: "North Dakota" },
  { value: "Ohio", label: "Ohio" },
  { value: "Oklahoma", label: "Oklahoma" },
  { value: "Oregon", label: "Oregon" },
  { value: "Pennsylvania", label: "Pennsylvania" },
  { value: "Rhode Island", label: "Rhode Island" },
  { value: "South Carolina", label: "South Carolina" },
  { value: "South Dakota", label: "South Dakota" },
  { value: "Tennessee", label: "Tennessee" },
  { value: "Texas", label: "Texas" },
  { value: "Utah", label: "Utah" },
  { value: "Vermont", label: "Vermont" },
  { value: "Virginia", label: "Virginia" },
  { value: "Washington", label: "Washington" },
  { value: "West Virginia", label: "West Virginia" },
  { value: "Wisconsin", label: "Wisconsin" },
  { value: "Wyoming", label: "Wyoming" },
];

const CANADIAN_PROVINCES: GlassSelectOption[] = [
  { value: "Alberta", label: "Alberta" },
  { value: "British Columbia", label: "British Columbia" },
  { value: "Manitoba", label: "Manitoba" },
  { value: "New Brunswick", label: "New Brunswick" },
  { value: "Newfoundland and Labrador", label: "Newfoundland and Labrador" },
  { value: "Nova Scotia", label: "Nova Scotia" },
  { value: "Ontario", label: "Ontario" },
  { value: "Prince Edward Island", label: "Prince Edward Island" },
  { value: "Quebec", label: "Quebec" },
  { value: "Saskatchewan", label: "Saskatchewan" },
];

const COUNTRIES: GlassSelectOption[] = [
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "Mexico", label: "Mexico" },
];

export type LocationSectionProps = BaseSectionProps & {
  /** Pre-computed venue name for display */
  venueName?: string;
  /** Pre-computed city/state string for display */
  cityState?: string;
};

/**
 * LocationSection displays the event venue and location.
 * Supports both view and edit modes.
 */
export function LocationSection({
  mode,
  eventData,
  onUpdate,
  venueName: propVenueName,
  cityState: propCityState,
}: LocationSectionProps) {
  // Parse location data
  const venue = useMemo(
    () =>
      eventData.venue || {
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      },
    [eventData.venue],
  );
  const location = eventData.location || "";
  const locationParts = location.split(", ");
  const venueName = propVenueName || venue.name || locationParts[0] || location;
  const cityState =
    propCityState ||
    (venue.city && venue.state
      ? `${venue.city}, ${venue.state}`
      : locationParts.slice(1).join(", "));

  const updateVenue = useCallback(
    (updates: Partial<EventVenue>) => {
      const newVenue = { ...venue, ...updates };
      // Also update the legacy location field for backwards compatibility
      const locationString = [
        newVenue.name,
        newVenue.streetAddress,
        newVenue.city,
        newVenue.state,
        newVenue.zipCode,
        newVenue.country,
      ]
        .filter(Boolean)
        .join(", ");

      onUpdate?.({
        venue: newVenue,
        location: locationString,
      });
    },
    [venue, onUpdate],
  );

  // VIEW MODE
  if (mode === "view") {
    const googleMapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    const hasLocation = location && location !== "Location to be announced";

    return (
      <div className="flex flex-col gap-4">
        {/* Google Maps embed */}
        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-border/70 bg-muted/50">
          {hasLocation ? (
            <>
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${venueName}`}
              />
              <Link
                href={googleMapsHref}
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
          <span className="text-sm text-muted-foreground">{cityState}</span>
        </div>
      </div>
    );
  }

  // EDIT MODE
  // Get state/province options based on country
  const stateOptions =
    venue.country === "Canada" ? CANADIAN_PROVINCES : US_STATES;
  const stateLabel = venue.country === "Canada" ? "Province *" : "State *";
  const postalLabel =
    venue.country === "Canada" ? "Postal Code *" : "Zip Code *";

  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* Venue Name */}
      <div className="space-y-2">
        <Label htmlFor="venue-name">Venue Name *</Label>
        <Input
          id="venue-name"
          value={venue.name || ""}
          onChange={(e) => updateVenue({ name: e.target.value })}
          placeholder="e.g., Madison Square Garden"
          className="w-full"
        />
      </div>

      {/* Street Address */}
      <div className="space-y-2">
        <Label htmlFor="street-address">Street Address *</Label>
        <Input
          id="street-address"
          value={venue.streetAddress || ""}
          onChange={(e) => updateVenue({ streetAddress: e.target.value })}
          placeholder="Street address"
          className="w-full"
        />
      </div>

      {/* Apt/Suite */}
      <div className="space-y-2">
        <Label htmlFor="apt-suite">Apt/Suite</Label>
        <Input
          id="apt-suite"
          value={venue.aptSuite || ""}
          onChange={(e) => updateVenue({ aptSuite: e.target.value })}
          placeholder="Apt, Suite, Unit, etc."
          className="w-full"
        />
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city">City *</Label>
        <Input
          id="city"
          value={venue.city || ""}
          onChange={(e) => updateVenue({ city: e.target.value })}
          placeholder="City"
          className="w-full"
        />
      </div>

      {/* State & Zip */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <GlassSelect
            label={stateLabel}
            value={venue.state || ""}
            onValueChange={(value) => updateVenue({ state: value })}
            options={stateOptions}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip-code">{postalLabel}</Label>
          <Input
            id="zip-code"
            value={venue.zipCode || ""}
            onChange={(e) => updateVenue({ zipCode: e.target.value })}
            placeholder={
              venue.country === "Canada" ? "Postal code" : "Zip code"
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Country */}
      <div className="space-y-2">
        <GlassSelect
          label="Country *"
          value={venue.country || "United States"}
          onValueChange={(value) => updateVenue({ country: value, state: "" })}
          options={COUNTRIES}
          className="w-full"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="venue-phone">Venue Phone</Label>
        <Input
          id="venue-phone"
          type="tel"
          value={venue.phone || ""}
          onChange={(e) => updateVenue({ phone: e.target.value })}
          placeholder="(555) 123-4567"
          className="w-full"
        />
      </div>
    </div>
  );
}

/** Check if section has data to display */
LocationSection.hasData = (eventData: Partial<Event>): boolean => {
  return !!(eventData.location || eventData.venue?.name);
};

/** Empty state configuration */
LocationSection.emptyTitle = "Add event venue";
LocationSection.emptyDescription = "Set where your event will take place";
