import type { Metadata } from "next";
import { buildMetadata } from "@/constants/seo";
import type { LucideIcon } from "lucide-react";
import { Building2, ScrollText, UserPlus, Wallet } from "lucide-react";

import { getRecentActivity, type ActivityItem } from "@/lib/services/activity";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyStateCard } from "@/components/shared/empty-state-card";

export const metadata: Metadata = buildMetadata({
  title: "Activité",
  description: "Activité récente de la plateforme : inscriptions, créations d'organisations et événements.",
  path: "/admin/activity",
  noindex: true,
});

const ICONS: Record<ActivityItem["type"], LucideIcon> = {
  audit: ScrollText,
  user_signup: UserPlus,
  org_created: Building2,
  payment: Wallet,
};

export default async function AdminActivityPage() {
  const activity = await getRecentActivity();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Activité récente"
        subtitle="Les derniers événements sur la plateforme : inscriptions, organisations, paiements, actions."
      />

      <Section title="Flux d'activité" description="Timeline des événements récents.">
        {activity.length === 0 ? (
          <EmptyStateCard
            icon={ScrollText}
            title="Aucune activité"
            description="Aucun événement enregistré pour le moment."
          />
        ) : (
          <Card>
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
        )}
      </Section>
    </div>
  );
}
