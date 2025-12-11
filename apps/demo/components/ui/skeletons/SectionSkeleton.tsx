import { Skeleton } from '@workspace/ui/shadcn/skeleton'
import { cn } from '@workspace/ui/lib/utils'

type SectionSkeletonProps = {
  /** Whether to show a divider line above the section */
  showDivider?: boolean
  /** Number of content items/cards to show */
  itemCount?: number
  /** Layout for items */
  layout?: 'list' | 'grid'
  /** Grid columns (only used when layout is 'grid') */
  columns?: 2 | 3 | 4
  className?: string
}

/**
 * Skeleton for section content with heading and items.
 * Used for loading states of content sections.
 */
export function SectionSkeleton({
  showDivider = true,
  itemCount = 3,
  layout = 'list',
  columns = 3,
  className,
}: SectionSkeletonProps) {
  const gridColClasses = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('flex flex-col gap-4 px-1', className)}>
      <div className="flex flex-col gap-4">
        {showDivider && <div className="h-px w-full bg-border" />}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      </div>
      <div
        className={cn(
          layout === 'grid' && `grid gap-4 ${gridColClasses[columns]}`,
          layout === 'list' && 'flex flex-col gap-3'
        )}
      >
        {Array.from({ length: itemCount }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-border/70 bg-card/60 p-5"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-3.5 w-24 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
