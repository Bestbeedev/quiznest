import type { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";

type SessionUser = typeof auth.$Infer.Session.user;

export function DashboardShell({
  user,
  organizationName,
  children,
}: {
  user: SessionUser;
  organizationName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1">
      <DashboardSidebar organizationName={organizationName} />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={user} />
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
