import type { Organizer } from '@/types/events'

export const organizers: Organizer[] = [
  {
    name: 'Cheer Elite Events',
    visibility: 'Public',
    region: 'National',
    gradient: 'red',
    followers: 1679,
    eventsCount: 1,
    hostingYears: 1,
  },
  {
    name: 'Spirit Sports Co.',
    visibility: 'Public',
    region: 'Southeast',
    gradient: 'indigo',
    followers: 2450,
    eventsCount: 12,
    hostingYears: 3,
  },
  {
    name: 'West Coast Cheer',
    visibility: 'Public',
    region: 'California',
    gradient: 'orange',
    followers: 3200,
    eventsCount: 8,
    hostingYears: 5,
  },
  {
    name: 'Cheer Squad Prestige Academy',
    visibility: 'Invite-only',
    region: 'Midwest',
    gradient: 'purple',
    followers: 890,
    eventsCount: 4,
    hostingYears: 2,
  },
  {
    name: 'Midwest Athletics',
    visibility: 'Public',
    region: 'Illinois',
    gradient: 'blue',
    followers: 1850,
    eventsCount: 6,
    hostingYears: 4,
  },
  {
    name: 'Southern Spirit',
    visibility: 'Public',
    region: 'Texas',
    gradient: 'green',
    followers: 2100,
    eventsCount: 9,
    hostingYears: 3,
  },
  {
    name: 'East Region Events',
    visibility: 'Public',
    region: 'New England',
    gradient: 'teal',
    followers: 1420,
    eventsCount: 5,
    hostingYears: 2,
  },
  {
    name: 'Sapphire Productions',
    visibility: 'Public',
    region: 'Quebec',
    gradient: 'primary',
    followers: 2800,
    eventsCount: 15,
    hostingYears: 6,
  },
]

/**
 * Find an organizer by name
 */
export function findOrganizerByName(name: string): Organizer | undefined {
  return organizers.find((org) => org.name === name)
}

/**
 * Format followers count for display
 */
export function formatFollowers(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k`
  }
  return count.toLocaleString()
}

/**
 * Format hosting duration for display
 */
export function formatHostingDuration(years: number): string {
  if (years === 1) return '1 year'
  return `${years} years`
}
