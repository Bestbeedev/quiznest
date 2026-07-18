import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { requireOrgRole } from "@/lib/auth/require-org-role";
import type { MemberRole } from "@/generated/prisma/client";

const EXPIRY_DAYS = 7;

function generateToken() {
  return randomBytes(24).toString("hex");
}

/** No email is sent (no email provider is wired in this project) — the
 * caller shares the returned invitation's link manually, same pattern as a
 * quiz's access link/QR code. */
export async function createInvitation(
  organizationId: string,
  actorUserId: string,
  email: string,
  role: MemberRole,
) {
  await requireOrgRole(organizationId, actorUserId, "ADMIN");

  const existingMember = await prisma.organizationMember.findFirst({
    where: { organizationId, user: { email } },
  });
  if (existingMember) {
    throw new ValidationError("Cette personne est déjà membre de l'organisation.");
  }

  const existingInvite = await prisma.invitation.findFirst({
    where: { organizationId, email, status: "PENDING" },
  });
  if (existingInvite) {
    throw new ValidationError("Une invitation est déjà en attente pour cet email.");
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

  return prisma.invitation.create({
    data: {
      organizationId,
      email,
      role,
      token: generateToken(),
      invitedBy: actorUserId,
      expiresAt,
    },
  });
}

export async function listPendingInvitations(organizationId: string) {
  return prisma.invitation.findMany({
    where: { organizationId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: { inviter: { select: { name: true } } },
  });
}

export async function revokeInvitation(organizationId: string, actorUserId: string, invitationId: string) {
  await requireOrgRole(organizationId, actorUserId, "ADMIN");

  await prisma.invitation.updateMany({
    where: { id: invitationId, organizationId, status: "PENDING" },
    data: { status: "DECLINED" },
  });
}

export async function getInvitationByToken(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: { select: { id: true, name: true, slug: true } } },
  });
  if (!invitation) return null;
  return invitation;
}

/** Accepts on behalf of `userId` — the caller (the /invite/[token] page) is
 * responsible for confirming that userId's email matches the invitation
 * before calling this. */
export async function acceptInvitation(token: string, userId: string) {
  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation) throw new NotFoundError("Invitation introuvable.");
  if (invitation.status !== "PENDING") throw new ValidationError("Cette invitation n'est plus valide.");
  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({ where: { id: invitation.id }, data: { status: "EXPIRED" } });
    throw new ValidationError("Cette invitation a expiré.");
  }

  const existingMembership = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId, organizationId: invitation.organizationId } },
  });
  if (existingMembership) {
    await prisma.invitation.update({ where: { id: invitation.id }, data: { status: "ACCEPTED" } });
    return existingMembership;
  }

  const [membership] = await prisma.$transaction([
    prisma.organizationMember.create({
      data: {
        userId,
        organizationId: invitation.organizationId,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
        invitationStatus: "ACCEPTED",
      },
    }),
    prisma.invitation.update({ where: { id: invitation.id }, data: { status: "ACCEPTED" } }),
  ]);

  return membership;
}
