'use client'

/**
 * NavBar
 *
 * Purpose
 * - Global navigation with brand, search, and key links.
 * - Adapts links based on authentication role (public, club owner, organizer).
 *
 * Structure
 * - Sticky header with brand and search
 * - Inline nav links
 * - Auth dropdown for signed-in users; Get Started CTA for guests
 */
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

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

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { AuthSignUp } from '@/components/features/auth/AuthSignUp'
import { AuthDialog } from '@/components/features/auth/AuthDialog'
import { useAuth } from '@/components/providers/AuthProvider'
import { eventCategories } from '@/data/events/categories'
import { SearchIcon } from 'lucide-react'

type SearchItem = {
  label: string
  href: string
  meta?: string
}

type NavBarProps = {
  mode?: 'default' | 'clubs'
  variant?: 'default' | 'organizer'
  showNavLinks?: boolean
}

export function NavBar({ mode, variant, showNavLinks }: NavBarProps) {
  void mode
  void variant
  void showNavLinks
  const router = useRouter()
  const { user, signOut, signInAsRole } = useAuth()
  const role = user?.role ?? null
  const [isDark, setIsDark] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  // Build event-only search list
  const eventSearchItems: SearchItem[] = useMemo(() => {
    return eventCategories.flatMap(category =>
      category.events.map(event => ({
        label: event.name,
        href: `/events/${encodeURIComponent(event.id)}`,
        meta: `${event.location} · ${event.date}`,
      }))
    )
  }, [])

  // Debounce search term to avoid instant queries
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 220)
    return () => clearTimeout(handle)
  }, [searchTerm])

  const filteredHits = useMemo(() => {
    const term = debouncedTerm.toLowerCase()
    if (!term) return []
    const list = eventSearchItems.filter(
      item =>
        item.label.toLowerCase().includes(term) ||
        (item.meta ? item.meta.toLowerCase().includes(term) : false)
    )
    return list.slice(0, 5)
  }, [debouncedTerm, eventSearchItems])

  // Initialize theme state from localStorage
  useEffect(() => {
    try {
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

  return (
    <>
      {/* Simple sticky header with full-width background and bottom border */}
      <AuthSignUp>
        {({ openStart }) => (
          <header className="sticky top-0 z-30 w-full border-b border-border bg-background">
            <div className="mx-auto flex w-full items-center gap-4 px-6 py-4">
              <Link href="/" className="flex items-center gap-2">
                <span
                  className="heading-3 bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(160deg, #8E69D0 0%, #576AE6 50.22%, #3B9BDF 100%)",
                  }}
                >
                  cheerbase
                </span>
              </Link>

              <div className="flex flex-1 items-center justify-center">
                <div className="relative mx-auto w-full max-w-xl">
                  <Input
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value)
                      if (e.target.value.trim().length > 0) setSearchOpen(true)
                    }}
                    onFocus={() => {
                      if (searchTerm.trim().length > 0) setSearchOpen(true)
                    }}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
                    placeholder="Search teams, events, or divisions"
                    className="w-full rounded-full border border-border/60 bg-card/80 pl-10 pr-4 text-sm shadow-sm backdrop-blur-sm focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                  {searchOpen && debouncedTerm && (
                    <div
                      className="absolute left-0 right-0 top-12 z-20 overflow-hidden rounded-xl border border-border/70 bg-card/90 shadow-xl backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in-0"
                      data-state={searchOpen ? 'open' : 'closed'}
                    >
                      <ul className="divide-y divide-border/70">
                        {filteredHits.length > 0 ? (
                          filteredHits.map((item, idx) => (
                            <li
                              key={`${item.href}-${idx}`}
                              className="dropdown-fade-in hover:bg-accent/40 focus-within:bg-accent/40 transition"
                              style={{ animationDelay: `${idx * 60}ms` }}
                            >
                              <button
                                type="button"
                                className="flex w-full items-center justify-between px-4 py-3 text-left"
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => {
                                  setSearchOpen(false)
                                  setSearchTerm('')
                                  router.push(item.href)
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                                  {item.meta && <span className="text-xs text-muted-foreground">{item.meta}</span>}
                                </div>
                                <span className="text-xs text-muted-foreground">Enter</span>
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-3 text-sm text-muted-foreground">No results yet</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-2 flex items-center justify-end">
                {role ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">
                        <Avatar className="h-11 w-11 bg-primary">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium uppercase">
                            {user?.name?.slice(0, 2).toUpperCase() || (role === 'club_owner' ? 'CO' : 'OR')}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="min-w-52 border border-border/70 bg-card/90 shadow-xl backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in-0"
                    >
                      <DropdownMenuLabel className="space-y-1">
                        <span className="block text-xs uppercase tracking-[0.08em] text-muted-foreground">Signed in as</span>
                        <span className="text-sm font-semibold">{user?.name ?? 'User'}</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {[
                        { label: 'Toggle theme', onClick: toggleTheme, detail: isDark ? 'Dark' : 'Light' },
                        ...(role === 'club_owner'
                          ? [
                              { label: 'My Club', onClick: () => router.push('/clubs') },
                              { label: 'Registrations', onClick: () => router.push('/clubs/registrations') },
                            ]
                          : [
                              { label: 'Organizer Home', onClick: () => router.push('/organizer') },
                              { label: 'Events', onClick: () => router.push('/organizer/events') },
                            ]),
                        { label: 'Sign out', onClick: () => { signOut(); router.push('/'); } },
                      ].map((item, idx) => (
                        <DropdownMenuItem
                          key={item.label}
                          onClick={item.onClick}
                          className="dropdown-fade-in flex items-center justify-between"
                          style={{ animationDelay: `${idx * 60}ms` }}
                        >
                          <span>{item.label}</span>
                          {item.detail ? <span className="text-xs text-muted-foreground">{item.detail}</span> : null}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="px-4" onClick={() => openStart('choose')}>
                      Get Started
                    </Button>
                    <Button variant="default" size="sm" className="px-4" onClick={() => setLoginOpen(true)}>
                      Log in
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}
      </AuthSignUp>

      <AuthDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onDemoLogin={nextRole => {
          const demoId = nextRole === 'club_owner' ? 'club-owner-1' : 'organizer-demo-1'
          signInAsRole(nextRole, nextRole === 'club_owner' ? 'Demo Club Owner' : 'Demo Organizer', `${nextRole}@demo.test`, {
            demoId,
            isDemo: true,
          })
          setLoginOpen(false)
          if (nextRole === 'organizer') router.push('/organizer')
          else router.push('/clubs')
        }}
      />
    </>
  )
}
