import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PageHeaderSkeleton({ hasAction = false }: { hasAction?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-3.5 w-56" />
      </div>
      {hasAction && <Skeleton className="h-9 w-36 rounded-lg" />}
    </div>
  );
}

export function SectionSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-3.5 w-28" />
      {lines > 1 && <Skeleton className="h-2.5 w-40" />}
    </div>
  );
}

export function StatCardSkeleton() {
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

export function StatsRowSkeleton({ count = 4, gridCols }: { count?: number; gridCols?: string }) {
  return (
    <section className="flex flex-col gap-3">
      <SectionSkeleton lines={2} />
      <div className={`grid gap-4 ${gridCols ?? "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {Array.from({ length: count }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function DataTableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-2.5 w-24" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t">
          <div className="flex items-center gap-4 border-b bg-muted/30 px-4 py-2.5">
            {Array.from({ length: cols }).map((_, i) => (
              <Skeleton key={i} className="h-2.5" style={{ width: i === 0 ? "8%" : `${92 / cols}%` }} />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, row) => (
            <div key={row} className="flex items-center gap-4 border-b px-4 py-3 last:border-0">
              {Array.from({ length: cols }).map((_, col) => (
                <Skeleton
                  key={col}
                  className="h-3"
                  style={{ width: col === 0 ? "8%" : col === cols - 1 ? "12%" : `${72 / cols}%` }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t px-4 py-2.5">
          <Skeleton className="h-2.5 w-32" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ListCardSkeleton({ rows = 5, hasHeader = true }: { rows?: number; hasHeader?: boolean }) {
  return (
    <Card>
      {hasHeader && (
        <CardHeader className="pb-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </CardHeader>
      )}
      <CardContent className="flex flex-col divide-y p-4 pt-0">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-2.5 w-full max-w-[70%]" />
              <Skeleton className="h-2 w-24" />
            </div>
            <Skeleton className="h-2.5 w-16 shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TimelineSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Card>
      <CardContent className="flex flex-col divide-y p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <Skeleton className="mt-0.5 size-2.5 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1">
              <Skeleton className="h-2.5 w-full max-w-[80%]" />
              <Skeleton className="h-2 w-20" />
            </div>
            <Skeleton className="h-2 w-14 shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
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
        <div className="flex items-end gap-2 px-2" style={{ height }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <Skeleton
                className="w-full rounded-t-sm"
                style={{ height: `${20 + Math.sin(i * 0.9) * 35 + i * 4}%` }}
              />
              <Skeleton className="h-1.5 w-6" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TabsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-1 border-b">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-9 rounded-t-md" style={{ width: `${100 / count}%` }} />
      ))}
    </div>
  );
}

export function PlanCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-2 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-3.5 rounded-full" />
              <Skeleton className="h-2.5 w-28" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CreditPackSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
        <Skeleton className="h-9 w-20 rounded-lg" />
      </CardContent>
    </Card>
  );
}
