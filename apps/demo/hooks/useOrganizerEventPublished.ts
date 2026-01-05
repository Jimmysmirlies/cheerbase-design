'use client'

import { useCallback, useMemo } from 'react'
import type { Event } from '@/types/events'

const STORAGE_KEY_PREFIX = 'cheerbase-organizer-events-published'

function getStorageKey(organizerId: string): string {
  return `${STORAGE_KEY_PREFIX}-${organizerId}`
}

export function useOrganizerEventPublished(organizerId: string | undefined) {
  const storageKey = useMemo(
    () => (organizerId ? getStorageKey(organizerId) : null),
    [organizerId]
  )

  const getPublished = useCallback((): Event[] => {
    if (!storageKey || typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        return JSON.parse(stored) as Event[]
      }
    } catch {
      // Ignore parse errors
    }
    return []
  }, [storageKey])

  const publishEvent = useCallback((event: Event) => {
    if (!storageKey || typeof window === 'undefined') return

    const published = getPublished()
    const existingIndex = published.findIndex(e => e.id === event.id)
    
    const publishedEvent: Event = {
      ...event,
      updatedAt: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      published[existingIndex] = publishedEvent
    } else {
      published.push(publishedEvent)
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(published))
    } catch {
      // Ignore storage errors
    }
  }, [storageKey, getPublished])

  const unpublishEvent = useCallback((eventId: string) => {
    if (!storageKey || typeof window === 'undefined') return

    const published = getPublished().filter(e => e.id !== eventId)
    try {
      localStorage.setItem(storageKey, JSON.stringify(published))
    } catch {
      // Ignore storage errors
    }
  }, [storageKey, getPublished])

  const getPublishedEvent = useCallback((eventId: string): Event | undefined => {
    return getPublished().find(e => e.id === eventId)
  }, [getPublished])

  return {
    published: getPublished(),
    getPublishedEvent,
    publishEvent,
    unpublishEvent,
  }
}

