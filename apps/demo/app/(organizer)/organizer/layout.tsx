'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3Icon, ClipboardListIcon, HomeIcon, LayoutGridIcon, SettingsIcon } from 'lucide-react'

import { Sidebar } from '@/components/layout/Sidebar'
import { NavBar } from '@/components/layout/NavBar'
import { useAuth } from '@/components/providers/AuthProvider'

const organizerNavSections = [
  {
    label: 'Organizer',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="size-4" />, href: '/organizer' },
      { key: 'events', label: 'Events', icon: <LayoutGridIcon className="size-4" />, href: '/organizer/events' },
      { key: 'registrations', label: 'Registrations', icon: <ClipboardListIcon className="size-4" />, href: '/organizer/registrations' },
      { key: 'analytics', label: 'Analytics', icon: <BarChart3Icon className="size-4" />, href: '/organizer/analytics' },
      { key: 'settings', label: 'Settings', icon: <SettingsIcon className="size-4" />, href: '/organizer/settings' },
    ],
  },
]

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const navWrapperRef = useRef<HTMLDivElement | null>(null)
  const [navHeight, setNavHeight] = useState(72)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user, status } = useAuth()

  const active = useMemo(() => {
    if (!pathname) return 'dashboard'
    if (pathname.includes('/events')) return 'events'
    if (pathname.includes('/registrations')) return 'registrations'
    if (pathname.includes('/analytics')) return 'analytics'
    if (pathname.includes('/settings')) return 'settings'
    return 'dashboard'
  }, [pathname])

  useEffect(() => {
    if (status === 'loading') return
    if (!user || user.role !== 'organizer') {
      router.replace('/')
    }
  }, [user, status, router])

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
          variant="organizer"
          showSidebarToggle={isMobile}
          sidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen(prev => !prev)}
        />
      </div>
      <Sidebar active={active} navSections={organizerNavSections} navOffset={navHeight} isOpen={isSidebarOpen} isMobile={isMobile} onClose={() => setIsSidebarOpen(false)}>
        {status === 'loading' ? null : children}
      </Sidebar>
    </div>
  )
}
