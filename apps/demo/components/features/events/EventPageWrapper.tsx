'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { findEventByIdIncludingDrafts } from '@/data/events'
import type { Event } from '@/types/events'
import type { ReactNode } from 'react'

type EventPageWrapperProps = {
  eventId: string
  serverEvent: Event | null
  children: (event: Event) => ReactNode
}

/**
 * Client wrapper that checks for drafts and provides the correct event to children.
 * If event is a draft and user is the organizer, allows viewing.
 * Otherwise falls back to server event.
 */
export function EventPageWrapper({ eventId, serverEvent, children }: EventPageWrapperProps) {
  const router = useRouter()
  const { user, status } = useAuth()
  const organizerId = user?.organizerId
  const [event, setEvent] = useState<Event | null>(serverEvent)

  useEffect(() => {
    if (status === 'loading') return

    // Check for draft if user is organizer
    if (organizerId && typeof window !== 'undefined') {
      const draftOrPublished = findEventByIdIncludingDrafts(eventId, organizerId)
      if (draftOrPublished) {
        setEvent(draftOrPublished)
        return
      }
    }

    // Fall back to server event
    if (serverEvent) {
      setEvent(serverEvent)
    } else {
      // Event not found
      router.replace('/events')
    }
  }, [eventId, organizerId, serverEvent, status, router])

  if (!event) {
    return null // Will redirect
  }

  return <>{children(event)}</>
}

