'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/shadcn/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuth } from '@/components/providers/AuthProvider'
import { useOrganizerEventDrafts } from '@/hooks/useOrganizerEventDrafts'
import { useOrganizerEventPublished } from '@/hooks/useOrganizerEventPublished'
import { findOrganizerById } from '@/data/events/organizers'
import type { Event } from '@/types/events'
import { CheckIcon, CircleIcon, SettingsIcon } from 'lucide-react'
import { toast } from '@workspace/ui/shadcn/sonner'
import { Input } from '@workspace/ui/shadcn/input'
import { Label } from '@workspace/ui/shadcn/label'
import { GlassSelect } from '@workspace/ui/components/glass-select'
import { EditableEventDetailBody } from './EditableEventDetailBody'
import { EventSectionEditDialog } from './EventSectionEditDialog'

type InitialSetupData = {
  name: string
  type: 'Championship' | 'Friendly Competition'
  capacity: number
}

type EventEditorV2Props = {
  mode: 'create' | 'edit'
  eventId?: string
  initialEvent?: Partial<Event>
  initialData?: InitialSetupData
}

export function EventEditorV2({ mode, eventId, initialEvent, initialData }: EventEditorV2Props) {
  const router = useRouter()
  const { user } = useAuth()
  const organizerId = user?.organizerId
  const organizer = organizerId ? findOrganizerById(organizerId) : null

  const { getDraft, saveDraft, deleteDraft } = useOrganizerEventDrafts(organizerId)
  const { publishEvent, getPublishedEvent } = useOrganizerEventPublished(organizerId)

  // Check if this event was previously published
  const wasPublished = useMemo(() => {
    if (!eventId) return false
    const published = getPublishedEvent(eventId)
    return !!published
  }, [eventId, getPublishedEvent])

  // Load initial event data
  const [eventData, setEventData] = useState<Partial<Event>>(() => {
    if (mode === 'edit' && eventId) {
      // Try draft first, then initialEvent
      const draft = getDraft(eventId)
      if (draft) return draft
      if (initialEvent) return initialEvent
    }

    // For create mode, merge initialData from setup modal
    const capacity = initialData?.capacity || 0
    const baseData = {
      organizer: organizer?.name || '',
      status: 'draft' as const,
      slots: { filled: 0, capacity },
      type: initialData?.type || 'Championship',
      image: '',
      description: '',
      teams: capacity > 0 ? `0 / ${capacity} teams` : '0 / 0 teams',
      name: initialData?.name || '',
    }

    return initialEvent || baseData
  })

  const [isPublishing, setIsPublishing] = useState(false)
  const [currentEventId, setCurrentEventId] = useState<string | undefined>(eventId)
  const [showValidationNotice, setShowValidationNotice] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Event settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [settingsDraft, setSettingsDraft] = useState({
    name: '',
    type: 'Championship' as 'Championship' | 'Friendly Competition',
    capacity: 0,
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Update eventData when initialEvent changes (e.g., when auth loads)
  // Only update if we haven't made local edits yet
  useEffect(() => {
    if (mode === 'edit' && initialEvent && !hasInitialized) {
      // Check if draft exists - if so, use draft
      const draft = getDraft(eventId || '')
      if (draft) {
        setEventData(draft)
      } else {
        setEventData(initialEvent)
      }
      setHasInitialized(true)
    }
  }, [mode, initialEvent, eventId, getDraft, hasInitialized])

  // Determine current status
  const isPublished = eventData.status === 'published' || wasPublished
  const publishedDate = eventData.updatedAt ? new Date(eventData.updatedAt) : null

  // Track if published event has pending changes (compare with last published version)
  const hasChanges = useMemo(() => {
    if (!currentEventId || !wasPublished) return false
    const published = getPublishedEvent(currentEventId)
    if (!published) return false

    // Compare relevant fields to detect changes
    const fieldsToCompare = ['name', 'description', 'date', 'location', 'type', 'image'] as const
    return fieldsToCompare.some(field => eventData[field] !== published[field])
  }, [currentEventId, wasPublished, eventData, getPublishedEvent])

  // Update event data helper
  const updateEventData = useCallback((updates: Partial<Event>) => {
    setEventData(prev => ({ ...prev, ...updates }))
    // Clear validation notice when updating fields (user is actively editing)
    setShowValidationNotice(false)
  }, [])

  // Validate required fields
  const isValid = useCallback((): boolean => {
    return !!(
      eventData.name &&
      eventData.date &&
      eventData.location &&
      eventData.description
    )
  }, [eventData])

  const getValidationMessage = useCallback((): string | null => {
    const missing: string[] = []
    if (!eventData.name) missing.push('event name')
    if (!eventData.description) missing.push('description')
    if (!eventData.date) missing.push('event date')
    if (!eventData.location) missing.push('location')
    
    if (missing.length === 0) return null
    if (missing.length === 1) return `Missing ${missing[0]}`
    if (missing.length === 2) return `Missing ${missing[0]} and ${missing[1]}`
    return `Missing ${missing.slice(0, -1).join(', ')}, and ${missing[missing.length - 1]}`
  }, [eventData])

  // Save section to draft (called by EditableEventDetailBody on each section save)
  const handleSaveSection = useCallback(async (updatedData: Partial<Event>) => {
    if (!organizerId) return

    // Generate ID on first save for create mode
    const finalEventId = currentEventId || `event-${Date.now()}`
    
    // Merge current eventData with the updated data from the modal
    const mergedData = { ...eventData, ...updatedData }
    
    const draftEvent: Event = {
      ...mergedData,
      id: finalEventId,
      organizer: organizer?.name || '',
      status: isPublished ? 'published' : 'draft',
      updatedAt: new Date().toISOString(),
    } as Event

    saveDraft(draftEvent)
    
    // If creating and first save, navigate to edit page
    if (mode === 'create' && !currentEventId) {
      setCurrentEventId(finalEventId)
      router.replace(`/organizer/events/${finalEventId}/edit`)
    }
  }, [eventData, organizerId, organizer, currentEventId, mode, isPublished, saveDraft, router])

  // Publish event
  const handlePublish = useCallback(async () => {
    if (!organizerId) return
    
    if (!isValid()) {
      setShowValidationNotice(true)
      return
    }
    
    setShowValidationNotice(false)
    setIsPublishing(true)
    try {
      const finalEventId = currentEventId || `event-${Date.now()}`
      
      const finalEvent: Event = {
        ...eventData,
        id: finalEventId,
        organizer: organizer?.name || '',
        status: 'published',
        updatedAt: new Date().toISOString(),
      } as Event

      publishEvent(finalEvent)
      
      // Remove from drafts if it was there
      if (currentEventId) {
        deleteDraft(currentEventId)
      }

      toast.success('Event published successfully!')
      
      // Navigate to public event page
      router.push(`/events/${finalEvent.id}`)
    } catch (error) {
      toast.error('Failed to publish event')
      console.error(error)
    } finally {
      setIsPublishing(false)
    }
  }, [eventData, organizerId, organizer, currentEventId, isValid, publishEvent, deleteDraft, router])

  // Discard changes and revert to published version
  const handleDiscardChanges = useCallback(() => {
    if (!currentEventId) return
    const published = getPublishedEvent(currentEventId)
    if (published) {
      setEventData(published)
      deleteDraft(currentEventId) // Remove draft version with pending changes
      toast.success('Changes discarded')
    }
  }, [currentEventId, getPublishedEvent, deleteDraft])

  // Open settings modal with current values
  const handleOpenSettings = useCallback(() => {
    setSettingsDraft({
      name: eventData.name || '',
      type: (eventData.type as 'Championship' | 'Friendly Competition') || 'Championship',
      capacity: eventData.slots?.capacity || 0,
    })
    setShowSettingsModal(true)
  }, [eventData])

  // Save settings from modal
  const handleSaveSettings = useCallback(async () => {
    if (!organizerId) return

    setIsSavingSettings(true)
    try {
      const capacity = settingsDraft.capacity
      const updates: Partial<Event> = {
        name: settingsDraft.name,
        type: settingsDraft.type,
        slots: { filled: eventData.slots?.filled || 0, capacity },
        teams: capacity > 0 ? `${eventData.slots?.filled || 0} / ${capacity} teams` : '0 / 0 teams',
      }

      // Update local state
      updateEventData(updates)

      // Save to draft
      const finalEventId = currentEventId || `event-${Date.now()}`
      const mergedData = { ...eventData, ...updates }
      const draftEvent: Event = {
        ...mergedData,
        id: finalEventId,
        organizer: organizer?.name || '',
        status: isPublished ? 'published' : 'draft',
        updatedAt: new Date().toISOString(),
      } as Event

      saveDraft(draftEvent)

      if (mode === 'create' && !currentEventId) {
        setCurrentEventId(finalEventId)
        router.replace(`/organizer/events/${finalEventId}/edit`)
      }

      toast.success('Event settings saved')
      setShowSettingsModal(false)
    } catch (error) {
      toast.error('Failed to save settings')
      console.error(error)
    } finally {
      setIsSavingSettings(false)
    }
  }, [settingsDraft, eventData, organizerId, organizer, currentEventId, mode, isPublished, saveDraft, router, updateEventData])

  return (
    <section className="flex min-h-screen flex-col">
      <PageHeader
        title={eventData.name || 'Untitled Event'}
        eyebrow={mode === 'create' ? 'Event Creation' : 'Event Editing'}
        gradient={organizer?.gradient}
      />

      {/* Toolbar Actions */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
          <div className="flex items-center justify-between gap-3 py-3">
            {/* Status Line */}
            <div className="flex items-center gap-2 text-sm">
              {isPublished ? (
                <>
                  <CircleIcon className="size-2 fill-green-500 text-green-500" />
                  <span className="text-muted-foreground">
                    Published
                    {publishedDate && (
                      <> • {publishedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                    )}
                  </span>
                </>
              ) : (
                <>
                  <CircleIcon className="size-2 fill-amber-500 text-amber-500" />
                  <span className="text-muted-foreground">Draft • Unpublished</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleOpenSettings}
              >
                <SettingsIcon className="mr-2 size-4" />
                Event Settings
              </Button>
              {isPublished && hasChanges && (
                <Button
                  variant="outline"
                  onClick={handleDiscardChanges}
                >
                  Discard Changes
                </Button>
              )}
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
              >
                <CheckIcon className="mr-2 size-4" />
                {isPublishing ? 'Publishing...' : isPublished ? 'Republish Event' : 'Publish Event'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <EditableEventDetailBody
        eventData={eventData}
        onUpdate={updateEventData}
        onSave={handleSaveSection}
        organizerGradient={organizer?.gradient || 'teal'}
        validationNotice={showValidationNotice ? getValidationMessage() : undefined}
      />

      {/* Event Settings Modal */}
      <EventSectionEditDialog
        open={showSettingsModal}
        onOpenChange={(open) => !open && setShowSettingsModal(false)}
        title="Event Settings"
        description="Edit the event title, type, and team capacity"
        onSave={handleSaveSettings}
        onCancel={() => setShowSettingsModal(false)}
        isSaving={isSavingSettings}
      >
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Title *</Label>
            <Input
              id="event-name"
              value={settingsDraft.name}
              onChange={(e) => setSettingsDraft(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter event name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-type">Event Type</Label>
            <GlassSelect
              value={settingsDraft.type}
              onValueChange={(value) => setSettingsDraft(prev => ({ ...prev, type: value as 'Championship' | 'Friendly Competition' }))}
              options={[
                { value: 'Championship', label: 'Championship' },
                { value: 'Friendly Competition', label: 'Friendly Competition' },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-capacity">Team Capacity</Label>
            <Input
              id="event-capacity"
              type="number"
              min={0}
              value={settingsDraft.capacity || ''}
              onChange={(e) => setSettingsDraft(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
              placeholder="Maximum number of teams"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty or set to 0 for unlimited capacity
            </p>
          </div>
        </div>
      </EventSectionEditDialog>
    </section>
  )
}

