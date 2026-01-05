/**
 * Storage helpers for organizer event drafts and published events.
 * Merges published events with base seeded events for public display.
 */

import type { Event } from '@/types/events'
import { listEvents as getBaseEvents, findEventById as findBaseEventById } from './categories'

const STORAGE_KEY_PREFIX_DRAFTS = 'cheerbase-organizer-events-drafts'
const STORAGE_KEY_PREFIX_PUBLISHED = 'cheerbase-organizer-events-published'

function getDraftsStorageKey(organizerId: string): string {
  return `${STORAGE_KEY_PREFIX_DRAFTS}-${organizerId}`
}

function getPublishedStorageKey(organizerId: string): string {
  return `${STORAGE_KEY_PREFIX_PUBLISHED}-${organizerId}`
}

/**
 * Get all draft events for an organizer (client-side only)
 */
export function getOrganizerDrafts(organizerId: string): Event[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(getDraftsStorageKey(organizerId))
    if (stored) {
      return JSON.parse(stored) as Event[]
    }
  } catch {
    // Ignore parse errors
  }
  return []
}

/**
 * Get all published events for an organizer (client-side only)
 */
export function getOrganizerPublished(organizerId: string): Event[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(getPublishedStorageKey(organizerId))
    if (stored) {
      return JSON.parse(stored) as Event[]
    }
  } catch {
    // Ignore parse errors
  }
  return []
}

/**
 * List all events (base + published overrides) for public display.
 * Published events override base events by id.
 * Only includes published events (not drafts).
 * Works on both server and client - on server, returns base events only.
 */
export function listEvents(): Event[] {
  const baseEvents = getBaseEvents()
  
  // On server, return base events only (localStorage not available)
  if (typeof window === 'undefined') {
    return baseEvents
  }

  const publishedMap = new Map<string, Event>()
  
  // Collect all published events from localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_KEY_PREFIX_PUBLISHED)) {
        const stored = localStorage.getItem(key)
        if (stored) {
          const published: Event[] = JSON.parse(stored)
          published.forEach(event => {
            if (event.status === 'published' || !event.status) {
              publishedMap.set(event.id, event)
            }
          })
        }
      }
    }
  } catch {
    // Ignore errors
  }

  // Merge: base events + published overrides
  const merged = new Map<string, Event>()
  
  // Add all base events
  baseEvents.forEach(event => {
    merged.set(event.id, event)
  })
  
  // Override with published events
  publishedMap.forEach((event, id) => {
    merged.set(id, event)
  })

  return Array.from(merged.values())
}

/**
 * Find event by ID, checking published overrides first, then base events.
 * Works on both server and client - on server, checks base events only.
 */
export function findEventById(id: string): Event | undefined {
  // First check published events (client-side only)
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(STORAGE_KEY_PREFIX_PUBLISHED)) {
          const stored = localStorage.getItem(key)
          if (stored) {
            const published: Event[] = JSON.parse(stored)
            const found = published.find(e => e.id === id)
            if (found && (found.status === 'published' || !found.status)) {
              return found
            }
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }

  // Fall back to base events
  return findBaseEventById(id)
}

/**
 * Find event by ID including drafts (for organizer's own events)
 */
export function findEventByIdIncludingDrafts(id: string, organizerId?: string): Event | undefined {
  // Check drafts first if organizerId provided
  if (organizerId && typeof window !== 'undefined') {
    const drafts = getOrganizerDrafts(organizerId)
    const draft = drafts.find(e => e.id === id)
    if (draft) return draft
  }

  // Check published
  const published = findEventById(id)
  if (published) return published

  // Fall back to base
  return findBaseEventById(id)
}

