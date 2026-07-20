import "server-only";
import { prisma } from "@/lib/db/client";

/**
 * Returns true if the given email matches the SUPER_ADMIN_EMAIL env var.
 * Supports a single email or comma-separated list (trimmed, case-insensitive).
 */
export function isEmailSuperAdmin(email: string): boolean {
  const raw = process.env.SUPER_ADMIN_EMAIL;
  if (!raw) return false;
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email.toLowerCase());
}

/**
 * Ensures the DB `isSuperAdmin` flag is in sync with the env var.
 * Called during session checks so the flag is always up to date without
 * requiring a manual DB migration when the env var changes.
 */
export async function ensureSuperAdminSync(userId: string, email: string): Promise<boolean> {
  if (isEmailSuperAdmin(email)) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperAdmin: true },
    });
    if (user && !user.isSuperAdmin) {
      await prisma.user.update({
        where: { id: userId },
        data: { isSuperAdmin: true },
      });
    }
    return true;
  }
  return false;
}
