import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { EmptyStateCard } from "@/components/shared/empty-state-card";

export const metadata: Metadata = {
  title: "Analytics — QuizNest",
};

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Distribution des scores, taux de réussite par catégorie et évolution des participants.
        </p>
      </div>

      <EmptyStateCard
        icon={BarChart3}
        title="Pas encore de données"
        description="Les statistiques détaillées apparaîtront ici une fois que vos quiz publiés auront reçu des réponses."
      />
    </div>
  );
}
