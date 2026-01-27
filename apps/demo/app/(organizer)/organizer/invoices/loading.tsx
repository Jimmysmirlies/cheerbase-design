import { Skeleton } from "@workspace/ui/shadcn/skeleton";
import { Card, CardContent, CardHeader } from "@workspace/ui/shadcn/card";

export default function OrganizerInvoicesLoading() {
  return (
    <section className="mx-auto min-w-0 w-full max-w-6xl">
      {/* Page title skeleton - matches PageTitle component */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-32 rounded" />
      </div>

      {/* Season dropdown skeleton */}
      <div className="pt-6">
        <Skeleton className="h-10 w-[220px] rounded-md" />
      </div>

      {/* Tabs skeleton */}
      <div className="pt-6">
        <div className="flex items-center gap-1 rounded-full bg-muted/50 p-1 w-fit">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-36 rounded-full" />
        </div>
      </div>

      {/* Overview section */}
      <div className="pt-6">
        <Skeleton className="h-6 w-24 rounded mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="size-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 rounded" />
                <Skeleton className="h-3 w-24 rounded mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Table section */}
      <div className="pt-8">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="rounded-lg border border-border/60 bg-card">
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-border/40 px-4 py-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-4 rounded flex-1" />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border/40 px-4 py-4 last:border-b-0"
            >
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <Skeleton key={j} className="h-5 rounded flex-1" />
              ))}
            </div>
          ))}
        </div>

        {/* Count footer */}
        <div className="pt-4">
          <Skeleton className="h-4 w-48 rounded" />
        </div>
      </div>
    </section>
  );
}
