import { Skeleton } from '@workspace/ui/shadcn/skeleton'
import { cn } from '@workspace/ui/lib/utils'
import { Card, CardContent } from '@workspace/ui/shadcn/card'

type EventCardSkeletonProps = {
  size?: 'default' | 'compact'
  className?: string
}

/**
 * Skeleton for EventCard component.
 * Matches the exact structure and dimensions of the real EventCard.
 */
export function EventCardSkeleton({ size = 'default', className }: EventCardSkeletonProps) {
  const isCompact = size === 'compact'

  return (
    <Card
      className={cn(
        'flex h-full w-full gap-0 overflow-hidden !rounded-md border border-border/60 p-0',
        className
      )}
    >
      {/* Hero image skeleton */}
      <Skeleton
        className={cn(
          'w-full rounded-none',
          isCompact ? 'aspect-[2.5/1]' : 'aspect-[2/1]'
        )}
      />
      {/* Content skeleton */}
      <CardContent className={cn('flex flex-1 flex-col px-6 py-6', isCompact ? 'gap-3' : 'gap-4')}>
        {/* Title block */}
        <div className={cn('space-y-2', isCompact && 'space-y-1.5')}>
          <Skeleton className={cn('rounded', isCompact ? 'h-5 w-4/5' : 'h-6 w-3/4')} />
          <Skeleton className={cn('rounded', isCompact ? 'h-3 w-1/2' : 'h-4 w-2/5')} />
        </div>
        {/* Meta items */}
        <div className={cn('space-y-2.5', isCompact && 'space-y-2')}>
          <div className="flex items-center gap-2">
            <Skeleton className={cn('rounded-full', isCompact ? 'size-3.5' : 'size-4')} />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className={cn('rounded-full', isCompact ? 'size-3.5' : 'size-4')} />
            <Skeleton className="h-3.5 w-36 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className={cn('rounded-full', isCompact ? 'size-3.5' : 'size-4')} />
            <Skeleton className="h-3.5 w-20 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
