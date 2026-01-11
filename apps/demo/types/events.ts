import type { BrandGradient } from "@/lib/gradients";

export type Organizer = {
  id: string;
  name: string;
  visibility: string;
  region: string;
  gradient: BrandGradient;
  // Profile
  email?: string;
  supportEmail?: string;
  logo?: string;
  // Stats
  followers: number;
  eventsCount: number;
  hostingYears: number;
};

export type EventVenue = {
  name?: string;
  streetAddress: string;
  aptSuite?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
};

export type EventDocument = {
  name: string;
  description: string;
  href: string;
};

/** A single day in a multi-day event schedule */
export type EventScheduleDay = {
  /** Date for this day (ISO format: YYYY-MM-DD) */
  date: string;
  /** Label for this day (e.g., "Preliminary Rounds", "Finals & Awards Ceremony") */
  label: string;
  /** Start time for this day (e.g., "8:00 AM") */
  startTime: string;
  /** End time for this day (e.g., "6:00 PM") */
  endTime: string;
};

export type Event = {
  id: string;
  name: string;
  organizer: string;
  type: "Championship" | "Friendly Competition";
  /** Event start date (or single day for one-day events) */
  date: string;
  /** Event end date for multi-day events */
  endDate?: string;
  /** Event start time (e.g., "8:00 AM" or "08:00") */
  startTime?: string;
  /** Event end time (e.g., "6:00 PM" or "18:00") */
  endTime?: string;
  /** Timezone for the event (e.g., "EST", "PST", "UTC") */
  timezone?: string;
  /** Multi-day event schedule. When present, overrides single date/time fields for display. */
  schedule?: EventScheduleDay[];
  /** @deprecated Use venue instead */
  location: string;
  venue?: EventVenue;
  teams: string;
  image: string;
  slots: {
    filled: number;
    capacity: number;
    statusLabel?: string;
  };
  description: string;
  tags?: string[];
  gallery?: string[];
  documents?: EventDocument[];
  availableDivisions?: DivisionPricing[];
  /** Whether registration is enabled for this event. If false, registration is closed regardless of dates. */
  registrationEnabled?: boolean;
  /** ISO date string for when registration opens. Required when registrationEnabled is true. */
  registrationStartDate?: string;
  /** ISO date string for registration deadline (end date). Required when registrationEnabled is true. */
  registrationDeadline?: string;
  /** Whether early bird pricing is enabled for this event */
  earlyBirdEnabled?: boolean;
  /** ISO date string for when early bird pricing begins. Must be >= registrationStartDate. */
  earlyBirdStartDate?: string;
  /** ISO date string for early bird pricing deadline (end date). Must be <= registrationDeadline. */
  earlyBirdDeadline?: string;
  /** Event status: draft (not visible publicly) or published (visible) */
  status?: "draft" | "published";
  /** Event visibility: public (searchable), unlisted (link only), private (organizer only) */
  visibility?: "public" | "unlisted" | "private";
  /** Early bird discount percentage (0-100). Alternative to per-division early bird pricing. */
  earlyBirdDiscount?: number;
  /** ISO date string for when event was last updated */
  updatedAt?: string;
};

export type EventCategory = {
  title: string;
  subtitle: string;
  events: Event[];
};

export type DivisionPricing = {
  name: string;
  earlyBird?: {
    price: number;
    deadline?: string; // ISO date (YYYY-MM-DD)
  };
  regular: {
    price: number;
  };
};
