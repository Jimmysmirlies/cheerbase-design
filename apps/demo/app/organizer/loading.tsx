import { Skeleton } from "@workspace/ui/shadcn/skeleton";

export default function OrganizerDashboardLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/60 bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="size-8 rounded-md" />
            </div>
            <Skeleton className="mt-4 h-8 w-24 rounded" />
            <Skeleton className="mt-2 h-3.5 w-32 rounded" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-card p-6">
          <Skeleton className="mb-6 h-6 w-36 rounded" />
          <Skeleton className="h-64 w-full rounded" />
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-6">
          <Skeleton className="mb-6 h-6 w-40 rounded" />
          <Skeleton className="h-64 w-full rounded" />
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-lg border border-border/60 bg-card p-6">
        <Skeleton className="mb-6 h-6 w-36 rounded" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border border-border/40 p-4"
            >
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-3.5 w-24 rounded" />
              </div>
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
