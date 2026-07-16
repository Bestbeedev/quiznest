import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/auth/require-auth";

/**
 * Guards the /admin space. Checks `isSuperAdmin` directly against the database rather
 * than trusting the client-visible session — this flag is platform-level and must never
 * be settable through the auth client's update-user API.
 */
export async function requireSuperAdmin() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true },
  });

  if (!user?.isSuperAdmin) {
    redirect("/dashboard");
  }

  return session;
}
