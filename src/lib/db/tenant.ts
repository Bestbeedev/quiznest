import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { getFirstOrganizationForUser } from "@/lib/services/organization";
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

/**
 * Resolves the organization to use for the authenticated app (dashboard). Prefers
 * domain-based resolution (subdomain/custom domain) so white-labeled tenants stay
 * isolated; falls back to the current user's first membership when the app is
 * accessed from the root domain (e.g. localhost, or before custom domains are set up).
 */
export const getActiveOrganization = cache(async () => {
  const domainOrganization = await getCurrentOrganization();
  if (domainOrganization) return domainOrganization;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  return getFirstOrganizationForUser(session.user.id);
});

export async function requireActiveOrganization() {
  const organization = await getActiveOrganization();
  if (!organization) {
    throw new NotFoundError("Organization not found");
  }
  return organization;
}
