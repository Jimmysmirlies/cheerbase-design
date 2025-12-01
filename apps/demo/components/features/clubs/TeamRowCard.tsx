'use client'

import { useMemo } from 'react'

import { Button } from '@workspace/ui/shadcn/button'
import type { RegistrationMember } from '@/components/features/registration/flow/types'

export type TeamData = {
  id: string
  name: string
  division: string
  members?: RegistrationMember[]
}

type TeamRowCardProps = {
  team: TeamData
  onViewTeam: (teamId: string) => void
}

export function TeamRowCard({ team, onViewTeam }: TeamRowCardProps) {
  const memberCount = useMemo(() => team.members?.length ?? 0, [team.members])
  const { divisionLabel, levelLabel } = useMemo(() => {
    const parts = (team.division ?? '').split('-').map(part => part.trim()).filter(Boolean)
    if (!parts.length) {
      return { divisionLabel: '—', levelLabel: '—' }
    }
    if (parts.length === 1) {
      return { divisionLabel: parts[0], levelLabel: '—' }
    }
    const level = parts.pop() ?? '—'
    return { divisionLabel: parts.join(' - '), levelLabel: level }
  }, [team.division])

  return (
    <div className="border-border/70 bg-background/80 border shadow-sm">
      <div className="px-5 pt-6 pb-4">
        <h3 className="heading-4 text-foreground">{team.name}</h3>
        <div className="bg-border mt-2 h-px w-full" />
      </div>
      <div className="px-5 pb-2 text-sm text-foreground">
        <div className="flex items-center justify-between py-2">
          <span className="text-muted-foreground">Division</span>
          <span className="font-medium truncate text-right">{divisionLabel}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border/70 py-2">
          <span className="text-muted-foreground">Level</span>
          <span className="font-medium">{levelLabel}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border/70 py-2">
          <span className="text-muted-foreground">Athletes</span>
          <span className="font-medium">{memberCount}</span>
        </div>
      </div>
      <div className="border-t border-border/70 px-5 py-3">
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => onViewTeam(team.id)}>
            View team
          </Button>
        </div>
      </div>
    </div>
  )
}
