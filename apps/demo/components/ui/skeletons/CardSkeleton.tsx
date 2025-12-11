import { Skeleton } from '@workspace/ui/shadcn/skeleton'
import { cn } from '@workspace/ui/lib/utils'

type CardSkeletonProps = {
  /** Number of content rows to show */
  rows?: number
  /** Whether to show an image/media area at top */
  showMedia?: boolean
  /** Aspect ratio for media area */
  mediaAspect?: 'square' | 'video' | 'wide'
  className?: string
}

/**
 * Generic card skeleton with configurable rows and optional media area.
 * Use for loading states of card-based content.
 */
export function CardSkeleton({
  rows = 3,
  showMedia = false,
  mediaAspect = 'video',
  className,
}: CardSkeletonProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[2/1]',
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border border-border/60 bg-card',
        className
      )}
    >
      {showMedia && (
        <Skeleton className={cn('w-full rounded-none', aspectClasses[mediaAspect])} />
      )}
      <div className="flex flex-col gap-3 p-6">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              'h-4 rounded',
              i === 0 && 'w-3/4',
              i === 1 && 'w-1/2',
              i >= 2 && 'w-full'
            )}
          />
        ))}
      </div>
    </div>
  )
}
