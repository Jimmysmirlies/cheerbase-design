'use client'

import { useState } from 'react'
import Link from 'next/link'

import { Button } from '@workspace/ui/shadcn/button'
import {
  MapPinIcon,
  Share2Icon,
  DownloadIcon,
  ExternalLinkIcon,
} from 'lucide-react'

import { FadeInSection } from '@/components/ui'
import { EventGallery } from '@/components/ui/gallery/EventGallery'
import { PageHeader } from '@/components/layout/PageHeader'
import { OrganizerCard } from '@/components/features/clubs/OrganizerCard'
import { RegistrationSummaryCard } from '@/components/features/events/RegistrationSummaryCard'
import { EventTableOfContents } from '@/components/features/events/EventTableOfContents'
import { EventSectionBadges } from '@/components/features/events/EventSectionBadges'
import { LayoutToggle } from '@/components/ui/controls/LayoutToggle'
import type { BrandGradient } from '@/lib/gradients'

type LayoutVariant = 'A' | 'B'

type TimelinePhase = {
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

type PricingRow = {
  label: string
  before: string
  after: string
}

type Document = {
  name: string
  description: string
  href: string
}

type EventDetailContentProps = {
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
  slotLabel: string
  timelinePhases: TimelinePhase[]
  pricingDeadlineLabel: string
  pricingRows: PricingRow[]
  documents: Document[]
}

export function EventDetailContent({
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
  slotLabel,
  timelinePhases,
  pricingDeadlineLabel,
  pricingRows,
  documents,
}: EventDetailContentProps) {
  const [layout, setLayout] = useState<LayoutVariant>('A')

  return (
    <section className="flex flex-1 flex-col">
      {/* PageHeader with organizer's brand gradient */}
      <PageHeader
        title={event.name}
        hideSubtitle
        gradientVariant={organizerGradient}
        eventStartDate={event.date}
        showEventDateAsBreadcrumb
        hideCountdown
        action={
          <LayoutToggle
            variants={['A', 'B'] as const}
            value={layout}
            onChange={setLayout}
            showTutorial={false}
          />
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <article className="space-y-8 min-w-0 overflow-hidden">
            {/* Section Navigation Badges - Layout B only */}
            {layout === 'B' && <EventSectionBadges />}

            {/* Overview Section */}
            <FadeInSection>
              <div id="overview" className="flex flex-col gap-4">
                {/* Divider - Layout B only */}
                {layout === 'B' && <div className="h-px w-full bg-border" />}
                <p className="heading-4">Overview</p>
                <p className="text-muted-foreground body-text">
                  {event.description} Added amenities include expanded warm-up rotations, on-site athletic trainers,
                  backstage video replay, and hospitality lounges for club directors. Expect curated judges feedback, vendor
                  experiences, and a champion&apos;s parade following finals.
                </p>
              </div>
            </FadeInSection>

            {/* Registration Status Section */}
            <FadeInSection delay={100}>
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
            </FadeInSection>

            {/* Date & Location Section */}
            <FadeInSection delay={200}>
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
            </FadeInSection>

            {/* Gallery Section */}
            <FadeInSection delay={300}>
              <div id="gallery" className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Gallery</p>
                <EventGallery images={galleryImages} alt={event.name} maxImages={4} />
              </div>
            </FadeInSection>

            {/* Organizer Section */}
            <FadeInSection delay={400}>
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
            </FadeInSection>

            {/* Pricing Section */}
            <FadeInSection delay={500}>
              <div className="flex flex-col gap-4" id="pricing">
                <div className="h-px w-full bg-border" />
                <p className="heading-4">Pricing</p>
                <div className="overflow-hidden rounded-md border border-border/70">
                  <table className="w-full table-auto text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3 font-medium sm:px-4">Division</th>
                        <th className="px-3 py-3 font-medium sm:px-4">{`Before ${pricingDeadlineLabel}`}</th>
                        <th className="px-3 py-3 font-medium sm:px-4">{`After ${pricingDeadlineLabel}`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingRows.length ? (
                        pricingRows.map((row) => (
                          <tr key={row.label} className="border-t">
                            <td className="text-foreground px-3 py-3 sm:px-4">{row.label}</td>
                            <td className="px-3 py-3 sm:px-4">{row.before}</td>
                            <td className="px-3 py-3 sm:px-4">{row.after}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t">
                          <td className="px-3 py-6 text-center text-sm text-muted-foreground sm:px-4" colSpan={3}>
                            Pricing information will be available soon.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeInSection>

            {/* Documents & Resources Section */}
            <FadeInSection delay={600}>
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
            </FadeInSection>

            {/* Results Section */}
            <FadeInSection delay={800}>
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
            </FadeInSection>
          </article>

          {/* Sidebar with Registration CTA (desktop) */}
          <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <FadeInSection delay={200}>
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
                {layout === 'A' && <EventTableOfContents showLabel={false} />}
              </div>
            </FadeInSection>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-foreground">{slotLabel} teams confirmed</p>
            <p className="text-xs text-muted-foreground">
              {registrationClosed 
                ? 'Registration has closed'
                : (() => {
                    const deadlineDate = new Date(registrationDeadlineISO)
                    const now = new Date()
                    const msPerDay = 1000 * 60 * 60 * 24
                    const daysRemaining = Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / msPerDay))
                    return daysRemaining === 0
                      ? 'Registration closes today'
                      : `Closes in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
                  })()
              }
            </p>
          </div>
          {registrationClosed ? (
            <Button size="sm" disabled>
              Closed
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href={`/events/${encodeURIComponent(event.id)}/register`}>Register</Link>
            </Button>
          )}
        </div>
      </div>
      {/* Spacer to prevent content from being hidden behind sticky footer */}
      <div className="h-20 lg:hidden" />
    </section>
  )
}

