"use client";

import { Button } from "@workspace/ui/shadcn/button";
import { Skeleton } from "@workspace/ui/shadcn/skeleton";

import { GradientAvatar } from "@/components/ui/GradientAvatar";
import { OrganizerFollowButton } from "@/components/features/clubs/OrganizerFollowButton";
import { brandGradients, type BrandGradient } from "@/lib/gradients";

type OrganizerCardProps = {
  /** Organizer display name */
  name: string;
  /** Brand gradient key for avatar */
  gradient?: BrandGradient;
  /** Number of followers (formatted string or number) */
  followers?: string | number;
  /** Number of events hosted */
  eventsCount?: number;
  /** How long they've been hosting (e.g., "3 years") */
  hostingDuration?: string;
  /** Whether to show action buttons (Follow, Contact) */
  showActions?: boolean;
  /** Callback when contact button is clicked */
  onContact?: () => void;
  /** Show loading skeleton instead of content */
  isLoading?: boolean;
};

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
  gradient = "teal",
  followers,
  eventsCount,
  hostingDuration,
  showActions = true,
  onContact,
  isLoading = false,
}: OrganizerCardProps) {
  const formattedFollowers =
    typeof followers === "number" ? followers.toLocaleString() : followers;

  // Get gradient styling
  const gradientConfig = brandGradients[gradient];
  const gradientCss = gradientConfig.css;
  const firstGradientColor =
    gradientCss.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? "#0D9488";

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-md border border-border/70 bg-card/60 p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 sm:items-center">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-36 rounded" />
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-16 rounded" />
                  <Skeleton className="h-3.5 w-10 rounded" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-12 rounded" />
                  <Skeleton className="h-3.5 w-6 rounded" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-14 rounded" />
                  <Skeleton className="h-3.5 w-12 rounded" />
                </div>
              </div>
            </div>
          </div>
          {showActions && (
            <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-md border p-5 transition-all overflow-hidden"
      style={{
        borderColor: `${firstGradientColor}50`,
      }}
    >
      {/* Gradient background overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: gradientCss,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
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
  );
}
