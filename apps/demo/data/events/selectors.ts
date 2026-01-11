import {
  eventCategories,
  listEvents,
  isRegistrationClosed,
} from "./categories";
import {
  organizers,
  findOrganizerById,
  findOrganizerByName,
} from "./organizers";
import { demoRegistrations } from "@/data/clubs/registrations";
import type { Event, Organizer } from "@/types/events";
import type { Registration } from "@/types/club";

/**
 * Get all events for a specific organizer by organizer ID
 */
export function getEventsByOrganizerId(organizerId: string): Event[] {
  const organizer = findOrganizerById(organizerId);
  if (!organizer) return [];

  return listEvents().filter((event) => event.organizer === organizer.name);
}

/**
 * Get all events for a specific organizer by organizer name
 */
export function getEventsByOrganizerName(organizerName: string): Event[] {
  return listEvents().filter((event) => event.organizer === organizerName);
}

/**
 * Get active events for an organizer.
 * Active = published AND accepting registrations (registration not closed).
 */
export function getActiveEventsByOrganizerId(organizerId: string): Event[] {
  const allEvents = getEventsByOrganizerId(organizerId);
  return allEvents.filter((event) => !isRegistrationClosed(event));
}

/**
 * Count active events for an organizer.
 */
export function getActiveEventCount(organizerId: string): number {
  return getActiveEventsByOrganizerId(organizerId).length;
}

/**
 * Get all registrations for events belonging to a specific organizer
 */
export function getRegistrationsByOrganizerId(
  organizerId: string,
): Registration[] {
  const organizer = findOrganizerById(organizerId);
  if (!organizer) return [];

  // Get all events for this organizer
  const organizerEvents = getEventsByOrganizerId(organizerId);
  const organizerEventIds = new Set(organizerEvents.map((e) => e.id));

  // Filter registrations to only those for this organizer's events
  return demoRegistrations.filter((reg) => organizerEventIds.has(reg.eventId));
}

/**
 * Get registrations grouped by event for an organizer
 */
export function getRegistrationsByEventForOrganizer(
  organizerId: string,
): Map<string, Registration[]> {
  const registrations = getRegistrationsByOrganizerId(organizerId);
  const byEvent = new Map<string, Registration[]>();

  for (const reg of registrations) {
    const existing = byEvent.get(reg.eventId) ?? [];
    existing.push(reg);
    byEvent.set(reg.eventId, existing);
  }

  return byEvent;
}

/**
 * Get organizer profile by ID
 */
export function getOrganizerProfile(
  organizerId: string,
): Organizer | undefined {
  return findOrganizerById(organizerId);
}

/**
 * Calculate stats for an organizer
 */
export function getOrganizerStats(organizerId: string): {
  activeEvents: number;
  totalEvents: number;
  totalRegistrations: number;
  pendingRegistrations: number;
  paidRegistrations: number;
  totalRevenue: number;
  totalAthletes: number;
} {
  const allEvents = getEventsByOrganizerId(organizerId);
  const activeEvents = getActiveEventsByOrganizerId(organizerId);
  const registrations = getRegistrationsByOrganizerId(organizerId);

  const pendingRegistrations = registrations.filter(
    (r) => r.status === "pending",
  );
  const paidRegistrations = registrations.filter((r) => r.status === "paid");

  // Calculate total revenue from paid registrations
  const totalRevenue = paidRegistrations.reduce((sum, reg) => {
    const amount = parseFloat(reg.invoiceTotal) || 0;
    return sum + amount;
  }, 0);

  // Calculate total athletes across all registrations
  const totalAthletes = registrations.reduce(
    (sum, reg) => sum + reg.athletes,
    0,
  );

  return {
    activeEvents: activeEvents.length,
    totalEvents: allEvents.length,
    totalRegistrations: registrations.length,
    pendingRegistrations: pendingRegistrations.length,
    paidRegistrations: paidRegistrations.length,
    totalRevenue,
    totalAthletes,
  };
}

/**
 * Parse event date string (e.g., "Nov 14, 2026") into a Date object
 */
export function parseEventDate(dateStr: string): Date {
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  // Fallback: return invalid date (caller should handle)
  return new Date(NaN);
}

/**
 * Check if an event date falls within a season range
 */
export function isEventInSeason(
  eventDate: Date,
  seasonStart: Date,
  seasonEnd: Date,
): boolean {
  if (!(eventDate instanceof Date) || Number.isNaN(eventDate.getTime()))
    return false;
  return eventDate >= seasonStart && eventDate <= seasonEnd;
}

// Re-export for convenience
export { organizers, findOrganizerById, findOrganizerByName };
export { eventCategories, listEvents, isRegistrationClosed };
