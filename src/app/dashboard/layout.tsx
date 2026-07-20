import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { getActiveOrganization } from "@/lib/db/tenant";
import { getOrganizationSubscription } from "@/lib/services/billing";
import { getOrCreateWallet } from "@/lib/services/wallet";
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

  const [subscription, wallet] = await Promise.all([
    getOrganizationSubscription(organization.id),
    getOrCreateWallet(organization.id),
  ]);

  return (
    <DashboardShell
      user={session.user}
      planName={subscription?.plan.name ?? null}
      walletBalance={wallet.balance}
    >
      {children}
    </DashboardShell>
  );
}
