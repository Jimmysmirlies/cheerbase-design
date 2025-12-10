'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@workspace/ui/lib/utils'
import { Card, CardContent } from '@workspace/ui/shadcn/card'
import { Separator } from '@workspace/ui/shadcn/separator'
import { Button } from '@workspace/ui/shadcn/button'

import { UsersIcon } from 'lucide-react'

import { PricingScrollButton } from '@/components/features/events/PricingScrollButton'
import { WalkthroughSpotlight } from '@/components/ui/RegistrationWalkthrough'
import { AuthSignUp } from '@/components/features/auth/AuthSignUp'
import { AuthDialog } from '@/components/features/auth/AuthDialog'
import { useAuth } from '@/components/providers/AuthProvider'

import Link from 'next/link'

type RegistrationSummaryCardProps = {
  eventId: string
  registrationDeadline: string
  slotLabel: string
  pricingTargetId?: string
  className?: string
  registerButtonLabel?: string
  pricingButtonLabel?: string
  /** If true, registration is closed and button will be disabled */
  isRegistrationClosed?: boolean
}

// Countdown calculation
const SECOND_IN_MS = 1000
const MINUTE_IN_MS = 60 * SECOND_IN_MS
const HOUR_IN_MS = 60 * MINUTE_IN_MS
const DAY_IN_MS = 24 * HOUR_IN_MS

type CountdownSegments = {
  days: number
  hours: number
  seconds: number
} | null

function getCountdownSegments(deadline: Date | null): CountdownSegments {
  if (!deadline || Number.isNaN(deadline.getTime())) return null
  
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  if (diffMs <= 0) return null
  
  const days = Math.floor(diffMs / DAY_IN_MS)
  const remainingAfterDays = diffMs % DAY_IN_MS
  const hours = Math.floor(remainingAfterDays / HOUR_IN_MS)
  const remainingAfterHours = remainingAfterDays % HOUR_IN_MS
  const seconds = Math.floor((remainingAfterHours % MINUTE_IN_MS) / SECOND_IN_MS)
  
  return { days, hours, seconds }
}

export function RegistrationSummaryCard({
  eventId,
  registrationDeadline,
  slotLabel,
  pricingTargetId = 'pricing',
  className,
  registerButtonLabel = 'Start registration',
  pricingButtonLabel = 'View pricing info',
  isRegistrationClosed = false,
}: RegistrationSummaryCardProps) {
  const router = useRouter()
  const { user, status, signInAsRole } = useAuth()
  const isAuthenticated = status === 'authenticated' && user !== null
  const [loginOpen, setLoginOpen] = useState(false)
  
  // Initialize as null to avoid hydration mismatch
  const [countdown, setCountdown] = useState<CountdownSegments>(null)
  const [formattedDeadline, setFormattedDeadline] = useState<string>('TBA')
  
  useEffect(() => {
    // Calculate countdown only on client
    const deadlineDate = registrationDeadline ? new Date(registrationDeadline) : null
    
    if (deadlineDate && !Number.isNaN(deadlineDate.getTime())) {
      setFormattedDeadline(
        deadlineDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      )
    }
    
    setCountdown(getCountdownSegments(deadlineDate))
    
    if (!deadlineDate) return
    
    const interval = window.setInterval(() => {
      setCountdown(getCountdownSegments(deadlineDate))
    }, 1000)
    
    return () => window.clearInterval(interval)
  }, [registrationDeadline])

  return (
    <AuthSignUp>
      {({ openStart }) => (
        <>
          <Card className={cn('shadow-md', className)}>
            <CardContent className="space-y-4 px-6 py-0">
              {/* Countdown */}
              {isRegistrationClosed ? (
                <div className="flex flex-col items-center gap-1 pt-2">
                  <p className="text-sm font-medium text-destructive">
                    Registration has closed
                  </p>
                </div>
              ) : countdown ? (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <div className="grid grid-flow-col gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-foreground">
                        {countdown.days.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Days
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-foreground">
                        {countdown.hours.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Hours
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-foreground">
                        {countdown.seconds.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Secs
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Registration closes on {formattedDeadline}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 pt-2">
                  <p className="text-sm text-muted-foreground">
                    {registrationDeadline ? `Registration closes on ${formattedDeadline}` : 'Registration window pending'}
                  </p>
                </div>
              )}
              
              <Separator />
              
              {/* Team count */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <UsersIcon className="text-primary/70 size-4" />
                {slotLabel} teams confirmed
              </div>
              
              {/* Buttons */}
              <div className="space-y-2 pb-2">
                <WalkthroughSpotlight step="start-registration" side="left" align="center" advanceOnClick>
                  {isRegistrationClosed ? (
                    <Button className="w-full" disabled>
                      Registration Closed
                    </Button>
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
                <PricingScrollButton targetId={pricingTargetId} className="w-full">
                  {pricingButtonLabel}
                </PricingScrollButton>
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
