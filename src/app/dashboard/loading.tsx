import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SectionSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-3.5 w-28" />
      {lines > 1 && <Skeleton className="h-2.5 w-40" />}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-3 p-3.5">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-4.5 w-10" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-2.5 w-36" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-4 pt-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-2.5 w-16 shrink-0" />
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted/50">
              <Skeleton className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${60 - i * 12}%` }} />
            </div>
            <Skeleton className="h-2.5 w-6 shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ListCardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-2.5 w-20" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 p-4 pt-0">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-7 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-2.5 w-full max-w-[70%]" />
              <Skeleton className="h-2 w-16" />
            </div>
            <Skeleton className="h-4 w-10 shrink-0 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-3.5 w-28" />
        </div>
        <Skeleton className="h-5 w-36 rounded-full" />
      </div>

      <Skeleton className="h-11 w-full rounded-xl" />

      <Skeleton className="h-14 w-full rounded-xl" />

      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full sm:w-32 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-xl border p-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4 shrink-0 rounded" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                    <Skeleton className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${70 - i * 10}%` }} />
                  </div>
                  <Skeleton className="h-2 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-2.5 w-36" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex gap-2 mb-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-20 rounded-full" />
                  ))}
                </div>
                <div className="flex h-[200px] items-end gap-2 px-2 pb-6">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <Skeleton className="w-full rounded-t-sm" style={{ height: `${20 + Math.sin(i * 0.8) * 40 + i * 5}%` }} />
                      <Skeleton className="h-1.5 w-6" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-2.5 w-20" />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-2.5 rounded-full" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2.5 w-6" />
                    <Skeleton className="h-2.5 w-8" />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <ChartSkeleton />
          <ListCardSkeleton rows={5} />
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-3.5 w-28" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 p-4 pt-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Skeleton className="mt-0.5 size-2 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <Skeleton className="h-2.5 w-full max-w-[85%]" />
                    <Skeleton className="h-2 w-14" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionSkeleton lines={2} />
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-3.5 w-20" />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-2.5 w-32" />
              <Skeleton className="h-2 w-24" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-3.5 w-20" />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Skeleton className="size-7 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-2.5 w-24" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <ListCardSkeleton rows={3} />
        </div>
      </section>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="mx-auto h-4 w-48" />
            <Skeleton className="mx-auto h-2.5 w-64" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
