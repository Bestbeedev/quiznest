import "server-only";
import { prisma } from "@/lib/db/client";
import { ValidationError } from "@/lib/errors";
import type { PassInput } from "@/lib/validators/pass";
import type { FeatureKey } from "@/generated/prisma/client";

export async function listPasses() {
  return prisma.pass.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { purchases: true } } },
  });
}

export async function listActivePasses() {
  return prisma.pass.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } });
}

export async function getPassById(id: string) {
  const pass = await prisma.pass.findUnique({ where: { id } });
  if (!pass) throw new ValidationError("Pass introuvable.");
  return pass;
}

function passScalarData(input: PassInput) {
  return {
    name: input.name,
    description: input.description || null,
    price: input.price,
    currency: input.currency,
    durationDays: input.durationDays,
    features: input.features as FeatureKey[],
    isActive: input.isActive,
    isPromoted: input.isPromoted,
    displayOrder: input.displayOrder,
  };
}

export async function createPass(input: PassInput) {
  return prisma.pass.create({ data: passScalarData(input) });
}

export async function updatePass(id: string, input: PassInput) {
  await getPassById(id);
  return prisma.pass.update({ where: { id }, data: passScalarData(input) });
}

export async function deletePass(id: string) {
  await prisma.pass.delete({ where: { id } });
}

export async function setPassActive(id: string, isActive: boolean) {
  await getPassById(id);
  return prisma.pass.update({ where: { id }, data: { isActive } });
}

export async function grantPassPurchase(organizationId: string, passId: string, paymentId?: string) {
  const pass = await getPassById(passId);
  const expiresAt = new Date(Date.now() + pass.durationDays * 86_400_000);

  return prisma.organizationPass.create({
    data: { organizationId, passId, expiresAt, paymentId },
  });
}

export async function listOrganizationPasses(organizationId: string) {
  return prisma.organizationPass.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { pass: true },
  });
}

/** Features granted by any currently-active (non-expired) purchased pass —
 * unioned into the org's plan features by the Feature Gate. */
export async function getActivePassFeatures(organizationId: string): Promise<Set<FeatureKey>> {
  const activePasses = await prisma.organizationPass.findMany({
    where: { organizationId, expiresAt: { gt: new Date() } },
    include: { pass: true },
  });

  const features = new Set<FeatureKey>();
  for (const purchase of activePasses) {
    for (const feature of purchase.pass.features) {
      features.add(feature);
    }
  }
  return features;
}
