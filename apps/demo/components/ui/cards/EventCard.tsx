'use client'

/**
 * EventCard
 *
 * Purpose
 * - Compact marketplace card displaying event media, metadata, and a primary action.
 *
 * Structure
 * - Media banner with hero image
 * - Content: title, organizer, details (date/location/teams)
 * - Footer: fee + Register CTA
 */
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/shadcn/button'
import { Card, CardContent, CardFooter } from '@workspace/ui/shadcn/card'

import { CalendarDaysIcon, MapPinIcon, UsersIcon } from 'lucide-react'
import Link from 'next/link'

import { FALLBACK_EVENT_IMAGE } from '@/data/events/fallbacks'

type EventCardProps = {
  image: string
  title: string
  organizer: string
  date: string
  location: string
  teams: string
  href?: string
  onRegister?: () => void
  size?: 'default' | 'compact'
}

export function EventCard({
  image,
  title,
  organizer,
  date,
  location,
  teams,
  href,
  onRegister,
  size = 'default',
}: EventCardProps) {
  const isCompact = size === 'compact'
  const mediaImage = image || FALLBACK_EVENT_IMAGE

  return (
    <Card
      className={cn(
        'h-full overflow-hidden p-0 shadow-lg transition hover:shadow-xl',
        isCompact ? 'gap-4' : 'gap-6'
      )}
    >
      {/* Media */}
      <div
        className={cn('relative bg-muted bg-cover bg-center', isCompact ? 'h-32' : 'h-40')}
        style={{ backgroundImage: `url(${mediaImage})` }}
      />
      {/* Meta */}
      <CardContent className={cn('flex flex-1 flex-col px-6 py-0', isCompact ? 'gap-4' : 'gap-5')}>
        <div className={cn('space-y-2', isCompact && 'space-y-1.5')}>
          <h3 className={cn('text-foreground', isCompact ? 'text-base font-semibold leading-tight' : 'heading-4')}>
            {title}
          </h3>
          <p className={cn('text-muted-foreground', isCompact ? 'text-xs' : 'text-sm')}>
            {organizer}
          </p>
        </div>
        <div
          className={cn('text-muted-foreground space-y-3 text-sm', {
            'space-y-2 text-xs': isCompact,
          })}
        >
          <p className="flex items-center gap-2">
            <CalendarDaysIcon className={cn('text-primary/70 size-4', isCompact && 'size-3.5')} />
            {date}
          </p>
          <p className="flex items-start gap-2">
            <MapPinIcon className={cn('text-primary/70 size-4 shrink-0', isCompact && 'size-3.5')} />
            <span className={cn('line-clamp-2 break-words leading-tight', isCompact && 'text-xs')}>
              {location}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <UsersIcon className={cn('text-primary/70 size-4', isCompact && 'size-3.5')} />
            {teams}
          </p>
        </div>
      </CardContent>
      {/* Actions */}
      <CardFooter className={cn('border-border/80 mt-auto border-t !px-6 !py-4', isCompact && 'p-5')}>
        {onRegister ? (
          <Button
            type="button"
            variant="default"
            onClick={onRegister}
            className={cn('w-full', isCompact && 'py-3 text-sm')}
          >
            View
          </Button>
        ) : href ? (
          <Button asChild variant="default" className={cn('w-full', isCompact && 'py-3 text-sm')}>
            <Link href={href}>View</Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  )
}
