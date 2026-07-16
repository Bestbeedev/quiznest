import type { Metadata } from "next";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { listAllQuestions } from "@/lib/services/question";
import { DataTable } from "@/components/shared/data-table";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { questionBankColumns } from "@/features/quiz/components/question-bank-columns";
import { HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Questions — QuizNest",
};

export default async function QuestionsPage() {
  const organization = await requireActiveOrganization();
  const questions = await listAllQuestions(organization.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Banque de questions</h1>
        <p className="text-sm text-muted-foreground">
          Toutes les questions de vos quiz, réunies au même endroit.
        </p>
      </div>

      {questions.length === 0 ? (
        <EmptyStateCard
          icon={HelpCircle}
          title="Aucune question pour le moment"
          description="Ajoutez des questions à un quiz pour les retrouver ici."
        />
      ) : (
        <DataTable
          columns={questionBankColumns}
          data={questions}
          searchColumn="title"
          searchPlaceholder="Rechercher une question..."
        />
      )}
    </div>
  );
}
