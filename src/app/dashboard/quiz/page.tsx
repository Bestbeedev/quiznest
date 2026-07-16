import type { Metadata } from "next";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { listQuizzes } from "@/lib/services/quiz";
import { DataTable } from "@/components/shared/data-table";
import { quizColumns } from "@/features/quiz/components/quiz-columns";
import { NewQuizDialog } from "@/features/quiz/components/new-quiz-dialog";

export const metadata: Metadata = {
  title: "Quiz — QuizNest",
};

export default async function QuizListPage() {
  const organization = await requireActiveOrganization();
  const quizzes = await listQuizzes(organization.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quiz</h1>
          <p className="text-sm text-muted-foreground">
            {quizzes.length} quiz{quizzes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <NewQuizDialog />
      </div>

      <DataTable
        columns={quizColumns}
        data={quizzes}
        searchColumn="title"
        searchPlaceholder="Rechercher un quiz..."
      />
    </div>
  );
}
