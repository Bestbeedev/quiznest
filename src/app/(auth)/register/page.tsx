import type { Metadata } from "next";
import { Suspense } from "react";
import { UserX } from "lucide-react";
import { RegisterForm } from "@/features/authentication/components/register-form";
import { getPlatformSettings } from "@/lib/services/platform-settings";

export const metadata: Metadata = {
  title: "Créer un compte — QuizNest",
};

export default async function RegisterPage() {
  const settings = await getPlatformSettings();

  if (!settings.allowSignups) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <UserX className="size-6" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">Inscriptions fermées</h1>
        <p className="text-sm text-muted-foreground">
          La création de nouveaux comptes est temporairement désactivée. Réessayez plus tard.
        </p>
      </div>
    );
  }

  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
