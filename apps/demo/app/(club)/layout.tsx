'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ClipboardListIcon, Settings2Icon, UserIcon, UsersIcon } from 'lucide-react'

import { NavBar } from '@/components/layout/NavBar'
import { Sidebar } from '@/components/layout/Sidebar'

const clubNavSections = [
  {
    label: 'Club',
    nickname: 'club-core',
    items: [
      { key: 'teams', label: 'Teams', icon: <UsersIcon className="size-4" />, href: '/clubs', nickname: 'teams-hub' },
      { key: 'athletes', label: 'Athletes', icon: <UserIcon className="size-4" />, disabled: true, badge: 'Coming soon', nickname: 'athletes-roster' },
      {
        key: 'registrations',
        label: 'Registrations',
        icon: <ClipboardListIcon className="size-4" />,
        href: '/clubs/registrations',
        nickname: 'registrations-hub',
      },
    ],
  },
  {
    label: 'Management',
    nickname: 'club-management',
    items: [{ key: 'settings', label: 'Club Settings', icon: <Settings2Icon className="size-4" />, href: '/clubs/settings', nickname: 'club-settings' }],
  },
]

export default function ClubLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const navWrapperRef = useRef<HTMLDivElement | null>(null)
  const [navHeight, setNavHeight] = useState(72)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const active = useMemo(() => {
    if (!pathname) return 'teams'
    if (pathname.includes('/registrations')) return 'registrations'
    if (pathname.includes('/settings')) return 'settings'
    return 'teams'
  }, [pathname])

  useEffect(() => {
    const element = navWrapperRef.current
    if (!element) return

    const updateHeight = () => {
      const next = element.getBoundingClientRect().height
      if (!next) return
      setNavHeight(next)
    }

    updateHeight()

    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      const observer = new window.ResizeObserver(entries => {
        const entry = entries[0]
        if (!entry) return
        const next = entry.contentRect.height
        if (next) {
          setNavHeight(next)
        }
      })
      observer.observe(element)
      return () => observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const syncFromQuery = (target: Pick<MediaQueryList, 'matches'>) => {
      setIsMobile(target.matches)
      setIsSidebarOpen(target.matches ? false : true)
    }

    syncFromQuery(mediaQuery)
    const handler = (event: MediaQueryListEvent) => syncFromQuery(event)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }

    mediaQuery.addListener(handler)
    return () => mediaQuery.removeListener(handler)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div ref={navWrapperRef} className="fixed inset-x-0 top-0 z-40">
      <NavBar
        mode="clubs"
        showSidebarToggle={isMobile}
        sidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen(prev => !prev)}
      />
    </div>
    <Sidebar active={active} navSections={clubNavSections} navOffset={navHeight} isOpen={isSidebarOpen} isMobile={isMobile} onClose={() => setIsSidebarOpen(false)}>
      {children}
    </Sidebar>
  </div>
)
}
