'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/shadcn/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@workspace/ui/shadcn/accordion'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuth } from '@/components/providers/AuthProvider'
import { useOrganizerEventDrafts } from '@/hooks/useOrganizerEventDrafts'
import { useOrganizerEventPublished } from '@/hooks/useOrganizerEventPublished'
import { findOrganizerById } from '@/data/events/organizers'
import type { Event } from '@/types/events'
import { TitleSection } from './sections/TitleSection'
import { TimelineSection } from './sections/TimelineSection'
import { DateLocationSection } from './sections/DateLocationSection'
import { GallerySection } from './sections/GallerySection'
import { PricingSection } from './sections/PricingSection'
import { DocumentsSection } from './sections/DocumentsSection'
import { SaveIcon, CheckIcon } from 'lucide-react'

type EventEditorProps = {
  mode: 'create' | 'edit'
  eventId?: string
  initialEvent?: Partial<Event>
}

export function EventEditor({ mode, eventId, initialEvent }: EventEditorProps) {
  const router = useRouter()
  const { user } = useAuth()
  const organizerId = user?.organizerId
  const organizer = organizerId ? findOrganizerById(organizerId) : null

  const { getDraft, saveDraft, deleteDraft } = useOrganizerEventDrafts(organizerId)
  const { publishEvent } = useOrganizerEventPublished(organizerId)

  // Load initial event data
  const [eventData, setEventData] = useState<Partial<Event>>(() => {
    if (mode === 'edit' && eventId) {
      // Try draft first, then initialEvent
      const draft = getDraft(eventId)
      if (draft) return draft
      if (initialEvent) return initialEvent
    }
    return initialEvent || {
      organizer: organizer?.name || '',
      status: 'draft',
      slots: { filled: 0, capacity: 0 },
      type: 'Championship',
      image: '',
      description: '',
      teams: '0 / 0 teams',
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // Update event data helper
  const updateEventData = useCallback((updates: Partial<Event>) => {
    setEventData(prev => ({ ...prev, ...updates }))
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

  // Save draft
  const handleSaveDraft = useCallback(async () => {
    if (!organizerId) return

    setIsSaving(true)
    try {
      const draftEvent: Event = {
        ...eventData,
        id: eventId || `event-${Date.now()}`,
        organizer: organizer?.name || '',
        status: 'draft',
        updatedAt: new Date().toISOString(),
      } as Event

      saveDraft(draftEvent)
      
      // If creating, navigate to edit page
      if (mode === 'create' && !eventId) {
        router.push(`/organizer/events/${draftEvent.id}/edit`)
      }
    } finally {
      setIsSaving(false)
    }
  }, [eventData, organizerId, organizer, eventId, mode, saveDraft, router])

  // Publish event
  const handlePublish = useCallback(async () => {
    if (!organizerId || !isValid()) return

    setIsPublishing(true)
    try {
      const finalEvent: Event = {
        ...eventData,
        id: eventId || `event-${Date.now()}`,
        organizer: organizer?.name || '',
        status: 'published',
        updatedAt: new Date().toISOString(),
      } as Event

      publishEvent(finalEvent)
      
      // Remove from drafts if it was there
      if (eventId) {
        deleteDraft(eventId)
      }

      // Navigate to public event page
      router.push(`/events/${finalEvent.id}`)
    } finally {
      setIsPublishing(false)
    }
  }, [eventData, organizerId, organizer, eventId, isValid, publishEvent, deleteDraft, router])

  // Auto-save draft on changes (debounced)
  useEffect(() => {
    if (mode === 'edit' && eventId && eventData.name) {
      const timer = setTimeout(() => {
        handleSaveDraft()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [eventData, mode, eventId, handleSaveDraft])

  return (
    <section className="flex min-h-screen flex-col">
      <PageHeader
        title={mode === 'create' ? 'Create Event' : 'Edit Event'}
        gradient={organizer?.gradient}
      />

      {/* Toolbar Actions */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="text-sm text-muted-foreground">
              {!isValid() && <span className="text-amber-600">Please fill in all required fields</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving || isPublishing}
              >
                <SaveIcon className="mr-2 size-4" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isSaving || isPublishing || !isValid()}
              >
                <CheckIcon className="mr-2 size-4" />
                {isPublishing ? 'Publishing...' : 'Publish Event'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <Accordion type="multiple" defaultValue={['title', 'timeline', 'date-location', 'gallery', 'pricing', 'documents']} className="w-full space-y-8">
          <AccordionItem value="title" className="border-0">
            <div className="h-px w-full bg-border" />
            <AccordionTrigger className="px-0 py-4 hover:no-underline [&[data-state=open]]:pb-2">
              <p className="heading-4">Title & Description</p>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0">
              <TitleSection
                eventData={eventData}
                onUpdate={updateEventData}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="timeline" className="border-0">
            <div className="h-px w-full bg-border" />
            <AccordionTrigger className="px-0 py-4 hover:no-underline [&[data-state=open]]:pb-2">
              <p className="heading-4">Registration Timeline</p>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0">
              <TimelineSection
                eventData={eventData}
                onUpdate={updateEventData}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="date-location" className="border-0">
            <div className="h-px w-full bg-border" />
            <AccordionTrigger className="px-0 py-4 hover:no-underline [&[data-state=open]]:pb-2">
              <p className="heading-4">Date & Location</p>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0">
              <DateLocationSection
                eventData={eventData}
                onUpdate={updateEventData}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="gallery" className="border-0">
            <div className="h-px w-full bg-border" />
            <AccordionTrigger className="px-0 py-4 hover:no-underline [&[data-state=open]]:pb-2">
              <p className="heading-4">Gallery</p>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0">
              <GallerySection
                eventData={eventData}
                onUpdate={updateEventData}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pricing" className="border-0">
            <div className="h-px w-full bg-border" />
            <AccordionTrigger className="px-0 py-4 hover:no-underline [&[data-state=open]]:pb-2">
              <p className="heading-4">Pricing</p>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0">
              <PricingSection
                eventData={eventData}
                onUpdate={updateEventData}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="documents" className="border-0">
            <div className="h-px w-full bg-border" />
            <AccordionTrigger className="px-0 py-4 hover:no-underline [&[data-state=open]]:pb-2">
              <p className="heading-4">Documents</p>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0">
              <DocumentsSection
                eventData={eventData}
                onUpdate={updateEventData}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}

