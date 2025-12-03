"use client";

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/shadcn/button'
import { LargeSelect } from '@workspace/ui/components/large-select'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

import { EventRegisteredCard, type EventRegisteredCardProps } from '@/components/ui/cards/EventRegisteredCard'
import { FadeInSection } from '@/components/ui'
import { ClubPageHeader } from '@/components/layout/ClubPageHeader'
import { ClubSidebar } from '@/components/layout/ClubSidebar'
import { useAuth } from '@/components/providers/AuthProvider'
import { useClubData } from '@/hooks/useClubData'
import { findEventById } from '@/data/events'
import { formatFriendlyDate } from '@/utils/format'
import type { ClubData } from '@/lib/club-data'
import type { TeamRoster } from '@/types/club'

export default function ClubRegistrationsPage() {
  const { user, status } = useAuth()
  const router = useRouter()
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(defaultSeasonId)

  // ACCESS CONTROL — "Gatekeeper": keep non-club-owners out of the registrations experience
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

  const selectedSeason = resolveSeasonById(selectedSeasonId)
  const clubInitial = (user.name ?? 'Club')[0]?.toUpperCase() ?? 'C'
  const clubLabel = user.name ? `${user.name}'s Club` : 'Your Club'
  const ownerName = user.name ?? user.email ?? clubLabel
  const isHistoricalSeason = selectedSeason.type === 'past'

  return (
    // LAYOUT SHELL — "Club Canvas": nav rail, hero header, and content track everything in one frame
    <main className="flex w-full">
      <ClubSidebar clubInitial={clubInitial} clubLabel={clubLabel} ownerName={ownerName} active="registrations" />

      <section className="flex flex-1 flex-col">
        <ClubPageHeader
          title="Registrations"
          subtitle="Review submissions, update rosters, and keep an eye on payment deadlines."
          hideSubtitle
          breadcrumbs={<span>Clubs / Registrations</span>}
        />

        <div className="mx-auto w-full max-w-6xl px-4 lg:px-8 py-8">
          <FadeInSection className="w-full">
            <RegistrationsContent
              userId={user.id}
              season={selectedSeason}
              readOnly={isHistoricalSeason}
              selectedSeasonId={selectedSeasonId}
              onSelectSeason={setSelectedSeasonId}
            />
          </FadeInSection>
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
type SeasonOption = {
  id: string
  label: string
  start: Date
  end: Date
  type: 'current' | 'past'
}

const seasonOptions: SeasonOption[] = [
  {
    id: '2025-2026',
    label: 'Nov 2025 - May 2026',
    start: new Date(2025, 10, 1),
    end: new Date(2026, 4, 1),
    type: 'current',
  },
  {
    id: '2024-2025',
    label: 'Nov 2024 - May 2025',
    start: new Date(2024, 10, 1),
    end: new Date(2025, 4, 1),
    type: 'past',
  },
  {
    id: '2023-2024',
    label: 'Nov 2023 - May 2024',
    start: new Date(2023, 10, 1),
    end: new Date(2024, 4, 1),
    type: 'past',
  },
]
const defaultSeason = (seasonOptions.find(season => season.type === 'current') ?? seasonOptions[0])!
const defaultSeasonId = defaultSeason.id
function resolveSeasonById(seasonId: string): SeasonOption {
  return seasonOptions.find(season => season.id === seasonId) ?? defaultSeason
}

function RegistrationsContent({
  userId,
  season,
  readOnly,
  selectedSeasonId,
  onSelectSeason,
}: {
  userId?: string
  season: SeasonOption
  readOnly: boolean
  selectedSeasonId: string
  onSelectSeason: (seasonId: string) => void
}) {
  // DATA PIPELINE — "Command Center": pull club data, then memoize categorized + sectioned outputs
  const { data, loading, error } = useClubData(userId)
  const categorized = useMemo(() => categorizeRegistrations(data ?? undefined), [data])
  const rows = useMemo(() => {
    const all = [...categorized.upcoming, ...categorized.past]
    return all.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
  }, [categorized])
  const filteredRows = useMemo(
    () => rows.filter(row => isWithinSeason(row.eventDate, season)),
    [rows, season],
  )
  const sections = useMemo(() => buildMonthSections(filteredRows, season), [filteredRows, season])
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const seasonSelectSections = useMemo(() => {
    const current = seasonOptions
      .filter(option => option.type === 'current')
      .map(option => ({ value: option.id, label: option.label }))
    const past = seasonOptions
      .filter(option => option.type === 'past')
      .map(option => ({ value: option.id, label: option.label }))
    const sections: { label: string; options: { value: string; label: string }[]; showDivider?: boolean }[] = []
    if (current.length) {
      sections.push({ label: 'Current Season', options: current })
    }
    if (past.length) {
      sections.push({ label: 'Past Seasons', options: past, showDivider: current.length > 0 })
    }
    return sections
  }, [])

  // COLLAPSE MEMORY — "Accordion Brain": initialize per-month expansion state
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
      {/* STATUS HANDOFF — "Loading Bay": surface fetch status before showing the grid */}
      {loading ? (
        <FadeInSection className="w-full">
          <div className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
            Loading registrations...
          </div>
        </FadeInSection>
      ) : error ? (
        <FadeInSection className="w-full">
          <div className="text-destructive rounded-2xl border border-dashed p-6 text-center text-sm">
            Failed to load registrations.
          </div>
        </FadeInSection>
      ) : null}

      <FadeInSection className="w-full" delay={80}>
        <div className="border-b border-border pb-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Viewing Season</p>
            <LargeSelect
              value={selectedSeasonId}
              onValueChange={onSelectSeason}
              sections={seasonSelectSections}
              triggerClassName="justify-between heading-3 text-primary"
              itemClassName="text-lg font-semibold"
              contentClassName="w-[280px]"
            />
          </div>
        </div>
      </FadeInSection>
      {readOnly ? (
        <FadeInSection className="w-full">
          <div className="rounded-md border border-dashed border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            You are viewing historical registrations for {season.label}. Records are read-only and cannot be modified.
          </div>
        </FadeInSection>
      ) : null}

      <FadeInSection className="w-full" delay={120}>
        {/* MONTHLY STACK — "Calendar Rack": month buckets with collapsible grids */}
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <FadeInSection key={section.key} className="w-full" delay={sectionIndex * 80}>
              <div className="space-y-3 border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div className="heading-3 text-foreground">{section.label}</div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleSection(section.key)}
                    aria-label={collapsed[section.key] ? 'Expand month' : 'Collapse month'}
                  >
                    {collapsed[section.key] ? (
                      <ChevronDownIcon className="size-5" />
                    ) : (
                      <ChevronUpIcon className="size-5" />
                    )}
                  </Button>
                </div>
                {!collapsed[section.key] ? (
                  section.items.length ? (
                    <div className="overflow-hidden">
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {section.items.map((row, rowIndex) => (
                          <FadeInSection key={row.id} delay={rowIndex * 60} className="h-full shrink-0">
                            <div className={`h-full ${readOnly ? 'pointer-events-none opacity-75' : ''}`}>
                              <EventRegisteredCard {...row} />
                            </div>
                          </FadeInSection>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
                      No events this month.
                    </div>
                  )
                ) : null}
              </div>
            </FadeInSection>
          ))}
        </div>
      </FadeInSection>
    </section>
  )
}

function categorizeRegistrations(data?: ClubData) {
  if (!data) return { upcoming: [] as RegistrationRow[], past: [] as RegistrationRow[] }

  const { registrations, registeredTeams, rosters } = data
  const registeredTeamMap = new Map(registeredTeams.map(rt => [rt.id, rt]))
  const rosterByTeam = new Map(rosters.map(r => [r.teamId, r]))
  const now = new Date()
  const upcoming: RegistrationRow[] = []
  const past: RegistrationRow[] = []

  registrations.forEach(reg => {
    const inferredRegisteredTeamId = reg.registeredTeamId ?? (reg.teamId ? `rt-${reg.teamId}` : undefined)
    const registeredTeam = reg.registeredTeam ?? (inferredRegisteredTeamId ? registeredTeamMap.get(inferredRegisteredTeamId) : undefined)
    const roster = registeredTeam?.sourceTeamId ? rosterByTeam.get(registeredTeam.sourceTeamId) : null
    const participants =
      registeredTeam?.members?.length ?? (roster ? countRosterParticipants(roster) : reg.athletes ?? registeredTeam?.size ?? 0)
    const event = findEventById(reg.eventId)
    const isPaid = reg.status === 'paid' || Boolean(reg.paidAt)
    const paymentDeadline = reg.paymentDeadline ? new Date(reg.paymentDeadline) : undefined
    let statusLabel: 'PAID' | 'UNPAID' | 'OVERDUE' = 'UNPAID'
    if (isPaid) statusLabel = 'PAID'
    else if (paymentDeadline && paymentDeadline < now) statusLabel = 'OVERDUE'
    const eventDate = new Date(reg.eventDate)
    const bucket: 'upcoming' | 'past' = Number.isNaN(eventDate.getTime()) ? 'upcoming' : eventDate < now ? 'past' : 'upcoming'

    const card: RegistrationRow = {
      id: reg.id,
      image: event?.image,
      title: reg.eventName,
      date: formatFriendlyDate(reg.eventDate),
      // keep raw date for grouping
      eventDate,
      location: event?.location ?? reg.location,
      participants,
      statusLabel,
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

function buildMonthSections(rows: (RegistrationRow & { eventDate: Date })[], season: SeasonOption) {
  // TIME WINDOW — "Season Envelope": limit calendar to the active cheer season months
  const start = new Date(season.start.getFullYear(), season.start.getMonth(), 1)
  const end = new Date(season.end.getFullYear(), season.end.getMonth(), 1)

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

function isWithinSeason(date: Date, season: SeasonOption) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false
  return date >= season.start && date <= season.end
}

function countRosterParticipants(roster: TeamRoster) {
  return (
    (roster.coaches?.length ?? 0) +
    (roster.athletes?.length ?? 0) +
    (roster.reservists?.length ?? 0) +
    (roster.chaperones?.length ?? 0)
  )
}
