import type { Metadata } from "next";
import { Suspense } from "react";
import { UserX } from "lucide-react";
import { RegisterForm } from "@/features/authentication/components/register-form";
import { getPlatformSettings } from "@/lib/services/platform-settings";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-auth";
import { buildMetadata } from "@/constants/seo";

export const metadata: Metadata = buildMetadata({
  title: "Créer un compte gratuit",
  description:
    "Inscrivez-vous gratuitement sur QuizNest et créez votre premier quiz en moins de 2 minutes. IA intégrée, analytics avancés, sans engagement.",
  path: "/register",
  keywords: [
    "inscription gratuite quiz",
    "créer compte quiznest",
    "s'inscrire plateforme évaluation",
    "quiz gratuit sans engagement",
    "nouveau compte quiz en ligne",
  ],
});

export default async function RegisterPage() {
  await redirectIfAuthenticated();
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
