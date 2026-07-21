import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { isEmailSuperAdmin, ensureSuperAdminSync } from "@/lib/auth/super-admin";

/**
 * Returns the appropriate default redirect path based on user role.
 * Super admins → /admin, regular users → /dashboard.
 */
export async function getDefaultRedirectPath(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return "/dashboard";

  if (isEmailSuperAdmin(session.user.email)) {
    await ensureSuperAdminSync(session.user.id, session.user.email);
    return "/admin";
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true },
  });

  return user?.isSuperAdmin ? "/admin" : "/dashboard";
}
