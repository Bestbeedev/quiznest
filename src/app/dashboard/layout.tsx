import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { getActiveOrganization } from "@/lib/db/tenant";
import { getOrganizationSubscription } from "@/lib/services/billing";
import { DashboardShell } from "@/components/shared/dashboard-shell";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAuth();
  const organization = await getActiveOrganization();

  if (!organization) {
    redirect("/onboarding/organization");
  }

  const subscription = await getOrganizationSubscription(organization.id);

  return (
    <DashboardShell user={session.user} planName={subscription?.plan.name ?? null}>
      {children}
    </DashboardShell>
  );
}
