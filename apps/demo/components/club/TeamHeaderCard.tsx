'use client'

/**
 * TeamHeaderCard
 *
 * Purpose
 * - Compact, reusable header card for a team with title, meta badges, and an Edit action.
 */
import { Badge } from '@workspace/ui/shadcn/badge'
import { Card, CardContent } from '@workspace/ui/shadcn/card'

import { Layers as LayersIcon, Mars as MarsIcon, Users as UsersIcon } from 'lucide-react'

import TeamSettingsDialog from '@/components/club/TeamSettingsDialog'

type Props = {
  name: string
  division: string
  size: number
  coedCount: number
}

export default function TeamHeaderCard({ name, division, size, coedCount }: Props) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
            <TeamSettingsDialog
              initialName={name}
              initialDivision={division}
              initialCoed={coedCount}
              triggerLabel="Edit"
              triggerVariant="secondary"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="inline-flex items-center gap-1">
            <LayersIcon className="h-3.5 w-3.5" />
            <span className="text-xs">{division || 'TBD'}</span>
          </Badge>
          <Badge variant="outline" className="inline-flex items-center gap-1">
            <UsersIcon className="h-3.5 w-3.5" />
            <span className="text-xs">Size {size}</span>
          </Badge>
          <Badge variant="outline" className="inline-flex items-center gap-1">
            <MarsIcon className="h-3.5 w-3.5" />
            <span className="text-xs">COED {coedCount}</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
