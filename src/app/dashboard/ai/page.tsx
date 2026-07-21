import type { Metadata } from "next";
import { Sparkles, FileText } from "lucide-react";

import { buildMetadata } from "@/constants/seo";
import { requireAuth } from "@/lib/auth/require-auth";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { canUseFeature } from "@/lib/services/feature-gate";
import { getPlatformSettings } from "@/lib/services/platform-settings";
import { listQuizzes } from "@/lib/services/quiz";
import { getOrganizationMembers } from "@/lib/services/organization";
import { getAiSettings } from "@/lib/services/ai-settings";
import { roleAtLeast } from "@/constants/roles";
import * as conversationService from "@/lib/services/ai-conversation";
import { Badge } from "@/components/ui/badge";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { UpgradeBanner } from "@/features/dashboard/components/upgrade-banner";
import { AiChatWorkspace } from "@/features/ai/components/ai-chat-workspace";
import { AiSettingsDialog } from "@/features/ai/components/ai-settings-dialog";
import type { FeatureKey } from "@/generated/prisma/client";
import Link from "next/link";

export const metadata: Metadata = buildMetadata({
  title: "Assistant IA",
  description:
    "Discutez avec l'assistant IA de QuizNest pour générer des questions de quiz et les importer directement dans vos quiz.",
  path: "/dashboard/ai",
});

export default async function AiPage() {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  const [quizzes, aiCheck, platformSettings, conversations, members, aiSettings] = await Promise.all([
    listQuizzes(organization.id),
    canUseFeature(organization.id, "AI_GENERATION" as FeatureKey),
    getPlatformSettings(),
    conversationService.listConversations(organization.id, session.user.id),
    getOrganizationMembers(organization.id),
    getAiSettings(organization.id),
  ]);

  const currentMember = members.find((m) => m.userId === session.user.id);
  const canManage = currentMember ? roleAtLeast(currentMember.role, "ADMIN") : false;

  const isGated = !aiCheck.allowed && platformSettings.aiGeneration;
  const aiDisabled = !platformSettings.aiGeneration;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Assistant IA"
          subtitle="Discutez avec l'IA pour créer vos questions, puis importez-les directement dans un quiz."
        />
        <AiSettingsDialog initialSettings={aiSettings} canManage={canManage} />
      </div>

      {aiDisabled ? (
        <EmptyStateCard
          icon={Sparkles}
          title="Génération IA désactivée"
          description="La génération de questions par IA est actuellement désactivée par l'administrateur de la plateforme."
        />
      ) : (
        <>
          {isGated && (
            <UpgradeBanner
              title="Quota IA atteint"
              description="Passez à un plan supérieur, achetez un Pack IA, ou configurez votre propre clé API dans les réglages IA pour continuer sans limite de plateforme."
              variant="card"
              features={["Génération illimitée avec votre clé", "Tous les types de questions", "Historique de conversation"]}
              icon={Sparkles}
              ctaLabel="Voir les plans"
            />
          )}

          {quizzes.length === 0 ? (
            <EmptyStateCard
              icon={FileText}
              title="Créez d'abord un quiz"
              description="L'assistant IA importe les questions dans un quiz existant — créez-en un pour commencer."
            />
          ) : (
            <AiChatWorkspace
              quizzes={quizzes.map((q) => ({ id: q.id, title: q.title }))}
              initialConversations={conversations.map((c) => ({
                id: c.id,
                title: c.title,
                quizId: c.quizId,
                quiz: c.quiz,
                updatedAt: c.updatedAt,
              }))}
              aiAllowed={aiCheck.allowed}
            />
          )}
        </>
      )}

      {quizzes.length > 0 && (
        <Section title="Accès rapide" description="Ouvrir un quiz pour gérer ses questions manuellement.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/dashboard/quiz/${quiz.id}`}
                className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="size-8 shrink-0 text-muted-foreground group-hover:text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium group-hover:text-primary">{quiz.title}</p>
                    <Badge variant={quiz.status === "PUBLISHED" ? "default" : "secondary"} className="mt-1 text-[10px]">
                      {quiz.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
