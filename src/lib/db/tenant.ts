import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { NotFoundError } from "@/lib/errors";

/**
 * Resolves the current tenant (Organization) from the `x-tenant-slug` header set by
 * middleware. Cached per-request via React `cache` so repeated calls in the same
 * render don't re-hit the DB. This is the single source of truth for the current
 * organization — repositories/services must scope every query through it.
 */
export const getCurrentOrganization = cache(async () => {
  const headerList = await headers();
  const slug = headerList.get("x-tenant-slug");
  if (!slug) return null;

  const organization = await prisma.organization.findUnique({ where: { slug } });
  return organization;
});

export async function requireCurrentOrganization() {
  const organization = await getCurrentOrganization();
  if (!organization) {
    throw new NotFoundError("Organization not found");
  }
  return organization;
}
