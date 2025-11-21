import { cn } from '@workspace/ui/lib/utils'
import { Card, CardContent } from '@workspace/ui/shadcn/card'
import { Separator } from '@workspace/ui/shadcn/separator'
import { Button } from '@workspace/ui/shadcn/button'

import { UsersIcon } from 'lucide-react'

import { PricingScrollButton } from '@/components/features/events/PricingScrollButton'

import Link from 'next/link'

type RegistrationSummaryCardProps = {
  eventId: string
  registrationDeadline: string
  slotLabel: string
  pricingTargetId?: string
  className?: string
  registerButtonLabel?: string
  pricingButtonLabel?: string
}

export function RegistrationSummaryCard({
  eventId,
  registrationDeadline,
  slotLabel,
  pricingTargetId = 'pricing',
  className,
  registerButtonLabel = 'Start registration',
  pricingButtonLabel = 'View pricing info',
}: RegistrationSummaryCardProps) {
  const deadlineDate = registrationDeadline ? new Date(registrationDeadline) : null
  const formattedDeadline = deadlineDate
    ? deadlineDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    : 'TBA'
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  const daysRemaining =
    deadlineDate && !Number.isNaN(deadlineDate.getTime())
      ? Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / msPerDay))
      : null
  const countdownLabel =
    daysRemaining === null
      ? 'Registration window pending'
      : daysRemaining === 0
        ? 'Registration closes today'
        : `Registration closes in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`

  return (
    <Card className={cn('shadow-md', className)}>
      <CardContent className="space-y-6 px-6 py-0">
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Event Registration Deadline</span>
          <p className="text-foreground text-2xl font-semibold">{formattedDeadline}</p>
          <p className="text-muted-foreground text-sm">{countdownLabel}</p>
        </div>
        <Separator />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UsersIcon className="text-primary/70 size-4" />
          {slotLabel} teams confirmed
        </div>
        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href={`/events/${encodeURIComponent(eventId)}/register`}>{registerButtonLabel}</Link>
          </Button>
          <PricingScrollButton targetId={pricingTargetId} className="w-full">
            {pricingButtonLabel}
          </PricingScrollButton>
        </div>
      </CardContent>
    </Card>
  )
}
