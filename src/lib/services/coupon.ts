import "server-only";
import { prisma } from "@/lib/db/client";
import { ValidationError } from "@/lib/errors";
import type { CouponInput } from "@/lib/validators/coupon";

export async function listCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });
}

export async function getCouponById(id: string) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) throw new ValidationError("Coupon introuvable.");
  return coupon;
}

function couponScalarData(input: CouponInput) {
  return {
    code: input.code.toUpperCase(),
    type: input.type,
    value: input.value,
    currency: input.currency || null,
    startsAt: input.startsAt ?? null,
    endsAt: input.endsAt ?? null,
    maxRedemptions: input.maxRedemptions ?? null,
    isActive: input.isActive,
    planIds: input.planIds,
  };
}

export async function createCoupon(input: CouponInput) {
  const existing = await prisma.coupon.findUnique({ where: { code: input.code.toUpperCase() } });
  if (existing) throw new ValidationError("Un coupon avec ce code existe déjà.");
  return prisma.coupon.create({ data: couponScalarData(input) });
}

export async function updateCoupon(id: string, input: CouponInput) {
  await getCouponById(id);
  const conflict = await prisma.coupon.findFirst({ where: { code: input.code.toUpperCase(), NOT: { id } } });
  if (conflict) throw new ValidationError("Un coupon avec ce code existe déjà.");
  return prisma.coupon.update({ where: { id }, data: couponScalarData(input) });
}

export async function deleteCoupon(id: string) {
  await prisma.coupon.delete({ where: { id } });
}

/** Validates a coupon code against a target plan and returns the discounted
 * price — never mutates redemption count here (that happens once the
 * payment actually succeeds, in applyVerifiedPayment). */
export async function validateCoupon(code: string, planId: string, basePrice: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    throw new ValidationError("Code promo invalide.");
  }
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    throw new ValidationError("Ce code promo n'est pas encore actif.");
  }
  if (coupon.endsAt && coupon.endsAt < now) {
    throw new ValidationError("Ce code promo a expiré.");
  }
  if (coupon.maxRedemptions != null && coupon.redemptionCount >= coupon.maxRedemptions) {
    throw new ValidationError("Ce code promo a atteint sa limite d'utilisation.");
  }
  if (coupon.planIds.length > 0 && !coupon.planIds.includes(planId)) {
    throw new ValidationError("Ce code promo ne s'applique pas à ce plan.");
  }

  const discount = coupon.type === "PERCENTAGE" ? Math.round((basePrice * coupon.value) / 100) : coupon.value;
  const finalPrice = Math.max(basePrice - discount, 0);

  return { coupon, finalPrice };
}

export async function redeemCoupon(couponId: string, organizationId: string, paymentId: string) {
  await prisma.$transaction([
    prisma.coupon.update({ where: { id: couponId }, data: { redemptionCount: { increment: 1 } } }),
    prisma.couponRedemption.create({ data: { couponId, organizationId, paymentId } }),
  ]);
}
