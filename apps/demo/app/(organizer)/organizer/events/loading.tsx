import { Skeleton } from "@workspace/ui/shadcn/skeleton";

export default function OrganizerEventsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32 rounded" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-40 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Event cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/60 bg-card overflow-hidden"
          >
            <Skeleton className="aspect-video w-full" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-3.5 w-24 rounded" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
