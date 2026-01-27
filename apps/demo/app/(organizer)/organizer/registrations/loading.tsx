import { Skeleton } from "@workspace/ui/shadcn/skeleton";

export default function OrganizerRegistrationsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36 rounded" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Registration table */}
      <div className="rounded-lg border border-border/60 bg-card">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border/40 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-20 rounded flex-1" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border/40 p-4 last:border-b-0"
          >
            {[1, 2, 3, 4, 5].map((j) => (
              <Skeleton key={j} className="h-5 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}
