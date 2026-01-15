/**
 * Computed analytics selectors for organizer dashboard.
 * Derives metrics from actual registration and event data.
 */

import { demoRegistrations } from "@/data/clubs/registrations";
import { demoTeams } from "@/data/clubs/teams";
import {
  getEventsByOrganizerId,
  findOrganizerById,
  listEvents,
} from "./selectors";
import type { Registration } from "@/types/club";

// ============================================================================
// Types
// ============================================================================

export type OrganizerOverview = {
  totalRegistrations: number;
  totalParticipants: number;
  revenuePaid: number;
  revenueOutstanding: number;
  overdueAmount: number;
};

export type PaymentHealth = {
  paidCount: number;
  unpaidCount: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueCount: number;
  overdueAmount: number;
  dueSoon7Days: number;
  dueSoon14Days: number;
  dueSoon30Days: number;
  paidPercentage: number;
};

export type MonthlyData = {
  month: string;
  registrations: number;
  revenue: number;
  participants: number;
};

export type EventPerformance = {
  eventId: string;
  eventName: string;
  eventDate: string;
  registrations: number;
  participants: number;
  revenuePaid: number;
  revenueOutstanding: number;
  filledSlots: number;
  totalSlots: number;
  fillRate: number;
  remainingSlots: number;
  unpaidPercentage: number;
  needsAttention: boolean;
};

export type OrganizerAnalytics = {
  overview: OrganizerOverview;
  paymentHealth: PaymentHealth;
  monthlyData: MonthlyData[];
  eventPerformance: EventPerformance[];
};

export type RegistrationStatus = "paid" | "unpaid" | "overdue";

export type RegistrationTableRow = {
  id: string;
  teamName: string;
  teamId: string;
  clubName: string;
  submittedAt: Date;
  submittedAtFormatted: string;
  eventName: string;
  eventId: string;
  invoiceNumber: string;
  invoiceHref: string;
  status: RegistrationStatus;
  invoiceTotal: number;
};

export type InvoiceHistoryEntry = {
  id: string;
  invoiceNumber: string;
  teamName: string;
  teamId: string;
  clubOwner: string;
  eventName: string;
  eventId: string;
  changeDate: Date;
  changeDateFormatted: string;
  paidByOrganizer: string;
  paymentNote: string;
  status: RegistrationStatus;
};

// ============================================================================
// Helpers
// ============================================================================

function parseAmount(amount: string): number {
  return parseFloat(amount) || 0;
}

function getSubmittedDate(reg: Registration): Date {
  // Prefer submittedAt, fallback to snapshotTakenAt
  const dateStr = reg.submittedAt ?? reg.snapshotTakenAt;
  return dateStr ? new Date(dateStr) : new Date();
}

function formatMonthKey(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Compute a 6-digit invoice ID from a seed string (matches lib/invoices.ts logic)
 */
function computeSixDigitId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const sixDigit = (hash % 900000) + 100000; // ensures 100000–999999
  return String(sixDigit).padStart(6, "0");
}

/**
 * Format invoice number consistently (e.g., "733814-001")
 */
function formatInvoiceNumber(
  registrationId: string,
  eventId: string,
  version = 1,
): string {
  const invoiceId = computeSixDigitId(`${registrationId}:${eventId}`);
  return `${invoiceId}-${String(version).padStart(3, "0")}`;
}

// ============================================================================
// Selectors
// ============================================================================

/**
 * Get registrations for a specific organizer's events
 */
export function getOrganizerRegistrations(organizerId: string): Registration[] {
  const organizer = findOrganizerById(organizerId);
  if (!organizer) return [];

  const organizerEvents = getEventsByOrganizerId(organizerId);
  const organizerEventIds = new Set(organizerEvents.map((e) => e.id));

  return demoRegistrations.filter((reg) => organizerEventIds.has(reg.eventId));
}

/**
 * Get overview KPIs for an organizer
 */
