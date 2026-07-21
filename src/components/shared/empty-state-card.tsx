import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed py-6 text-center">
          <Icon className="size-6 text-muted-foreground" />
          <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
