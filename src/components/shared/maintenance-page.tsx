import { Wrench } from "lucide-react";

export function MaintenancePage({ message }: { message?: string | null }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Wrench className="size-7" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">Maintenance en cours</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {message?.trim()
          ? message
          : "QuizNest est actuellement en maintenance. Nous serons de retour très bientôt, merci de votre patience."}
      </p>
    </div>
  );
}
