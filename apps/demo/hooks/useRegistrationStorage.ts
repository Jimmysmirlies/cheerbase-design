'use client'

import { useCallback, useEffect, useState } from 'react'
import type { TeamMember, TeamData } from '@/components/features/clubs/TeamCard'

// Registration-specific team data (TeamData with required detailId)
type RegisteredTeamData = TeamData & { detailId: string }

export type StoredInvoiceInfo = {
  invoiceNumber: string
  invoiceDate: string
  total: number
  status?: 'paid' | 'unpaid' | 'void'
  // Snapshot of changes at the time this invoice was created
  addedTeams?: RegisteredTeamData[]
  removedTeamIds?: string[]
  modifiedRosters?: Record<string, TeamMember[]>
}

export type StoredRegistrationChanges = {
  addedTeams: RegisteredTeamData[]
  removedTeamIds: string[]
  modifiedRosters: Record<string, TeamMember[]>
  submittedAt?: string
  // Invoice tracking - current invoice
  newInvoice?: StoredInvoiceInfo
  // Original invoice (first invoice before any changes)
  originalInvoice?: StoredInvoiceInfo
  // History of all past invoices (in order from oldest to newest)
  pastInvoices?: StoredInvoiceInfo[]
}

const STORAGE_KEY_PREFIX = 'registration-edit-'

function getStorageKey(registrationId: string): string {
  return `${STORAGE_KEY_PREFIX}${registrationId}`
}

export function useRegistrationStorage(registrationId: string) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [savedChanges, setSavedChanges] = useState<StoredRegistrationChanges | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const key = getStorageKey(registrationId)
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored) as StoredRegistrationChanges
        setSavedChanges(parsed)
      }
    } catch (error) {
      console.error('Failed to load registration changes from storage:', error)
    }
    setIsLoaded(true)
  }, [registrationId])

  // Save changes to localStorage
  const saveChanges = useCallback((changes: Omit<StoredRegistrationChanges, 'submittedAt' | 'pastInvoices'>) => {
    const key = getStorageKey(registrationId)
    
    // Build the past invoices array
    let pastInvoices: StoredInvoiceInfo[] = []
    
    if (savedChanges) {
      // Keep existing past invoices
      pastInvoices = savedChanges.pastInvoices ? [...savedChanges.pastInvoices] : []
      
      // If there was a previous newInvoice, move it to pastInvoices
      if (savedChanges.newInvoice) {
        // Store the snapshot of changes with this invoice
        const previousInvoiceWithChanges: StoredInvoiceInfo = {
          ...savedChanges.newInvoice,
          status: changes.originalInvoice ? 'void' : 'unpaid', // Mark as void since superseded
          addedTeams: savedChanges.addedTeams,
          removedTeamIds: savedChanges.removedTeamIds,
          modifiedRosters: savedChanges.modifiedRosters,
        }
        pastInvoices.push(previousInvoiceWithChanges)
      }
    }
    
    const dataToStore: StoredRegistrationChanges = {
      ...changes,
      pastInvoices,
      submittedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem(key, JSON.stringify(dataToStore))
      setSavedChanges(dataToStore)
      return true
    } catch (error) {
      console.error('Failed to save registration changes to storage:', error)
      return false
    }
  }, [registrationId, savedChanges])

  // Clear changes from localStorage
  const clearChanges = useCallback(() => {
    const key = getStorageKey(registrationId)
    try {
      localStorage.removeItem(key)
      setSavedChanges(null)
      return true
    } catch (error) {
      console.error('Failed to clear registration changes from storage:', error)
      return false
    }
  }, [registrationId])

  // Check if there are saved changes
  const hasStoredChanges = savedChanges !== null && (
    savedChanges.addedTeams.length > 0 ||
    savedChanges.removedTeamIds.length > 0 ||
    Object.keys(savedChanges.modifiedRosters).length > 0
  )

  return {
    isLoaded,
    savedChanges,
    hasStoredChanges,
    saveChanges,
    clearChanges,
  }
}

// Utility to convert Map to Record for storage
export function mapToRecord<K extends string, V>(map: Map<K, V>): Record<K, V> {
  const record = {} as Record<K, V>
  map.forEach((value, key) => {
    record[key] = value
  })
  return record
}

// Utility to convert Record to Map from storage
export function recordToMap<K extends string, V>(record: Record<K, V>): Map<K, V> {
  return new Map(Object.entries(record)) as Map<K, V>
}

