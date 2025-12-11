import { Skeleton } from '@workspace/ui/shadcn/skeleton'

/**
 * Full page skeleton for the invoice page.
 * Matches the InvoicePageClient layout with header, invoice content, and sidebar.
 */
export function InvoicePageSkeleton() {
  return (
    <section className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        {/* Header with back button and layout toggle */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Invoice content */}
          <div className="flex flex-col gap-6">
            {/* Invoice header card */}
            <div className="rounded-xl border border-border/60 bg-card p-6">
              <div className="flex flex-col gap-6">
                {/* Title row */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-40 rounded" />
                    <Skeleton className="h-4 w-64 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-20 rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                  </div>
                </div>

                {/* Invoice summary section */}
                <div className="space-y-4">
                  <Skeleton className="h-5 w-32 rounded" />
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-3 w-20 rounded" />
                        <Skeleton className="h-5 w-28 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Line items table */}
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24 rounded" />
                  <div className="overflow-hidden rounded-md border border-border/70">
                    <Skeleton className="h-10 w-full" />
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14 w-full border-t border-border/60" />
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-20 rounded" />
                        <Skeleton className="h-4 w-16 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block border-l border-border">
            <div className="sticky top-8 w-full pl-4 space-y-4">
              <div className="space-y-3">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="border-t border-border pt-4 space-y-3">
                <Skeleton className="h-3 w-24 rounded" />
                <div className="rounded-md border border-dashed border-border/60 p-4">
                  <Skeleton className="h-3 w-24 mx-auto rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}



