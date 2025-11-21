'use client'

/**
 * NavBar
 *
 * Purpose
 * - Global navigation with brand, search, and key links.
 * - Delegates authentication UI to AuthDialog for separation of concerns.
 *
 * Structure
 * - Sticky header with brand and search
 * - Inline nav links
 * - Auth dialog trigger (opens AuthDialog)
 */
import { useEffect, useState } from 'react'

import { Avatar, AvatarFallback } from '@workspace/ui/shadcn/avatar'
import { Button } from '@workspace/ui/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/shadcn/dropdown-menu'
import { Input } from '@workspace/ui/shadcn/input'
import { cn } from '@workspace/ui/lib/utils'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { AuthDialog } from '@/components/features/auth/AuthDialog'
import { listEvents } from '@/data/events'
import { getGlassCardStyle } from '@/components/ui/glass/glass-card-style'
import { useScrollPosition } from '@/hooks/useScrollPosition'

type NavBarProps = {
  showSearch?: boolean
  mode?: 'default' | 'clubs'
}

export function NavBar({ showSearch = true, mode = 'default' }: NavBarProps) {
  const router = useRouter()
  const events = listEvents()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof events>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [role, setRole] = useState<null | 'club_owner' | 'organizer'>(null)
  const [isDark, setIsDark] = useState(false)
  const isScrolled = useScrollPosition(50)

  // Initialize demo auth state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('demoRole')
      if (stored === 'club_owner' || stored === 'organizer') {
        setRole(stored)
      }
      const storedTheme = localStorage.getItem('demo-theme')
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark')
        setIsDark(true)
      }
    } catch {
      // localStorage is not available (e.g., SSR or privacy mode)
    }
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('demo-theme', next ? 'dark' : 'light')
    } catch {
      // ignore storage errors
    }
  }

  // Debounced search across name, organizer, and location.
  useEffect(() => {
    const handle = setTimeout(() => {
      const term = query.trim().toLowerCase()
      if (!term) {
        setResults([])
        setShowDropdown(false)
        return
      }
      const filtered = events.filter(event => {
        const haystack = `${event.name} ${event.organizer} ${event.location}`.toLowerCase()
        return haystack.includes(term)
      })
      setResults(filtered.slice(0, 5))
      setShowDropdown(true)
    }, 220)
    return () => clearTimeout(handle)
  }, [events, query])

  const handleSubmitSearch = () => {
    const term = query.trim()
    if (!term) return
    setShowDropdown(false)
    router.push(`/events/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <>
      {/* Sticky header: brand, search, and primary nav links */}
      <header
        className={cn(
          'sticky top-0 z-30 px-4 transition-all duration-[700ms] ease-out sm:px-6',
          isScrolled && 'pt-4'
        )}
      >
        <div
          className={cn(
            'mx-auto flex w-full items-center gap-4 px-4 py-4 transition-all duration-[700ms] ease-out sm:px-6',
            isScrolled && 'max-w-8xl rounded-2xl shadow-lg'
          )}
          style={
            isScrolled
              ? {
                  ...getGlassCardStyle({ showShadow: false }),
                  background:
                    'linear-gradient(180deg, rgba(167, 139, 250, 0.18) 0%, rgba(167, 139, 250, 0.08) 60%, rgba(167, 139, 250, 0.02) 100%)',
                  backdropFilter: 'blur(12px)',
                }
              : undefined
          }
        >
          <Link href="/" className="flex items-center gap-2">
            <span className="text-primary heading-3">cheerbase</span>
          </Link>
          {/* Search (optional) */}
          <div className="relative flex flex-1 justify-center">
            {showSearch ? (
              <>
                <Input
                  className="w-full max-w-xl"
                  placeholder="Search events, organizers, or locations"
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => query.trim() && results.length && setShowDropdown(true)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSubmitSearch()
                    }
                  }}
                />
                {showDropdown && results.length ? (
                  <div className="bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-border absolute left-1/2 top-[110%] z-20 w-full max-w-xl -translate-x-1/2 rounded-xl border shadow-lg">
                    <ul className="divide-border/80 divide-y">
                      {results.map(result => (
                        <li key={result.id}>
                          <button
                            type="button"
                            className="hover:bg-muted/70 w-full px-4 py-3 text-left transition"
                            onClick={() => {
                              setQuery(result.name)
                              setShowDropdown(false)
                              router.push(`/events/search?q=${encodeURIComponent(result.name)}`)
                            }}
                          >
                            <p className="text-sm font-semibold text-foreground">{result.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {result.organizer} · {result.location}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
          {/* Primary nav links + auth: Logged-out shows Browse/Organizers + Auth; Logged-in shows My Club/Registered + Avatar */}
          <nav className="text-muted-foreground ml-auto flex items-center gap-4 text-sm font-medium">
            {mode === 'clubs' ? (
              <>
                <Link className="hover:text-foreground" href="/#categories">
                  Explore Events
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">
                      <Avatar className="h-9 w-9 bg-primary">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium uppercase">
                          {role === 'club_owner' ? 'CO' : 'OR'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-52">
                      <DropdownMenuLabel>
                        Signed in as {role === 'club_owner' ? 'Club Owner' : 'Event Organizer'}
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={toggleTheme} className="flex items-center justify-between">
                        Toggle theme
                        <span className="text-muted-foreground text-xs">{isDark ? 'Dark' : 'Light'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/clubs')}>
                        My Club
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/events')}>
                      Registered Events
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        try {
                          localStorage.removeItem('demoRole')
                        } catch {
                          // Ignore storage access errors
                        }
                        setRole(null)
                        router.push('/')
                      }}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : role == null ? (
              <>
                <Link className="hover:text-foreground" href="#categories">
                  Browse
                </Link>
                <Link className="hover:text-foreground" href="#organizers">
                  Organizers
                </Link>
                <Button variant="outline" size="sm" onClick={() => setAuthModalOpen(true)}>
                  Sign up / Log in
                </Button>
              </>
            ) : (
              <>
                <Link className="hover:text-foreground" href="/clubs">
                  My Club
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">
                      <Avatar className="h-9 w-9 bg-primary">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium uppercase">
                          {role === 'club_owner' ? 'CO' : 'OR'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-52">
                      <DropdownMenuLabel>
                        Signed in as {role === 'club_owner' ? 'Club Owner' : 'Event Organizer'}
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={toggleTheme} className="flex items-center justify-between">
                        Toggle theme
                        <span className="text-muted-foreground text-xs">{isDark ? 'Dark' : 'Light'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/clubs')}>
                        My Club
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/events')}>
                      Registered Events
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        try {
                          localStorage.removeItem('demoRole')
                        } catch {
                          // Ignore storage access errors
                        }
                        setRole(null)
                        router.push('/')
                      }}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* AuthDialog is mounted here, controlled by state above */}
      <AuthDialog
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onDemoLogin={nextRole => {
          try {
            localStorage.setItem('demoRole', nextRole)
          } catch {
            // Ignore storage access errors
          }
          setRole(nextRole)
          setAuthModalOpen(false)
          // Stay on the current page for club owners; route organizers to events
          if (nextRole === 'organizer') router.push('/events')
        }}
      />
    </>
  )
}
