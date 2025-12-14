/**
 * Analytics data for Sapphire Productions organizer demo.
 * This provides pre-seeded analytics data for the organizer analytics page.
 */

export type MonthlyData = {
  month: string
  registrations: number
  revenue: number
  participants: number
}

export type EventPerformance = {
  eventId: string
  eventName: string
  registrations: number
  participants: number
  revenue: number
  fillRate: number // percentage of capacity filled
}

export type OrganizerAnalytics = {
  organizerId: string
  monthlyData: MonthlyData[]
  eventPerformance: EventPerformance[]
  totals: {
    totalRegistrations: number
    totalParticipants: number
    totalRevenue: number
    averageFillRate: number
  }
}

/**
 * Sapphire Productions analytics data
 * Based on their 5 Quebec events:
 * - Adrenaline Championship (Nov)
 * - Frostfest Championship (Jan)
 * - Cheerfest Montreal (Feb)
 * - CheerUp Invitational (Feb)
 * - GrooveFest Dance & Cheer (Mar)
 */
export const sapphireAnalytics: OrganizerAnalytics = {
  organizerId: 'sapphire-productions',
  monthlyData: [
    { month: 'Sep 2025', registrations: 8, revenue: 3200, participants: 142 },
    { month: 'Oct 2025', registrations: 15, revenue: 6450, participants: 268 },
    { month: 'Nov 2025', registrations: 22, revenue: 9680, participants: 396 },
    { month: 'Dec 2025', registrations: 18, revenue: 7920, participants: 324 },
    { month: 'Jan 2026', registrations: 28, revenue: 12320, participants: 504 },
    { month: 'Feb 2026', registrations: 35, revenue: 15400, participants: 630 },
    { month: 'Mar 2026', registrations: 24, revenue: 10560, participants: 432 },
  ],
  eventPerformance: [
    {
      eventId: 'adrenaline-quebec',
      eventName: 'Adrenaline Championship',
      registrations: 30,
      participants: 540,
      revenue: 23760,
      fillRate: 60,
    },
    {
      eventId: 'frostfest-montreal',
      eventName: 'Frostfest Championship',
      registrations: 22,
      participants: 396,
      revenue: 17424,
      fillRate: 55,
    },
    {
      eventId: 'cheerfest-quebec',
      eventName: 'Cheerfest Montreal',
      registrations: 34,
      participants: 612,
      revenue: 26928,
      fillRate: 68,
    },
    {
      eventId: 'cheerup-quebec',
      eventName: 'CheerUp Invitational',
      registrations: 18,
      participants: 324,
      revenue: 14256,
      fillRate: 56,
    },
    {
      eventId: 'groovefest-quebec',
      eventName: 'GrooveFest Dance & Cheer',
      registrations: 24,
      participants: 432,
      revenue: 19008,
      fillRate: 67,
    },
  ],
  totals: {
    totalRegistrations: 128,
    totalParticipants: 2304,
    totalRevenue: 101376,
    averageFillRate: 61.2,
  },
}

/**
 * Get analytics data for a specific organizer
 */
export function getOrganizerAnalytics(organizerId: string): OrganizerAnalytics | null {
  if (organizerId === 'sapphire-productions') {
    return sapphireAnalytics
  }
  return null
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

