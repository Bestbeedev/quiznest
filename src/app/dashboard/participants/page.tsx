import type { Metadata } from "next";
import { Users } from "lucide-react";

import { EmptyStateCard } from "@/components/shared/empty-state-card";

export const metadata: Metadata = {
  title: "Participants — QuizNest",
};

export default function ParticipantsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Participants</h1>
        <p className="text-sm text-muted-foreground">
          Suivez qui a répondu à vos évaluations et leurs résultats.
        </p>
      </div>

      <EmptyStateCard
        icon={Users}
        title="Aucun participant pour le moment"
        description="Publiez un quiz et partagez son lien ou code d'accès pour voir apparaître vos participants ici."
      />
    </div>
  );
}
