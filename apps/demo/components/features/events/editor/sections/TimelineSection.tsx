'use client'

import { useState, useCallback } from 'react'
import { Button } from '@workspace/ui/shadcn/button'
import { DatePicker } from '@workspace/ui/shadcn/date-picker'
import { Input } from '@workspace/ui/shadcn/input'
import { Label } from '@workspace/ui/shadcn/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/shadcn/dialog'
import { PlusIcon, PencilIcon } from 'lucide-react'
import type { Event } from '@/types/events'

type TimelineSectionProps = {
  eventData: Partial<Event>
  onUpdate: (updates: Partial<Event>) => void
}

type TimelinePhaseType = 'earlyBird' | 'registration'

type EditingPhase = {
  type: TimelinePhaseType
  date: Date | undefined
  time: string
}

export function TimelineSection({ eventData, onUpdate }: TimelineSectionProps) {
  const [editingPhase, setEditingPhase] = useState<EditingPhase | null>(null)

  const earlyBirdDate = eventData.earlyBirdDeadline ? new Date(eventData.earlyBirdDeadline) : undefined
  const validEarlyBirdDate = earlyBirdDate && !Number.isNaN(earlyBirdDate.getTime()) ? earlyBirdDate : undefined

  const registrationDate = eventData.registrationDeadline ? new Date(eventData.registrationDeadline) : undefined
  const validRegistrationDate = registrationDate && !Number.isNaN(registrationDate.getTime()) ? registrationDate : undefined

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const getTimeFromDate = (date: Date | undefined): string => {
    if (!date) return '23:59'
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const openEditDialog = useCallback((type: TimelinePhaseType) => {
    const date = type === 'earlyBird' ? validEarlyBirdDate : validRegistrationDate
    setEditingPhase({
      type,
      date,
      time: getTimeFromDate(date),
    })
  }, [validEarlyBirdDate, validRegistrationDate])

  const handleSave = useCallback(() => {
    if (!editingPhase) return

    const { type, date, time } = editingPhase
    
    if (date) {
      const [hours, minutes] = time.split(':').map(Number)
      const fullDate = new Date(date)
      fullDate.setHours(hours || 0, minutes || 0, 0, 0)
      
      if (type === 'earlyBird') {
        onUpdate({ earlyBirdDeadline: fullDate.toISOString() })
      } else {
        onUpdate({ registrationDeadline: fullDate.toISOString() })
      }
    }
    
    setEditingPhase(null)
  }, [editingPhase, onUpdate])

  const handleRemove = useCallback((type: TimelinePhaseType) => {
    if (type === 'earlyBird') {
      onUpdate({ earlyBirdDeadline: undefined })
    } else {
      onUpdate({ registrationDeadline: undefined })
    }
    setEditingPhase(null)
  }, [onUpdate])

  const getPhaseStatus = useCallback((deadline: Date | undefined) => {
    if (!deadline) return 'pending'
    const now = new Date()
    return deadline > now ? 'active' : 'passed'
  }, [])

  const earlyBirdStatus = getPhaseStatus(validEarlyBirdDate)
  const registrationStatus = getPhaseStatus(validRegistrationDate)

  return (
    <div className="flex flex-col gap-3 pt-2">
      {/* Early Bird Phase */}
      {validEarlyBirdDate ? (
        <TimelineCard
          title="Early Bird Pricing"
          subtitle={`Ends ${formatDate(validEarlyBirdDate)} at ${formatTime(validEarlyBirdDate)}`}
          status={earlyBirdStatus}
          onEdit={() => openEditDialog('earlyBird')}
          onRemove={() => handleRemove('earlyBird')}
        />
      ) : (
        <EmptyTimelineCard
          title="Early Bird Pricing"
          description="Optional: Add early bird pricing deadline"
          onClick={() => openEditDialog('earlyBird')}
        />
      )}

      {/* Registration Open Phase - always shown as info */}
      <TimelineCard
        title="Registration Open"
        subtitle={validRegistrationDate 
          ? `Open until ${formatDate(validRegistrationDate)}`
          : 'Set registration deadline below'
        }
        status="info"
      />

      {/* Registration Closes Phase */}
      {validRegistrationDate ? (
        <TimelineCard
          title="Registration Closes"
          subtitle={`${formatDate(validRegistrationDate)} at ${formatTime(validRegistrationDate)}`}
          status={registrationStatus}
          onEdit={() => openEditDialog('registration')}
          isRequired
        />
      ) : (
        <EmptyTimelineCard
          title="Registration Deadline"
          description="Required: Set when registration closes"
          onClick={() => openEditDialog('registration')}
          isRequired
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPhase} onOpenChange={(open) => !open && setEditingPhase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPhase?.type === 'earlyBird' ? 'Early Bird Deadline' : 'Registration Deadline'}
            </DialogTitle>
            <DialogDescription>
              {editingPhase?.type === 'earlyBird' 
                ? 'Set when early bird pricing ends'
                : 'Set the last day clubs can register for this event'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker
                date={editingPhase?.date}
                onDateChange={(date) => setEditingPhase(prev => prev ? { ...prev, date } : null)}
                placeholder="Select date"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={editingPhase?.time || '23:59'}
                onChange={(e) => setEditingPhase(prev => prev ? { ...prev, time: e.target.value } : null)}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter>
            {editingPhase?.type === 'earlyBird' && validEarlyBirdDate && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemove('earlyBird')}
                className="mr-auto"
              >
                Remove
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => setEditingPhase(null)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSave}
              disabled={!editingPhase?.date}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type TimelineCardProps = {
  title: string
  subtitle: string
  status: 'active' | 'passed' | 'pending' | 'info'
  onEdit?: () => void
  onRemove?: () => void
  isRequired?: boolean
}

function TimelineCard({ title, subtitle, status, onEdit }: TimelineCardProps) {
  const statusStyles = {
    active: {
      border: 'border-primary/50',
      background: 'bg-primary/5',
      dot: 'bg-primary',
      text: 'text-foreground',
    },
    passed: {
      border: 'border-border',
      background: 'bg-muted/30',
      dot: 'bg-muted-foreground',
      text: 'text-muted-foreground',
    },
    pending: {
      border: 'border-border',
      background: 'bg-card',
      dot: 'bg-muted-foreground',
      text: 'text-muted-foreground',
    },
    info: {
      border: 'border-border',
      background: 'bg-card',
      dot: 'bg-muted-foreground',
      text: 'text-muted-foreground',
    },
  }

  const styles = statusStyles[status]

  return (
    <div className={`relative rounded-md border p-4 transition-all ${styles.border} ${styles.background}`}>
      <div className="flex items-center gap-3">
        <div className={`size-2.5 shrink-0 rounded-full ${styles.dot}`} />
        <div className="flex items-center gap-2 flex-1">
          <p className={`body-text font-semibold ${styles.text}`}>
            {title}
          </p>
          <span className="body-text text-muted-foreground">•</span>
          <p className="body-text text-muted-foreground flex-1">
            {subtitle}
          </p>
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="size-8"
            >
              <PencilIcon className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

type EmptyTimelineCardProps = {
  title: string
  description: string
  onClick: () => void
  isRequired?: boolean
}

function EmptyTimelineCard({ title, description, onClick, isRequired }: EmptyTimelineCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-md border-2 border-dashed border-border p-4 transition-all hover:border-primary/50 hover:bg-primary/5 text-left w-full group"
    >
      <div className="flex items-center gap-3">
        <div className="size-8 shrink-0 rounded-full border-2 border-dashed border-border flex items-center justify-center group-hover:border-primary/50">
          <PlusIcon className="size-4 text-muted-foreground group-hover:text-primary" />
        </div>
        <div className="flex flex-col">
          <p className="body-text font-semibold text-muted-foreground group-hover:text-foreground">
            {title} {isRequired && <span className="text-destructive">*</span>}
          </p>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </button>
  )
}
