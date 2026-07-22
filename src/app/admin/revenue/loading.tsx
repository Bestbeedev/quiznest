import { PageHeaderSkeleton, StatsRowSkeleton, SectionSkeleton, ChartSkeleton } from "@/components/shared/admin-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRevenueLoading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeaderSkeleton />
      <StatsRowSkeleton count={3} gridCols="sm:grid-cols-3" />
      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <ChartSkeleton height={220} />
      </section>
      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <Card>
          <CardContent className="p-0">
            <div className="border-t">
              <div className="flex items-center gap-4 border-b bg-muted/30 px-4 py-2.5">
                <Skeleton className="h-2.5 w-[25%]" />
                <Skeleton className="h-2.5 w-[15%]" />
                <Skeleton className="h-2.5 w-[15%]" />
                <Skeleton className="h-2.5 w-[20%]" />
                <Skeleton className="h-2.5 w-[25%]" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-0">
                  <Skeleton className="h-3 w-[25%]" />
                  <Skeleton className="h-3 w-[15%]" />
                  <Skeleton className="h-3 w-[15%]" />
                  <Skeleton className="h-3 w-[20%]" />
                  <Skeleton className="h-3 w-[25%]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
