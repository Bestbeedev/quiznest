import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type QuestionStat = { id: string; title: string; successRate: number | null };

/** Green (high success) → amber → red (low success), on a fixed 5-step scale
 * so the color always means the same thing regardless of which questions are
 * shown — never a relative/auto-scaled gradient. */
function heatColor(rate: number | null) {
  if (rate === null) return "bg-muted text-muted-foreground";
  if (rate >= 80) return "bg-primary text-primary-foreground";
  if (rate >= 60) return "bg-primary/70 text-primary-foreground";
  if (rate >= 40) return "bg-amber-500/70 text-white";
  if (rate >= 20) return "bg-destructive/60 text-white";
  return "bg-destructive text-white";
}

export function QuestionHeatmap({ questionStats }: { questionStats: QuestionStat[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Heatmap des questions</CardTitle>
        <CardDescription>Taux de réussite par question — les plus difficiles ressortent en rouge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
          {questionStats.map((question, index) => (
            <div
              key={question.id}
              title={`${question.title} — ${question.successRate === null ? "aucune donnée" : `${question.successRate}%`}`}
              className={cn(
                "flex  flex-col items-center py-8 justify-center rounded-xl text-xs font-semibold",
                heatColor(question.successRate),
              )}
            >
              <span>Q{index + 1}</span>
              <span className="text-[10px] font-normal opacity-90">
                {question.successRate === null ? "—" : `${question.successRate}%`}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
