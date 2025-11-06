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
import { useEffect, useMemo, useState } from 'react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/shadcn/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/shadcn/dialog'
import { Input } from '@workspace/ui/shadcn/input'
import { Label } from '@workspace/ui/shadcn/label'
import { RadioGroup, RadioGroupItem } from '@workspace/ui/shadcn/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/shadcn/select'

import { ChevronDownIcon, PenSquareIcon, SearchIcon, Trash2Icon, UploadIcon } from 'lucide-react'

import type { Person, TeamRoster } from '@/types/club'
import type { DivisionPricing } from '@/types/events'
import { formatFriendlyDate, formatPhoneNumber } from '@/utils/format'

const ROSTER_TEMPLATE_PATH = '/templates/team-roster-template.xlsx'

type TeamOption = {
  id: string
  name: string
  division?: string
  size?: number
}

type RegistrationMember = {
  name: string
  type: string
  dob?: string
  email?: string
  phone?: string
}

type RegistrationEntry = {
  id: string
  division: string
  mode: 'existing' | 'upload'
  teamId?: string
  teamName?: string
  teamSize?: number
  fileName?: string
  members?: RegistrationMember[]
}

export type RegistrationFlowProps = {
  divisionPricing: DivisionPricing[]
  teams: TeamOption[]
  rosters?: TeamRoster[]
  onConfirm?: (entries: RegistrationEntry[]) => void
}

// Section nickname: "Flow Shell" – orchestrates the primary registration workflow state.
export function RegistrationFlow({
  divisionPricing,
  teams,
  rosters,
  onConfirm,
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

  const [entries, setEntries] = useState<RegistrationEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const handleClear = () => {
    setEntries([])
  }

  const handleConfirm = () => {
    onConfirm?.(entries)
    setEntries([])
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
          />

          <footer className="border-border/60 border-t pt-4">
            <p className="text-muted-foreground text-xs">
              Finalize once all divisions have assigned registrants.
            </p>
          </footer>
        </div>

        <aside className="mt-8 lg:mt-0 lg:sticky lg:top-24">
          <div className="border-border/60 bg-background/70 rounded-2xl border">
            <div className="border-border/60 space-y-1 border-b p-4">
              <h3 className="text-sm font-semibold text-foreground">Pricing Breakdown</h3>
              <p className="text-muted-foreground text-xs">
                Totals update automatically based on early bird and regular rates.
              </p>
            </div>
            <div className="p-4">
              <PricingBreakdownPanel
                entriesByDivision={groupedEntries}
                divisionPricing={divisionPricing}
              />
              <Button
                type="button"
                className="mt-4 w-full"
                onClick={handleConfirm}
                disabled={!entries.length}
              >
                Finalize registration
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <RegisterTeamModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        divisions={divisionOptions}
        teams={teamOptions}
        onSubmit={handleAddEntry}
      />
    </section>
  )
}

// --- Modal -----------------------------------------------------------------

type RegisterTeamModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  divisions: string[]
  teams: TeamOption[]
  onSubmit: (entry: RegistrationEntry) => void
}

