import { Skeleton } from "@workspace/ui/shadcn/skeleton";
import { EventCardSkeleton } from "./EventCardSkeleton";

/**
 * Full page skeleton for Event Search page.
 * Shows loading state for filters and event cards grid.
 */
export function EventSearchSkeleton() {
  return (
    <main className="bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <Skeleton className="h-10 w-48 rounded" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </header>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-44 rounded-md" />
          <Skeleton className="h-10 w-44 rounded-md" />
        </div>

        {/* Results section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded" />
          </div>

          {/* Cards grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
