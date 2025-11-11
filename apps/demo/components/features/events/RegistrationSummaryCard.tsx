import { cn } from '@workspace/ui/lib/utils'
import { CardContent } from '@workspace/ui/shadcn/card'
import { Separator } from '@workspace/ui/shadcn/separator'
import { Button } from '@workspace/ui/shadcn/button'

import { UsersIcon } from 'lucide-react'

import { PricingScrollButton } from '@/components/features/events/PricingScrollButton'
import { GlassCard } from '@/components/ui/glass/GlassCard'

import Link from 'next/link'

type RegistrationSummaryCardProps = {
  eventId: string
  fee: string
  pricePerParticipant: string
  slotLabel: string
  pricingTargetId?: string
  className?: string
  registerButtonLabel?: string
  pricingButtonLabel?: string
}

export function RegistrationSummaryCard({
  eventId,
  fee,
  pricePerParticipant,
  slotLabel,
  pricingTargetId = 'pricing',
  className,
  registerButtonLabel = 'Start registration',
  pricingButtonLabel = 'View pricing info',
}: RegistrationSummaryCardProps) {
  return (
    <GlassCard className={cn('shadow-md', className)}>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Registration fee</span>
          <p className="text-foreground text-3xl font-semibold">{fee}</p>
          <p className="text-muted-foreground text-sm">{pricePerParticipant}</p>
        </div>
        <Separator />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UsersIcon className="text-primary/70 size-4" />
          {slotLabel} confirmed
        </div>
        <Button asChild className="w-full">
          <Link href={`/events/${encodeURIComponent(eventId)}/register`}>{registerButtonLabel}</Link>
        </Button>
        <PricingScrollButton targetId={pricingTargetId} className="w-full">
          {pricingButtonLabel}
        </PricingScrollButton>
      </CardContent>
    </GlassCard>
  )
}