export function getOrganizerOverview(organizerId: string): OrganizerOverview {
  const registrations = getOrganizerRegistrations(organizerId);
  const now = new Date();

  let totalRegistrations = 0;
  let totalParticipants = 0;
  let revenuePaid = 0;
  let revenueOutstanding = 0;
  let overdueAmount = 0;

  for (const reg of registrations) {
    totalRegistrations++;
    totalParticipants += reg.athletes;
    const amount = parseAmount(reg.invoiceTotal);

    if (reg.status === "paid") {
      revenuePaid += amount;
    } else {
      revenueOutstanding += amount;
      const deadline = new Date(reg.paymentDeadline);
      if (deadline < now) {
        overdueAmount += amount;
      }
    }
  }

  return {
    totalRegistrations,
    totalParticipants,
    revenuePaid,
    revenueOutstanding,
    overdueAmount,
  };
}

/**
 * Get payment health metrics for an organizer
 */
export function getPaymentHealth(organizerId: string): PaymentHealth {
  const registrations = getOrganizerRegistrations(organizerId);
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  let paidCount = 0;
  let unpaidCount = 0;
  let paidAmount = 0;
  let unpaidAmount = 0;
  let overdueCount = 0;
  let overdueAmount = 0;
  let dueSoon7Days = 0;
  let dueSoon14Days = 0;
  let dueSoon30Days = 0;

  for (const reg of registrations) {
    const amount = parseAmount(reg.invoiceTotal);
    const deadline = new Date(reg.paymentDeadline);

    if (reg.status === "paid") {
      paidCount++;
      paidAmount += amount;
    } else {
      unpaidCount++;
      unpaidAmount += amount;

      if (deadline < now) {
        overdueCount++;
        overdueAmount += amount;
      } else if (deadline <= in7Days) {
        dueSoon7Days++;
      } else if (deadline <= in14Days) {
        dueSoon14Days++;
      } else if (deadline <= in30Days) {
        dueSoon30Days++;
      }
    }
  }

  const total = paidCount + unpaidCount;
  const paidPercentage = total > 0 ? (paidCount / total) * 100 : 0;

  return {
    paidCount,
    unpaidCount,
    paidAmount,
    unpaidAmount,
    overdueCount,
    overdueAmount,
    dueSoon7Days,
    dueSoon14Days,
    dueSoon30Days,
    paidPercentage,
  };
}

/**
 * Get registration trend by month for an organizer
 */
