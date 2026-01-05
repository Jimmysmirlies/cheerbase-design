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
import { useEffect, useMemo, useRef, useState } from 'react'

import { motion, AnimatePresence } from 'framer-motion'

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
import { Switch } from '@workspace/ui/shadcn/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/shadcn/tooltip'
import { cn } from '@workspace/ui/lib/utils'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { AuthSignUp } from '@/components/features/auth/AuthSignUp'
import { AuthDialog } from '@/components/features/auth/AuthDialog'
import { useAuth } from '@/components/providers/AuthProvider'
import { useOrganizer } from '@/hooks/useOrganizer'
import { GradientAvatar } from '@/components/ui/avatars/GradientAvatar'
import { eventCategories } from '@/data/events/categories'
import { brandGradients, type BrandGradient } from '@/lib/gradients'
import { 
  SearchIcon, 
  XIcon, 
  SunIcon, 
  MoonIcon, 
  UsersIcon, 
  ClipboardListIcon, 
  LogOutIcon, 
  LayoutDashboardIcon, 
  CalendarIcon,
  PaletteIcon
} from 'lucide-react'

type SearchItem = {
  label: string
  href: string
  meta?: string
  searchText?: string
}

type NavBarProps = {
  mode?: 'default' | 'clubs'
  variant?: 'default' | 'organizer'
  showNavLinks?: boolean
  showSidebarToggle?: boolean
  sidebarOpen?: boolean
  onSidebarToggle?: () => void
}

