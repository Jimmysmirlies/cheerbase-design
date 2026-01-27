import { Skeleton } from "@workspace/ui/shadcn/skeleton";
import { CardSkeleton } from "@/components/ui";

export default function RegistrationsLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      {/* Page title with view toggle */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-40 rounded" />
        {/* View mode toggle skeleton */}
        <div className="inline-flex items-center rounded-md border border-border bg-background p-1">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Season dropdown skeleton */}
      <div className="pt-6">
        <Skeleton className="h-10 w-[220px] rounded-md" />
      </div>

      {/* Tabs skeleton */}
      <div className="pt-6">
        <div className="flex items-center gap-1 rounded-full bg-muted/50 p-1 w-fit">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      </div>

      {/* Event cards grid */}
      <div className="grid gap-4 pt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} rows={3} showMedia />
        ))}
      </div>
    </section>
  );
}