export function getRegistrationTrend(organizerId: string): MonthlyData[] {
  const registrations = getOrganizerRegistrations(organizerId);

  // Group by month of submission
  const monthMap = new Map<
    string,
    { registrations: number; revenue: number; participants: number }
  >();

  for (const reg of registrations) {
    const submittedDate = getSubmittedDate(reg);
    const monthKey = formatMonthKey(submittedDate);

    const existing = monthMap.get(monthKey) ?? {
      registrations: 0,
      revenue: 0,
      participants: 0,
    };
    existing.registrations++;
    existing.participants += reg.athletes;
    if (reg.status === "paid") {
      existing.revenue += parseAmount(reg.invoiceTotal);
    }
    monthMap.set(monthKey, existing);
  }

  // Sort by date
  const months = Array.from(monthMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  return months;
}

/**
 * Get per-event performance metrics for an organizer
 */
export function getEventPerformance(organizerId: string): EventPerformance[] {
  const registrations = getOrganizerRegistrations(organizerId);
  const events = getEventsByOrganizerId(organizerId);
  const allEvents = listEvents();

  // Build event lookup
  const eventMap = new Map(allEvents.map((e) => [e.id, e]));

  // Group registrations by event
  const eventRegs = new Map<string, Registration[]>();
  for (const reg of registrations) {
    const existing = eventRegs.get(reg.eventId) ?? [];
    existing.push(reg);
    eventRegs.set(reg.eventId, existing);
  }

  const performance: EventPerformance[] = [];

  for (const event of events) {
    const regs = eventRegs.get(event.id) ?? [];
    const eventData = eventMap.get(event.id);

    let participants = 0;
    let revenuePaid = 0;
    let revenueOutstanding = 0;
    let unpaidCount = 0;

    for (const reg of regs) {
      participants += reg.athletes;
      const amount = parseAmount(reg.invoiceTotal);
      if (reg.status === "paid") {
        revenuePaid += amount;
      } else {
        revenueOutstanding += amount;
        unpaidCount++;
      }
    }

    const filledSlots = eventData?.slots.filled ?? regs.length;
    const totalSlots = eventData?.slots.capacity ?? filledSlots;
    const remainingSlots = Math.max(0, totalSlots - filledSlots);
    const fillRate = totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0;
    const unpaidPercentage =
      regs.length > 0 ? (unpaidCount / regs.length) * 100 : 0;

    // Flag events that need attention: >50% unpaid or overdue payments
    const needsAttention =
      unpaidPercentage > 50 || revenueOutstanding > revenuePaid;

    performance.push({
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      registrations: regs.length,
      participants,
      revenuePaid,
      revenueOutstanding,
      filledSlots,
      totalSlots,
      fillRate,
      remainingSlots,
      unpaidPercentage,
      needsAttention,
    });
  }

  // Sort by event date (upcoming first)
  performance.sort((a, b) => {
    const dateA = new Date(a.eventDate);
    const dateB = new Date(b.eventDate);
    return dateA.getTime() - dateB.getTime();
  });

  return performance;
}

/**
 * Get complete analytics for an organizer
 */
export function getOrganizerAnalytics(
  organizerId: string,
): OrganizerAnalytics | null {
  const organizer = findOrganizerById(organizerId);
  if (!organizer) return null;

  return {
    overview: getOrganizerOverview(organizerId),
    paymentHealth: getPaymentHealth(organizerId),
    monthlyData: getRegistrationTrend(organizerId),
    eventPerformance: getEventPerformance(organizerId),
  };
}

/**
 * Get registration table data for an organizer
 * Returns enriched registration rows with team names, formatted dates, and status
 */
export function getRegistrationTableData(
  organizerId: string,
): RegistrationTableRow[] {
  const registrations = getOrganizerRegistrations(organizerId);
  const now = new Date();

  // Build team lookup
  const teamMap = new Map(demoTeams.map((t) => [t.id, t]));

  const rows: RegistrationTableRow[] = registrations.map((reg) => {
    const team = teamMap.get(reg.teamId);
    const submittedAt = getSubmittedDate(reg);
    const deadline = new Date(reg.paymentDeadline);

    // Compute status
    let status: RegistrationStatus = "unpaid";
    if (reg.status === "paid") {
      status = "paid";
    } else if (deadline < now) {
      status = "overdue";
    }

    // Generate invoice number (format: {6-digit-hash}-001)
    const invoiceNumber = formatInvoiceNumber(reg.id, reg.eventId);

    return {
      id: reg.id,
      teamName: team?.name ?? reg.teamId,
      teamId: reg.teamId,
      clubName: "Demo Club", // TODO: derive from actual club data when available
      submittedAt,
      submittedAtFormatted: submittedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      eventName: reg.eventName,
      eventId: reg.eventId,
      invoiceNumber,
      invoiceHref: `/organizer/invoices/invoice/${reg.id}`,
      status,
      invoiceTotal: parseAmount(reg.invoiceTotal),
    };
  });

  // Sort by submitted date (newest first)
  rows.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

  return rows;
}

// ============================================================================
// Formatters
// ============================================================================

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get invoice history entries for an organizer (payments and changes)
 * Returns entries sorted by change date (newest first)
 */
export function getInvoiceHistory(organizerId: string): InvoiceHistoryEntry[] {
  const registrations = getOrganizerRegistrations(organizerId);

  // Build team lookup
  const teamMap = new Map(demoTeams.map((t) => [t.id, t]));

  // Filter to only paid registrations (they have history)
  const paidRegistrations = registrations.filter(
    (reg) => reg.status === "paid" && reg.paidAt,
  );

  const entries: InvoiceHistoryEntry[] = paidRegistrations.map((reg) => {
    const team = teamMap.get(reg.teamId);
    const changeDate = new Date(reg.paidAt!);

    // Generate invoice number
    const invoiceNumber = formatInvoiceNumber(reg.id, reg.eventId);

    return {
      id: reg.id,
      invoiceNumber,
      teamName: team?.name ?? reg.teamId,
      teamId: reg.teamId,
      clubOwner: reg.clubOwner ?? "Unknown",
      eventName: reg.eventName,
      eventId: reg.eventId,
      changeDate,
      changeDateFormatted: changeDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      paidByOrganizer: reg.paidByOrganizer ?? "Unknown",
      paymentNote: reg.paymentNote ?? "",
      status: "paid" as RegistrationStatus,
    };
  });

  // Sort by change date (newest first)
  entries.sort((a, b) => b.changeDate.getTime() - a.changeDate.getTime());

  return entries;
}
