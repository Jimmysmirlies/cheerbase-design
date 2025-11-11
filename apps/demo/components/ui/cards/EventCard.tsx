'use client'

/**
 * EventCard
 *
 * Purpose
 * - Compact marketplace card displaying event media, metadata, and a primary action.
 *
 * Structure
 * - Media banner with event type chip
 * - Content: title, organizer, details (date/location/teams)
 * - Footer: fee + Register CTA
 */
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/shadcn/button'
import { CardContent, CardFooter } from '@workspace/ui/shadcn/card'

import { CalendarDaysIcon, MapPinIcon, UsersIcon } from 'lucide-react'
import Link from 'next/link'

import { GlassCard } from '@/components/ui/glass/GlassCard'

type EventCardProps = {
  image: string
  type: string
  title: string
  organizer: string
  date: string
  location: string
  teams: string
  fee: string
  href?: string
  onRegister?: () => void
  size?: 'default' | 'compact'
}

export function EventCard({
  image,
  type,
  title,
  organizer,
  date,
  location,
  teams,
  fee,
  href,
  onRegister,
  size = 'default',
}: EventCardProps) {
  const isCompact = size === 'compact'

  return (
    <GlassCard interactive className={cn('shadow-md p-0', isCompact ? 'gap-4' : 'gap-6')}>
      {/* Media */}
      <div
        className={cn('relative bg-cover bg-center', isCompact ? 'h-32' : 'h-40')}
        style={{ backgroundImage: `url(${image})` }}
      >
        <span
          className={cn(
            'bg-background/90 text-muted-foreground absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm',
            isCompact && 'px-2.5 py-0.5 text-[11px]'
          )}
        >
          {type}
        </span>
      </div>
      {/* Meta */}
      <CardContent className={cn('flex flex-1 flex-col px-6 py-0', isCompact ? 'gap-4' : 'gap-5')}>
        <div className={cn('space-y-2', isCompact && 'space-y-1.5')}>
          <h3 className={cn('text-foreground font-semibold', isCompact ? 'text-base' : 'text-lg')}>
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
          <p className="flex items-center gap-2">
            <MapPinIcon className={cn('text-primary/70 size-4', isCompact && 'size-3.5')} />
            {location}
          </p>
          <p className="flex items-center gap-2">
            <UsersIcon className={cn('text-primary/70 size-4', isCompact && 'size-3.5')} />
            {teams}
          </p>
        </div>
      </CardContent>
      {/* Actions */}
      <CardFooter
        className={cn(
          'border-border/80 mt-auto flex items-center justify-between border-t p-6 pt-4',
          isCompact && 'p-5 pt-3'
        )}
      >
        <div className={cn('text-sm', isCompact && 'text-xs')}>
          <span className="text-muted-foreground block">Fee</span>
          <span
            className={cn('text-foreground font-semibold', isCompact ? 'text-sm' : 'text-base')}
          >
            {fee}
          </span>
        </div>
        {onRegister ? (
          <Button
            type="button"
            onClick={onRegister}
            className={cn('rounded-full px-6', isCompact && 'px-5 py-3 text-sm')}
          >
            Register
          </Button>
        ) : href ? (
          <Button asChild className={cn('rounded-full px-6', isCompact && 'px-5 py-3 text-sm')}>
            <Link href={href}>Register</Link>
          </Button>
        ) : null}
      </CardFooter>
    </GlassCard>
  )
}
