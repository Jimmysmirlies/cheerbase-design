import { Skeleton } from '@workspace/ui/shadcn/skeleton'
import { EventCardSkeleton } from './EventCardSkeleton'

/**
 * Full page skeleton for Event Detail page.
 * Shows loading state for the event hero, details, and registration card.
 */
export function EventDetailSkeleton() {
  return (
    <main className="bg-background text-foreground">
      {/* Hero skeleton */}
      <div className="relative w-full overflow-hidden">
        <Skeleton className="aspect-[21/9] w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-4">
            <Skeleton className="h-4 w-24 rounded bg-white/30" />
            <Skeleton className="h-10 w-96 rounded bg-white/40" />
            <Skeleton className="h-5 w-64 rounded bg-white/30" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main content */}
          <div className="space-y-10">
            {/* Quick info bar */}
            <div className="flex flex-wrap gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="size-5 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              ))}
            </div>

            {/* Description section */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>
            </div>

            {/* Timeline section */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40 rounded" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 rounded-lg border border-border/60 p-4">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-3.5 w-full rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery section */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-24 rounded" />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="aspect-video rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Registration card */}
          <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="space-y-4">
                <Skeleton className="h-5 w-36 rounded" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                </div>
                <div className="h-px w-full bg-border/60" />
                {/* Countdown */}
                <div className="flex justify-center gap-4 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <Skeleton className="h-8 w-12 rounded" />
                      <Skeleton className="mt-1 h-3 w-8 rounded" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Related events section */}
        <div className="mt-16 space-y-6">
          <Skeleton className="h-7 w-48 rounded" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <EventCardSkeleton key={i} size="compact" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
