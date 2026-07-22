import { PageHeaderSkeleton, StatsRowSkeleton, ListCardSkeleton, SectionSkeleton, ChartSkeleton } from "@/components/shared/admin-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOverviewLoading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeaderSkeleton />

      <StatsRowSkeleton count={5} gridCols="sm:grid-cols-2 lg:grid-cols-5" />

      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <ChartSkeleton height={200} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <SectionSkeleton lines={2} />
          <ListCardSkeleton rows={5} />
        </section>
        <section className="flex flex-col gap-3">
          <SectionSkeleton lines={2} />
          <ListCardSkeleton rows={5} />
        </section>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-center justify-between gap-4 py-6">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-2.5 w-48" />
          </div>
          <Skeleton className="h-3.5 w-12" />
        </CardContent>
      </Card>
    </div>
  );
}
