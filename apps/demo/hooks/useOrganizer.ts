'use client'

import { useMemo } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { findOrganizerById } from '@/data/events/organizers'
import type { Organizer } from '@/types/events'

/**
 * Hook to get the current organizer profile based on the authenticated user.
 * Returns the organizer profile if the user is logged in as an organizer with an organizerId.
 */
export function useOrganizer(): {
  organizer: Organizer | null
  organizerId: string | null
  isLoading: boolean
} {
  const { user, status } = useAuth()

  const result = useMemo(() => {
    if (status === 'loading') {
      return { organizer: null, organizerId: null, isLoading: true }
    }

    if (!user || user.role !== 'organizer' || !user.organizerId) {
      return { organizer: null, organizerId: null, isLoading: false }
    }

    const organizer = findOrganizerById(user.organizerId)
    return {
      organizer: organizer ?? null,
      organizerId: user.organizerId,
      isLoading: false,
    }
  }, [user, status])

  return result
}

