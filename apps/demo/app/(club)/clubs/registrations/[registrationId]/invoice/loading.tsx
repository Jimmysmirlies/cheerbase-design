import { Skeleton } from '@workspace/ui/shadcn/skeleton'
import { PageHeaderSkeleton } from '@/components/ui'

export default function InvoiceLoading() {
  return (
    <section className="flex flex-1 flex-col">
      <PageHeaderSkeleton showBreadcrumb />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-20 rounded" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          </div>
          {/* Invoice content */}
          <div className="rounded-lg border border-border/60 bg-card p-8">
            <div className="space-y-8">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-32 rounded" />
                  <Skeleton className="h-4 w-48 rounded" />
                </div>
                <Skeleton className="h-10 w-28 rounded-md" />
              </div>
              {/* Invoice details */}
              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-16 rounded" />
                  <Skeleton className="h-5 w-32 rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-16 rounded" />
                  <Skeleton className="h-5 w-28 rounded" />
                </div>
              </div>
              {/* Line items table */}
              <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" />
                ))}
              </div>
              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  {[1, 2, 3].map((i) => (
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
      </div>
    </section>
  )
}
