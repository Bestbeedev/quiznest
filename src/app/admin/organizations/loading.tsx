import { PageHeaderSkeleton, StatsRowSkeleton, DataTableSkeleton, SectionSkeleton } from "@/components/shared/admin-skeleton";

export default function AdminOrganizationsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeaderSkeleton />
      <StatsRowSkeleton count={4} />
      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <DataTableSkeleton rows={8} cols={5} />
      </section>
    </div>
  );
}
