import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/auth/require-auth";
import { isEmailSuperAdmin, ensureSuperAdminSync } from "@/lib/auth/super-admin";

/**
 * Guards the /admin space. Grants access when either:
 * 1. The user's email matches `SUPER_ADMIN_EMAIL` (env-based, auto-syncs DB flag), or
 * 2. The user has `isSuperAdmin = true` in the database (set manually or via env sync).
 *
 * This ensures the super admin always has access even if the DB flag was lost
 * or hasn't been set yet.
 */
export async function requireSuperAdmin() {
  const session = await requireAuth();

  if (isEmailSuperAdmin(session.user.email)) {
    await ensureSuperAdminSync(session.user.id, session.user.email);
    return session;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true },
  });

  if (!user?.isSuperAdmin) {
    redirect("/dashboard");
  }

  return session;
}
