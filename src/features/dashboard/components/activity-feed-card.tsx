import type { LucideIcon } from "lucide-react";
import { Activity, ScrollText, UserCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import type { OrgActivityItem } from "@/lib/services/activity";

const ICONS: Record<OrgActivityItem["type"], LucideIcon> = {
  audit: ScrollText,
  participant: UserCheck,
};

export function ActivityFeedCard({ activity }: { activity: OrgActivityItem[] }) {
  if (activity.length === 0) {
    return (
      <EmptyStateCard
        icon={Activity}
        title="Activité récente"
        description="Les actions sur vos quiz et les tentatives de vos participants apparaîtront ici."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activité récente</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y">
        {activity.map((item) => {
          const Icon = ICONS[item.type];
          return (
            <div key={`${item.type}-${item.id}`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                {item.detail && <p className="truncate text-xs text-muted-foreground">{item.detail}</p>}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(
                  item.createdAt,
                )}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
