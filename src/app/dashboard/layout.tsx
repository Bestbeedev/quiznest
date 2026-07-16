import { requireAuth } from "@/lib/auth/require-auth";
import { DashboardShell } from "@/components/shared/dashboard-shell";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAuth();

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
