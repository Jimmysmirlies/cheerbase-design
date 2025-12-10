'use client'

/**
 * useUserTeams
 * 
 * Manages per-user teams in localStorage for non-demo accounts.
 * Demo accounts use static demo data instead.
 */

import { useCallback, useEffect, useState } from 'react'
import type { Team, TeamRoster, Person } from '@/types/club'

const STORAGE_KEY_PREFIX = 'cheerbase-user-teams'
const ROSTER_STORAGE_KEY_PREFIX = 'cheerbase-user-rosters'
const DEMO_CLUB_OWNER_ID = 'club-owner-1'

export type StoredTeam = Team

export type StoredRoster = TeamRoster

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}-${userId}`
}

function getRosterStorageKey(userId: string): string {
  return `${ROSTER_STORAGE_KEY_PREFIX}-${userId}`
}

// Get teams from localStorage for a specific user
export function getUserTeams(userId: string): StoredTeam[] {
  if (typeof window === 'undefined') return []
  if (userId === DEMO_CLUB_OWNER_ID) return [] // Demo uses static data
  
  try {
    const stored = localStorage.getItem(getStorageKey(userId))
    if (stored) {
      return JSON.parse(stored) as StoredTeam[]
    }
  } catch (error) {
    console.error('Failed to load teams from localStorage:', error)
  }
  return []
}

// Get rosters from localStorage for a specific user
export function getUserRosters(userId: string): StoredRoster[] {
  if (typeof window === 'undefined') return []
  if (userId === DEMO_CLUB_OWNER_ID) return [] // Demo uses static data
  
  try {
    const stored = localStorage.getItem(getRosterStorageKey(userId))
    if (stored) {
      return JSON.parse(stored) as StoredRoster[]
    }
  } catch (error) {
    console.error('Failed to load rosters from localStorage:', error)
  }
  return []
}

// Save teams to localStorage
function saveUserTeams(userId: string, teams: StoredTeam[]): void {
  if (typeof window === 'undefined') return
  if (userId === DEMO_CLUB_OWNER_ID) return
  
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(teams))
  } catch (error) {
    console.error('Failed to save teams to localStorage:', error)
  }
}

// Save rosters to localStorage
function saveUserRosters(userId: string, rosters: StoredRoster[]): void {
  if (typeof window === 'undefined') return
  if (userId === DEMO_CLUB_OWNER_ID) return
  
  try {
    localStorage.setItem(getRosterStorageKey(userId), JSON.stringify(rosters))
  } catch (error) {
    console.error('Failed to save rosters to localStorage:', error)
  }
}

// Add a new team
export function addUserTeam(userId: string, team: Omit<StoredTeam, 'id'>): StoredTeam {
  const teams = getUserTeams(userId)
  const newTeam: StoredTeam = {
    ...team,
    id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  }
  teams.push(newTeam)
  saveUserTeams(userId, teams)
  
  // Also create an empty roster for this team
  const rosters = getUserRosters(userId)
  const newRoster: StoredRoster = {
    teamId: newTeam.id,
    coaches: [],
    athletes: [],
    reservists: [],
    chaperones: [],
    updatedAt: new Date().toISOString(),
  }
  rosters.push(newRoster)
  saveUserRosters(userId, rosters)
  
  return newTeam
}

// Update an existing team
export function updateUserTeam(userId: string, teamId: string, updates: Partial<Omit<StoredTeam, 'id'>>): StoredTeam | null {
  const teams = getUserTeams(userId)
  const existingTeam = teams.find(t => t.id === teamId)
  if (!existingTeam) return null
  
  const updatedTeam: StoredTeam = {
    id: existingTeam.id,
    name: updates.name ?? existingTeam.name,
    division: updates.division ?? existingTeam.division,
    size: updates.size ?? existingTeam.size,
    coedCount: updates.coedCount ?? existingTeam.coedCount,
  }
  
  const updatedTeams = teams.map(t => t.id === teamId ? updatedTeam : t)
  saveUserTeams(userId, updatedTeams)
  return updatedTeam
}

// Delete a team
export function deleteUserTeam(userId: string, teamId: string): boolean {
  const teams = getUserTeams(userId)
  const filtered = teams.filter(t => t.id !== teamId)
  if (filtered.length === teams.length) return false
  
  saveUserTeams(userId, filtered)
  
  // Also remove the roster
  const rosters = getUserRosters(userId)
  const filteredRosters = rosters.filter(r => r.teamId !== teamId)
  saveUserRosters(userId, filteredRosters)
  
  return true
}

// Update a team's roster
export function updateUserRoster(userId: string, teamId: string, roster: Partial<Omit<StoredRoster, 'teamId'>>): StoredRoster | null {
  const rosters = getUserRosters(userId)
  const existingRoster = rosters.find(r => r.teamId === teamId)
  
  if (!existingRoster) {
    // Create new roster if doesn't exist
    const newRoster: StoredRoster = {
      teamId,
      coaches: roster.coaches ?? [],
      athletes: roster.athletes ?? [],
      reservists: roster.reservists ?? [],
      chaperones: roster.chaperones ?? [],
      updatedAt: new Date().toISOString(),
    }
    rosters.push(newRoster)
    saveUserRosters(userId, rosters)
    return newRoster
  }
  
  const updatedRoster: StoredRoster = {
    teamId: existingRoster.teamId,
    coaches: roster.coaches ?? existingRoster.coaches,
    athletes: roster.athletes ?? existingRoster.athletes,
    reservists: roster.reservists ?? existingRoster.reservists,
    chaperones: roster.chaperones ?? existingRoster.chaperones,
    updatedAt: new Date().toISOString(),
  }
  
  const updatedRosters = rosters.map(r => r.teamId === teamId ? updatedRoster : r)
  saveUserRosters(userId, updatedRosters)
  return updatedRoster
}

// Add a member to a team roster
export function addMemberToRoster(
  userId: string,
  teamId: string,
  member: Person,
  role: 'coach' | 'athlete' | 'reservist' | 'chaperone'
): StoredRoster | null {
  const rosters = getUserRosters(userId)
  let roster = rosters.find(r => r.teamId === teamId)
  
  if (!roster) {
    roster = {
      teamId,
      coaches: [],
      athletes: [],
      reservists: [],
      chaperones: [],
      updatedAt: new Date().toISOString(),
    }
    rosters.push(roster)
  }
  
  const roleKey = `${role}s` as 'coaches' | 'athletes' | 'reservists' | 'chaperones'
  roster[roleKey].push(member)
  roster.updatedAt = new Date().toISOString()
  
  saveUserRosters(userId, rosters)
  return roster
}

// Hook for reactive team management
export function useUserTeams(userId?: string) {
  const [teams, setTeams] = useState<StoredTeam[]>([])
  const [rosters, setRosters] = useState<StoredRoster[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load data on mount and when userId changes
  useEffect(() => {
    if (!userId || userId === DEMO_CLUB_OWNER_ID) {
      setTeams([])
      setRosters([])
      setIsLoading(false)
      return
    }

    setTeams(getUserTeams(userId))
    setRosters(getUserRosters(userId))
    setIsLoading(false)
  }, [userId])

  const addTeam = useCallback((team: Omit<StoredTeam, 'id'>) => {
    if (!userId || userId === DEMO_CLUB_OWNER_ID) return null
    
    const newTeam = addUserTeam(userId, team)
    setTeams(getUserTeams(userId))
    setRosters(getUserRosters(userId))
    return newTeam
  }, [userId])

  const updateTeam = useCallback((teamId: string, updates: Partial<Omit<StoredTeam, 'id'>>) => {
    if (!userId || userId === DEMO_CLUB_OWNER_ID) return null
    
    const updated = updateUserTeam(userId, teamId, updates)
    if (updated) {
      setTeams(getUserTeams(userId))
    }
    return updated
  }, [userId])

  const removeTeam = useCallback((teamId: string) => {
    if (!userId || userId === DEMO_CLUB_OWNER_ID) return false
    
    const removed = deleteUserTeam(userId, teamId)
    if (removed) {
      setTeams(getUserTeams(userId))
      setRosters(getUserRosters(userId))
    }
    return removed
  }, [userId])

  const updateRoster = useCallback((teamId: string, roster: Partial<Omit<StoredRoster, 'teamId'>>) => {
    if (!userId || userId === DEMO_CLUB_OWNER_ID) return null
    
    const updated = updateUserRoster(userId, teamId, roster)
    if (updated) {
      setRosters(getUserRosters(userId))
    }
    return updated
  }, [userId])

  const addMember = useCallback((
    teamId: string,
    member: Person,
    role: 'coach' | 'athlete' | 'reservist' | 'chaperone'
  ) => {
    if (!userId || userId === DEMO_CLUB_OWNER_ID) return null
    
    const updated = addMemberToRoster(userId, teamId, member, role)
    if (updated) {
      setRosters(getUserRosters(userId))
    }
    return updated
  }, [userId])

  const refresh = useCallback(() => {
    if (!userId || userId === DEMO_CLUB_OWNER_ID) return
    
    setTeams(getUserTeams(userId))
    setRosters(getUserRosters(userId))
  }, [userId])

  return {
    teams,
    rosters,
    isLoading,
    addTeam,
    updateTeam,
    removeTeam,
    updateRoster,
    addMember,
    refresh,
  }
}
