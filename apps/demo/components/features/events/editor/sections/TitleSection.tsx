'use client'

import { Textarea } from '@workspace/ui/shadcn/textarea'
import { Label } from '@workspace/ui/shadcn/label'
import type { Event } from '@/types/events'

type TitleSectionProps = {
  eventData: Partial<Event>
  onUpdate: (updates: Partial<Event>) => void
}

export function TitleSection({ eventData, onUpdate }: TitleSectionProps) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="event-description">Description *</Label>
        <Textarea
          id="event-description"
          value={eventData.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Describe your event..."
          rows={6}
          className="w-full"
        />
      </div>
    </div>
  )
}
