import { PageHeaderSkeleton, SectionSkeleton } from '@/components/ui'

export default function RegistrationsLoading() {
  return (
    <section className="flex flex-1 flex-col">
      <PageHeaderSkeleton showBreadcrumb />
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 lg:px-8">
        {/* Filter tabs skeleton */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-24 animate-pulse rounded-full bg-muted"
            />
          ))}
        </div>
        {/* Registration cards */}
        <SectionSkeleton showDivider={false} itemCount={5} layout="list" />
      </div>
    </section>
  )
}
