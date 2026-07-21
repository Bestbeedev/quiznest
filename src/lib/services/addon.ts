import "server-only";
import { prisma } from "@/lib/db/client";
import { ValidationError } from "@/lib/errors";
import { METERED_ADDON_EFFECTS } from "@/constants/addon-effects";
import type { AddOnProductInput } from "@/lib/validators/addon-product";
import type { AddOnEffect } from "@/generated/prisma/client";

export async function decrementAddonRemaining(organizationId: string, effect: AddOnEffect, quantity = 1) {
  const purchase = await prisma.organizationAddOn.findFirst({
    where: { organizationId, product: { effect }, remaining: { gt: 0 } },
    orderBy: { createdAt: "asc" },
  });
  if (!purchase) return null;
  const newRemaining = Math.max((purchase.remaining ?? 0) - quantity, 0);
  return prisma.organizationAddOn.update({
    where: { id: purchase.id },
    data: { remaining: newRemaining },
  });
}

export async function listAddOnProducts() {
  return prisma.addOnProduct.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { purchases: true } } },
  });
}

export async function listActiveAddOnProducts() {
  return prisma.addOnProduct.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } });
}

export async function getAddOnProductById(id: string) {
  const product = await prisma.addOnProduct.findUnique({ where: { id } });
  if (!product) throw new ValidationError("Module introuvable.");
  return product;
}

function addOnScalarData(input: AddOnProductInput) {
  return {
    name: input.name,
    description: input.description || null,
    price: input.price,
    currency: input.currency,
    effect: input.effect,
    amount: input.amount ?? null,
    isActive: input.isActive,
    isPromoted: input.isPromoted,
    displayOrder: input.displayOrder,
  };
}

export async function createAddOnProduct(input: AddOnProductInput) {
  return prisma.addOnProduct.create({ data: addOnScalarData(input) });
}

export async function updateAddOnProduct(id: string, input: AddOnProductInput) {
  await getAddOnProductById(id);
  return prisma.addOnProduct.update({ where: { id }, data: addOnScalarData(input) });
}

export async function deleteAddOnProduct(id: string) {
  await prisma.addOnProduct.delete({ where: { id } });
}

export async function setAddOnProductActive(id: string, isActive: boolean) {
  await getAddOnProductById(id);
  return prisma.addOnProduct.update({ where: { id }, data: { isActive } });
}

export async function grantAddOnPurchase(organizationId: string, productId: string, paymentId?: string) {
  const product = await getAddOnProductById(productId);
  const isMetered = METERED_ADDON_EFFECTS.has(product.effect);

  return prisma.organizationAddOn.create({
    data: {
      organizationId,
      productId,
      remaining: isMetered ? product.amount : null,
      paymentId,
    },
  });
}

export async function listOrganizationAddOns(organizationId: string) {
  return prisma.organizationAddOn.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });
}

/** Sum of remaining quantity boosts an org has for a given effect — e.g.
 * total extra AI generations left across every pack bought. For metered
 * add-ons, returns the sum of `remaining` (not the original `amount`).
 * Used to extend a plan's base numeric limit. */
export async function getAddOnBonus(organizationId: string, effect: AddOnEffect) {
  const purchases = await prisma.organizationAddOn.findMany({
    where: { organizationId, product: { effect } },
    include: { product: true },
  });
  return purchases.reduce((sum, purchase) => {
    if (METERED_ADDON_EFFECTS.has(effect)) {
      return sum + (purchase.remaining ?? 0);
    }
    return sum + (purchase.product.amount ?? 0);
  }, 0);
}

/** True if the org has purchased a non-metered unlock effect (e.g. export
 * access) at least once — unlocks don't expire or get consumed. */
export async function hasAddOnUnlock(organizationId: string, effect: AddOnEffect) {
  const count = await prisma.organizationAddOn.count({ where: { organizationId, product: { effect } } });
  return count > 0;
}
