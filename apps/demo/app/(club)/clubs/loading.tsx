import { PageHeaderSkeleton, SectionSkeleton } from "@/components/ui";

export default function ClubsLoading() {
  return (
    <section className="flex flex-1 flex-col">
      <PageHeaderSkeleton showBreadcrumb />
      <div className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 lg:px-8">
        <SectionSkeleton
          showDivider={false}
          itemCount={4}
          layout="grid"
          columns={2}
        />
      </div>
    </section>
  );
}
