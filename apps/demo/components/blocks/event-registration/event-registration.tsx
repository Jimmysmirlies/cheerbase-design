'use client'

/**
 * RegistrationFlow
 *
 * Purpose
 * - Client-side flow for registering teams to an event outside of a modal context.
 *
 * Structure
 * - Page header describing the event
 * - Actions row with search input + "Register team" modal trigger
 * - Queued teams panel with division-grouped cards and totals footer
 * - Footer actions to clear the queue or submit registrations
 */
import { useCallback, useMemo, useState } from 'react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/shadcn/button'
import { Input } from '@workspace/ui/shadcn/input'

import { ChevronDownIcon, PenSquareIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { GlassCard } from '@/components/ui/glass/glass-card'
import type { Person, TeamRoster } from '@/types/club'
import type { DivisionPricing } from '@/types/events'
import { formatCurrency, formatFriendlyDate, formatPhoneNumber } from '@/utils/format'
import { resolveDivisionPricing } from '@/utils/pricing'

import { FinalizeRegistrationDialog } from './finalize-registration-dialog'
import { RegisterTeamModal } from './register-team-modal'
import { RosterEditorDialog } from './roster-editor-dialog'
import { DEFAULT_ROLE, RegistrationEntry, RegistrationMember, TeamOption } from './types'

export type { TeamOption, RegistrationMember, RegistrationEntry } from './types'

export type RegistrationFlowProps = {
  divisionPricing: DivisionPricing[]
  teams: TeamOption[]
  rosters?: TeamRoster[]
  initialEntries?: RegistrationEntry[]
  onConfirm?: (entries: RegistrationEntry[]) => void
  finalizeConfig?: Partial<FinalizeConfig>
}

type FinalizeConfig = {
  ctaLabel: string
  dialogTitle: string
  dialogDescription: string
  dialogConfirmLabel: string
  redirectPath: string
}

const DEFAULT_FINALIZE_CONFIG: FinalizeConfig = {
  ctaLabel: 'Finalize registration',
  dialogTitle: 'Review and confirm',
  dialogDescription: 'Double-check division totals and roster counts before submitting.',
  dialogConfirmLabel: 'Submit registration',
  redirectPath: '/clubs?view=registrations',
}

// Section nickname: "Flow Shell" – orchestrates the primary registration workflow state.
export function RegistrationFlow({
  divisionPricing,
  teams,
  rosters,
  initialEntries = [],
  onConfirm,
  finalizeConfig,
}: RegistrationFlowProps) {
  const divisionOptions = useMemo(
    () => Array.from(new Set(divisionPricing.map(option => option.name))).filter(Boolean),
    [divisionPricing]
  )
  const teamOptions = useMemo(() => teams.filter(Boolean), [teams])
  const rosterByTeamId = useMemo(() => {
    return (rosters ?? []).reduce<Record<string, TeamRoster>>((acc, roster) => {
      acc[roster.teamId] = roster
      return acc
    }, {})
  }, [rosters])

  const [entries, setEntries] = useState<RegistrationEntry[]>(initialEntries)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false)

  const router = useRouter()
  const resolvedFinalizeConfig = useMemo<FinalizeConfig>(
    () => ({
      ...DEFAULT_FINALIZE_CONFIG,
      ...(finalizeConfig ?? {}),
    }),
    [finalizeConfig]
  )

  const sanitizedSearch = searchTerm.trim().toLowerCase()

  const filteredEntries = useMemo(() => {
    if (!sanitizedSearch) return entries
    return entries.filter(entry => {
      const divisionMatch = entry.division.toLowerCase().includes(sanitizedSearch)
      const teamLabel = (entry.teamName ?? entry.fileName ?? '').toLowerCase()
      return divisionMatch || teamLabel.includes(sanitizedSearch)
    })
  }, [entries, sanitizedSearch])

  const groupedEntries = useMemo(() => groupEntriesByDivision(entries), [entries])
  const filteredGroupedEntries = useMemo(
    () => groupEntriesByDivision(filteredEntries),
    [filteredEntries]
  )

  const handleAddEntry = (entry: RegistrationEntry) => {
    if (entry.mode === 'existing' && entry.teamId) {
      const roster = rosterByTeamId[entry.teamId]
      const flattenedMembers = flattenRosterMembers(roster)
      const members = flattenedMembers.length ? flattenedMembers : entry.members
      const teamSize = entry.teamSize ?? (members?.length ? members.length : undefined)

      setEntries(prev => [
        ...prev,
        {
          ...entry,
          members,
          teamSize,
        },
      ])
      return
    }

    setEntries(prev => [...prev, entry])
  }

  const handleRemoveEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const handleUpdateEntryMembers = (id: string, members: RegistrationMember[]) => {
    const sanitizedMembers = members.filter(member => {
      const content = [
        member.name?.trim(),
        member.email?.trim(),
        member.phone?.trim(),
        member.dob?.trim(),
        member.type?.trim(),
      ]
      return content.some(Boolean)
    })

    setEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? {
              ...entry,
              members: sanitizedMembers.map(member => ({
                ...member,
                name: member.name?.trim() || 'Unnamed',
                email: member.email?.trim() || undefined,
                phone: member.phone?.trim() || undefined,
                dob: member.dob?.trim() || undefined,
                type: member.type?.trim() || DEFAULT_ROLE,
              })),
              teamSize: sanitizedMembers.length,
            }
          : entry
      )
    )
  }

  const handleConfirm = () => {
    if (!entries.length) return
    onConfirm?.(entries)
    setEntries([])
    setIsFinalizeDialogOpen(false)
    if (resolvedFinalizeConfig.redirectPath) {
      router.push(resolvedFinalizeConfig.redirectPath)
    }
  }

  return (
    <section className="w-full">
      <div className="space-y-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-8 lg:space-y-0">
        <div className="space-y-8">
          {/* Flow Shell · Search + register */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                type="search"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search registered teams or participants"
                className="w-full pl-9"
              />
            </div>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(true)} disabled={!divisionOptions.length}>
              Register team
            </Button>
          </div>

          <DivisionQueueSection
            entriesByDivision={groupedEntries}
            filteredEntriesByDivision={filteredGroupedEntries}
            allEntries={entries}
            divisionOptions={divisionOptions}
            searchTerm={sanitizedSearch}
            onRemoveEntry={handleRemoveEntry}
            onUpdateEntryMembers={handleUpdateEntryMembers}
          />

          <footer className="border-border/60 border-t pt-4">
            <p className="text-muted-foreground text-xs">
              Finalize once all divisions have assigned registrants.
            </p>
          </footer>
        </div>

        <aside className="mt-8 lg:mt-0 lg:sticky lg:top-24">
          <GlassCard className="rounded-3xl border-none p-4 shadow-lg">
            <PricingBreakdownPanel
              entriesByDivision={groupedEntries}
              divisionPricing={divisionPricing}
            />
            <Button
              type="button"
              className="w-full"
              onClick={() => setIsFinalizeDialogOpen(true)}
              disabled={!entries.length}
            >
              {resolvedFinalizeConfig.ctaLabel}
            </Button>
          </GlassCard>
        </aside>
      </div>

      <RegisterTeamModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        divisions={divisionOptions}
        teams={teamOptions}
        onSubmit={handleAddEntry}
      />
      <FinalizeRegistrationDialog
        open={isFinalizeDialogOpen}
        onOpenChange={setIsFinalizeDialogOpen}
        pricingPanel={
          <PricingBreakdownPanel
            entriesByDivision={groupedEntries}
            divisionPricing={divisionPricing}
          />
        }
        title={resolvedFinalizeConfig.dialogTitle}
        description={resolvedFinalizeConfig.dialogDescription}
        confirmLabel={resolvedFinalizeConfig.dialogConfirmLabel}
        onConfirm={handleConfirm}
        confirmDisabled={!entries.length}
      />
    </section>
  )
}

