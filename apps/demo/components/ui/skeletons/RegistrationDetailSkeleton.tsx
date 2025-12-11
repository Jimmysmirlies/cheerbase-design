import { PageHeaderSkeleton } from './PageHeaderSkeleton'
import { OrganizerCardSkeleton } from './OrganizerCardSkeleton'
import { TeamCardSkeleton } from './TeamCardSkeleton'
import { InvoiceSkeleton } from './InvoiceSkeleton'
import { Skeleton } from '@workspace/ui/shadcn/skeleton'

/**
 * Full page skeleton for Registration Detail page.
 * Shows loading state matching the RegistrationDetailContent layout.
 */
export function RegistrationDetailSkeleton() {
  return (
    <section className="flex flex-1 flex-col">
      <PageHeaderSkeleton showBreadcrumb showAction />
      
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="space-y-12">
            {/* Event Details Section */}
            <div className="flex flex-col gap-4 px-1">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-6 w-32 rounded" />
                  <Skeleton className="h-4 w-28 rounded" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <OrganizerCardSkeleton />
                {/* Date & Location card */}
                <div className="rounded-md border border-border/70 bg-card/60 p-5">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-4">
                      <Skeleton className="h-3.5 w-28 rounded" />
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                          <Skeleton className="size-4 rounded-full" />
                          <Skeleton className="h-4 w-40 rounded" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="size-4 rounded-full" />
                          <Skeleton className="h-4 w-32 rounded" />
                        </div>
                      </div>
                    </div>
                    <Skeleton className="aspect-[3/2] w-full rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Registered Teams Section */}
            <div className="flex flex-col gap-4 px-1">
              <div className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-36 rounded" />
                  <Skeleton className="h-4 w-28 rounded" />
                </div>
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
              <div className="flex flex-col gap-6">
                {/* Division groups */}
                {[1, 2].map((division) => (
                  <div key={division} className="flex flex-col gap-3">
                    <Skeleton className="h-3.5 w-40 rounded" />
                    <TeamCardSkeleton />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
            <InvoiceSkeleton lineItems={2} />
          </div>
        </div>
      </div>

      {/* Mobile sticky bar placeholder */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-md" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
      <div className="h-20 lg:hidden" />
    </section>
  )
}
