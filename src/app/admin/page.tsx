import type { Metadata } from "next";
import { Building2, ListChecks, Users } from "lucide-react";

import { getPlatformStats } from "@/lib/services/admin";
import { StatCard } from "@/components/shared/stat-card";

export const metadata: Metadata = {
  title: "Administration — QuizNest",
};

export default async function AdminOverviewPage() {
  const stats = await getPlatformStats();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vue d&apos;ensemble</h1>
        <p className="text-sm text-muted-foreground">Gestion globale de la plateforme QuizNest.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} label="Organisations" value={String(stats.organizations)} />
        <StatCard icon={Users} label="Utilisateurs" value={String(stats.users)} />
        <StatCard icon={ListChecks} label="Quiz" value={String(stats.quizzes)} />
      </div>
    </div>
  );
}
