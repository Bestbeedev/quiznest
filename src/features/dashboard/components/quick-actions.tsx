import Link from "next/link";
import { Sparkles, UserPlus, ListChecks, BarChart3, Users } from "lucide-react";

import { NewQuizDialog } from "@/features/quiz/components/new-quiz-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "Nouveau quiz",
    icon: Sparkles,
    variant: "default" as const,
    component: "dialog" as const,
  },
  {
    label: "Voir les quiz",
    icon: ListChecks,
    variant: "outline" as const,
    href: "/dashboard/quiz" as const,
  },
  {
    label: "Participants",
    icon: Users,
    variant: "outline" as const,
    href: "/dashboard/participants" as const,
  },
  {
    label: "Analytics",
    icon: BarChart3,
    variant: "outline" as const,
    href: "/dashboard/analytics" as const,
  },
  {
    label: "Inviter un membre",
    icon: UserPlus,
    variant: "outline" as const,
    disabled: true,
  },
  {
    label: "Importer un quiz",
    icon: Sparkles,
    variant: "outline" as const,
    href: "/dashboard/ai" as const,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Actions rapides
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {actions.map((action) => {
            if (action.component === "dialog") {
              return (
                <NewQuizDialog key={action.label}>
                  <button className="flex flex-col items-center gap-1.5 rounded-lg border bg-card px-2 py-3 text-xs font-medium text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                    <action.icon className="size-5" />
                    {action.label}
                  </button>
                </NewQuizDialog>
              );
            }

            if (action.href) {
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border bg-card px-2 py-3 text-xs font-medium text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <action.icon className="size-5" />
                  {action.label}
                </Link>
              );
            }

            return (
              <button
                key={action.label}
                disabled={action.disabled}
                className="flex cursor-not-allowed flex-col items-center gap-1.5 rounded-lg border bg-card px-2 py-3 text-xs font-medium text-muted-foreground/50 shadow-sm"
              >
                <action.icon className="size-5" />
                {action.label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