// --- Division queue --------------------------------------------------------
// Section nickname: "Queue Explorer" – groups divisions and keeps empty states consistent.

type DivisionQueueSectionProps = {
  entriesByDivision: Record<string, RegistrationEntry[]>
  filteredEntriesByDivision: Record<string, RegistrationEntry[]>
  allEntries: RegistrationEntry[]
  divisionOptions: string[]
  searchTerm: string
  onRemoveEntry: (id: string) => void
  onUpdateEntryMembers: (id: string, members: RegistrationMember[]) => void
}

function DivisionQueueSection({
  entriesByDivision,
  filteredEntriesByDivision,
  allEntries,
  divisionOptions,
  searchTerm,
  onRemoveEntry,
  onUpdateEntryMembers,
}: DivisionQueueSectionProps) {
  const baseDivisions = useMemo(() => {
    if (divisionOptions.length) {
      return Array.from(new Set(divisionOptions))
    }
    return Array.from(new Set(allEntries.map(entry => entry.division)))
  }, [divisionOptions, allEntries])

  const divisionsToRender = useMemo(() => {
    if (!searchTerm) return baseDivisions
    return baseDivisions.filter(division => (filteredEntriesByDivision[division]?.length ?? 0) > 0)
  }, [baseDivisions, filteredEntriesByDivision, searchTerm])

  const shouldShowGlobalEmpty = divisionsToRender.length === 0

  if (shouldShowGlobalEmpty) {
    return (
      <div className="border-border/70 text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
        {searchTerm
          ? 'No teams match your search yet.'
          : 'No teams added yet. Start by registering a team.'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {divisionsToRender.map(divisionName => {
        const divisionEntries =
          (searchTerm
            ? filteredEntriesByDivision[divisionName]
            : entriesByDivision[divisionName]) ?? []

        return (
          <section key={divisionName} className="space-y-3 border-t border-border/60 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{divisionName}</p>
              <span className="text-muted-foreground text-xs font-medium">
                {divisionEntries.length} {divisionEntries.length === 1 ? 'team' : 'teams'}
              </span>
            </div>
            {divisionEntries.length ? (
              <div className="space-y-2">
                {divisionEntries.map(entry => (
                  <DivisionTeamRow
                    key={entry.id}
                    entry={entry}
                    onRemove={() => onRemoveEntry(entry.id)}
                    onUpdateMembers={members => onUpdateEntryMembers(entry.id, members)}
                  />
                ))}
              </div>
            ) : (
              <div className="border-border/60 text-muted-foreground rounded-2xl border border-dashed p-4 text-xs">
                No teams registered for this division yet.
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

// --- Pricing breakdown -----------------------------------------------------
// Section nickname: "Pricing Snapshot" – summarises totals and pricing tiers.

type PricingBreakdownPanelProps = {
  entriesByDivision: Record<string, RegistrationEntry[]>
  divisionPricing: DivisionPricing[]
}

function PricingBreakdownPanel({ entriesByDivision, divisionPricing }: PricingBreakdownPanelProps) {
  const pricingByDivision = useMemo(() => {
    return divisionPricing.reduce<Record<string, DivisionPricing>>((acc, option) => {
      acc[option.name] = option
      return acc
    }, {})
  }, [divisionPricing])

  const pricingSummary = useMemo(() => {
    const referenceDate = new Date()
    return Object.entries(entriesByDivision).map(([divisionName, divisionEntries]) => {
      const participants = divisionEntries.reduce(
        (total, entry) => total + getEntryMemberCount(entry),
        0
      )
      const pricing = pricingByDivision[divisionName]
      if (!pricing) {
        const participantLabel = `${participants} ${participants === 1 ? 'participant' : 'participants'}`
        return {
          division: divisionName,
          participants,
          teams: divisionEntries.length,
          price: 0,
          total: 0,
          unitLabel: `${participantLabel} · pricing unavailable`,
          tierLabel: 'Pricing unavailable',
          hasPricing: false,
        }
      }

      const activeTier = resolveDivisionPricing(pricing, referenceDate)
      const total = participants * activeTier.price
      const participantLabel = `${participants} ${participants === 1 ? 'participant' : 'participants'}`
      const unitLabel = `${participantLabel} × ${formatCurrency(activeTier.price)}`
      const tierLabel =
        activeTier.tier === 'earlyBird'
          ? `Early bird · through ${formatFriendlyDate(pricing.earlyBird!.deadline)}`
          : pricing.earlyBird
            ? 'Regular pricing'
            : 'Standard pricing'

      return {
        division: divisionName,
        participants,
        teams: divisionEntries.length,
        price: activeTier.price,
        total,
        unitLabel,
        tierLabel,
        hasPricing: true,
      }
    })
  }, [entriesByDivision, pricingByDivision])

  const totalTeams = useMemo(
    () => Object.values(entriesByDivision).reduce((sum, list) => sum + list.length, 0),
    [entriesByDivision]
  )
  const totalParticipants = pricingSummary.reduce((sum, item) => sum + item.participants, 0)
  const totalDue = pricingSummary.reduce((sum, item) => sum + item.total, 0)
  const hasUnpricedDivision = pricingSummary.some(item => !item.hasPricing && item.participants > 0)

  const hasAnySummary = pricingSummary.length > 0

  return (
    <div className="space-y-3 text-sm">
      {hasAnySummary ? (
        pricingSummary.map(item => (
          <div key={item.division} className="space-y-1">
            <div className="text-foreground flex items-center justify-between">
              <span>{item.division}</span>
              <span>{formatCurrency(item.total)}</span>
            </div>
            <div className="text-muted-foreground flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
              <span>{item.unitLabel}</span>
              <span className="sm:text-right">{item.tierLabel}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="border-border/60 text-muted-foreground rounded-xl border border-dashed p-4 text-xs">
          Add teams to see pricing breakdown by division.
        </div>
      )}
      {hasUnpricedDivision && (
        <p className="text-xs text-amber-600">
          Pricing is still pending for at least one division and is excluded from the total.
        </p>
      )}
      <div className="border-border/60 text-foreground space-y-2 border-t pt-3">
        <div className="flex items-center justify-between">
          <span>Total teams</span>
          <span>{totalTeams}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total participants</span>
          <span>{totalParticipants}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Estimated total due</span>
          <span>{formatCurrency(totalDue)}</span>
        </div>
      </div>
    </div>
  )
}

// --- Team row --------------------------------------------------------------
// Section nickname: "Team Capsule" – expandable roster review per team entry.

type DivisionTeamRowProps = {
  entry: RegistrationEntry
  onRemove: () => void
  onUpdateMembers: (members: RegistrationMember[]) => void
}

function DivisionTeamRow({ entry, onRemove, onUpdateMembers }: DivisionTeamRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)

  const toggleExpanded = useCallback(() => setExpanded(prev => !prev), [])
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleExpanded()
    }
  }

  const members = useMemo(() => entry.members ?? [], [entry.members])
  const handleSaveRoster = useCallback(
    (updatedMembers: RegistrationMember[]) => {
      onUpdateMembers(updatedMembers)
      setEditorOpen(false)
    },
    [onUpdateMembers]
  )
  const memberCount = members.length ? members.length : entry.teamSize ?? 0
  const secondaryLabel =
    entry.mode === 'existing'
      ? memberCount
        ? `${memberCount} members · Existing roster`
        : 'Existing roster'
      : (entry.fileName ?? 'Roster upload')

  return (
    <div className="border-border/70 bg-background/80 rounded-2xl border">
      <div
        role="button"
        tabIndex={0}
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        className="focus-visible:ring-primary/40 flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2"
      >
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-medium">
            {entry.teamName ?? entry.fileName ?? 'Team'}
          </p>
          <p className="text-muted-foreground truncate text-xs">{secondaryLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={event => {
              event.stopPropagation()
              onRemove()
            }}
            aria-label="Remove team"
          >
            <Trash2Icon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={event => {
              event.stopPropagation()
              setEditorOpen(true)
            }}
            aria-label="Edit roster"
          >
            <PenSquareIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={event => {
              event.stopPropagation()
              toggleExpanded()
            }}
            aria-label={expanded ? 'Collapse team details' : 'Expand team details'}
          >
            <ChevronDownIcon
              className={cn('size-4 transition-transform', expanded && 'rotate-180')}
            />
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="border-border/60 text-muted-foreground border-t text-xs">
          {members.length ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-left text-[13px] lg:text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium sm:px-4">Name</th>
                    <th className="px-3 py-2 font-medium sm:px-4">DOB</th>
                    <th className="px-3 py-2 font-medium sm:px-5">Email</th>
                    <th className="px-3 py-2 font-medium sm:px-5">Phone</th>
                    <th className="px-3 py-2 text-right font-medium sm:px-4">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <tr key={`${entry.id}-member-${index}`} className="border-t">
                      <td className="text-foreground px-3 py-2 sm:px-4">{member.name}</td>
                      <td className="px-3 py-2 sm:px-4">{formatFriendlyDate(member.dob)}</td>
                      <td className="px-3 py-2 sm:px-5">{member.email ?? '—'}</td>
                      <td className="px-3 py-2 sm:px-5">{formatPhoneNumber(member.phone)}</td>
                      <td className="text-muted-foreground px-3 py-2 text-right sm:px-4">
                        {member.type ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : entry.mode === 'existing' ? (
            <div className="p-4">
              Roster details will be pulled from your workspace once registration is submitted.
            </div>
          ) : (
            <div className="p-4">Roster file: {entry.fileName ?? 'Pending upload'}</div>
          )}
        </div>
      )}
      <RosterEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        members={members}
        teamName={entry.teamName ?? entry.fileName ?? 'Team'}
        onSave={handleSaveRoster}
      />
    </div>
  )
}

// --- Utilities -------------------------------------------------------------

function groupEntriesByDivision(entries: RegistrationEntry[]): Record<string, RegistrationEntry[]> {
  return entries.reduce<Record<string, RegistrationEntry[]>>((acc, entry) => {
    const list = acc[entry.division] ?? []
    list.push(entry)
    acc[entry.division] = list
    return acc
  }, {})
}

function getEntryMemberCount(entry: RegistrationEntry): number {
  return entry.members?.length ?? entry.teamSize ?? 0
}

function flattenRosterMembers(roster?: TeamRoster): RegistrationMember[] {
  if (!roster) return []

  const roleMap: Array<{
    key: 'coaches' | 'athletes' | 'reservists' | 'chaperones'
    label: string
  }> = [
    { key: 'coaches', label: 'Coach' },
    { key: 'athletes', label: 'Athlete' },
    { key: 'reservists', label: 'Reservist' },
    { key: 'chaperones', label: 'Chaperone' },
  ]

  return roleMap.flatMap(({ key, label }) => {
    const group = roster[key] ?? []
    return group.map(member => ({
      name: formatMemberName(member),
      type: label,
      dob: member.dob,
      email: member.email,
      phone: member.phone,
    }))
  })
}

function formatMemberName(member: Pick<Person, 'firstName' | 'lastName'>): string {
  const parts = [member.firstName, member.lastName].filter(Boolean)
  return parts.length ? parts.join(' ') : 'Unnamed'
}
