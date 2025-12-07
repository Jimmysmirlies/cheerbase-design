'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ClipboardListIcon, LogOutIcon, Settings2Icon, UserIcon, UsersIcon } from 'lucide-react'

import { Button } from '@workspace/ui/shadcn/button'
import { ScrollArea } from '@workspace/ui/shadcn/scroll-area'
import { cn } from '@workspace/ui/lib/utils'

import { useAuth } from '@/components/providers/AuthProvider'

type ClubSidebarProps = {
  active: 'teams' | 'registrations' | 'settings'
  navOffset?: number
  children?: ReactNode
  isOpen?: boolean
  isMobile?: boolean
  onClose?: () => void
}

type NavItem = {
  key: ClubSidebarProps['active'] | 'athletes'
  label: string
  icon: ReactNode
  href?: string
  disabled?: boolean
  badge?: string
}

type NavSection = {
  label?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    label: 'Club',
    items: [
      { key: 'teams', label: 'Teams', icon: <UsersIcon className="size-4" />, href: '/clubs' },
      { key: 'athletes', label: 'Athletes', icon: <UserIcon className="size-4" />, disabled: true, badge: 'Coming soon' },
      {
        key: 'registrations',
        label: 'Registrations',
        icon: <ClipboardListIcon className="size-4" />,
        href: '/clubs/registrations',
      },
    ],
  },
  {
    label: 'Management',
    items: [{ key: 'settings', label: 'Club Settings', icon: <Settings2Icon className="size-4" />, href: '/clubs/settings' }],
  },
]

export function ClubSidebar({ active, navOffset = 72, children, isOpen = true, isMobile = false, onClose }: ClubSidebarProps) {
  const { signOut } = useAuth()
  const router = useRouter()
  const offset = Number.isFinite(navOffset) ? Math.max(navOffset, 0) : 72
  const offsetPx = `${offset}px`
  const availableHeight = `calc(100vh - ${offset}px)`

  return (
    <div className="flex min-h-screen bg-background" style={{ paddingTop: offsetPx }}>
      {isMobile ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className={cn(
            'fixed left-0 right-0 z-20 bg-black/50 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden',
            isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          )}
          style={{ top: offsetPx, height: availableHeight }}
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          'fixed left-0 z-30 flex w-72 flex-col border-r border-border/70 bg-card shadow-lg transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ top: offsetPx, height: availableHeight }}
      >
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-5">
          {navSections.map((section, index) => (
            <div key={section.label ?? `section-${index}`} className="space-y-2">
              {section.label ? <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">{section.label}</p> : null}
              <div className="space-y-2">
                {section.items.map(item => {
                  const isActive = active === item.key
                  const buttonClasses = cn(
                    'group flex w-full items-center justify-between rounded-sm px-4 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    item.disabled ? 'cursor-not-allowed opacity-70' : null
                  )

                  const content = (
                    <div className="flex flex-1 items-center gap-4">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                  )

                  const badge = item.badge ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.badge}
                    </span>
                  ) : null

                  if (item.href && !item.disabled) {
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        className={buttonClasses}
                        onClick={() => {
                          if (isMobile && onClose) onClose()
                        }}
                      >
                        {content}
                        {badge}
                      </Link>
                    )
                  }

                  return (
                    <div key={item.key} className={buttonClasses} aria-disabled={item.disabled}>
                      {content}
                      {badge}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border/70 px-3 py-4">
          <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <p className="text-sm font-semibold text-foreground">Support</p>
            <p>Need help? Reach out to your CSM or email support@cheerbase.test</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-start gap-2"
            onClick={() => {
              signOut()
              router.push('/')
            }}
          >
            <LogOutIcon className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 transition-[margin-left] duration-300 lg:ml-72">
        <ScrollArea className="w-full" style={{ height: availableHeight }}>
          <div className="min-h-full">{children}</div>
        </ScrollArea>
      </div>
    </div>
  )
}
