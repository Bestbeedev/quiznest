import "server-only";
import { prisma } from "@/lib/db/client";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { createDefaultSubscription } from "@/lib/services/billing";
import { requireOrgRole } from "@/lib/auth/require-org-role";
import type { CreateOrganizationInput } from "@/lib/validators/organization";
import type { MemberRole } from "@/generated/prisma/client";

export async function createOrganizationForUser(userId: string, input: CreateOrganizationInput) {
  const existing = await prisma.organization.findUnique({ where: { slug: input.slug } });
  if (existing) {
    throw new ValidationError("Ce nom d'espace est déjà utilisé.");
  }

  const organization = await prisma.organization.create({
    data: {
      name: input.name,
      slug: input.slug,
      members: {
        create: {
          userId,
          role: "OWNER",
          invitationStatus: "ACCEPTED",
        },
      },
    },
  });

  await createDefaultSubscription(organization.id);

  return organization;
}

/** The first organization a user joined — used as the fallback tenant when no
 * subdomain/custom-domain is present (e.g. the app dashboard on localhost or the
 * root domain). Domain-based resolution ([[getCurrentOrganization]]) always wins
 * when available. */
export async function getFirstOrganizationForUser(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: "asc" },
    include: { organization: true },
  });

  return membership?.organization ?? null;
}

export async function getOrganizationMembers(organizationId: string) {
  return prisma.organizationMember.findMany({
    where: { organizationId },
    orderBy: { joinedAt: "asc" },
    include: { user: { select: { name: true, email: true, image: true } } },
  });
}

export type UpdateOrganizationInput = {
  name: string;
  slug: string;
  logo?: string;
  timezone: string;
  language: string;
  primaryColor?: string;
};

/** `primaryColor` is stored under `settings.branding` — real, persisted, but
 * not currently applied anywhere in the app's rendering (that's a separate,
 * larger theming task). This is storage/management only, same honesty rule
 * as the API keys below. */
export async function updateOrganization(organizationId: string, input: UpdateOrganizationInput) {
  const existing = await prisma.organization.findFirst({
    where: { slug: input.slug, id: { not: organizationId } },
  });
  if (existing) {
    throw new ValidationError("Cet identifiant est déjà utilisé par une autre organisation.");
  }

  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { settings: true },
  });
  const currentSettings = (org.settings as Record<string, unknown>) ?? {};
  const currentBranding = (currentSettings.branding as Record<string, unknown>) ?? {};

  return prisma.organization.update({
    where: { id: organizationId },
    data: {
      name: input.name,
      slug: input.slug,
      logo: input.logo || null,
      timezone: input.timezone,
      language: input.language,
      settings: {
        ...currentSettings,
        branding: { ...currentBranding, primaryColor: input.primaryColor || null },
      },
    },
  });
}

/** Only the owner can reassign roles — avoids an ADMIN promoting themselves
 * or a peer to OWNER. Always keeps at least one owner in the organization. */
export async function changeMemberRole(
  organizationId: string,
  actorUserId: string,
  memberId: string,
  newRole: MemberRole,
) {
  await requireOrgRole(organizationId, actorUserId, "OWNER");

  const target = await prisma.organizationMember.findFirst({ where: { id: memberId, organizationId } });
  if (!target) throw new NotFoundError("Membre introuvable.");

  if (target.role === "OWNER" && newRole !== "OWNER") {
    const ownerCount = await prisma.organizationMember.count({ where: { organizationId, role: "OWNER" } });
    if (ownerCount <= 1) throw new ValidationError("Il doit toujours y avoir au moins un propriétaire.");
  }

  return prisma.organizationMember.update({ where: { id: memberId }, data: { role: newRole } });
}

export async function removeMember(organizationId: string, actorUserId: string, memberId: string) {
  await requireOrgRole(organizationId, actorUserId, "ADMIN");

  const target = await prisma.organizationMember.findFirst({ where: { id: memberId, organizationId } });
  if (!target) throw new NotFoundError("Membre introuvable.");

  if (target.role === "OWNER") {
    const ownerCount = await prisma.organizationMember.count({ where: { organizationId, role: "OWNER" } });
    if (ownerCount <= 1) throw new ValidationError("Impossible de retirer le dernier propriétaire.");
  }

  await prisma.organizationMember.delete({ where: { id: memberId } });
}