export function NavBar({ mode, variant, showNavLinks, showSidebarToggle, sidebarOpen = false, onSidebarToggle }: NavBarProps) {
  void mode
  void variant
  void showNavLinks
  const router = useRouter()
  const { user, signOut, signInAsRole } = useAuth()
  const { organizer } = useOrganizer()
  const role = user?.role ?? null
  const [isDark, setIsDark] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false)
  const [organizerGradient, setOrganizerGradient] = useState<string | undefined>(undefined)
  const [clubGradient, setClubGradient] = useState<string | undefined>(undefined)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load organizer settings if applicable
  useEffect(() => {
    const loadGradient = () => {
      if (role === 'organizer' && user?.organizerId) {
        try {
          const stored = localStorage.getItem(`cheerbase-organizer-settings-${user.organizerId}`)
          if (stored) {
            const settings = JSON.parse(stored)
            if (settings.gradient) {
              setOrganizerGradient(settings.gradient)
              return
            }
          }
        } catch {
          // Ignore storage errors
        }
      }
      setOrganizerGradient(undefined)
    }

    loadGradient()

    // Listen for settings changes from other components
    const handleSettingsChange = (event: CustomEvent<{ gradient: string }>) => {
      if (event.detail?.gradient) {
        setOrganizerGradient(event.detail.gradient)
      }
    }

    window.addEventListener('organizer-settings-changed', handleSettingsChange as EventListener)
    return () => {
      window.removeEventListener('organizer-settings-changed', handleSettingsChange as EventListener)
    }
  }, [role, user?.organizerId])

  // Load club settings if applicable
  useEffect(() => {
    const loadGradient = () => {
      if (role === 'club_owner' && user?.id) {
        try {
          const stored = localStorage.getItem(`cheerbase-club-settings-${user.id}`)
          if (stored) {
            const settings = JSON.parse(stored)
            if (settings.gradient) {
              setClubGradient(settings.gradient)
              return
            }
          }
        } catch {
          // Ignore storage errors
        }
      }
      setClubGradient(undefined)
    }

    loadGradient()

    // Listen for settings changes from other components
    const handleClubSettingsChange = (event: CustomEvent<{ gradient: string }>) => {
      if (event.detail?.gradient) {
        setClubGradient(event.detail.gradient)
      }
    }

    window.addEventListener('club-settings-changed', handleClubSettingsChange as EventListener)
    return () => {
      window.removeEventListener('club-settings-changed', handleClubSettingsChange as EventListener)
    }
  }, [role, user?.id])

  // Build event-only search list
  const eventSearchItems: SearchItem[] = useMemo(() => {
    return eventCategories.flatMap(category =>
      category.events.map(event => {
        const divisionNames = event.availableDivisions?.map(d => d.name).join(' ') ?? ''
        return {
          label: event.name,
          href: `/events/${encodeURIComponent(event.id)}`,
          meta: `${event.organizer} · ${event.location} · ${event.date}`,
          searchText: `${event.name} ${event.organizer} ${event.location} ${divisionNames}`.toLowerCase(),
        }
      })
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
      item => item.searchText?.includes(term) ?? item.label.toLowerCase().includes(term)
    )
    return list.slice(0, 5)
  }, [debouncedTerm, eventSearchItems])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const query = window.matchMedia('(max-width: 1023px)')
    const sync = (target: Pick<MediaQueryList, 'matches'>) => setIsNarrow(target.matches)
    sync(query)
    const handler = (event: MediaQueryListEvent) => sync(event)
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handler)
      return () => query.removeEventListener('change', handler)
    }
    query.addListener(handler)
    return () => query.removeListener(handler)
  }, [])

  // Auto-focus mobile search input when expanded
  useEffect(() => {
    if (mobileSearchExpanded && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [mobileSearchExpanded])

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

  const menuItems =
    role == null
      ? []
      : [
          ...(role === 'club_owner'
            ? [
                { label: 'Teams', icon: UsersIcon, onClick: () => router.push('/clubs') },
                { label: 'Registrations', icon: ClipboardListIcon, onClick: () => router.push('/clubs/registrations') },
              ]
            : [
                { label: 'Organizer Home', icon: LayoutDashboardIcon, onClick: () => router.push('/organizer') },
                { label: 'Events', icon: CalendarIcon, onClick: () => router.push('/organizer/events') },
              ]),
          { label: 'Sign out', icon: LogOutIcon, onClick: () => { signOut(); router.push('/'); } },
        ]

  return (
    <>
      {/* Simple sticky header with full-width background and bottom border */}
      <AuthSignUp>
        {({ openStart }) => (
          <>
          <header className="sticky top-0 z-30 w-full border-b border-sidebar-border bg-sidebar/80 backdrop-blur-md">
            {/* Main row - always 68px */}
            <div className="mx-auto flex h-[68px] w-full items-center justify-between gap-3 px-6">
              {/* Logo */}
              <div className="flex items-center gap-3">
                {showSidebarToggle && onSidebarToggle ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onSidebarToggle}
                    aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  >
                    <MenuXToggle open={sidebarOpen} />
                  </Button>
                ) : null}
                <Link href="/" className="flex items-center gap-2">
                  <span
                    className="heading-3 bg-clip-text text-transparent"
                    style={{
                      backgroundImage: (() => {
                        // Use role-specific gradient if available
                        if (role === 'organizer' && organizerGradient) {
                          const gradient = brandGradients[organizerGradient as BrandGradient]
                          if (gradient) return gradient.css
                        }
                        if (role === 'organizer' && organizer?.gradient) {
                          const gradient = brandGradients[organizer.gradient as BrandGradient]
                          if (gradient) return gradient.css
                        }
                        if (role === 'club_owner' && clubGradient) {
                          const gradient = brandGradients[clubGradient as BrandGradient]
                          if (gradient) return gradient.css
                        }
                        // Default teal gradient
                        return brandGradients.teal.css
                      })(),
                    }}
                  >
                    cheerbase
                  </span>
                </Link>
              </div>

              {/* Desktop search - hidden on mobile */}
              <div className="hidden flex-1 px-4 lg:block lg:max-w-xl">
                <form
                  className="relative w-full"
                  onSubmit={e => {
                    e.preventDefault()
                    const trimmed = searchTerm.trim()
                    if (trimmed) {
                      setSearchOpen(false)
                      router.push(`/events/search?q=${encodeURIComponent(trimmed)}`)
                    }
                  }}
                >
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
                    placeholder="Search events, divisions, organizers, and locations"
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
                </form>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-2">
                {/* Mobile search toggle */}
                {isNarrow && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileSearchExpanded(!mobileSearchExpanded)}
                    aria-label={mobileSearchExpanded ? "Close search" : "Open search"}
                  >
                    {mobileSearchExpanded ? (
                      <XIcon className="size-5" />
                    ) : (
                      <SearchIcon className="size-5" />
                    )}
                  </Button>
                )}
                
                {/* Style Guide button with tooltip */}
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="mr-2"
                        asChild
                      >
                        <Link href="/style-guide" aria-label="Open the style guide">
                          <PaletteIcon className="size-5" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Style Guide</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {role ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="p-0 hover:opacity-90">
                        <GradientAvatar 
                          name={user?.name || (role === 'club_owner' ? 'Club Owner' : 'Organizer')} 
                          size="sm"
                          gradient={role === 'club_owner' ? clubGradient : (organizerGradient || organizer?.gradient)}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="min-w-[280px] md:min-w-64 border border-border/70 bg-card/90 shadow-xl backdrop-blur-md p-2 data-[state=open]:animate-in data-[state=open]:fade-in-0"
                    >
                      <DropdownMenuLabel className="px-3 py-2 space-y-1">
                        <span className="block label text-muted-foreground">Signed in as</span>
                        <span className="body-text font-semibold">{user?.name ?? 'User'}</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-2" />
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {isDark ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
                          <span className="body-text md:body-small">Theme</span>
                        </div>
                        <Switch checked={isDark} onCheckedChange={toggleTheme} />
                      </div>
                      <DropdownMenuSeparator className="my-2" />
                      {menuItems.map((item, idx) => (
                        <DropdownMenuItem
                          key={item.label}
                          onClick={item.onClick}
                          className="dropdown-fade-in flex items-center gap-3 px-3 py-2.5 body-text md:body-small cursor-pointer"
                          style={{ animationDelay: `${idx * 60}ms` }}
                        >
                          {item.icon && <item.icon className="size-5 md:size-4 text-muted-foreground" />}
                          <span>{item.label}</span>
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

            {/* Mobile search - animated with Framer Motion */}
            <AnimatePresence>
              {mobileSearchExpanded && isNarrow && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-3">
                    <form
                      className="relative w-full"
                      onSubmit={e => {
                        e.preventDefault()
                        const trimmed = searchTerm.trim()
                        if (trimmed) {
                          setSearchOpen(false)
                          setMobileSearchExpanded(false)
                          router.push(`/events/search?q=${encodeURIComponent(trimmed)}`)
                        }
                      }}
                    >
                      <Input
                        ref={searchInputRef}
                        value={searchTerm}
                        onChange={e => {
                          setSearchTerm(e.target.value)
                          if (e.target.value.trim().length > 0) setSearchOpen(true)
                        }}
                        onFocus={() => {
                          if (searchTerm.trim().length > 0) setSearchOpen(true)
                        }}
                        onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
                        placeholder="Search events, divisions, organizers, and locations"
                        className="w-full rounded-full border border-border/60 bg-card/80 pl-10 pr-4 text-sm shadow-sm backdrop-blur-sm focus:border-primary focus:ring-2 focus:ring-primary/30"
                      />
                      <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                      {searchOpen && debouncedTerm && (
                        <div
                          className="absolute left-0 right-0 top-12 z-20 overflow-hidden rounded-xl border border-border/70 bg-card/90 shadow-xl backdrop-blur-md"
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
                                      setMobileSearchExpanded(false)
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
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <AuthDialog
            open={loginOpen}
            onOpenChange={setLoginOpen}
            onDemoLogin={nextRole => {
              if (nextRole === 'organizer') {
                // Demo organizer login as Sapphire Productions
                signInAsRole(nextRole, 'Sapphire Productions', 'contact@sapphireproductions.ca', {
                  demoId: 'sapphire-productions',
                  isDemo: true,
                  organizerId: 'sapphire-productions',
                })
                setLoginOpen(false)
                router.push('/organizer')
              } else {
                signInAsRole(nextRole, 'Demo Club Owner', 'club_owner@demo.test', {
                  demoId: 'club-owner-1',
                  isDemo: true,
                })
                setLoginOpen(false)
                router.push('/clubs')
              }
            }}
            onJoinClick={() => openStart('choose')}
          />
          </>
        )}
      </AuthSignUp>

      {/* AvatarSheet removed for now - keeping component code below in case needed later */}
    </>
  )
}

function MenuXToggle({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-5">
      <span
        className={`absolute left-0 block h-0.5 w-full rounded-sm bg-current transition-all duration-300 ${
          open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
        }`}
      />
      <span
        className={`absolute left-0 block h-0.5 w-full rounded-sm bg-current transition-all duration-300 ${
          open ? 'top-1/2 opacity-0' : 'top-1/2 -translate-y-1/2'
        }`}
      />
      <span
        className={`absolute left-0 block h-0.5 w-full rounded-sm bg-current transition-all duration-300 ${
          open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0'
        }`}
      />
    </span>
  )
}

type SheetItem = {
  label: string
  detail?: string
  onClick: () => void
}

// AvatarSheet kept for future use; currently unused
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AvatarSheet({ 
  open, 
  onClose, 
  items, 
  userName, 
  isDark, 
  onToggleTheme 
}: { 
  open: boolean
  onClose: () => void
  items: SheetItem[]
  userName: string
  isDark: boolean
  onToggleTheme: () => void
}) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed inset-0 z-50 bg-background/95 backdrop-blur-xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 pt-5">
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
              onClick={onClose}
              aria-label="Close account menu"
            >
              <XIcon className="size-5" />
              Close
            </button>
            <span className="text-sm font-semibold text-muted-foreground">Signed in as {userName}</span>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            {items.map((item, idx) => (
              <button
                key={item.label}
                type="button"
                className="dropdown-fade-in text-2xl font-semibold text-foreground transition hover:text-primary"
                style={{ animationDelay: `${idx * 80}ms` }}
                onClick={() => {
                  onClose()
                  item.onClick()
                }}
              >
                {item.label}
                {item.detail ? <span className="ml-2 text-base text-muted-foreground">({item.detail})</span> : null}
              </button>
            ))}

            <div className="dropdown-fade-in mt-4 flex items-center justify-center gap-3 rounded-full border border-border/40 bg-card/40 px-5 py-3 backdrop-blur-sm" style={{ animationDelay: `${items.length * 80}ms` }}>
              <div className="flex items-center gap-2">
                {isDark ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
                <span className="text-base font-medium">Theme</span>
              </div>
              <Switch checked={isDark} onCheckedChange={onToggleTheme} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
