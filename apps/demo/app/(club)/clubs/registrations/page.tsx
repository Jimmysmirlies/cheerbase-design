"use client";

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@workspace/ui/shadcn/badge'
import { Button } from '@workspace/ui/shadcn/button'
import { TextSelect } from '@workspace/ui/components/text-select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@workspace/ui/shadcn/tooltip'
import { CalendarRangeIcon, ChevronDownIcon, ChevronUpIcon, ListIcon } from 'lucide-react'

import { EventRegisteredCard, type EventRegisteredCardProps } from '@/components/ui/cards/EventRegisteredCard'
import { FadeInSection, CardSkeleton } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
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
  const isHistoricalSeason = selectedSeason.type === 'past'

  return (
    <section className="flex flex-1 flex-col">
      <PageHeader
        title="Registrations"
        subtitle="Review submissions, update rosters, and keep an eye on payment deadlines."
        hideSubtitle
        breadcrumbItems={[
          { label: 'Clubs', href: '/clubs' },
          { label: 'Registrations', href: '/clubs/registrations' },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
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
type ViewMode = 'month' | 'all'

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
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [allEventsBucket, setAllEventsBucket] = useState<'upcoming' | 'past'>('upcoming')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const bucketedSeasonRows = useMemo(() => {
    const now = new Date()
    const upcoming: RegistrationRow[] = []
    const past: RegistrationRow[] = []

    filteredRows.forEach(row => {
      const bucket: 'upcoming' | 'past' = Number.isNaN(row.eventDate.getTime()) ? 'upcoming' : row.eventDate < now ? 'past' : 'upcoming'
      if (bucket === 'past') {
        past.push(row)
      } else {
        upcoming.push(row)
      }
    })

    return { upcoming, past }
  }, [filteredRows])
  const listRows = useMemo(
    () => (allEventsBucket === 'past' ? bucketedSeasonRows.past : bucketedSeasonRows.upcoming),
    [allEventsBucket, bucketedSeasonRows],
  )
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
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} rows={3} showMedia />
            ))}
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
          <div className="flex flex-wrap items-end gap-3">
            <TextSelect
              value={selectedSeasonId}
              onValueChange={onSelectSeason}
              sections={seasonSelectSections}
              size="large"
              label="Viewing Season"
              triggerClassName="justify-between heading-3 text-primary"
              itemClassName="text-lg font-semibold"
              contentClassName="min-w-[340px]"
            />
            <TooltipProvider delayDuration={120}>
              <div className="relative inline-flex items-center rounded-md border border-border/70 bg-muted/40 p-1 shrink-0 ml-auto">
                <div
                  className={`absolute top-1 left-1 h-9 w-9 rounded-md bg-card shadow transition-transform duration-200 ease-out ${
                    viewMode === 'all' ? 'translate-x-9' : ''
                  }`}
                  aria-hidden
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-9 rounded-md relative z-10"
                      aria-label="Month view"
                      aria-pressed={viewMode === 'month'}
                      onClick={() => setViewMode('month')}
                    >
                      <CalendarRangeIcon className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Month view</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-9 rounded-md relative z-10"
                      aria-label="All events"
                      aria-pressed={viewMode === 'all'}
                      onClick={() => setViewMode('all')}
                    >
                      <ListIcon className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">All events</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </FadeInSection>
      {viewMode === 'all' ? (
        <FadeInSection className="w-full" delay={100}>
          <div className="flex items-center gap-2">
            <Badge
              role="button"
              tabIndex={0}
              variant={allEventsBucket === 'upcoming' ? 'default' : 'outline'}
              className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              aria-pressed={allEventsBucket === 'upcoming'}
              onClick={() => setAllEventsBucket('upcoming')}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setAllEventsBucket('upcoming')
                }
              }}
            >
              Upcoming
            </Badge>
            <Badge
              role="button"
              tabIndex={0}
              variant={allEventsBucket === 'past' ? 'default' : 'outline'}
              className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              aria-pressed={allEventsBucket === 'past'}
              onClick={() => setAllEventsBucket('past')}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setAllEventsBucket('past')
                }
              }}
            >
              Past
            </Badge>
          </div>
        </FadeInSection>
      ) : null}
      {readOnly ? (
        <FadeInSection className="w-full">
          <div className="rounded-md border border-dashed border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            You are viewing historical registrations for {season.label}. Records are read-only and cannot be modified.
          </div>
        </FadeInSection>
      ) : null}

      {viewMode === 'month' ? (
        <FadeInSection className="w-full" delay={120}>
          {/* MONTHLY STACK — "Calendar Rack": month buckets with collapsible grids */}
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => (
              <FadeInSection key={section.key} className="w-full" delay={sectionIndex * 80}>
                <div className="space-y-3 border-b border-border pb-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="heading-3 text-foreground">{section.label}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span className="text-foreground font-semibold">{section.items.length}</span>
                        <span>{section.items.length === 1 ? 'event' : 'events'}</span>
                      </div>
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
                  </div>
                  {!collapsed[section.key] ? (
                    section.items.length ? (
                      <div className="grid grid-cols-1 gap-4 justify-items-start pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {section.items.map((row, rowIndex) => (
                          <FadeInSection key={row.id} delay={rowIndex * 60} className="h-full w-full">
                            <div className={`h-full w-full ${readOnly ? 'pointer-events-none opacity-75' : ''}`}>
                              <EventRegisteredCard {...row} />
                            </div>
                          </FadeInSection>
                        ))}
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
      ) : (
        <FadeInSection className="w-full" delay={120}>
          <div className="space-y-4">
            {listRows.length ? (
              <div className="grid grid-cols-1 gap-4 justify-items-start pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listRows.map((row, rowIndex) => (
                  <FadeInSection key={row.id} delay={rowIndex * 60} className="h-full w-full">
                    <div className={`h-full w-full ${readOnly ? 'pointer-events-none opacity-75' : ''}`}>
                      <EventRegisteredCard {...row} />
                    </div>
                  </FadeInSection>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
                {allEventsBucket === 'past' ? 'No past events in this season.' : 'No upcoming events in this season.'}
              </div>
            )}
          </div>
        </FadeInSection>
      )}
    </section>
  )
}

