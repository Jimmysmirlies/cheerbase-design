import { PageHeaderSkeleton, SectionSkeleton } from "@/components/ui";

export default function ClubsLoading() {
  return (
    <section className="flex flex-1 flex-col">
      <PageHeaderSkeleton showBreadcrumb />
      <div className="page-container page-section space-y-12">
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
