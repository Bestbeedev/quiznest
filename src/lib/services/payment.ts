import "server-only";
import { prisma } from "@/lib/db/client";
import { paymentProvider } from "@/lib/payments/provider";
import type { VerifiedWebhookEvent } from "@/lib/payments/types";
import { getPlanById, effectivePlanPrice } from "@/lib/services/plan";
import { validateCoupon } from "@/lib/services/coupon";
import { getCreditPackById } from "@/lib/services/wallet";
import { getAddOnProductById } from "@/lib/services/addon";
import { getPassById } from "@/lib/services/pass";
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

  if (event.status === "approved") {
    // fall through to grant the purchase below
  } else if (event.status === "declined" || event.status === "canceled") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return { applied: true as const, succeeded: false as const };
  } else {
    // Transient status (pending, created, etc.) — wait for the next webhook
    return { applied: true as const, succeeded: false as const };
  }

  const metadata = payment.metadata as CheckoutMetadata | null;

  if (!metadata) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED" } });
    return { applied: true as const, succeeded: true as const };
  }

  // --- Pre-read everything needed for the business logic (outside TX) ---
  let plan: Awaited<ReturnType<typeof getPlanById>> | null = null;
  let pack: Awaited<ReturnType<typeof getCreditPackById>> | null = null;
  let addonProduct: Awaited<ReturnType<typeof getAddOnProductById>> | null = null;
  let passData: Awaited<ReturnType<typeof getPassById>> | null = null;

  switch (metadata.purchaseType) {
    case "subscription":
      plan = await getPlanById(metadata.targetPlanId);
      break;
    case "wallet":
      pack = await getCreditPackById(metadata.creditPackId);
      break;
    case "addon":
      addonProduct = await getAddOnProductById(metadata.productId);
      break;
    case "pass":
      passData = await getPassById(metadata.passId);
      break;
  }

  // --- Single atomic transaction: payment + invoice + business grant ---
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED" } });

    // Invoice
    const year = new Date().getFullYear();
    const invoiceCount = await tx.invoice.count({ where: { number: { startsWith: `INV-${year}-` } } });
    const invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(6, "0")}`;
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

    // Business grant
    switch (metadata.purchaseType) {
      case "subscription": {
        if (!plan) throw new ValidationError("Plan introuvable.");
        const now = new Date();
        await tx.subscription.upsert({
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
          await tx.coupon.update({ where: { id: metadata.couponId }, data: { redemptionCount: { increment: 1 } } });
          await tx.couponRedemption.create({ data: { couponId: metadata.couponId, organizationId: payment.organizationId, paymentId: payment.id } });
        }

        break;
      }
      case "wallet": {
        if (!pack) throw new ValidationError("Pack de crédits introuvable.");
        const wallet = await tx.wallet.findUnique({ where: { organizationId: payment.organizationId } });
        if (!wallet) throw new ValidationError("Wallet introuvable.");
        await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: pack.credits } } });
        await tx.walletTransaction.create({
          data: { walletId: wallet.id, type: "TOPUP", amount: pack.credits, reason: `Recharge — ${pack.name}`, paymentId: payment.id },
        });
        break;
      }
      case "addon": {
        if (!addonProduct) throw new ValidationError("Module introuvable.");
        await tx.organizationAddOn.create({
          data: {
            organizationId: payment.organizationId,
            productId: addonProduct.id,
            remaining: addonProduct.isOneTime ? null : addonProduct.amount,
            paymentId: payment.id,
          },
        });
        break;
      }
      case "pass": {
        if (!passData) throw new ValidationError("Pass introuvable.");
        const expiresAt = new Date(Date.now() + passData.durationDays * 86_400_000);
        await tx.organizationPass.create({
          data: { organizationId: payment.organizationId, passId: passData.id, expiresAt, paymentId: payment.id },
        });
        break;
      }
    }
  });

  // Audit log (fire-and-forget, outside transaction)
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

/** Recovery: re-apply the business grant for a SUCCEEDED payment that somehow
 * missed it (e.g. webhook verification failed, or the old non-atomic code path
 * committed the payment but crashed before crediting wallet/subscription/etc).
 * Only acts on payments whose grant is demonstrably missing. */
export async function recoverPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new ValidationError("Paiement introuvable.");
  if (payment.status !== "SUCCEEDED") throw new ValidationError("Seuls les paiements SUCCEEDED peuvent être récupérés.");

  const metadata = payment.metadata as CheckoutMetadata | null;
  if (!metadata) return { recovered: false as const, reason: "Pas de métadonnées" };

  // Check if grant already exists
  let alreadyGranted = false;
  switch (metadata.purchaseType) {
    case "wallet": {
      const walletTx = await prisma.walletTransaction.findUnique({ where: { paymentId: payment.id } });
      alreadyGranted = !!walletTx;
      break;
    }
    case "subscription": {
      const sub = await prisma.subscription.findUnique({ where: { organizationId: payment.organizationId } });
      alreadyGranted = !!sub && sub.planId === metadata.targetPlanId && sub.status === "ACTIVE";
      break;
    }
    case "addon": {
      const addon = await prisma.organizationAddOn.findUnique({ where: { paymentId: payment.id } });
      alreadyGranted = !!addon;
      break;
    }
    case "pass": {
      const passPurchase = await prisma.organizationPass.findUnique({ where: { paymentId: payment.id } });
      alreadyGranted = !!passPurchase;
      break;
    }
  }

  if (alreadyGranted) return { recovered: false as const, reason: "Le grant existe déjà" };

  // Re-apply the grant inside a single atomic transaction
  let plan: Awaited<ReturnType<typeof getPlanById>> | null = null;
  let pack: Awaited<ReturnType<typeof getCreditPackById>> | null = null;
  let addonProduct: Awaited<ReturnType<typeof getAddOnProductById>> | null = null;
  let passData: Awaited<ReturnType<typeof getPassById>> | null = null;

  switch (metadata.purchaseType) {
    case "subscription":
      plan = await getPlanById(metadata.targetPlanId);
      break;
    case "wallet":
      pack = await getCreditPackById(metadata.creditPackId);
      break;
    case "addon":
      addonProduct = await getAddOnProductById(metadata.productId);
      break;
    case "pass":
      passData = await getPassById(metadata.passId);
      break;
  }

  await prisma.$transaction(async (tx) => {
    switch (metadata.purchaseType) {
      case "subscription": {
        if (!plan) throw new ValidationError("Plan introuvable.");
        const now = new Date();
        await tx.subscription.upsert({
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
          const existingRedemption = await tx.couponRedemption.findUnique({ where: { paymentId: payment.id } });
          if (!existingRedemption) {
            await tx.coupon.update({ where: { id: metadata.couponId }, data: { redemptionCount: { increment: 1 } } });
            await tx.couponRedemption.create({ data: { couponId: metadata.couponId, organizationId: payment.organizationId, paymentId: payment.id } });
          }
        }
        break;
      }
      case "wallet": {
        if (!pack) throw new ValidationError("Pack de crédits introuvable.");
        const wallet = await tx.wallet.findUnique({ where: { organizationId: payment.organizationId } });
        if (!wallet) throw new ValidationError("Wallet introuvable.");
        await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: pack.credits } } });
        await tx.walletTransaction.create({
          data: { walletId: wallet.id, type: "TOPUP", amount: pack.credits, reason: `Recharge — ${pack.name}`, paymentId: payment.id },
        });
        break;
      }
      case "addon": {
        if (!addonProduct) throw new ValidationError("Module introuvable.");
        await tx.organizationAddOn.create({
          data: {
            organizationId: payment.organizationId,
            productId: addonProduct.id,
            remaining: addonProduct.isOneTime ? null : addonProduct.amount,
            paymentId: payment.id,
          },
        });
        break;
      }
      case "pass": {
        if (!passData) throw new ValidationError("Pass introuvable.");
        const expiresAt = new Date(Date.now() + passData.durationDays * 86_400_000);
        await tx.organizationPass.create({
          data: { organizationId: payment.organizationId, passId: passData.id, expiresAt, paymentId: payment.id },
        });
        break;
      }
    }
  });

  await logAudit({
    action: "PAYMENT_SUCCEEDED",
    organizationId: payment.organizationId,
    resource: { paymentId: payment.id, amount: payment.amount, currency: payment.currency, recovered: true },
  });

  return { recovered: true as const };
}
