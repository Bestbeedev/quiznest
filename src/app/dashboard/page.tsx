import { Activity, LineChart, ListChecks, Percent, Users } from "lucide-react";

import { getActiveOrganization } from "@/lib/db/tenant";
import { getQuizStats, getRecentQuizzes } from "@/lib/services/quiz";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { Reveal } from "@/components/shared/reveal";
import { RecentQuizzesCard } from "@/features/dashboard/components/recent-quizzes-card";

export default async function DashboardPage() {
  const organization = await getActiveOrganization();
  if (!organization) return null;

  const [stats, recentQuizzes] = await Promise.all([
    getQuizStats(organization.id),
    getRecentQuizzes(organization.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Organisation : {organization.name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal>
          <StatCard icon={ListChecks} label="Quiz créés" value={String(stats.total)} />
        </Reveal>
        <Reveal delay={0.05}>
          <StatCard icon={Activity} label="Quiz publiés" value={String(stats.published)} />
        </Reveal>
        <Reveal delay={0.1}>
          <StatCard icon={Users} label="Participants" value="—" hint="Bientôt disponible" muted />
        </Reveal>
        <Reveal delay={0.15}>
          <StatCard icon={Percent} label="Taux de réussite" value="—" hint="Bientôt disponible" muted />
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.2}>
          <EmptyStateCard
            icon={LineChart}
            title="Évolution des scores"
            description="Publiez un quiz et récoltez des réponses pour voir apparaître vos statistiques d'évolution ici."
          />
        </Reveal>
        <Reveal delay={0.25}>
          <RecentQuizzesCard quizzes={recentQuizzes} />
        </Reveal>
      </div>
    </div>
  );
}
