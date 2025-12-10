'use client'

import { useCallback, useEffect, useState } from 'react'
import type { RegisteredTeamMember } from '@/components/features/clubs/RegisteredTeamCard'

/**
 * useNewRegistrationStorage
 * 
 * Manages localStorage persistence for new registrations created via the event registration flow.
 * This allows the demo app to feel real and persistent without a backend database.
 */

type RegisteredTeamCardData = {
  id: string
  name: string
  division: string
  members?: RegisteredTeamMember[]
  detailId: string
}

export type StoredRegistrationTeam = {
  id: string
  teamId: string
  name: string
  division: string
  members: RegisteredTeamMember[]
}

export type StoredRegistration = {
  id: string
  eventId: string
  eventName: string
  organizer: string
  organizerGradient?: string
  eventDate: string
  location: string
  registrationDeadline?: string
  paymentDeadline?: string
  teams: StoredRegistrationTeam[]
  // Invoice data
  invoiceNumber: string
  invoiceDate: string
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'paid' | 'cancelled'
  paidAt?: string
  // Metadata
  createdAt: string
  updatedAt?: string
}

const STORAGE_KEY = 'cheerbase-new-registrations'
const COUNTER_KEY = 'cheerbase-registration-counter'

// Generate a unique registration ID
function generateRegistrationId(): string {
  let counter = 1
  try {
    const stored = localStorage.getItem(COUNTER_KEY)
    if (stored) {
      counter = parseInt(stored, 10) + 1
    }
    localStorage.setItem(COUNTER_KEY, counter.toString())
  } catch {
    counter = Date.now() % 100000
  }
  return `new-${counter.toString().padStart(5, '0')}`
}

// Generate invoice number from registration ID
function generateInvoiceNumber(registrationId: string): string {
  const numPart = registrationId.replace('new-', '').padStart(6, '0')
  return `${numPart}-001`
}

// Get all stored registrations
export function getStoredRegistrations(): StoredRegistration[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as StoredRegistration[]
    }
  } catch (error) {
    console.error('Failed to load registrations from storage:', error)
  }
  return []
}

// Get a single registration by ID
export function getStoredRegistration(registrationId: string): StoredRegistration | null {
  const registrations = getStoredRegistrations()
  return registrations.find(r => r.id === registrationId) ?? null
}

// Save a new registration
export function saveNewRegistration(
  eventData: {
    eventId: string
    eventName: string
    organizer: string
    organizerGradient?: string
    eventDate: string
    location: string
    registrationDeadline?: string
  },
  teams: RegisteredTeamCardData[],
  invoiceData: {
    subtotal: number
    tax: number
    total: number
  }
): StoredRegistration | null {
  try {
    const registrationId = generateRegistrationId()
    const invoiceNumber = generateInvoiceNumber(registrationId)
    const now = new Date().toISOString()
    
    // Calculate payment deadline (14 days before event, or 7 days from now, whichever is later)
    const eventDate = new Date(eventData.eventDate)
    const twoWeeksBefore = new Date(eventDate.getTime() - 14 * 24 * 60 * 60 * 1000)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const paymentDeadline = new Date(Math.max(twoWeeksBefore.getTime(), sevenDaysFromNow.getTime()))
    
    const newRegistration: StoredRegistration = {
      id: registrationId,
      eventId: eventData.eventId,
      eventName: eventData.eventName,
      organizer: eventData.organizer,
      organizerGradient: eventData.organizerGradient,
      eventDate: eventData.eventDate,
      location: eventData.location,
      registrationDeadline: eventData.registrationDeadline,
      paymentDeadline: paymentDeadline.toISOString(),
      teams: teams.map(t => ({
        id: t.id,
        teamId: t.detailId,
        name: t.name,
        division: t.division,
        members: t.members ?? [],
      })),
      invoiceNumber,
      invoiceDate: now,
      subtotal: invoiceData.subtotal,
      tax: invoiceData.tax,
      total: invoiceData.total,
      status: 'pending',
      createdAt: now,
    }
    
    const existing = getStoredRegistrations()
    const updated = [...existing, newRegistration]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    
    return newRegistration
  } catch (error) {
    console.error('Failed to save registration to storage:', error)
    return null
  }
}

