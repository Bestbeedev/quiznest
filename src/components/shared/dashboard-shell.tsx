import type { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";

type SessionUser = typeof auth.$Infer.Session.user;

export function DashboardShell({
  user,
  planName,
  walletBalance,
  children,
}: {
  user: SessionUser;
  planName: string | null;
  walletBalance: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar user={user} planName={planName} walletBalance={walletBalance} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader user={user} planName={planName} walletBalance={walletBalance} />
        <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
