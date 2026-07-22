import { PageHeaderSkeleton, StatsRowSkeleton, SectionSkeleton, TabsSkeleton, PlanCardSkeleton } from "@/components/shared/admin-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSettingsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeaderSkeleton />
      <TabsSkeleton count={5} />
      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <StatsRowSkeleton count={3} gridCols="sm:grid-cols-2 lg:grid-cols-3" />
      </section>
      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3 p-4">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="h-2 w-36" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
