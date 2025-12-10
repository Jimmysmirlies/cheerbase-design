'use client'

/**
 * useUnifiedClubData
 * 
 * Unified data layer that merges demo data with localStorage registrations.
 * This creates a seamless experience where user-created registrations appear
 * alongside demo data without any special handling.
 */

import { useCallback, useEffect, useState } from 'react'
import type { ClubData, RegistrationDTO, RegisteredTeamDTO, RegisteredMemberDTO, MemberRole } from '@/lib/club-data'
import type { StoredRegistration, StoredRegistrationTeam } from './useNewRegistrationStorage'

const STORAGE_KEY = 'cheerbase-new-registrations'
const DEFAULT_CLUB_OWNER_ID = 'club-owner-1'

// Get localStorage registrations (runs only on client)
function getLocalStorageRegistrations(): StoredRegistration[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as StoredRegistration[]
    }
  } catch (error) {
    console.error('Failed to load registrations from localStorage:', error)
  }
  return []
}

// Convert a StoredRegistrationTeam to RegisteredTeamDTO
function convertToRegisteredTeamDTO(
  team: StoredRegistrationTeam,
  registrationId: string
): RegisteredTeamDTO {
  const members: RegisteredMemberDTO[] = (team.members || []).map((m, idx) => ({
    id: m.id || `${registrationId}-${team.id}-member-${idx}`,
    firstName: m.firstName || m.name?.split(' ')[0] || '',
    lastName: m.lastName || m.name?.split(' ').slice(1).join(' ') || '',
    email: m.email || undefined,
    phone: m.phone || undefined,
    dob: m.dob || undefined,
    role: (m.role?.toLowerCase() || 'athlete') as MemberRole,
  }))

  return {
    id: `rt-${registrationId}-${team.id}`,
    clubOwnerId: DEFAULT_CLUB_OWNER_ID,
    sourceType: 'club_team',
    sourceTeamId: team.teamId,
    name: team.name,
    division: team.division,
    size: members.length,
    coedCount: 0,
    members,
  }
}

// Convert StoredRegistration to RegistrationDTO[] (one per team)
function convertStoredToRegistrationDTOs(stored: StoredRegistration): RegistrationDTO[] {
  return stored.teams.map((team, index) => {
    const registeredTeam = convertToRegisteredTeamDTO(team, stored.id)
    const memberCount = team.members?.length || 0
    
    return {
      id: `${stored.id}${stored.teams.length > 1 ? `-${index}` : ''}`,
      clubOwnerId: DEFAULT_CLUB_OWNER_ID,
      eventId: stored.eventId,
      eventName: stored.eventName,
      organizer: stored.organizer,
      eventDate: stored.eventDate,
      location: stored.location,
      division: team.division,
      teamId: team.teamId,
      registeredTeamId: registeredTeam.id,
      registeredTeam,
      athletes: memberCount,
      invoiceTotal: stored.total / stored.teams.length, // Split total across teams
      paymentDeadline: stored.paymentDeadline,
      registrationDeadline: stored.registrationDeadline,
      snapshotTakenAt: stored.createdAt,
      snapshotSourceTeamId: team.teamId,
      status: stored.status === 'paid' ? 'paid' : 'pending',
      paidAt: stored.paidAt || null,
      createdAt: stored.createdAt,
      // Store reference to parent registration for grouping
      _parentRegistrationId: stored.id,
      _invoiceNumber: stored.invoiceNumber,
      _invoiceDate: stored.invoiceDate,
      _subtotal: stored.subtotal,
      _tax: stored.tax,
      _totalAmount: stored.total,
      _organizerGradient: stored.organizerGradient,
    } as RegistrationDTO & {
      _parentRegistrationId: string
      _invoiceNumber: string
      _invoiceDate: string
      _subtotal: number
      _tax: number
      _totalAmount: number
      _organizerGradient?: string
    }
  })
}

// Merge localStorage registrations with demo data
function mergeClubData(demoData: ClubData): ClubData {
  const localRegistrations = getLocalStorageRegistrations()
  
  if (localRegistrations.length === 0) {
    return demoData
  }

  // Convert localStorage registrations to DTOs
  const localRegistrationDTOs: RegistrationDTO[] = localRegistrations.flatMap(
    convertStoredToRegistrationDTOs
  )

  // Build registered teams from localStorage
  const localRegisteredTeams: RegisteredTeamDTO[] = localRegistrations.flatMap(stored =>
    stored.teams.map(team => convertToRegisteredTeamDTO(team, stored.id))
  )

  return {
    ...demoData,
    registeredTeams: [...demoData.registeredTeams, ...localRegisteredTeams],
    registrations: [...demoData.registrations, ...localRegistrationDTOs],
  }
}

// Get a single registration by ID (checks both demo and localStorage)
export function getRegistrationById(
  registrations: RegistrationDTO[],
  registrationId: string
): RegistrationDTO | undefined {
  // Direct match
  const direct = registrations.find(r => r.id === registrationId)
  if (direct) return direct

  // Check if it's a parent ID (for localStorage registrations with multiple teams)
  // Return the first team's registration
  const byParent = registrations.find(r => 
    (r as any)._parentRegistrationId === registrationId
  )
  if (byParent) return byParent

  return undefined
}

// Get all registrations for a parent registration ID
export function getRegistrationsByParentId(
  registrations: RegistrationDTO[],
  parentId: string
): RegistrationDTO[] {
  return registrations.filter(r => 
    r.id === parentId || 
    r.id.startsWith(`${parentId}-`) ||
    (r as any)._parentRegistrationId === parentId
  )
}

// Hook to get unified club data
export function useUnifiedClubData() {
  const [data, setData] = useState<ClubData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch demo data from API
      const response = await fetch('/api/demo/club-data')
      if (!response.ok) {
        throw new Error('Failed to fetch club data')
      }
      const demoData: ClubData = await response.json()
      
      // Merge with localStorage
      const mergedData = mergeClubData(demoData)
      
      setData(mergedData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Refresh function to reload data (useful after creating a registration)
  const refresh = useCallback(() => {
    loadData()
  }, [loadData])

  return {
    data,
    isLoading,
    error,
    refresh,
  }
}

// Synchronous function to get merged data (for use in client components that already have demo data)
export function mergeWithLocalStorage(demoData: ClubData): ClubData {
  return mergeClubData(demoData)
}

// Get localStorage registration data for invoice (preserves full invoice info)
export function getLocalStorageRegistration(registrationId: string): StoredRegistration | null {
  const registrations = getLocalStorageRegistrations()
  // Check for direct match or parent match
  return registrations.find(r => 
    r.id === registrationId || 
    registrationId.startsWith(r.id)
  ) || null
}

