import { PageHeaderSkeleton, SectionSkeleton, TimelineSkeleton } from "@/components/shared/admin-skeleton";

export default function AdminActivityLoading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeaderSkeleton />
      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <TimelineSkeleton rows={8} />
      </section>
    </div>
  );
}
