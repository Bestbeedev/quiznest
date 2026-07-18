import Link from "next/link";
import { Sparkles, UserPlus, ListChecks, BarChart3, Users, FileDown } from "lucide-react";

import { NewQuizDialog } from "@/features/quiz/components/new-quiz-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "Nouveau quiz",
    description: "Créez un quiz from scratch",
    icon: Sparkles,
    color: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    component: "dialog" as const,
  },
  {
    label: "Importer",
    description: "Générez avec l'IA",
    icon: FileDown,
    color: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    href: "/dashboard/ai" as const,
  },
  {
    label: "Mes quiz",
    description: "Gérez vos quiz",
    icon: ListChecks,
    color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    href: "/dashboard/quiz" as const,
  },
  {
    label: "Participants",
    description: "Suivez les résultats",
    icon: Users,
    color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    href: "/dashboard/participants" as const,
  },
  {
    label: "Analytics",
    description: "Statistiques détaillées",
    icon: BarChart3,
    color: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
    href: "/dashboard/analytics" as const,
  },
  {
    label: "Inviter",
    description: "Ajoutez un membre",
    icon: UserPlus,
    color: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400",
    disabled: true,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Actions rapides
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {actions.map((action) => {
            if (action.component === "dialog") {
              return (
                <NewQuizDialog key={action.label}>
                  <button className="group flex flex-col items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-md">
                    <div className={cn("flex size-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110", action.color)}>
                      <action.icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none group-hover:text-primary">{action.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </button>
                </NewQuizDialog>
              );
            }

            if (action.href) {
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex flex-col items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-md"
                >
                  <div className={cn("flex size-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110", action.color)}>
                    <action.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none group-hover:text-primary">{action.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={action.label}
                className="flex cursor-not-allowed flex-col items-start gap-3 rounded-xl border border-dashed bg-card/50 p-4 opacity-50"
              >
                <div className={cn("flex size-10 items-center justify-center rounded-lg grayscale", action.color)}>
                  <action.icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none text-muted-foreground">{action.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">{action.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
