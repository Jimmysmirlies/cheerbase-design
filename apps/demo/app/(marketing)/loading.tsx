import { Skeleton } from '@workspace/ui/shadcn/skeleton'
import { EventCardSkeleton } from '@/components/ui'

export default function MarketingLoading() {
  return (
    <main className="bg-background text-foreground">
      {/* Hero skeleton */}
      <section className="relative grid min-h-[600px] w-full grid-cols-1 overflow-hidden lg:grid-cols-2">
        <div className="z-10 flex flex-col justify-center gap-8 p-8 lg:p-16">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-12 w-3/4 rounded" />
            <Skeleton className="h-5 w-full rounded" />
            <Skeleton className="h-5 w-2/3 rounded" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
        <div className="relative hidden lg:block">
          <Skeleton className="absolute inset-0" />
        </div>
      </section>

      {/* Quick filters skeleton */}
      <section className="border-y border-border/40 py-3">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 lg:px-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-full" />
          ))}
        </div>
      </section>

      {/* Featured events skeleton */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-7 w-40 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Event categories skeleton */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-7 w-48 rounded" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border border-border/60 p-4">
              <Skeleton className="size-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-28 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