// Update an existing registration
export function updateStoredRegistration(
  registrationId: string,
  updates: Partial<Pick<StoredRegistration, 'status' | 'paidAt' | 'teams' | 'subtotal' | 'tax' | 'total'>>
): StoredRegistration | null {
  try {
    const existing = getStoredRegistrations()
    const existingReg = existing.find(r => r.id === registrationId)
    
    if (!existingReg) return null
    
    const updated: StoredRegistration = {
      id: existingReg.id,
      eventId: existingReg.eventId,
      eventName: existingReg.eventName,
      organizer: existingReg.organizer,
      organizerGradient: existingReg.organizerGradient,
      eventDate: existingReg.eventDate,
      location: existingReg.location,
      registrationDeadline: existingReg.registrationDeadline,
      paymentDeadline: existingReg.paymentDeadline,
      teams: updates.teams ?? existingReg.teams,
      invoiceNumber: existingReg.invoiceNumber,
      invoiceDate: existingReg.invoiceDate,
      subtotal: updates.subtotal ?? existingReg.subtotal,
      tax: updates.tax ?? existingReg.tax,
      total: updates.total ?? existingReg.total,
      status: updates.status ?? existingReg.status,
      paidAt: updates.paidAt ?? existingReg.paidAt,
      createdAt: existingReg.createdAt,
      updatedAt: new Date().toISOString(),
    }
    
    const updatedList = existing.map(r => r.id === registrationId ? updated : r)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
    
    return updated
  } catch (error) {
    console.error('Failed to update registration in storage:', error)
    return null
  }
}

// Delete a registration
export function deleteStoredRegistration(registrationId: string): boolean {
  try {
    const existing = getStoredRegistrations()
    const filtered = existing.filter(r => r.id !== registrationId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Failed to delete registration from storage:', error)
    return false
  }
}

// React hook for managing registrations
export function useNewRegistrationStorage() {
  const [registrations, setRegistrations] = useState<StoredRegistration[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load registrations on mount
  useEffect(() => {
    setRegistrations(getStoredRegistrations())
    setIsLoaded(true)
  }, [])

  const saveRegistration = useCallback((
    eventData: Parameters<typeof saveNewRegistration>[0],
    teams: Parameters<typeof saveNewRegistration>[1],
    invoiceData: Parameters<typeof saveNewRegistration>[2]
  ) => {
    const saved = saveNewRegistration(eventData, teams, invoiceData)
    if (saved) {
      setRegistrations(prev => [...prev, saved])
    }
    return saved
  }, [])

  const updateRegistration = useCallback((
    registrationId: string,
    updates: Parameters<typeof updateStoredRegistration>[1]
  ) => {
    const updated = updateStoredRegistration(registrationId, updates)
    if (updated) {
      setRegistrations(prev => prev.map(r => r.id === registrationId ? updated : r))
    }
    return updated
  }, [])

  const deleteRegistration = useCallback((registrationId: string) => {
    const success = deleteStoredRegistration(registrationId)
    if (success) {
      setRegistrations(prev => prev.filter(r => r.id !== registrationId))
    }
    return success
  }, [])

  const getRegistration = useCallback((registrationId: string) => {
    return registrations.find(r => r.id === registrationId) ?? null
  }, [registrations])

  // Get registrations for a specific event
  const getRegistrationsForEvent = useCallback((eventId: string) => {
    return registrations.filter(r => r.eventId === eventId)
  }, [registrations])

  return {
    isLoaded,
    registrations,
    saveRegistration,
    updateRegistration,
    deleteRegistration,
    getRegistration,
    getRegistrationsForEvent,
  }
}

