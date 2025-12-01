"use client";

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/shadcn/button'
import { ScrollArea } from '@workspace/ui/shadcn/scroll-area'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

import { EventRegisteredCard, type EventRegisteredCardProps } from '@/components/ui/cards/EventRegisteredCard'
import { ClubPageHeader } from '@/components/layout/ClubPageHeader'
import { ClubSidebar } from '@/components/layout/ClubSidebar'
import { useAuth } from '@/components/providers/AuthProvider'
import { useClubData } from '@/hooks/useClubData'
import { findEventById } from '@/data/events'
import { formatCurrency, formatFriendlyDate } from '@/utils/format'
import { resolveDivisionPricing } from '@/utils/pricing'
import type { ClubData } from '@/lib/club-data'
import type { TeamRoster } from '@/types/club'

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
  const ownerName = user.name ?? user.email ?? clubLabel

  return (
    <main className="flex w-full">
      <ClubSidebar clubInitial={clubInitial} clubLabel={clubLabel} ownerName={ownerName} active="registrations" />

      <section className="flex flex-1 flex-col">
        <ClubPageHeader
          title="Registrations"
          subtitle="Review submissions, update rosters, and keep an eye on payment deadlines."
          hideSubtitle
        />

        <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
          <RegistrationsContent userId={user.id} />
        </div>
      </section>
    </main>
  )
}

type RegistrationRow = EventRegisteredCardProps & { id: string; eventDate: Date }
type MonthSection = {
  key: string
  label: string
  items: RegistrationRow[]
}

function RegistrationsContent({ userId }: { userId?: string }) {
  const { data, loading, error } = useClubData(userId)
  const categorized = useMemo(() => categorizeRegistrations(data ?? undefined), [data])
  const rows = useMemo(() => {
    const all = [...categorized.upcoming, ...categorized.past]
    return all.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
  }, [categorized])
  const sections = useMemo(() => buildMonthSections(rows), [rows])
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const nextState: Record<string, boolean> = {}
    sections.forEach(section => {
      nextState[section.key] = false
    })
    setCollapsed(nextState)
  }, [sections])

  const toggleSection = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <section className="space-y-6">
      {loading ? (
        <div className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">Loading registrations...</div>
      ) : error ? (
        <div className="text-destructive rounded-2xl border border-dashed p-6 text-center text-sm">
          Failed to load registrations.
        </div>
      ) : null}

      <ScrollArea className="w-full">
        <div className="space-y-6">
          {sections.map(section => (
            <div key={section.key} className="space-y-3 border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div className="heading-3 text-foreground">{section.label}</div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleSection(section.key)}
                  aria-label={collapsed[section.key] ? 'Expand month' : 'Collapse month'}
                >
                  {collapsed[section.key] ? <ChevronDownIcon className="size-5" /> : <ChevronUpIcon className="size-5" />}
                </Button>
              </div>
              {!collapsed[section.key] ? (
                section.items.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {section.items.map(row => (
                      <EventRegisteredCard key={row.id} {...row} />
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
                    No events this month.
                  </div>
                )
              ) : null}
            </div>
          ))}
        </div>
      </ScrollArea>
    </section>
  )
}

function categorizeRegistrations(data?: ClubData) {
  if (!data) return { upcoming: [] as RegistrationRow[], past: [] as RegistrationRow[] }

  const { registrations, registeredTeams, teams, rosters } = data
  const registeredTeamMap = new Map(registeredTeams.map(rt => [rt.id, rt]))
  const rosterByTeam = new Map(rosters.map(r => [r.teamId, r]))
  const now = new Date()
  const upcoming: RegistrationRow[] = []
  const past: RegistrationRow[] = []

  registrations.forEach(reg => {
    const inferredRegisteredTeamId = reg.registeredTeamId ?? (reg.teamId ? `rt-${reg.teamId}` : undefined)
    const registeredTeam = reg.registeredTeam ?? (inferredRegisteredTeamId ? registeredTeamMap.get(inferredRegisteredTeamId) : undefined)
    const sourceTeam = registeredTeam?.sourceTeamId ? teams.find(item => item.id === registeredTeam.sourceTeamId) : null
    const roster = registeredTeam?.sourceTeamId ? rosterByTeam.get(registeredTeam.sourceTeamId) : null
    const participants =
      registeredTeam?.members?.length ?? (roster ? countRosterParticipants(roster) : reg.athletes ?? registeredTeam?.size ?? 0)
    const event = findEventById(reg.eventId)
    const divisionPricing = event?.availableDivisions?.find(option => option.name === reg.division)
    const invoiceTotalNumber =
      divisionPricing && participants ? participants * resolveDivisionPricing(divisionPricing).price : reg.invoiceTotal
    const invoiceTotal = formatCurrency(invoiceTotalNumber)
    const isPaid = reg.status === 'paid' || Boolean(reg.paidAt)
    const statusLabel = isPaid ? 'Paid' : 'Unpaid'
    const statusSubtext = isPaid
      ? `Paid on ${formatFriendlyDate(reg.paidAt ?? undefined)}`
      : `Auto-pay on ${formatFriendlyDate(reg.paymentDeadline ?? undefined)}`
    const eventDate = new Date(reg.eventDate)
    const bucket: 'upcoming' | 'past' = Number.isNaN(eventDate.getTime()) ? 'upcoming' : eventDate < now ? 'past' : 'upcoming'

    const card: RegistrationRow = {
      id: reg.id,
      image: event?.image,
      title: reg.eventName,
      subtitle: event?.organizer ?? event?.type,
      teamName:
        registeredTeam?.name ??
        sourceTeam?.name ??
        registeredTeam?.sourceTeamId ??
        reg.registeredTeamId ??
        reg.teamId ??
        "Team",
      date: formatFriendlyDate(reg.eventDate),
      // keep raw date for grouping
      eventDate,
      location: event?.location ?? reg.location,
      participants,
      invoice: invoiceTotal,
      statusLabel,
      statusSubtext,
      statusVariant: isPaid ? 'green' : 'amber',
      actionHref: `/clubs/registrations/${reg.id}`,
    }

    if (bucket === 'past') {
      past.push(card)
    } else {
      upcoming.push(card)
    }
  })

  return { upcoming, past }
}

function buildMonthSections(rows: (RegistrationRow & { eventDate: Date })[]) {
  const start = new Date(2025, 10, 1) // Nov 2025
  const end = new Date(2026, 4, 1) // May 2026

  const months: MonthSection[] = []
  const cursor = new Date(start)

  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}`
    const label = cursor.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    const items = rows.filter(row => {
      const d = row.eventDate
      return d.getFullYear() === cursor.getFullYear() && d.getMonth() === cursor.getMonth()
    })
    months.push({ key, label, items })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return months
}

function countRosterParticipants(roster: TeamRoster) {
  return (
    (roster.coaches?.length ?? 0) +
    (roster.athletes?.length ?? 0) +
    (roster.reservists?.length ?? 0) +
    (roster.chaperones?.length ?? 0)
  )
}
