import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { getActiveOrganization } from "@/lib/db/tenant";
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

  return (
    <DashboardShell user={session.user} organizationName={organization.name}>
      {children}
    </DashboardShell>
  );
}
