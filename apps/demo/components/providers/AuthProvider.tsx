'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

type UserRole = 'club_owner' | 'organizer'
type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  onboarded?: boolean
  isDemo?: boolean
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type SignUpInput = {
  name: string
  email: string
  role: UserRole
  clubName?: string
  orgName?: string
}

type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  signUp: (input: SignUpInput) => Promise<void>
  signInAsRole: (role: UserRole, name?: string, email?: string, options?: { demoId?: string; isDemo?: boolean }) => Promise<void>
  signOut: () => void
  updateUser: (patch: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'cheerbase-demo-auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  // Load existing session from localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser
        setUser(parsed)
        setStatus('authenticated')
        return
      }
    } catch {
      // ignore parse/storage issues
    }
    setStatus('unauthenticated')
  }, [])

  const persistUser = (next: AuthUser | null) => {
    if (typeof window === 'undefined') return
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const signUp = useCallback(async (input: SignUpInput) => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `user-${Date.now()}`
    const nextUser: AuthUser = {
      id,
      name: input.name.trim() || 'Club Owner',
      email: input.email.trim().toLowerCase(),
      role: input.role,
      onboarded: true,
      isDemo: false,
    }
    setUser(nextUser)
    setStatus('authenticated')
    persistUser(nextUser)
  }, [])

  const signInAsRole = useCallback(async (role: UserRole, name?: string, email?: string, options?: { demoId?: string; isDemo?: boolean }) => {
    const id =
      options?.demoId ??
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `user-${Date.now()}`)
    const nextUser: AuthUser = {
      id,
      name: name?.trim() || (role === 'organizer' ? 'Organizer' : 'Club Owner'),
      email: email?.trim().toLowerCase() || `${role}@demo.test`,
      role,
      onboarded: true,
      isDemo: options?.isDemo ?? false,
    }
    setUser(nextUser)
    setStatus('authenticated')
    persistUser(nextUser)
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    setStatus('unauthenticated')
    persistUser(null)
  }, [])

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev
      const merged = { ...prev, ...patch }
      persistUser(merged)
      return merged
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      signUp,
      signInAsRole,
      signOut,
      updateUser,
    }),
    [signInAsRole, signOut, signUp, status, updateUser, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
