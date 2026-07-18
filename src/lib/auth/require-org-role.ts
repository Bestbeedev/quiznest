import "server-only";
import { prisma } from "@/lib/db/client";
import { ForbiddenError } from "@/lib/errors";
import { roleAtLeast } from "@/constants/roles";
import type { MemberRole } from "@/generated/prisma/client";

/** Fetches the caller's membership in `organizationId` and throws
 * `ForbiddenError` unless their role meets `minimum` on the app's role
 * hierarchy (VIEWER < EDITOR < MANAGER < ADMIN < OWNER < SUPER_ADMIN). */
export async function requireOrgRole(organizationId: string, userId: string, minimum: MemberRole) {
  const member = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });
  if (!member || !roleAtLeast(member.role, minimum)) {
    throw new ForbiddenError("Permission refusée.");
  }
  return member;
}
