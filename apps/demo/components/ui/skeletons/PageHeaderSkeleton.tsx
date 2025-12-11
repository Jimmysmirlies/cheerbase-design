import { Skeleton } from '@workspace/ui/shadcn/skeleton'
import { cn } from '@workspace/ui/lib/utils'

type PageHeaderSkeletonProps = {
  /** Whether to show breadcrumb placeholder */
  showBreadcrumb?: boolean
  /** Whether to show subtitle placeholder */
  showSubtitle?: boolean
  /** Whether to show action button placeholder */
  showAction?: boolean
  className?: string
}

/**
 * Skeleton for PageHeader component.
 * Mimics the gradient header with title and optional elements.
 */
export function PageHeaderSkeleton({
  showBreadcrumb = true,
  showSubtitle = false,
  showAction = false,
  className,
}: PageHeaderSkeletonProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden border-b border-border/70 bg-gradient-to-br from-primary/20 via-primary/10 to-background',
        className
      )}
    >
      <header className="flex min-h-[240px] w-full max-w-full flex-col justify-between px-4 pb-8 pt-4 lg:mx-auto lg:max-w-7xl lg:px-8">
        {/* Top row: action */}
        <div className="flex justify-end">
          {showAction && <Skeleton className="h-9 w-24 rounded-full bg-white/20" />}
        </div>
        <div className="flex flex-col justify-end gap-4">
          <div className="flex flex-col gap-2">
            {/* Breadcrumb */}
            {showBreadcrumb && (
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16 rounded bg-white/20" />
                <span className="text-white/40">/</span>
                <Skeleton className="h-3 w-24 rounded bg-white/20" />
              </div>
            )}
            {/* Title */}
            <Skeleton className="h-9 w-64 rounded bg-white/30" />
          </div>
          {/* Subtitle */}
          {showSubtitle && (
            <>
              <Skeleton className="h-4 w-3/4 rounded bg-white/20" />
              <div className="h-px w-full bg-white/20" />
            </>
          )}
        </div>
      </header>
    </div>
  )
}
