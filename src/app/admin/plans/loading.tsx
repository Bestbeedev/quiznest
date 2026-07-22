import { PageHeaderSkeleton, SectionSkeleton, PlanCardSkeleton } from "@/components/shared/admin-skeleton";

export default function AdminPlansLoading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeaderSkeleton hasAction />
      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
