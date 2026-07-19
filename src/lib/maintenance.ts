import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { getPlatformSettings } from "@/lib/services/platform-settings";

/** Routes that must stay reachable even during maintenance: the admin space
 * (to turn maintenance off), the auth API, and the login/reset flow (so a
 * super-admin who isn't already signed in can still authenticate). */
const EXEMPT_PREFIXES = ["/admin", "/api", "/login", "/register", "/forgot-password", "/reset-password"];

export async function checkMaintenanceGate(): Promise<
  { blocked: false } | { blocked: true; message: string | null }
> {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  if (EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return { blocked: false };
  }

  const settings = await getPlatformSettings();
  if (!settings.maintenanceMode) {
    return { blocked: false };
  }

  const session = await auth.api.getSession({ headers: headerList });
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isSuperAdmin: true },
    });
    if (user?.isSuperAdmin) {
      return { blocked: false };
    }
  }

  return { blocked: true, message: settings.maintenanceMessage };
}
