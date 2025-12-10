'use client'

import { Button } from '@workspace/ui/shadcn/button'

import { GradientAvatar } from '@/components/ui/avatars/GradientAvatar'
import { OrganizerFollowButton } from '@/components/features/clubs/OrganizerFollowButton'
import type { BrandGradient } from '@/lib/gradients'

type OrganizerCardProps = {
  /** Organizer display name */
  name: string
  /** Brand gradient key for avatar */
  gradient?: BrandGradient
  /** Number of followers (formatted string or number) */
  followers?: string | number
  /** Number of events hosted */
  eventsCount?: number
  /** How long they've been hosting (e.g., "3 years") */
  hostingDuration?: string
  /** Whether to show action buttons (Follow, Contact) */
  showActions?: boolean
  /** Callback when contact button is clicked */
  onContact?: () => void
}

/**
 * OrganizerCard
 * 
 * Reusable card component displaying organizer information with:
 * - Gradient avatar with initial
 * - Name and stats (followers, events, hosting duration)
 * - Optional action buttons (Follow, Contact)
 * 
 * Used on event pages, registration detail pages, and organizer listings.
 */
export function OrganizerCard({
  name,
  gradient = 'primary',
  followers,
  eventsCount,
  hostingDuration,
  showActions = true,
  onContact,
}: OrganizerCardProps) {
  const formattedFollowers = typeof followers === 'number' 
    ? followers.toLocaleString() 
    : followers

  return (
    <div className="rounded-md border border-border/70 bg-card/60 p-5 transition-all hover:border-primary/20">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4 sm:items-center">
          <GradientAvatar name={name} size="lg" gradient={gradient} />
          <div className="flex flex-col gap-1.5">
            <p className="heading-4 text-foreground">{name}</p>
            <div className="body-small flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
              {formattedFollowers !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/70">Followers</span>
                  <span className="text-foreground">{formattedFollowers}</span>
                </div>
              )}
              {eventsCount !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/70">Events</span>
                  <span className="text-foreground">{eventsCount}</span>
                </div>
              )}
              {hostingDuration && (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/70">Hosting</span>
                  <span className="text-foreground">{hostingDuration}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {showActions && (
          <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
            <OrganizerFollowButton organizerName={name} />
            <Button variant="outline" onClick={onContact}>
              Contact
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

