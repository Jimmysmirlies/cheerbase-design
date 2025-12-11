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
import { Switch } from '@workspace/ui/shadcn/switch'
import { cn } from '@workspace/ui/lib/utils'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { AuthSignUp } from '@/components/features/auth/AuthSignUp'
import { AuthDialog } from '@/components/features/auth/AuthDialog'
import { useAuth } from '@/components/providers/AuthProvider'
import { eventCategories } from '@/data/events/categories'
import { 
  SearchIcon, 
  XIcon, 
  SunIcon, 
  MoonIcon, 
  BuildingIcon, 
  ClipboardListIcon, 
  LogOutIcon, 
  LayoutDashboardIcon, 
  CalendarIcon 
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
  const role = user?.role ?? null
  const [isDark, setIsDark] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false)

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
    const query = window.matchMedia('(max-width: 767px)')
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

  useEffect(() => {
    if (!isNarrow) setAvatarSheetOpen(false)
  }, [isNarrow])

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
                { label: 'My Club', icon: BuildingIcon, onClick: () => router.push('/clubs') },
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
            <div className="mx-auto grid w-full grid-cols-[auto,auto] grid-rows-[auto,auto] items-center gap-x-3 gap-y-3 px-6 py-4 lg:grid-cols-[auto,1fr,auto] lg:grid-rows-1 lg:items-center lg:gap-4">
              <div className="col-start-1 row-start-1 flex items-center gap-3 lg:col-start-1 lg:row-start-1">
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
                      backgroundImage: "linear-gradient(160deg, #8E69D0 0%, #576AE6 50.22%, #3B9BDF 100%)",
                    }}
                  >
                    cheerbase
                  </span>
                </Link>
              </div>

              <div className="col-span-2 row-start-2 w-full lg:col-start-2 lg:row-start-1 lg:col-span-1 lg:mx-auto lg:w-full lg:place-self-center">
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

              <div className="col-start-2 row-start-1 ml-2 flex items-center justify-end justify-self-end lg:col-start-3 lg:row-start-1 lg:ml-4 lg:justify-self-end">
                {role ? (
                  isNarrow ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      onClick={() => setAvatarSheetOpen(true)}
                      aria-label="Open account menu"
                    >
                      <Avatar className="h-11 w-11 bg-primary">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium uppercase">
                          {user?.name?.slice(0, 2).toUpperCase() || (role === 'club_owner' ? 'CO' : 'OR')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  ) : (
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
                        <div className="flex items-center justify-between px-2 py-1.5">
                          <div className="flex items-center gap-2 text-sm">
                            {isDark ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
                            <span>Theme</span>
                          </div>
                          <Switch checked={isDark} onCheckedChange={toggleTheme} />
                        </div>
                        <DropdownMenuSeparator />
                        {menuItems.map((item, idx) => (
                          <DropdownMenuItem
                            key={item.label}
                            onClick={item.onClick}
                            className="dropdown-fade-in flex items-center gap-2"
                            style={{ animationDelay: `${idx * 60}ms` }}
                          >
                            {item.icon && <item.icon className="size-4 text-muted-foreground" />}
                            <span>{item.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
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
            onJoinClick={() => openStart('choose')}
          />
          </>
        )}
      </AuthSignUp>

      {isNarrow ? (
        <AvatarSheet
          open={avatarSheetOpen}
          onClose={() => setAvatarSheetOpen(false)}
          items={menuItems}
          userName={user?.name ?? 'User'}
        />
      ) : null}
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

function AvatarSheet({ open, onClose, items, userName }: { open: boolean; onClose: () => void; items: SheetItem[]; userName: string }) {
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
          </div>
        </div>
      </div>
    </>
  )
}
