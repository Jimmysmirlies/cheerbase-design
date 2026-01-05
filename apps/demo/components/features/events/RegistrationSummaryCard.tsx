'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import { Card, CardContent } from '@workspace/ui/shadcn/card'
import { Button } from '@workspace/ui/shadcn/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/shadcn/tooltip'

import { PricingScrollButton } from '@/components/features/events/PricingScrollButton'
import { WalkthroughSpotlight } from '@/components/ui/RegistrationWalkthrough'
import { AuthSignUp } from '@/components/features/auth/AuthSignUp'
import { AuthDialog } from '@/components/features/auth/AuthDialog'
import { useAuth } from '@/components/providers/AuthProvider'

type RegistrationSummaryCardProps = {
  eventId: string
  eventDate: string
  eventStartTime?: string
  registrationDeadline: string
  pricingTargetId?: string
  className?: string
  registerButtonLabel?: string
  pricingButtonLabel?: string
  /** If true, registration is closed and button will be disabled */
  isRegistrationClosed?: boolean
  /** If true, hides the pricing button */
  hidePricingButton?: boolean
}

export function RegistrationSummaryCard({
  eventId,
  eventDate,
  eventStartTime,
  registrationDeadline,
  pricingTargetId = 'pricing',
  className,
  registerButtonLabel = 'Start registration',
  pricingButtonLabel = 'View pricing info',
  isRegistrationClosed = false,
  hidePricingButton = false,
}: RegistrationSummaryCardProps) {
  const router = useRouter()
  const { user, status, signInAsRole } = useAuth()
  const isAuthenticated = status === 'authenticated' && user !== null
  const isOrganizer = isAuthenticated && user?.role === 'organizer'
  const [loginOpen, setLoginOpen] = useState(false)
  
  const [eventDateParts, setEventDateParts] = useState<{ month: string; day: string; weekday: string; fullDate: string } | null>(null)
  const [formattedDeadline, setFormattedDeadline] = useState<string>('TBA')
  
  useEffect(() => {
    const eventDateObj = eventDate ? new Date(eventDate) : null
    const deadlineDate = registrationDeadline ? new Date(registrationDeadline) : null
    
    if (eventDateObj && !Number.isNaN(eventDateObj.getTime())) {
      setEventDateParts({
        month: eventDateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        day: eventDateObj.getDate().toString(),
        weekday: eventDateObj.toLocaleDateString('en-US', { weekday: 'long' }),
        fullDate: eventDateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long' }),
      })
    }
    
    if (deadlineDate && !Number.isNaN(deadlineDate.getTime())) {
      setFormattedDeadline(
        deadlineDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      )
    }
  }, [eventDate, registrationDeadline])

  return (
    <AuthSignUp>
      {({ openStart }) => (
        <>
          <Card className={cn(className)}>
            <CardContent className="space-y-4 px-6 py-0">
              {/* Event date */}
              {eventDateParts && (
                <div className="flex items-center gap-4">
                  {/* Calendar icon */}
                  <div className="flex flex-col items-center rounded-lg border bg-muted/30 overflow-hidden min-w-[56px]">
                    <div className="w-full bg-muted px-3 py-0.5 text-center">
                      <span className="text-xs font-medium text-muted-foreground">{eventDateParts.month}</span>
                    </div>
                    <div className="px-3 py-1">
                      <span className="text-2xl font-semibold text-foreground">{eventDateParts.day}</span>
                    </div>
                  </div>
                  {/* Date text */}
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-foreground">
                      {eventDateParts.weekday}, {eventDateParts.fullDate}
                    </span>
                    {eventStartTime && (
                      <span className="text-sm text-muted-foreground">{eventStartTime}</span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Buttons */}
              <div className="space-y-2">
                <WalkthroughSpotlight step="start-registration" side="left" align="center" advanceOnClick>
                  {isRegistrationClosed ? (
                    <Button className="w-full" disabled>
                      Registration Closed
                    </Button>
                  ) : isOrganizer ? (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button className="w-full" disabled>
                            {registerButtonLabel}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          Log in as a Club Owner account to register for this event
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : isAuthenticated ? (
                    <Button asChild className="w-full">
                      <Link href={`/events/${encodeURIComponent(eventId)}/register`}>{registerButtonLabel}</Link>
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => setLoginOpen(true)}>
                      Log In or Sign Up
                    </Button>
                  )}
                </WalkthroughSpotlight>
                {!hidePricingButton && (
                  <PricingScrollButton targetId={pricingTargetId} className="w-full">
                    {pricingButtonLabel}
                  </PricingScrollButton>
                )}
              </div>
              
              {/* Registration deadline */}
              <div className="flex flex-col items-center">
                {isRegistrationClosed ? (
                  <p className="text-sm font-medium text-destructive">
                    Registration has closed
                  </p>
                ) : registrationDeadline ? (
                  <p className="text-sm text-muted-foreground text-center">
                    Registration closes on <span className="font-semibold text-foreground">{formattedDeadline}</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Registration window pending
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <AuthDialog
            open={loginOpen}
            onOpenChange={setLoginOpen}
            onDemoLogin={nextRole => {
              const demoId = nextRole === 'club_owner' ? 'club-owner-1' : 'organizer-demo-1'
              signInAsRole(nextRole, nextRole === 'club_owner' ? 'Demo Club Owner' : 'Demo Organizer', `${nextRole}@demo.test`, {
                demoId,
                isDemo: true,
              })
              setLoginOpen(false)
              if (nextRole === 'organizer') router.push('/organizer')
              else router.push('/clubs')
            }}
            onJoinClick={() => openStart('choose')}
          />
        </>
      )}
    </AuthSignUp>
  )
}
