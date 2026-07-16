import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { getActiveOrganization } from "@/lib/db/tenant";
import { CreateOrganizationForm } from "@/features/organizations/components/create-organization-form";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Créer votre organisation — QuizNest",
};

export default async function CreateOrganizationPage() {
  await requireAuth();
  const organization = await getActiveOrganization();

  if (organization) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 p-6">
      <Logo />
      <CreateOrganizationForm />
    </div>
  );
}
