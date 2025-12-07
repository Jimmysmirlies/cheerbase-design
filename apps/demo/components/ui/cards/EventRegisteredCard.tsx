'use client'

import type { ComponentProps } from 'react'

import { Badge } from '@workspace/ui/shadcn/badge'
import { Button } from '@workspace/ui/shadcn/button'
import { Card, CardContent, CardFooter } from '@workspace/ui/shadcn/card'
import { CalendarDaysIcon, MapPinIcon, UsersIcon } from 'lucide-react'
import Link from 'next/link'

import { FALLBACK_EVENT_IMAGE } from '@/data/events/fallbacks'

type StatusVariant = 'PAID' | 'UNPAID' | 'OVERDUE'

type BadgeVariant = ComponentProps<typeof Badge>['variant']

const statusBadgeVariants: Record<StatusVariant, BadgeVariant> = {
  PAID: 'green',
  UNPAID: 'amber',
  OVERDUE: 'red',
}

export type EventRegisteredCardProps = {
  image?: string
  title: string
  date: string
  location: string
  participants: number | string
  statusLabel: StatusVariant
  organizer?: string
  actionHref: string
  actionLabel?: string
  disabled?: boolean
}

export function EventRegisteredCard({
  image,
  title,
  date,
  location,
  participants,
  statusLabel,
  organizer,
  actionHref,
  actionLabel = 'View',
  disabled = false,
}: EventRegisteredCardProps) {
  const heroImage = image || FALLBACK_EVENT_IMAGE
  const heroStyle = { backgroundImage: `url(${heroImage})` }
  const badgeVariant = statusBadgeVariants[statusLabel] ?? 'secondary'

  return (
    <Card className="flex h-full w-full overflow-hidden rounded-2xl border border-border/60 p-0">
      <div className="relative aspect-[2/1] w-full bg-muted bg-cover bg-center" style={heroStyle}>
        <Badge
          variant={badgeVariant}
          className="pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-wide"
        >
          {statusLabel}
        </Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-4 px-5 py-0">
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {organizer ? <p className="text-xs text-muted-foreground">{organizer}</p> : null}
        </div>
        <div className="text-muted-foreground space-y-2.5 text-sm">
          <p className="flex items-center gap-2">
            <CalendarDaysIcon className="text-primary/70 size-4" />
            {date}
          </p>
          <p className="flex items-start gap-2">
            <MapPinIcon className="text-primary/70 size-4 shrink-0" />
            <span className="line-clamp-2 break-words leading-tight">{location}</span>
          </p>
          <p className="flex items-center gap-2">
            <UsersIcon className="text-primary/70 size-4" />
            <span className="font-medium">{participants} participants</span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="border-border/80 mt-auto border-t !px-5 !py-4">
        <Button
          asChild
          disabled={disabled}
          variant="secondary"
          className="w-full"
        >
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
