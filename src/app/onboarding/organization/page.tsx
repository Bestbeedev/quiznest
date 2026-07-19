import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ListChecks, Share2, Sparkles } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-auth";
import { getActiveOrganization } from "@/lib/db/tenant";
import { CreateOrganizationForm } from "@/features/organizations/components/create-organization-form";
import { Logo } from "@/components/shared/logo";
import { buildMetadata } from "@/constants/seo";

export const metadata: Metadata = buildMetadata({
  title: "Créer votre organisation",
  description:
    "Configurez votre espace de travail QuizNest en quelques secondes. Ajoutez votre nom, logo et commencez à créer des quiz.",
  path: "/onboarding/organization",
  noindex: true,
});

const NEXT_STEPS = [
  { icon: Sparkles, title: "Créez votre organisation", desc: "Votre espace de travail, en 30 secondes." },
  { icon: ListChecks, title: "Créez votre premier quiz", desc: "Ajoutez des questions manuellement ou via l'IA." },
  { icon: Share2, title: "Partagez le lien", desc: "Vos participants répondent, vous suivez les résultats." },
];

export default async function CreateOrganizationPage() {
  await requireAuth();
  const organization = await getActiveOrganization();

  if (organization) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-10 p-6">
      <Logo />

      <div className="flex w-full max-w-3xl flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
        <div className="flex w-full max-w-sm flex-col gap-4 lg:pt-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Bienvenue sur QuizNest</h1>
            <p className="text-sm text-muted-foreground">Encore une étape avant de créer votre premier quiz.</p>
          </div>
          <ul className="flex flex-col gap-3">
            {NEXT_STEPS.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <CreateOrganizationForm />
      </div>
    </div>
  );
}
