"use client"

import { useMemo } from 'react'

import type { RegistrationEntry, RegistrationMember, EntryStatusMeta } from './types'
import { TeamRow } from './TeamRow'
import { Card, CardContent, CardHeader } from '@workspace/ui/shadcn/card'
import { UsersIcon } from 'lucide-react'

export type DivisionQueueSectionProps = {
  entriesByDivision: Record<string, RegistrationEntry[]>
  filteredEntriesByDivision: Record<string, RegistrationEntry[]>
  allEntries: RegistrationEntry[]
  divisionOptions: string[]
  searchTerm: string
  onRemoveEntry: (id: string) => void
  onUpdateEntryMembers: (id: string, members: RegistrationMember[]) => void
  readOnly: boolean
  getEntryStatus: (entry: RegistrationEntry) => EntryStatusMeta
}

export function DivisionQueueSection({
  entriesByDivision,
  filteredEntriesByDivision,
  allEntries,
  divisionOptions,
  searchTerm,
  onRemoveEntry,
  onUpdateEntryMembers,
  readOnly,
  getEntryStatus,
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
      <div className="border-border/70 text-muted-foreground rounded-2xl border border-dashed p-6 text-center body-small">
        {searchTerm
          ? 'No teams match your search yet.'
          : 'No teams added yet. Start by registering a team.'}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {divisionsToRender.map(divisionName => {
        const divisionEntries =
          (searchTerm
            ? filteredEntriesByDivision[divisionName]
            : entriesByDivision[divisionName]) ?? []

        return (
          <Card key={divisionName} className="border-border/60 gap-0 p-0">
            <CardHeader className="border-border/60 flex items-center justify-between border-b !px-6 !py-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="heading-4">{divisionName}</p>
              </div>
              <span className={`body-small font-medium ${divisionEntries.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                {divisionEntries.length} {divisionEntries.length === 1 ? 'team' : 'teams'}
              </span>
            </CardHeader>
            <CardContent className="p-4">
              {divisionEntries.length ? (
                divisionEntries.map(entry => (
                  <TeamRow
                    key={entry.id}
                    entry={entry}
                    onRemove={() => onRemoveEntry(entry.id)}
                    onUpdateMembers={members => onUpdateEntryMembers(entry.id, members)}
                    status={getEntryStatus(entry)}
                    readOnly={readOnly}
                  />
                ))
              ) : (
                <div className="border-border/60 text-muted-foreground flex flex-col items-center gap-3 border border-dashed p-8 text-center body-small">
                  <UsersIcon className="size-8 text-muted-foreground/40" />
                  No teams registered for this division yet.
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
