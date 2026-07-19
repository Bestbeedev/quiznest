import "server-only";
import { prisma } from "@/lib/db/client";

/** Free plan limits mirror the numbers already shown on /dashboard/billing.
 * Professional/Enterprise have no defined price yet (sur devis) — we never
 * invent a figure, the UI shows "Prix à définir" until product/pricing sets one. */
const PLAN_SEEDS = [
  {
    slug: "free",
    name: "Free",
    price: 0,
    quizLimit: 3,
    participantLimit: 50,
    questionLimit: 10,
    storageLimitMb: 100,
    features: ["3 quiz", "50 participants", "10 questions par quiz", "100 Mo de stockage"],
  },
  {
    slug: "professional",
    name: "Professional",
    price: null,
    quizLimit: null,
    participantLimit: null,
    questionLimit: null,
    storageLimitMb: null,
    features: [
      "Quiz illimités",
      "Participants illimités",
      "IA Premium",
      "Exports avancés",
      "Statistiques avancées",
      "Support prioritaire",
    ],
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    price: null,
    quizLimit: null,
    participantLimit: null,
    questionLimit: null,
    storageLimitMb: null,
    features: ["Multi-équipes", "API complète", "White Label", "SSO", "Infrastructure dédiée", "Support 24/7"],
  },
] as const;

/** Idempotent — upserts the 3 known plans by slug. Safe to call on every
 * admin page load; avoids needing a separate seed command. */
async function ensureDefaultPlans() {
  await Promise.all(
    PLAN_SEEDS.map((seed) =>
      prisma.plan.upsert({
        where: { slug: seed.slug },
        update: {},
        create: {
          slug: seed.slug,
          name: seed.name,
          price: seed.price,
          quizLimit: seed.quizLimit,
          participantLimit: seed.participantLimit,
          questionLimit: seed.questionLimit,
          storageLimitMb: seed.storageLimitMb,
          features: seed.features,
        },
      }),
    ),
  );
}

export async function getFreePlan() {
  await ensureDefaultPlans();
  return prisma.plan.findUniqueOrThrow({ where: { slug: "free" } });
}

/** Enrolls a freshly created organization on the Free plan, TRIALING —
 * mirrors Organization.status default (TRIAL). Called once at org creation. */
export async function createDefaultSubscription(organizationId: string) {
  const freePlan = await getFreePlan();

  return prisma.subscription.create({
    data: {
      organizationId,
      planId: freePlan.id,
      status: "TRIALING",
    },
  });
}

/** The org's own current plan + limits — every org has one from creation
 * (`createDefaultSubscription`), so this is safe to call unconditionally. */
export async function getOrganizationSubscription(organizationId: string) {
  return prisma.subscription.findUnique({
    where: { organizationId },
    include: { plan: true },
  });
}

export async function listAllSubscriptions() {
  await ensureDefaultPlans();
  return prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: { organization: { select: { id: true, name: true, slug: true } }, plan: true },
  });
}

export async function listAllPayments() {
  return prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { organization: { select: { id: true, name: true, slug: true } } },
  });
}

export async function getRecentPayments(limit = 5) {
  return prisma.payment.findMany({
    where: { status: "SUCCEEDED" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { organization: { select: { id: true, name: true, slug: true } } },
  });
}

/** Monthly succeeded-payment revenue, zero-filled — `generate_series` anchors
 * the month boundaries so a quiet month still renders as a real zero, not a gap. */
export async function getMonthlyRevenueTrend(months = 6) {
  const rows = await prisma.$queryRaw<{ month: Date; total: number }[]>`
    SELECT gs.month AS month, COALESCE(sum(p.amount), 0)::int AS total
    FROM generate_series(
      date_trunc('month', now()) - ((${months}::int - 1) * interval '1 month'),
      date_trunc('month', now()),
      interval '1 month'
    ) AS gs(month)
    LEFT JOIN payments p
      ON date_trunc('month', p.created_at) = gs.month
      AND p.status = 'SUCCEEDED'
    GROUP BY gs.month
    ORDER BY gs.month ASC
  `;

  return rows.map((row) => ({
    date: row.month.toISOString().slice(0, 10),
    revenu: row.total,
  }));
}

/** This org's own payment history — scoped by organizationId, unlike the
 * platform-wide `getRevenueStats` (admin-only). */
export async function getOrganizationRevenueStats(organizationId: string) {
  const [succeeded, lastPayment] = await Promise.all([
    prisma.payment.aggregate({
      where: { organizationId, status: "SUCCEEDED" },
      _sum: { amount: true },
    }),
    prisma.payment.findFirst({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    totalPaid: succeeded._sum.amount ?? 0,
    lastPayment,
  };
}

export async function getRevenueStats() {
  const [succeeded, activeSubscriptions] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amount: true } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
  ]);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthToDate = await prisma.payment.aggregate({
    where: { status: "SUCCEEDED", createdAt: { gte: startOfMonth } },
    _sum: { amount: true },
  });

  return {
    totalRevenue: succeeded._sum.amount ?? 0,
    monthToDateRevenue: monthToDate._sum.amount ?? 0,
    activeSubscriptions,
  };
}

export async function getSubscriptionStatsByPlan() {
  await ensureDefaultPlans();
  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { subscriptions: true } } },
  });

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    currency: plan.currency,
    quizLimit: plan.quizLimit,
    participantLimit: plan.participantLimit,
    questionLimit: plan.questionLimit,
    subscriberCount: plan._count.subscriptions,
  }));
}
