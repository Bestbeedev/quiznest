import "server-only";
import { prisma } from "@/lib/db/client";
import { ValidationError } from "@/lib/errors";
import type { CreateOrganizationInput } from "@/lib/validators/organization";

export async function createOrganizationForUser(userId: string, input: CreateOrganizationInput) {
  const existing = await prisma.organization.findUnique({ where: { slug: input.slug } });
  if (existing) {
    throw new ValidationError("Ce nom d'espace est déjà utilisé.");
  }

  return prisma.organization.create({
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
