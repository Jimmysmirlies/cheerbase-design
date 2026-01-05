'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { Button } from '@workspace/ui/shadcn/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/shadcn/tooltip'
import {
  MapPinIcon,
  Share2Icon,
  DownloadIcon,
  ExternalLinkIcon,
} from 'lucide-react'

import { fadeInUp, staggerSections } from '@/lib/animations'
import { useAuth } from '@/components/providers/AuthProvider'
import { EventGallery } from '@/components/ui/gallery/EventGallery'
import { OrganizerCard } from '@/components/features/clubs/OrganizerCard'
import { RegistrationSummaryCard } from '@/components/features/events/RegistrationSummaryCard'
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

type LayoutVariant = 'A' | 'B'

export type TimelinePhase = {
  id: string
  title: string
  subtitle: string | null
  border: string
  background: string
  dot: string
  usesGradient: boolean
  gradientBg?: string
  borderColor?: string
  dotColor?: string
  isCurrent: boolean
}

export type PricingRow = {
  label: string
  before: string
  after: string
}

export type EventDocument = {
  name: string
  description: string
  href: string
}

export type EventDetailBodyProps = {
  event: {
    id: string
    name: string
    date: string
    description: string
    organizer: string
    location: string
  }
  organizerGradient: BrandGradient
  organizerFollowers: string
  organizerEventsCount?: number
  organizerHostingDuration?: string
  galleryImages: string[]
  eventDateParts: {
    month: string
    day: string
    weekday: string
    fullDate: string
  }
  venueName: string
  cityState: string
  registrationDeadlineISO: string
  registrationClosed: boolean
  timelinePhases: TimelinePhase[]
  pricingDeadlineLabel: string
  pricingRows: PricingRow[]
  documents: EventDocument[]
  /** Hide registration-related elements (for organizer view) */
  hideRegistration?: boolean
  /** Controlled layout value (when parent manages state) */
  layout?: LayoutVariant
}

