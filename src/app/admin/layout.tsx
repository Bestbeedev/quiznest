import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AdminShell } from "@/components/shared/admin-shell";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSuperAdmin();

  return (
    <AdminShell
      user={{ name: session.user.name, email: session.user.email }}
    >
      {children}
    </AdminShell>
  );
}
