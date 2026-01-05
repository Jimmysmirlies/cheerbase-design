'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@workspace/ui/shadcn/button'
import { Alert, AlertDescription } from '@workspace/ui/shadcn/alert'
import { AlertCircleIcon, PencilIcon, MapPinIcon, ExternalLinkIcon, DownloadIcon } from 'lucide-react'
import { fadeInUp, staggerSections } from '@/lib/animations'
import { EventGallery } from '@/components/ui/gallery/EventGallery'
import { OrganizerCard } from '@/components/features/clubs/OrganizerCard'
import { EventTableOfContents } from '@/components/features/events/EventTableOfContents'
import { EventSectionBadges } from '@/components/features/events/EventSectionBadges'
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
} from '@/components/ui/tables'
import type { BrandGradient } from '@/lib/gradients'
import type { Event } from '@/types/events'
import { buildEventDetailProps } from './buildEventDetailProps'
import { EventSectionEditDialog } from './EventSectionEditDialog'
import { TitleSection } from './sections/TitleSection'
import { TimelineSection } from './sections/TimelineSection'
import { DateLocationSection } from './sections/DateLocationSection'
import { GallerySection } from './sections/GallerySection'
import { PricingSection } from './sections/PricingSection'
import { DocumentsSection } from './sections/DocumentsSection'
import { findOrganizerByName, formatFollowers, formatHostingDuration } from '@/data/events/organizers'
import { toast } from '@workspace/ui/shadcn/sonner'
import { EmptyStateButton } from '@/components/ui/buttons/EmptyStateButton'

type EditableEventDetailBodyProps = {
  eventData: Partial<Event>
  onUpdate: (updates: Partial<Event>) => void
  onSave: (updatedData: Partial<Event>) => Promise<void>
  organizerGradient: BrandGradient
  /** Validation message to show above overview when user tries to publish with missing fields */
  validationNotice?: string | null
}

type SectionModal = 
  | 'title'
  | 'timeline'
  | 'date-location'
  | 'gallery'
  | 'pricing'
  | 'documents'
  | null

