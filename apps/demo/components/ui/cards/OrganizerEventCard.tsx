'use client'

import type { ComponentProps } from 'react'

import { Badge } from '@workspace/ui/shadcn/badge'
import { Card, CardContent } from '@workspace/ui/shadcn/card'
import { CalendarDaysIcon, MapPinIcon, UsersIcon } from 'lucide-react'
import Link from 'next/link'

import { FALLBACK_EVENT_IMAGE } from '@/data/events/fallbacks'

type RegistrationStatus = 'OPEN' | 'CLOSING SOON' | 'CLOSED' | 'FULL' | 'DRAFT'

type BadgeVariant = ComponentProps<typeof Badge>['variant']

const statusBadgeVariants: Record<RegistrationStatus, BadgeVariant> = {
  OPEN: 'green',
  'CLOSING SOON': 'amber',
  CLOSED: 'secondary',
  FULL: 'red',
  DRAFT: 'secondary',
}

export type OrganizerEventCardProps = {
  id: string
  image?: string
  title: string
  date: string
  location: string
  teamsFilled: number
  teamsCapacity: number
  statusLabel: RegistrationStatus
  disabled?: boolean
  status?: 'draft' | 'published'
}

/**
 * Derives registration status from event data
 */
export function getRegistrationStatus(event: {
  registrationDeadline?: string
  date: string
  slots: { filled: number; capacity: number }
}): RegistrationStatus {
  const now = new Date()

  // Check if slots are full
  if (event.slots.filled >= event.slots.capacity) {
    return 'FULL'
  }

  // Check registration deadline
  if (event.registrationDeadline) {
    const deadline = new Date(event.registrationDeadline)
    deadline.setHours(23, 59, 59, 999)

    if (now > deadline) {
      return 'CLOSED'
    }

    // Check if closing soon (within 7 days)
    const sevenDaysFromNow = new Date(now)
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    if (deadline <= sevenDaysFromNow) {
      return 'CLOSING SOON'
    }
  }

  // Check if event date has passed
  const eventDate = new Date(event.date)
  eventDate.setHours(23, 59, 59, 999)
  if (now > eventDate) {
    return 'CLOSED'
  }

  return 'OPEN'
}

export function OrganizerEventCard({
  id,
  image,
  title,
  date,
  location,
  teamsFilled,
  teamsCapacity,
  statusLabel,
  disabled = false,
  status,
}: OrganizerEventCardProps) {
  const heroImage = image || FALLBACK_EVENT_IMAGE
  const heroStyle = { backgroundImage: `url(${heroImage})` }
  const displayStatus = status === 'draft' ? 'DRAFT' : statusLabel
  const badgeVariant = statusBadgeVariants[displayStatus] ?? 'secondary'
  const linkLabel = `View event: ${title}`
  const cardHoverState = disabled
    ? 'opacity-65'
    : 'hover:-translate-y-[2px] hover:shadow-lg hover:border-primary/40'

  return (
    <Link
      href={`/organizer/events/${id}`}
      aria-label={linkLabel}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={`group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        disabled ? 'pointer-events-none' : ''
      }`}
    >
      <Card
        className={`flex h-full w-full gap-0 overflow-hidden !rounded-md border border-border/60 p-0 transition duration-200 ease-out ${cardHoverState}`}
      >
        {/* HERO BAND — Event image with status badge */}
        <div className="relative aspect-[2/1] w-full bg-muted bg-cover bg-center" style={heroStyle}>
          <Badge
            variant={badgeVariant}
            className="pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-wide leading-none text-center"
          >
            {displayStatus}
          </Badge>
        </div>
        {/* BODY STACK — Event details */}
        <CardContent className="flex flex-1 flex-col gap-4 px-6 py-6">
          {/* TITLE BLOCK */}
          <div className="space-y-1">
            <h3 className="heading-4 text-foreground">{title}</h3>
          </div>
          {/* META GRID — Quick Facts */}
          <div className="body-small text-muted-foreground space-y-2.5">
            <p className="flex items-center gap-2">
              <CalendarDaysIcon className="text-primary/70 size-4" />
              {date}
            </p>
            <p className="flex items-start gap-2">
              <MapPinIcon className="text-primary/70 size-4 shrink-0 translate-y-[2px]" />
              <span className="line-clamp-2 break-words leading-tight">{location}</span>
            </p>
            <p className="flex items-center gap-2">
              <UsersIcon className="text-primary/70 size-4" />
              <span className="font-medium">{teamsFilled} / {teamsCapacity} teams</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}



