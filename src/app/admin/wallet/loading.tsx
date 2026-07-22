import { PageHeaderSkeleton, SectionSkeleton, CreditPackSkeleton } from "@/components/shared/admin-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminWalletLoading() {
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
      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t">
              <div className="flex items-center gap-4 border-b bg-muted/30 px-4 py-2.5">
                <Skeleton className="h-2.5 w-[40%]" />
                <Skeleton className="h-2.5 w-[30%]" />
                <Skeleton className="h-2.5 w-[30%]" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-0">
                  <div className="flex items-center gap-2.5 w-[40%]">
                    <Skeleton className="size-7 rounded-full" />
                    <Skeleton className="h-2.5 w-28" />
                  </div>
                  <Skeleton className="h-2.5 w-12" />
                  <Skeleton className="h-2.5 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