function RegisterTeamModal({
  open,
  onOpenChange,
  divisions,
  teams,
  onSubmit,
}: RegisterTeamModalProps) {
  const [source, setSource] = useState<'existing' | 'upload'>('existing')
  const [division, setDivision] = useState<string>(divisions[0] ?? '')
  const [teamId, setTeamId] = useState<string>('')
  const [uploadTeamName, setUploadTeamName] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (open) {
      setSource('existing')
      setDivision(divisions[0] ?? '')
      setTeamId('')
      setUploadTeamName('')
      setFile(null)
    }
  }, [open, divisions])

  const filteredTeams = division
    ? teams.filter(team => !team.division || team.division === division)
    : teams

  const canSubmit = Boolean(division && (source === 'existing' ? teamId : file))

  const handleSubmit = () => {
    if (!canSubmit) return

    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `entry-${Date.now()}`

    if (source === 'existing') {
      const team = teams.find(t => t.id === teamId)
      if (!team) return
      onSubmit({
        id,
        division,
        mode: 'existing',
        teamId: team.id,
        teamName: team.name,
        teamSize: team.size,
      })
    } else {
      onSubmit({
        id,
        division,
        mode: 'upload',
        teamName: uploadTeamName || file?.name || 'Imported roster',
        fileName: file?.name,
      })
    }

    onOpenChange(false)
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(ROSTER_TEMPLATE_PATH)
      if (!response.ok) {
        throw new Error('Failed to load roster template')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'team-roster-template.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl gap-0">
        <DialogHeader className="mb-6">
          <DialogTitle>Register a team</DialogTitle>
          <DialogDescription>
            Select the team source, assign a division, and confirm to add it to the queue.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Team source
            </Label>
            <RadioGroup
              value={source}
              onValueChange={value => setSource(value as 'existing' | 'upload')}
              className="grid gap-2 sm:grid-cols-2"
            >
              <SourceCard
                value="existing"
                selected={source === 'existing'}
                title="Select existing team"
                description="Use a roster already stored in your club workspace."
              />
              <SourceCard
                value="upload"
                selected={source === 'upload'}
                title="Upload roster file"
                description="Import a CSV or Excel roster using the template."
              />
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Division
            </Label>
            <Select value={division} onValueChange={setDivision}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map(value => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {source === 'existing' ? (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">Team</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger className="w-full justify-between">
                  <SelectValue placeholder="Choose a team" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {filteredTeams.length ? (
                    filteredTeams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-muted-foreground px-3 py-2 text-sm">
                      There are no teams in this division.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Team name
                </Label>
                <Input
                  value={uploadTeamName}
                  onChange={event => setUploadTeamName(event.target.value)}
                  placeholder="Enter team name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Roster file
                </Label>
                <label className="border-border/70 text-muted-foreground hover:border-primary/60 flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-center text-sm transition">
                  <UploadIcon className="text-primary size-5" />
                  <span>{file?.name ?? 'Drop a CSV or Excel file, or browse'}</span>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="sr-only"
                    onChange={event => {
                      const nextFile = event.target.files?.[0] ?? null
                      setFile(nextFile)
                    }}
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleDownloadTemplate()}
                >
                  Download roster template
                </Button>
              </div>
            </div>
          )}
        </section>

        <DialogFooter className="flex flex-col gap-2 pb-0 sm:flex-row sm:justify-between sm:pb-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            Add team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SourceCard({
  value,
  selected,
  title,
  description,
}: {
  value: 'existing' | 'upload'
  selected: boolean
  title: string
  description: string
}) {
  return (
    <Label
      htmlFor={`source-${value}`}
      className={cn(
        'focus-visible:outline-primary cursor-pointer rounded-2xl border p-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        selected
          ? 'border-primary shadow-primary/10 shadow-md'
          : 'border-border/60 hover:border-primary/40'
      )}
    >
      <div className="flex items-start gap-3">
        <RadioGroupItem id={`source-${value}`} value={value} className="mt-1" />
        <div className="space-y-1">
          <p className="text-foreground text-sm font-medium">{title}</p>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
      </div>
    </Label>
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
}

function DivisionQueueSection({
  entriesByDivision,
  filteredEntriesByDivision,
  allEntries,
  divisionOptions,
  searchTerm,
  onRemoveEntry,
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
}

function DivisionTeamRow({ entry, onRemove }: DivisionTeamRowProps) {
  const [expanded, setExpanded] = useState(false)

  const toggleExpanded = () => setExpanded(prev => !prev)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleExpanded()
    }
  }

  // Team Capsule · Raw roster data for the accordion.
  const members = useMemo(() => entry.members ?? [], [entry.members])
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
              <table className="w-full table-auto text-left">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium sm:px-4">Name</th>
                    <th className="px-3 py-2 font-medium sm:px-4">DOB</th>
                    <th className="px-3 py-2 font-medium sm:px-5">Email</th>
                    <th className="px-3 py-2 font-medium sm:px-5">Phone</th>
                    <th className="px-3 py-2 text-right font-medium sm:px-4">Role</th>
                    <th className="px-3 py-2 text-right font-medium sm:px-4">Actions</th>
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
                        {member.type}
                      </td>
                      <td className="px-3 py-2 text-right sm:px-4">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={event => event.stopPropagation()}
                          aria-label={`Edit ${member.name}`}
                        >
                          <PenSquareIcon className="size-4" aria-hidden="true" />
                          <span className="sr-only">{`Edit ${member.name}`}</span>
                        </Button>
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
    </div>
  )
}

// --- Utilities -------------------------------------------------------------

type ActiveDivisionRate = {
  price: number
  tier: 'earlyBird' | 'regular'
}

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

function resolveDivisionPricing(pricing: DivisionPricing, referenceDate: Date): ActiveDivisionRate {
  if (pricing.earlyBird) {
    const deadline = parseIsoDateToLocal(pricing.earlyBird.deadline)
    if (referenceDate <= deadline) {
      return { price: pricing.earlyBird.price, tier: 'earlyBird' }
    }
  }

  return { price: pricing.regular.price, tier: 'regular' }
}

function parseIsoDateToLocal(value: string): Date {
  const [yearString, monthString, dayString] = value.split('-')
  const year = Number(yearString)
  const month = Number(monthString)
  const day = Number(dayString)

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return new Date(value)
  }

  const safeMonth = Math.max(1, Math.min(12, month || 1))
  const safeDay = Math.max(1, Math.min(31, day || 1))

  return new Date(year, safeMonth - 1, safeDay, 23, 59, 59, 999)
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

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  })
}