export function EventDetailBody({
  event,
  organizerGradient,
  organizerFollowers,
  organizerEventsCount,
  organizerHostingDuration,
  galleryImages,
  eventDateParts,
  venueName,
  cityState,
  registrationDeadlineISO,
  registrationClosed,
  timelinePhases,
  pricingDeadlineLabel,
  pricingRows,
  documents,
  hideRegistration = false,
  layout: controlledLayout,
}: EventDetailBodyProps) {
  // Use controlled layout if provided, otherwise internal state
  const [internalLayout, setInternalLayout] = useState<LayoutVariant>('A')
  const layout = controlledLayout ?? internalLayout

  // Check if user is an organizer (can't register for events)
  const { user, status } = useAuth()
  const isOrganizer = status === 'authenticated' && user?.role === 'organizer'

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">

        <div className={`grid gap-8 ${hideRegistration ? '' : 'lg:grid-cols-[1fr_320px]'}`}>
          <motion.article 
            className="space-y-8 min-w-0 overflow-hidden"
            variants={staggerSections}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Section Navigation Badges - always on mobile, Layout B on desktop too */}
            <div className={layout === 'B' ? '' : 'lg:hidden'}>
              <EventSectionBadges />
            </div>

            {/* Overview Section */}
            <motion.div variants={fadeInUp}>
              <div id="overview" className="flex flex-col gap-4">
                {/* Divider - Layout B only */}
                {layout === 'B' && <div className="h-px w-full bg-border" />}
                <p className="heading-4">Overview</p>
                <p className="text-muted-foreground body-text">
                  {event.description}
                </p>
              </div>
            </motion.div>

            {/* Registration Status Section */}
            <motion.div variants={fadeInUp}>
              <div id="registration-timeline" className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Registration Timeline</p>
                {/* Timeline container */}
                <div className="flex flex-col gap-3">
                  {timelinePhases.map((phase) => (
                    <div 
                      key={phase.id}
                      className={`relative rounded-md border p-4 transition-all overflow-hidden ${phase.border} ${phase.background}`}
                      style={phase.usesGradient && phase.borderColor ? {
                        borderColor: `${phase.borderColor}50`,
                      } : undefined}
                    >
                      {/* Gradient background overlay for current phase */}
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
                        {/* Status indicator dot */}
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
              </div>
            </motion.div>

            {/* Date & Location Section */}
            <motion.div variants={fadeInUp}>
              <div id="date-location" className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Date & Location</p>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    {/* Date */}
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 flex-col items-center justify-center rounded-md border bg-muted/30 overflow-hidden">
                        <span className="text-[10px] font-medium text-muted-foreground leading-none">{eventDateParts.month}</span>
                        <span className="text-lg font-semibold text-foreground leading-none">{eventDateParts.day}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {eventDateParts.weekday}, {eventDateParts.fullDate}
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
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-foreground hover:underline inline-flex items-center gap-1"
                        >
                          {venueName}
                          <ExternalLinkIcon className="size-3" />
                        </Link>
                        <span className="text-xs text-muted-foreground">{cityState}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border border-border/70 bg-muted/50">
                    <iframe
                      src={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
                      className="absolute inset-0 h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map of ${event.location}`}
                    />
                    <Link
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-10"
                      aria-label={`Open ${event.location} in Google Maps`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Gallery Section */}
            <motion.div variants={fadeInUp}>
              <div id="gallery" className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Gallery</p>
                <EventGallery images={galleryImages} alt={event.name} maxImages={4} />
              </div>
            </motion.div>

            {/* Organizer Section */}
            <motion.div variants={fadeInUp}>
              <div id="organizer" className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Organizer</p>
                <OrganizerCard
                  name={event.organizer}
                  gradient={organizerGradient}
                  followers={organizerFollowers}
                  eventsCount={organizerEventsCount}
                  hostingDuration={organizerHostingDuration}
                />
              </div>
            </motion.div>

            {/* Pricing Section */}
            <motion.div variants={fadeInUp}>
              <div className="flex flex-col gap-4" id="pricing">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Pricing</p>
                <DataTable>
                  <DataTableHeader>
                    <tr>
                      <DataTableHead>Division</DataTableHead>
                      <DataTableHead>{`Before ${pricingDeadlineLabel}`}</DataTableHead>
                      <DataTableHead>{`After ${pricingDeadlineLabel}`}</DataTableHead>
                    </tr>
                  </DataTableHeader>
                  <DataTableBody>
                    {pricingRows.length ? (
                      pricingRows.map((row) => (
                        <DataTableRow key={row.label} animated={false}>
                          <DataTableCell className="text-foreground">{row.label}</DataTableCell>
                          <DataTableCell>{row.before}</DataTableCell>
                          <DataTableCell>{row.after}</DataTableCell>
                        </DataTableRow>
                      ))
                    ) : (
                      <DataTableRow animated={false}>
                        <DataTableCell className="py-6 text-center text-sm text-muted-foreground" colSpan={3}>
                          Pricing information will be available soon.
                        </DataTableCell>
                      </DataTableRow>
                    )}
                  </DataTableBody>
                </DataTable>
              </div>
            </motion.div>

            {/* Documents & Resources Section */}
            <motion.div variants={fadeInUp}>
              <div id="documents" className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Documents & Resources</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {documents.map((doc) => (
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
              </div>
            </motion.div>

            {/* Results Section */}
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
                    <Button variant="outline" size="sm" disabled>
                      <Share2Icon className="mr-2 size-4" />
                      Notify me
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.article>

          {/* Sidebar with Registration CTA (desktop) - hidden for organizer views */}
          {!hideRegistration && (
            <motion.div
              className="hidden lg:block lg:sticky lg:top-24 lg:self-start"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex flex-col gap-6">
                <RegistrationSummaryCard
                  eventId={event.id}
                  eventDate={event.date}
                  eventStartTime="9:00 AM"
                  registrationDeadline={registrationDeadlineISO}
                  isRegistrationClosed={registrationClosed}
                  hidePricingButton
                />
                {/* Table of Contents - Layout A only */}
                {layout === 'A' && <EventTableOfContents showLabel={false} showDivider />}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Footer CTA */}
      {!hideRegistration && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="text-sm text-foreground">
                {registrationClosed 
                  ? 'Registration has closed'
                : `Registration closes on ${new Date(registrationDeadlineISO).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                }
              </p>
            {registrationClosed ? (
              <Button size="sm" disabled>
                Closed
              </Button>
            ) : isOrganizer ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" disabled>
                      Register
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Log in as a Club Owner account to register for this event
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button asChild size="sm">
                <Link href={`/events/${encodeURIComponent(event.id)}/register`}>Register</Link>
              </Button>
            )}
          </div>
        </div>
      )}
      {/* Spacer to prevent content from being hidden behind sticky footer */}
      {!hideRegistration && <div className="h-20 lg:hidden" />}
    </>
  )
}

