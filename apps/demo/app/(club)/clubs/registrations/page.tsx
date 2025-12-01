"use client";

import { Button } from '@workspace/ui/shadcn/button'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import RegistrationsSection from '@/components/features/clubs/RegistrationsSection'
import { ClubPageHeader } from '@/components/layout/ClubPageHeader'
import { ClubSidebar } from '@/components/layout/ClubSidebar'
import { useAuth } from '@/components/providers/AuthProvider'
import { SidebarProvider, SidebarInset, Sidebar } from '@workspace/ui/shadcn/sidebar'
import type { CSSProperties } from 'react'

export default function ClubRegistrationsPage() {
  const { user, status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!user) {
      router.replace('/')
      return
    }
    if (user.role !== 'club_owner') {
      router.replace(user.role === 'organizer' ? '/organizer' : '/')
    }
  }, [user, status, router])

  if (status === 'loading') {
    return <main className="min-h-screen bg-background" />
  }
  if (!user || user.role !== 'club_owner') return null

  const clubInitial = (user.name ?? 'Club')[0]?.toUpperCase() ?? 'C'
  const clubLabel = user.name ? `${user.name}'s Club` : 'Your Club'

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '16rem',
          '--header-height': '4rem',
        } as CSSProperties
      }
    >
      <Sidebar collapsible="icon" variant="sidebar">
        <div className="h-full pt-16">
          <ClubSidebar clubInitial={clubInitial} clubLabel={clubLabel} active="registrations" />
        </div>
      </Sidebar>

      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <ClubPageHeader
            title="Registrations"
            subtitle="Review submissions, update rosters, and keep an eye on payment deadlines."
            action={
              <Button asChild type="button" variant="gradient">
                <Link href="/events">Browse events</Link>
              </Button>
            }
          />

          <div className="flex-1 overflow-auto">
            <div className="w-full max-w-6xl space-y-8 px-6 py-8 lg:mx-auto">
              <RegistrationsSection />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
