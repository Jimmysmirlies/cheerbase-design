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
  password: string
  role: UserRole
  clubName?: string
  orgName?: string
}

type SignInInput = {
  email: string
  password: string
}

type SignInResult = {
  success: boolean
  error?: string
}

type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  signUp: (input: SignUpInput) => Promise<void>
  signIn: (input: SignInInput) => Promise<SignInResult>
  signInAsRole: (role: UserRole, name?: string, email?: string, options?: { demoId?: string; isDemo?: boolean }) => Promise<void>
  signOut: () => void
  updateUser: (patch: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'cheerbase-demo-auth'
const ACCOUNTS_STORAGE_KEY = 'cheerbase-accounts'

// Simple hash function for demo purposes (NOT secure for production)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

// Stored account type (includes password hash)
type StoredAccount = AuthUser & {
  passwordHash: string
  clubName?: string
  createdAt: string
}

// Get all stored accounts
function getStoredAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as StoredAccount[]
    }
  } catch {
    // ignore
  }
  return []
}

// Save accounts to localStorage
function saveStoredAccounts(accounts: StoredAccount[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
}

// Find account by email
function findAccountByEmail(email: string): StoredAccount | undefined {
  const accounts = getStoredAccounts()
  return accounts.find(a => a.email.toLowerCase() === email.toLowerCase())
}

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
    const email = input.email.trim().toLowerCase()
    
    // Check if account already exists
    const existingAccount = findAccountByEmail(email)
    if (existingAccount) {
      throw new Error('An account with this email already exists')
    }
    
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `user-${Date.now()}`
    const nextUser: AuthUser = {
      id,
      name: input.name.trim() || 'Club Owner',
      email,
      role: input.role,
      onboarded: true,
      isDemo: false,
    }
    
    // Store the account with password hash
    const accounts = getStoredAccounts()
    const newAccount: StoredAccount = {
      ...nextUser,
      passwordHash: simpleHash(input.password),
      clubName: input.clubName,
      createdAt: new Date().toISOString(),
    }
    accounts.push(newAccount)
    saveStoredAccounts(accounts)
    
    setUser(nextUser)
    setStatus('authenticated')
    persistUser(nextUser)
  }, [])

  const signIn = useCallback(async (input: SignInInput): Promise<SignInResult> => {
    const email = input.email.trim().toLowerCase()
    const account = findAccountByEmail(email)
    
    if (!account) {
      return { success: false, error: 'No account found with this email' }
    }
    
    const passwordHash = simpleHash(input.password)
    if (account.passwordHash !== passwordHash) {
      return { success: false, error: 'Incorrect password' }
    }
    
    // Restore the user session
    const nextUser: AuthUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      onboarded: account.onboarded,
      isDemo: false,
    }
    
    setUser(nextUser)
    setStatus('authenticated')
    persistUser(nextUser)
    
    return { success: true }
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
      signIn,
      signInAsRole,
      signOut,
      updateUser,
    }),
    [signIn, signInAsRole, signOut, signUp, status, updateUser, user]
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
