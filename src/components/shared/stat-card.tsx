import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  muted,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  muted?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn("mt-1 text-2xl font-semibold", muted && "text-muted-foreground")}>
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <Icon className="size-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}
