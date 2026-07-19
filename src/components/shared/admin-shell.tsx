import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { AdminHeader } from "@/components/shared/admin-header";

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <nav className="h-screen shrink-0 flex flex-col">
        <AdminSidebar user={user} />
      </nav>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader user={user} />
        <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
