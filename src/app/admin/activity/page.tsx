import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { Building2, ScrollText, UserPlus, Wallet } from "lucide-react";

import { getRecentActivity, type ActivityItem } from "@/lib/services/activity";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Activité — Admin QuizNest",
};

const ICONS: Record<ActivityItem["type"], LucideIcon> = {
  audit: ScrollText,
  user_signup: UserPlus,
  org_created: Building2,
  payment: Wallet,
};

export default async function AdminActivityPage() {
  const activity = await getRecentActivity();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Activité récente</h1>
        <p className="text-sm text-muted-foreground">
          Les derniers évènements sur la plateforme : inscriptions, organisations, paiements, actions.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col divide-y">
          {activity.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Aucune activité pour le moment.</p>
          )}
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
    </div>
  );
}