export function EditableEventDetailBody({
  eventData,
  onUpdate,
  onSave,
  organizerGradient,
  validationNotice,
}: EditableEventDetailBodyProps) {
  const [openModal, setOpenModal] = useState<SectionModal>(null)
  const [localDraft, setLocalDraft] = useState<Partial<Event>>({})
  const [isSaving, setIsSaving] = useState(false)

  const organizer = useMemo(() => {
    return eventData.organizer ? findOrganizerByName(eventData.organizer) : null
  }, [eventData.organizer])

  // Build props for rendering
  const detailProps = useMemo(() => {
    return buildEventDetailProps({
      event: eventData,
      organizerGradient,
      organizerFollowers: organizer ? formatFollowers(organizer.followers) : '—',
      organizerEventsCount: organizer?.eventsCount,
      organizerHostingDuration: organizer ? formatHostingDuration(organizer.hostingYears) : undefined,
    })
  }, [eventData, organizerGradient, organizer])

  // Open modal with local draft
  const handleOpenModal = useCallback((section: SectionModal) => {
    setLocalDraft(eventData)
    setOpenModal(section)
  }, [eventData])

  // Save changes from modal
  const handleModalSave = useCallback(async () => {
    setIsSaving(true)
    try {
      onUpdate(localDraft)
      await onSave(localDraft)
      toast.success('Section saved')
      setOpenModal(null)
    } catch (error) {
      toast.error('Failed to save')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }, [localDraft, onUpdate, onSave])

  // Cancel modal
  const handleModalCancel = useCallback(() => {
    setLocalDraft({})
    setOpenModal(null)
  }, [])

  // Update local draft
  const updateLocalDraft = useCallback((updates: Partial<Event>) => {
    setLocalDraft(prev => ({ ...prev, ...updates }))
  }, [])

  // Check if sections have content
  const hasOverview = !!eventData.description
  const hasTimeline = !!eventData.registrationDeadline
  const hasDateLocation = !!eventData.date && (!!eventData.location || !!eventData.venue)
  const hasGallery = !!(eventData.image || (eventData.gallery && eventData.gallery.length > 0))
  const hasPricing = !!(eventData.availableDivisions && eventData.availableDivisions.length > 0)
  const hasDocuments = !!(eventData.documents && eventData.documents.length > 0)

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <motion.article 
            className="space-y-8 min-w-0 overflow-hidden"
            variants={staggerSections}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Section Navigation Badges */}
            <div className="lg:hidden">
              <EventSectionBadges />
            </div>

            {/* Validation notice - shown when user tries to publish with missing info */}
            {validationNotice && (
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
                <AlertCircleIcon className="size-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  {validationNotice}. Please complete all required fields before publishing.
                </AlertDescription>
              </Alert>
            )}

            {/* Overview Section */}
            <motion.div variants={fadeInUp}>
              <div id="overview" className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="heading-4">Overview</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal('title')}
                  >
                    <PencilIcon className="mr-2 size-4" />
                    Edit
                  </Button>
                </div>
                {hasOverview ? (
                  <p className="text-muted-foreground body-text">
                    {eventData.description}
                  </p>
                ) : (
                  <EmptyStateButton
                    title="Add event name and description"
                    description="Provide a compelling overview of your event"
                    onClick={() => handleOpenModal('title')}
                  />
                )}
              </div>
            </motion.div>

            {/* Registration Timeline Section */}
            <motion.div variants={fadeInUp}>
              <div id="registration-timeline" className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between">
                  <p className="heading-4">Registration Timeline</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal('timeline')}
                  >
                    <PencilIcon className="mr-2 size-4" />
                    Edit
                  </Button>
                </div>
                {hasTimeline ? (
                  <div className="flex flex-col gap-3">
                    {detailProps.timelinePhases.map((phase) => (
                      <div 
                        key={phase.id}
                        className={`relative rounded-md border p-4 transition-all overflow-hidden ${phase.border} ${phase.background}`}
                        style={phase.usesGradient && phase.borderColor ? {
                          borderColor: `${phase.borderColor}50`,
                        } : undefined}
                      >
                        {phase.isCurrent && phase.gradientBg && (
                          <div
                            className="absolute inset-0 opacity-[0.03]"
                            style={{
                              backgroundImage: phase.gradientBg,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                        )}
                        <div className="relative z-10 flex items-center gap-3">
                          <div 
                            className={`size-2.5 shrink-0 rounded-full ${phase.dot}`}
                            style={phase.usesGradient && phase.dotColor ? {
                              backgroundColor: phase.dotColor,
                            } : undefined}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <p className={`body-text font-semibold ${
                              phase.isCurrent ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {phase.title}
                            </p>
                            {phase.subtitle && (
                              <>
                                <span className="body-text text-muted-foreground">•</span>
                                <p className="body-text text-muted-foreground">
                                  {phase.subtitle}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyStateButton
                    title="Set registration timeline"
                    description="Define registration and early bird deadlines"
                    onClick={() => handleOpenModal('timeline')}
                  />
                )}
              </div>
            </motion.div>

            {/* Date & Location Section */}
            <motion.div variants={fadeInUp}>
              <div id="date-location" className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between">
                  <p className="heading-4">Date & Location</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal('date-location')}
                  >
                    <PencilIcon className="mr-2 size-4" />
                    Edit
                  </Button>
                </div>
                {hasDateLocation ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-3">
                      {/* Date */}
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 flex-col items-center justify-center rounded-md border bg-muted/30 overflow-hidden">
                          <span className="text-[10px] font-medium text-muted-foreground leading-none">{detailProps.eventDateParts.month}</span>
                          <span className="text-lg font-semibold text-foreground leading-none">{detailProps.eventDateParts.day}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {detailProps.eventDateParts.weekday}, {detailProps.eventDateParts.fullDate}
                          </span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-md border bg-muted/30">
                          <MapPinIcon className="size-5 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <Link
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detailProps.event.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-foreground hover:underline inline-flex items-center gap-1"
                          >
                            {detailProps.venueName}
                            <ExternalLinkIcon className="size-3" />
                          </Link>
                          <span className="text-xs text-muted-foreground">{detailProps.cityState}</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border border-border/70 bg-muted/50">
                      <iframe
                        src={`https://www.google.com/maps?q=${encodeURIComponent(detailProps.event.location)}&output=embed`}
                        className="absolute inset-0 h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Map of ${detailProps.event.location}`}
                      />
                      <Link
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detailProps.event.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-10"
                        aria-label={`Open ${detailProps.event.location} in Google Maps`}
                      />
                    </div>
                  </div>
                ) : (
                  <EmptyStateButton
                    title="Add event date and venue"
                    description="Set when and where your event will take place"
                    onClick={() => handleOpenModal('date-location')}
                  />
                )}
              </div>
            </motion.div>

            {/* Gallery Section */}
            <motion.div variants={fadeInUp}>
              <div id="gallery" className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between">
                  <p className="heading-4">Gallery</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal('gallery')}
                  >
                    <PencilIcon className="mr-2 size-4" />
                    Edit
                  </Button>
                </div>
                {hasGallery ? (
                  <EventGallery images={detailProps.galleryImages} alt={detailProps.event.name} maxImages={4} />
                ) : (
                  <EmptyStateButton
                    title="Add event images"
                    description="Upload photos to showcase your event"
                    onClick={() => handleOpenModal('gallery')}
                  />
                )}
              </div>
            </motion.div>

            {/* Organizer Section - Not editable */}
            {organizer && (
              <motion.div variants={fadeInUp}>
                <div id="organizer" className="flex flex-col gap-4">
                  <div className="h-px w-full bg-border" />
                  <p className="heading-4">Organizer</p>
                  <OrganizerCard
                    name={detailProps.event.organizer}
                    gradient={organizerGradient}
                    followers={detailProps.organizerFollowers}
                    eventsCount={detailProps.organizerEventsCount}
                    hostingDuration={detailProps.organizerHostingDuration}
                  />
                </div>
              </motion.div>
            )}

            {/* Pricing Section */}
            <motion.div variants={fadeInUp}>
              <div className="flex flex-col gap-4" id="pricing">
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between">
                  <p className="heading-4">Pricing</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal('pricing')}
                  >
                    <PencilIcon className="mr-2 size-4" />
                    Edit
                  </Button>
                </div>
                {hasPricing ? (
                  <DataTable>
                    <DataTableHeader>
                      <tr>
                        <DataTableHead>Division</DataTableHead>
                        <DataTableHead>{`Before ${detailProps.pricingDeadlineLabel}`}</DataTableHead>
                        <DataTableHead>{`After ${detailProps.pricingDeadlineLabel}`}</DataTableHead>
                      </tr>
                    </DataTableHeader>
                    <DataTableBody>
                      {detailProps.pricingRows.map((row) => (
                        <DataTableRow key={row.label} animated={false}>
                          <DataTableCell className="text-foreground">{row.label}</DataTableCell>
                          <DataTableCell>{row.before}</DataTableCell>
                          <DataTableCell>{row.after}</DataTableCell>
                        </DataTableRow>
                      ))}
                    </DataTableBody>
                  </DataTable>
                ) : (
                  <EmptyStateButton
                    title="Add divisions and pricing"
                    description="Set prices for each division"
                    onClick={() => handleOpenModal('pricing')}
                  />
                )}
              </div>
            </motion.div>

            {/* Documents Section */}
            <motion.div variants={fadeInUp}>
              <div id="documents" className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between">
                  <p className="heading-4">Documents & Resources</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal('documents')}
                  >
                    <PencilIcon className="mr-2 size-4" />
                    Edit
                  </Button>
                </div>
                {hasDocuments ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {detailProps.documents.map((doc) => (
                      <div key={doc.name} className="rounded-md border border-border/70 bg-card/60 p-5 transition-all hover:border-primary/20">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <DownloadIcon className="text-primary/70 size-5 shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-0.5">
                              <p className="body-text font-semibold text-foreground">{doc.name}</p>
                              <p className="body-small text-muted-foreground">{doc.description}</p>
                            </div>
                          </div>
                          <Button asChild variant="outline" size="sm" className="shrink-0">
                            <Link href={doc.href}>Download</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyStateButton
                    title="Upload event documents"
                    description="Add waivers, info packets, and other resources"
                    onClick={() => handleOpenModal('documents')}
                  />
                )}
              </div>
            </motion.div>

            {/* Results Section - Not editable */}
            <motion.div variants={fadeInUp}>
              <div id="results" className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Results & Leaderboard</p>
                <div className="rounded-md border border-border/70 bg-card/60 p-5 transition-all hover:border-primary/20">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-foreground font-medium">Coming soon</p>
                      <p className="body-small text-muted-foreground">Scores and placements will publish once awards conclude.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.article>

          {/* Sidebar with Table of Contents */}
          <motion.div 
            className="hidden lg:block lg:sticky lg:top-24 lg:self-start"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex flex-col gap-6">
              <EventTableOfContents showLabel={false} showDivider={false} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Section Edit Modals */}
      <EventSectionEditDialog
        open={openModal === 'title'}
        onOpenChange={(open) => !open && handleModalCancel()}
        title="Title & Description"
        description="Set the event name, description, and basic details"
        onSave={handleModalSave}
        onCancel={handleModalCancel}
        isSaving={isSaving}
      >
        <TitleSection
          eventData={localDraft}
          onUpdate={updateLocalDraft}
        />
      </EventSectionEditDialog>

      <EventSectionEditDialog
        open={openModal === 'timeline'}
        onOpenChange={(open) => !open && handleModalCancel()}
        title="Registration Timeline"
        description="Set registration and early bird deadlines"
        onSave={handleModalSave}
        onCancel={handleModalCancel}
        isSaving={isSaving}
      >
        <TimelineSection
          eventData={localDraft}
          onUpdate={updateLocalDraft}
        />
      </EventSectionEditDialog>

      <EventSectionEditDialog
        open={openModal === 'date-location'}
        onOpenChange={(open) => !open && handleModalCancel()}
        title="Date & Location"
        description="Set the event date and venue details"
        onSave={handleModalSave}
        onCancel={handleModalCancel}
        isSaving={isSaving}
      >
        <DateLocationSection
          eventData={localDraft}
          onUpdate={updateLocalDraft}
        />
      </EventSectionEditDialog>

      <EventSectionEditDialog
        open={openModal === 'gallery'}
        onOpenChange={(open) => !open && handleModalCancel()}
        title="Gallery"
        description="Upload event photos and images"
        onSave={handleModalSave}
        onCancel={handleModalCancel}
        isSaving={isSaving}
      >
        <GallerySection
          eventData={localDraft}
          onUpdate={updateLocalDraft}
        />
      </EventSectionEditDialog>

      <EventSectionEditDialog
        open={openModal === 'pricing'}
        onOpenChange={(open) => !open && handleModalCancel()}
        title="Pricing"
        description="Set pricing for each division"
        onSave={handleModalSave}
        onCancel={handleModalCancel}
        isSaving={isSaving}
      >
        <PricingSection
          eventData={localDraft}
          onUpdate={updateLocalDraft}
        />
      </EventSectionEditDialog>

      <EventSectionEditDialog
        open={openModal === 'documents'}
        onOpenChange={(open) => !open && handleModalCancel()}
        title="Documents & Resources"
        description="Upload waivers, info packets, and other files"
        onSave={handleModalSave}
        onCancel={handleModalCancel}
        isSaving={isSaving}
      >
        <DocumentsSection
          eventData={localDraft}
          onUpdate={updateLocalDraft}
        />
      </EventSectionEditDialog>
    </>
  )
}

