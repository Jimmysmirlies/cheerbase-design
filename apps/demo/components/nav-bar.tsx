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

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { AuthDialog } from '@/components/auth-dialog'
import { getGlassCardStyle } from '@/components/ui/glass-card-style'

type NavBarProps = {
  showSearch?: boolean
  mode?: 'default' | 'clubs'
}

export function NavBar({ showSearch = true, mode = 'default' }: NavBarProps) {
  const router = useRouter()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [role, setRole] = useState<null | 'club_owner' | 'organizer'>(null)

  // Initialize demo auth state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('demoRole')
      if (stored === 'club_owner' || stored === 'organizer') {
        setRole(stored)
      }
    } catch {
      // localStorage is not available (e.g., SSR or privacy mode)
    }
  }, [])

  return (
    <>
      {/* Sticky header: brand, search, and primary nav links */}
      <header className="sticky top-0 z-30 border-b border-transparent">
        <div
          className="flex w-full items-center gap-4 px-4 py-4 sm:px-6"
          style={{
            ...getGlassCardStyle({ showShadow: false }),
            borderRadius: 0,
            borderColor: 'var(--glass-border)',
            borderWidth: '0 0 1px 0',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
              R
            </span>
            <span className="text-primary text-xl font-semibold tracking-normal">cheerbase</span>
          </div>
          {/* Search (optional) */}
          <div className="flex flex-1 justify-center">
            {showSearch ? (
              <Input
                className="w-full max-w-xl rounded-full px-5 py-3"
                placeholder="Search events or organizers"
                type="search"
              />
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
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-muted-foreground text-xs font-medium uppercase">
                          {role === 'club_owner' ? 'CO' : 'OR'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-52">
                    <DropdownMenuLabel>
                      Signed in as {role === 'club_owner' ? 'Club Owner' : 'Event Organizer'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
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
                <Link className="hover:text-foreground" href="/events">
                  Registered Events
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-muted-foreground text-xs font-medium uppercase">
                          {role === 'club_owner' ? 'CO' : 'OR'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-52">
                    <DropdownMenuLabel>
                      Signed in as {role === 'club_owner' ? 'Club Owner' : 'Event Organizer'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
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
