import { Skeleton } from '@workspace/ui/shadcn/skeleton'
import { cn } from '@workspace/ui/lib/utils'

type OrganizerCardSkeletonProps = {
  showActions?: boolean
  className?: string
}

/**
 * Skeleton for OrganizerCard component.
 * Matches the organizer info card with avatar, stats, and action buttons.
 */
export function OrganizerCardSkeleton({ showActions = true, className }: OrganizerCardSkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-border/70 bg-card/60 p-5',
        className
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4 sm:items-center">
          {/* Avatar */}
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-2">
            {/* Name */}
            <Skeleton className="h-6 w-36 rounded" />
            {/* Stats row */}
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
  )
}
