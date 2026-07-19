"use client";

import { ListChecks } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { quizColumns } from "@/features/quiz/components/quiz-columns";
import { NewQuizDialog } from "@/features/quiz/components/new-quiz-dialog";
import { QuizGrid } from "@/features/quiz/components/quiz-grid";
import { QuizViewToggle } from "@/features/quiz/components/quiz-view-toggle";
import { useQuizView } from "@/features/quiz/components/quiz-view-context";
import { QuizTableToolbar } from "@/features/quiz/components/quiz-table-toolbar";
import { QuizBulkActions } from "@/features/quiz/components/quiz-bulk-actions";
import { UpgradeBanner } from "@/features/dashboard/components/upgrade-banner";
import { QuizStatusChart } from "./quiz-status-chart";
import type { QuizRow } from "@/features/quiz/components/quiz-columns";

export function QuizListView({
  quizzes,
  planSlug,
  quizLimit,
}: {
  quizzes: QuizRow[];
  planSlug: string;
  quizLimit: number | null;
}) {
  const { view } = useQuizView();

  const draft = quizzes.filter((q) => q.status === "DRAFT").length;
  const published = quizzes.filter((q) => q.status === "PUBLISHED").length;
  const archived = quizzes.filter((q) => q.status === "ARCHIVED").length;

  const isFree = planSlug === "free";
  const approachingLimit = quizLimit !== null && quizzes.length >= quizLimit * 0.8;
  const atLimit = quizLimit !== null && quizzes.length >= quizLimit;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quiz"
        subtitle={`${quizzes.length} quiz${quizzes.length !== 1 ? "s" : ""}${quizLimit !== null ? ` / ${quizLimit} max` : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <QuizViewToggle />
            <NewQuizDialog />
          </div>
        }
      />

      {isFree && (
        <UpgradeBanner
          title="Créez plus de quiz"
          description="Le plan Free vous limite à 3 quiz. Passez au Professional pour une création illimitée."
          variant="compact"
          icon={ListChecks}
          ctaLabel="Upgrade"
        />
      )}

      {!isFree && atLimit && quizLimit !== null && (
        <UpgradeBanner
          title="Limite de quiz atteinte"
          description={`Vous avez atteint la limite de ${quizLimit} quiz. Passez à un plan supérieur pour continuer.`}
          variant="compact"
          icon={ListChecks}
          ctaLabel="Upgrade"
        />
      )}

      {!isFree && approachingLimit && !atLimit && quizLimit !== null && (
        <UpgradeBanner
          title="Vous approchez de la limite"
          description={`Vous avez ${quizzes.length} quiz sur ${quizLimit} autorisés. Pensez à upgrader.`}
          variant="compact"
          icon={ListChecks}
          ctaLabel="Upgrade"
        />
      )}

      {quizzes.length > 0 && (
        <QuizStatusChart draft={draft} published={published} archived={archived} />
      )}

      {view === "grid" ? (
        <QuizGrid quizzes={quizzes} />
      ) : (
        <DataTable
          columns={quizColumns}
          data={quizzes}
          searchColumn="title"
          searchPlaceholder="Rechercher un quiz..."
          enableRowSelection
          enableColumnVisibility
          toolbar={(table) => <QuizTableToolbar table={table} quizzes={quizzes} />}
          bulkActionsBar={(table) => <QuizBulkActions table={table} />}
        />
      )}
    </div>
  );
}