function categorizeRegistrations(data?: ClubData) {
  if (!data) return { upcoming: [] as RegistrationRow[], past: [] as RegistrationRow[] }

  const { registrations, registeredTeams, rosters } = data
  const registeredTeamMap = new Map(registeredTeams.map(rt => [rt.id, rt]))
  const rosterByTeam = new Map(rosters.map(r => [r.teamId, r]))
  const now = new Date()

  // Group registrations by eventId to avoid duplicate cards
  const eventMap = new Map<string, {
    reg: typeof registrations[0]
    participants: number
    isPaid: boolean
    paymentDeadline?: Date
  }>()

  registrations.forEach(reg => {
    const inferredRegisteredTeamId = reg.registeredTeamId ?? (reg.teamId ? `rt-${reg.teamId}` : undefined)
    const registeredTeam = reg.registeredTeam ?? (inferredRegisteredTeamId ? registeredTeamMap.get(inferredRegisteredTeamId) : undefined)
    const roster = registeredTeam?.sourceTeamId ? rosterByTeam.get(registeredTeam.sourceTeamId) : null
    const participants =
      registeredTeam?.members?.length ?? (roster ? countRosterParticipants(roster) : reg.athletes ?? registeredTeam?.size ?? 0)
    const isPaid = reg.status === 'paid' || Boolean(reg.paidAt)
    const paymentDeadline = reg.paymentDeadline ? new Date(reg.paymentDeadline) : undefined

    const existing = eventMap.get(reg.eventId)
    if (existing) {
      // Aggregate participants and track if ANY team is unpaid
      existing.participants += participants
      existing.isPaid = existing.isPaid && isPaid
      // Use earliest payment deadline
      if (paymentDeadline && (!existing.paymentDeadline || paymentDeadline < existing.paymentDeadline)) {
        existing.paymentDeadline = paymentDeadline
      }
    } else {
      eventMap.set(reg.eventId, { reg, participants, isPaid, paymentDeadline })
    }
  })

  const upcoming: RegistrationRow[] = []
  const past: RegistrationRow[] = []

  eventMap.forEach(({ reg, participants, isPaid, paymentDeadline }) => {
    const event = findEventById(reg.eventId)
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
      organizer: event?.organizer ?? reg.organizer,
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
