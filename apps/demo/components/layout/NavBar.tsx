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

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { AuthDialog } from '@/components/features/auth/AuthDialog'
import { HomeIcon, LifeBuoyIcon, SearchIcon, UsersIcon, ClipboardListIcon } from 'lucide-react'

type NavBarProps = {
  mode?: 'default' | 'clubs'
}

export function NavBar({ mode = 'default' }: NavBarProps) {
  const router = useRouter()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [role, setRole] = useState<null | 'club_owner' | 'organizer'>(null)
  const [isDark, setIsDark] = useState(false)

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

  const navLinks =
    mode === 'clubs'
      ? [
          { href: '/', label: 'Events', icon: <HomeIcon className="size-5" /> },
          { href: '/events/search', label: 'Search', icon: <SearchIcon className="size-5" /> },
          ...(role === 'club_owner'
            ? [{ href: '/clubs', label: 'My Club', icon: <UsersIcon className="size-5" /> }]
            : role === 'organizer'
              ? [{ href: '/events', label: 'My Events', icon: <ClipboardListIcon className="size-5" /> }]
              : []),
          { href: '/support', label: 'Support', icon: <LifeBuoyIcon className="size-5" /> },
        ]
      : [
          { href: '/', label: 'Events', icon: <HomeIcon className="size-5" /> },
          { href: '/events/search', label: 'Search', icon: <SearchIcon className="size-5" /> },
          ...(role === 'club_owner'
            ? [{ href: '/clubs', label: 'My Club', icon: <UsersIcon className="size-5" /> }]
            : role === 'organizer'
              ? [{ href: '/events', label: 'My Events', icon: <ClipboardListIcon className="size-5" /> }]
              : []),
          { href: '/support', label: 'Support', icon: <LifeBuoyIcon className="size-5" /> },
        ]

  return (
    <>
      {/* Simple sticky header with full-width background and bottom border */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background">
        <div className="relative mx-auto flex w-full max-w-8xl items-center gap-6 px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-primary heading-3">cheerbase</span>
          </Link>

          <nav className="text-muted-foreground pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-3 text-sm font-medium sm:gap-4">
            {navLinks.map(link => (
              <Button
                key={link.href}
                asChild
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-center text-sm font-semibold hover:bg-muted/70"
              >
                <Link href={link.href} className="flex items-center gap-2">
                  <span className="text-foreground/80 flex items-center justify-center">{link.icon}</span>
                  <span className="text-foreground/90">{link.label}</span>
                </Link>
              </Button>
            ))}
          </nav>

          <div className="ml-auto flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">
                  <Avatar className="h-11 w-11 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium uppercase">
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
          </div>
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
