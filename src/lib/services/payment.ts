import "server-only";
import { prisma } from "@/lib/db/client";
import { paymentProvider } from "@/lib/payments/provider";
import type { VerifiedWebhookEvent } from "@/lib/payments/types";
import { getPlanById, effectivePlanPrice } from "@/lib/services/plan";
import { validateCoupon, redeemCoupon } from "@/lib/services/coupon";
import { getCreditPackById, topUpWallet } from "@/lib/services/wallet";
import { getAddOnProductById, grantAddOnPurchase } from "@/lib/services/addon";
import { getPassById, grantPassPurchase } from "@/lib/services/pass";
import { logAudit } from "@/lib/services/audit-log";
import { ValidationError } from "@/lib/errors";
import type { PlanInterval } from "@/generated/prisma/client";

type CheckoutCustomer = { email: string; firstName?: string; lastName?: string };

type CheckoutMetadata =
  | { purchaseType: "subscription"; targetPlanId: string; couponId?: string }
  | { purchaseType: "wallet"; creditPackId: string }
  | { purchaseType: "addon"; productId: string }
  | { purchaseType: "pass"; passId: string };

function addInterval(date: Date, interval: PlanInterval) {
  const next = new Date(date);
  if (interval === "YEAR") next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

async function nextInvoiceNumber(tx: typeof prisma) {
  const year = new Date().getFullYear();
  const count = await tx.invoice.count({ where: { number: { startsWith: `INV-${year}-` } } });
  return `INV-${year}-${String(count + 1).padStart(6, "0")}`;
}

async function startCheckout(
  organizationId: string,
  amount: number,
  currency: string,
  description: string,
  customer: CheckoutCustomer,
  callbackUrl: string,
  metadata: CheckoutMetadata,
  subscriptionId?: string | null,
) {
  const payment = await prisma.payment.create({
    data: {
      organizationId,
      subscriptionId: subscriptionId ?? null,
      amount,
      currency,
      provider: paymentProvider.name,
      status: "PENDING",
      metadata,
    },
  });

  const checkout = await paymentProvider.createCheckout({
    amount,
    currency,
    description,
    customer,
    callbackUrl,
    metadata: { paymentId: payment.id, organizationId },
  });

  await prisma.payment.update({ where: { id: payment.id }, data: { reference: checkout.providerReference } });

  return { checkoutUrl: checkout.checkoutUrl };
}

/** Starts a plan-upgrade checkout — nothing about the org's subscription
 * changes until the webhook confirms the payment. An optional coupon code
 * discounts the price; the coupon is only actually redeemed once the
 * payment succeeds (see applyVerifiedPayment), never at initiation time. */
export async function initiateSubscriptionCheckout(
  organizationId: string,
  planId: string,
  customer: CheckoutCustomer,
  callbackUrl: string,
  couponCode?: string,
) {
  const plan = await getPlanById(planId);

  if (!plan.isActive) throw new ValidationError("Ce plan n'est plus disponible.");
  const basePrice = effectivePlanPrice(plan);
  if (basePrice === null) throw new ValidationError("Ce plan est sur devis — contactez-nous pour y souscrire.");
  if (basePrice === 0) throw new ValidationError("Ce plan est gratuit, aucun paiement n'est nécessaire.");

  let finalPrice = basePrice;
  let couponId: string | undefined;
  if (couponCode) {
    const result = await validateCoupon(couponCode, planId, basePrice);
    finalPrice = result.finalPrice;
    couponId = result.coupon.id;
  }

  const subscription = await prisma.subscription.findUnique({ where: { organizationId } });

  return startCheckout(
    organizationId,
    finalPrice,
    plan.currency,
    `QuizNest — Abonnement ${plan.name}`,
    customer,
    callbackUrl,
    { purchaseType: "subscription", targetPlanId: plan.id, couponId },
    subscription?.id,
  );
}

export async function initiateWalletTopUpCheckout(
  organizationId: string,
  creditPackId: string,
  customer: CheckoutCustomer,
  callbackUrl: string,
) {
  const pack = await getCreditPackById(creditPackId);
  if (!pack.isActive) throw new ValidationError("Ce pack n'est plus disponible.");

  return startCheckout(
    organizationId,
    pack.price,
    pack.currency,
    `QuizNest — Recharge wallet (${pack.credits} crédits)`,
    customer,
    callbackUrl,
    { purchaseType: "wallet", creditPackId: pack.id },
  );
}

export async function initiateAddOnCheckout(
  organizationId: string,
  productId: string,
  customer: CheckoutCustomer,
  callbackUrl: string,
) {
  const product = await getAddOnProductById(productId);
  if (!product.isActive) throw new ValidationError("Ce module n'est plus disponible.");

  return startCheckout(
    organizationId,
    product.price,
    product.currency,
    `QuizNest — ${product.name}`,
    customer,
    callbackUrl,
    { purchaseType: "addon", productId: product.id },
  );
}

export async function initiatePassCheckout(
  organizationId: string,
  passId: string,
  customer: CheckoutCustomer,
  callbackUrl: string,
) {
  const pass = await getPassById(passId);
  if (!pass.isActive) throw new ValidationError("Ce pass n'est plus disponible.");

  return startCheckout(
    organizationId,
    pass.price,
    pass.currency,
    `QuizNest — ${pass.name}`,
    customer,
    callbackUrl,
    { purchaseType: "pass", passId: pass.id },
  );
}

async function recordInvoice(tx: typeof prisma, payment: { id: string; organizationId: string; amount: number; currency: string }) {
  const invoiceNumber = await nextInvoiceNumber(tx as typeof prisma);
  await tx.invoice.create({
    data: {
      organizationId: payment.organizationId,
      paymentId: payment.id,
      number: invoiceNumber,
      amount: payment.amount,
      currency: payment.currency,
      status: "SUCCEEDED",
    },
  });
}

/** Applies a provider-verified webhook event: idempotent (a Payment already
 * SUCCEEDED is left untouched even if the same event is redelivered), and
 * only ever acts on a Payment this app itself created (matched by the
 * provider reference stored at checkout time) — the webhook body is never
 * trusted for anything beyond "look up this reference and re-check status". */
export async function applyVerifiedPayment(event: VerifiedWebhookEvent) {
  const payment = await prisma.payment.findUnique({ where: { reference: event.providerReference } });
  if (!payment || payment.status !== "PENDING") {
    return { applied: false as const };
  }

  if (event.status !== "approved") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return { applied: true as const, succeeded: false as const };
  }

  const metadata = payment.metadata as CheckoutMetadata | null;

  if (!metadata) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED" } });
    return { applied: true as const, succeeded: true as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED" } });
    await recordInvoice(tx as typeof prisma, payment);
  });

  switch (metadata.purchaseType) {
    case "subscription": {
      const plan = await getPlanById(metadata.targetPlanId);
      const now = new Date();

      await prisma.subscription.upsert({
        where: { organizationId: payment.organizationId },
        create: {
          organizationId: payment.organizationId,
          planId: plan.id,
          status: "ACTIVE",
          startDate: now,
          endDate: addInterval(now, plan.interval),
          trialEnd: plan.trialDays ? new Date(now.getTime() + plan.trialDays * 86_400_000) : null,
        },
        update: {
          planId: plan.id,
          status: "ACTIVE",
          startDate: now,
          endDate: addInterval(now, plan.interval),
          trialEnd: plan.trialDays ? new Date(now.getTime() + plan.trialDays * 86_400_000) : null,
        },
      });

      if (metadata.couponId) {
        await redeemCoupon(metadata.couponId, payment.organizationId, payment.id);
      }

      await logAudit({
        action: "SUBSCRIPTION_UPGRADED",
        organizationId: payment.organizationId,
        resource: { planId: plan.id, planName: plan.name },
      });
      break;
    }
    case "wallet": {
      const pack = await getCreditPackById(metadata.creditPackId);
      await topUpWallet(payment.organizationId, pack.credits, `Recharge — ${pack.name}`, payment.id);
      break;
    }
    case "addon": {
      await grantAddOnPurchase(payment.organizationId, metadata.productId, payment.id);
      break;
    }
    case "pass": {
      await grantPassPurchase(payment.organizationId, metadata.passId, payment.id);
      break;
    }
  }

  await logAudit({
    action: "PAYMENT_SUCCEEDED",
    organizationId: payment.organizationId,
    resource: { paymentId: payment.id, amount: payment.amount, currency: payment.currency },
  });

  return { applied: true as const, succeeded: true as const };
}

/** A paid period (or trial) that has lapsed without a renewal payment reverts
 * the org to the Free plan rather than silently keeping paid access forever
 * or hard-blocking the org — same mechanism covers both trial expiry and
 * regular period expiry, checked lazily on read (no cron infra yet). */
export async function expireLapsedSubscription(organizationId: string) {
  const subscription = await prisma.subscription.findUnique({ where: { organizationId } });
  if (!subscription || subscription.status === "CANCELED") return subscription;
  if (!subscription.endDate || subscription.endDate > new Date()) return subscription;

  const freePlan = await prisma.plan.findUnique({ where: { slug: "free" } });
  if (!freePlan) return subscription;

  return prisma.subscription.update({
    where: { organizationId },
    data: { planId: freePlan.id, status: "ACTIVE", endDate: null, trialEnd: null },
  });
}

export async function getOrganizationInvoices(organizationId: string) {
  return prisma.invoice.findMany({
    where: { organizationId },
    orderBy: { issuedAt: "desc" },
    include: { payment: true },
  });
}

export async function getOrganizationInvoiceById(organizationId: string, invoiceId: string) {
  return prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    include: { payment: true, organization: true },
  });
}
