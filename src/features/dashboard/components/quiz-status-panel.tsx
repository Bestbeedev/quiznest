import { FileQuestion } from "lucide-react";

const STATUS_ROWS = [
  { key: "PUBLISHED" as const, label: "Publiés", barClass: "bg-primary" },
  { key: "DRAFT" as const, label: "Brouillons", barClass: "bg-primary/55" },
  { key: "ARCHIVED" as const, label: "Archivés", barClass: "bg-primary/25" },
];

/** Category-breakdown-style panel: total up top, a single stacked bar, then a
 * legend list with per-status counts — the honest total is `total`, computed
 * from the same breakdown rather than re-derived, so the bar and legend can
 * never drift apart. */
export function QuizStatusPanel({
  breakdown,
}: {
  breakdown: { DRAFT: number; PUBLISHED: number; ARCHIVED: number };
}) {
  const total = breakdown.DRAFT + breakdown.PUBLISHED + breakdown.ARCHIVED;

  if (total === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border bg-card p-8 text-center">
        <FileQuestion className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Créez un quiz pour voir sa répartition ici.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border bg-card p-5">
      <div>
        <p className="text-sm text-muted-foreground">Répartition des quiz</p>
        <p className="text-2xl font-bold tracking-tight">{total}</p>
      </div>

      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {STATUS_ROWS.map((row) => {
          const value = breakdown[row.key];
          if (value === 0) return null;
          return (
            <div
              key={row.key}
              className={row.barClass}
              style={{ width: `${(value / total) * 100}%` }}
            />
          );
        })}
      </div>

      <ul className="flex flex-col gap-3">
        {STATUS_ROWS.map((row) => {
          const value = breakdown[row.key];
          const percent = Math.round((value / total) * 100);
          return (
            <li key={row.key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className={`size-2.5 shrink-0 rounded-full ${row.barClass}`} />
                {row.label}
              </span>
              <span className="font-medium">
                {value} <span className="text-muted-foreground">({percent}%)</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
