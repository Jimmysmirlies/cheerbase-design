'use client'

import { useMemo } from 'react'
import { BarChart3Icon, LayersIcon, UsersIcon, type LucideIcon } from 'lucide-react'

import { Button } from '@workspace/ui/shadcn/button'
import { Card, CardContent, CardFooter } from '@workspace/ui/shadcn/card'
import type { RegistrationMember } from '@/components/features/registration/flow/types'

export type TeamData = {
  id: string
  name: string
  division: string
  members?: RegistrationMember[]
}

type TeamCardProps = {
  team: TeamData
  onViewTeam: (teamId: string) => void
}

export function TeamCard({ team, onViewTeam }: TeamCardProps) {
  const { divisionLabel, levelLabel } = useMemo(() => parseDivision(team.division), [team.division])
  const memberCount = useMemo(() => team.members?.length ?? 0, [team.members])
  const memberLabel = memberCount === 1 ? 'member' : 'members'

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-md border border-border/60 bg-background/80 p-0 shadow-sm">
      <CardContent className="flex flex-1 flex-col gap-4 px-5 py-4">
        <h3 className="text-base font-semibold text-foreground">{team.name}</h3>
        <div className="space-y-2.5 text-sm text-muted-foreground">
          <DetailRow icon={LayersIcon} label="Division" value={divisionLabel !== '—' ? divisionLabel : 'Pending'} />
          <DetailRow icon={BarChart3Icon} label="Level" value={levelLabel !== '—' ? levelLabel : 'Pending'} />
          <DetailRow icon={UsersIcon} label="Member count" value={`${memberCount} ${memberLabel}`} />
        </div>
      </CardContent>
      <CardFooter className="border-border/80 mt-auto border-t !px-5 !py-4">
        <Button variant="secondary" size="lg" className="w-full rounded-md" onClick={() => onViewTeam(team.id)}>
          View
        </Button>
      </CardFooter>
    </Card>
  )
}

function DetailRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="text-primary/70 size-4 shrink-0" aria-hidden="true" />
      <span className="leading-tight text-muted-foreground">
        <span className="font-medium text-foreground">{label}: </span>
        {value}
      </span>
    </div>
  )
}

function parseDivision(division: string) {
  const parts = division
    .split('-')
    .map(part => part.trim())
    .filter(Boolean)
  if (!parts.length) {
    return { divisionLabel: '—', levelLabel: '—' }
  }
  if (parts.length === 1) {
    return { divisionLabel: parts[0] ?? '—', levelLabel: '—' }
  }
  const level = parts.pop() ?? '—'
  const divisionLabel = parts.length ? parts.join(' - ') : '—'
  return { divisionLabel, levelLabel: level }
}
