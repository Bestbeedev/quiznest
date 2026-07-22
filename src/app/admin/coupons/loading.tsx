import { PageHeaderSkeleton, SectionSkeleton, CreditPackSkeleton } from "@/components/shared/admin-skeleton";

export default function AdminCouponsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeaderSkeleton hasAction />
      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CreditPackSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
