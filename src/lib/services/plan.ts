import "server-only";
import { prisma } from "@/lib/db/client";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type { PlanInput } from "@/lib/validators/plan";
import type { FeatureKey } from "@/generated/prisma/client";

type FeatureSeed = { feature: FeatureKey; limit?: number | null };

/** Default commercial catalog, seeded once (idempotent upsert-if-missing) so
 * the app is usable out of the box — after that, /admin/plans is the single
 * source of truth. Re-running this never overwrites an admin edit: the
 * upsert's `update` clause is a deliberate no-op. */
const DEFAULT_PLAN_SEEDS: {
  slug: string;
  name: string;
  description: string;
  price: number | null;
  quizLimit: number | null;
  participantLimit: number | null;
  questionLimit: number | null;
  storageLimitMb: number | null;
  displayOrder: number;
  icon: string;
  badge: string | null;
  isPromoted: boolean;
  trialDays: number | null;
  marketingFeatures: string[];
  planFeatures: FeatureSeed[];
}[] = [
  {
    slug: "free",
    name: "Free",
    description: "Pour démarrer et tester la plateforme.",
    price: 0,
    quizLimit: 3,
    participantLimit: 50,
    questionLimit: 10,
    storageLimitMb: 100,
    displayOrder: 0,
    icon: "sparkles",
    badge: null,
    isPromoted: false,
    trialDays: null,
    marketingFeatures: ["3 quiz", "50 participants par quiz", "10 questions par quiz", "100 Mo de stockage"],
    planFeatures: [
      { feature: "AI_GENERATION", limit: 10 },
      { feature: "EXPORT_PDF" },
    ],
  },
  {
    slug: "starter",
    name: "Starter",
    description: "Pour les petites équipes qui évaluent régulièrement.",
    price: 5000,
    quizLimit: 20,
    participantLimit: 500,
    questionLimit: 50,
    storageLimitMb: 500,
    displayOrder: 1,
    icon: "zap",
    badge: null,
    isPromoted: false,
    trialDays: 14,
    marketingFeatures: [
      "20 quiz",
      "500 participants / mois",
      "50 questions par quiz",
      "500 Mo de stockage",
      "Exports PDF & Excel",
    ],
    planFeatures: [
      { feature: "AI_GENERATION", limit: 100 },
      { feature: "AI_IMPORT" },
      { feature: "QUESTION_BANK" },
      { feature: "EXPORT_PDF" },
      { feature: "EXPORT_EXCEL" },
    ],
  },
  {
    slug: "professional",
    name: "Professional",
    description: "Pour les organisations qui évaluent à grande échelle.",
    price: 15000,
    quizLimit: null,
    participantLimit: null,
    questionLimit: null,
    storageLimitMb: 5000,
    displayOrder: 2,
    icon: "crown",
    badge: "Recommandé",
    isPromoted: true,
    trialDays: 14,
    marketingFeatures: [
      "Quiz illimités",
      "Participants illimités",
      "IA Premium illimitée",
      "Exports PDF, Excel & CSV",
      "Statistiques avancées",
      "Certificats",
      "Support prioritaire",
    ],
    planFeatures: [
      { feature: "AI_GENERATION" },
      { feature: "AI_IMPORT" },
      { feature: "QUESTION_BANK" },
      { feature: "EXPORT_PDF" },
      { feature: "EXPORT_EXCEL" },
      { feature: "EXPORT_CSV" },
      { feature: "ADVANCED_ANALYTICS" },
      { feature: "CERTIFICATES" },
      { feature: "EMAIL_NOTIFICATIONS" },
    ],
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    description: "Pour les grandes organisations et le multi-équipes.",
    price: null,
    quizLimit: null,
    participantLimit: null,
    questionLimit: null,
    storageLimitMb: null,
    displayOrder: 3,
    icon: "building2",
    badge: "Sur mesure",
    isPromoted: false,
    trialDays: null,
    marketingFeatures: [
      "Tout Professional",
      "Multi-équipes",
      "API complète & Webhooks",
      "White label & domaine personnalisé",
      "Audit logs",
      "Support 24/7",
    ],
    planFeatures: [
      { feature: "AI_GENERATION" },
      { feature: "AI_IMPORT" },
      { feature: "QUESTION_BANK" },
      { feature: "EXPORT_PDF" },
      { feature: "EXPORT_EXCEL" },
      { feature: "EXPORT_CSV" },
      { feature: "ADVANCED_ANALYTICS" },
      { feature: "CERTIFICATES" },
      { feature: "EMAIL_NOTIFICATIONS" },
      { feature: "SMS_NOTIFICATIONS" },
      { feature: "MULTI_TEAM" },
      { feature: "API_ACCESS" },
      { feature: "WEBHOOKS" },
      { feature: "WHITE_LABEL" },
      { feature: "CUSTOM_BRANDING" },
      { feature: "CUSTOM_DOMAIN" },
      { feature: "LIVE_MONITORING" },
    ],
  },
];

export async function ensureDefaultPlans() {
  for (const seed of DEFAULT_PLAN_SEEDS) {
    await prisma.plan.upsert({
      where: { slug: seed.slug },
      update: {},
      create: {
        slug: seed.slug,
        name: seed.name,
        description: seed.description,
        price: seed.price,
        quizLimit: seed.quizLimit,
        participantLimit: seed.participantLimit,
        questionLimit: seed.questionLimit,
        storageLimitMb: seed.storageLimitMb,
        displayOrder: seed.displayOrder,
        icon: seed.icon,
        badge: seed.badge,
        isPromoted: seed.isPromoted,
        trialDays: seed.trialDays,
        features: seed.marketingFeatures,
        planFeatures: {
          create: seed.planFeatures.map((f) => ({ feature: f.feature, enabled: true, limit: f.limit ?? null })),
        },
      },
    });
  }
}

export async function getFreePlan() {
  await ensureDefaultPlans();
  return prisma.plan.findUniqueOrThrow({ where: { slug: "free" } });
}

export async function listAllPlans() {
  await ensureDefaultPlans();
  return prisma.plan.findMany({
    orderBy: { displayOrder: "asc" },
    include: { planFeatures: true, _count: { select: { subscriptions: true } } },
  });
}

/** Plans shown on public pricing surfaces (marketing site, dashboard billing
 * upgrade options) — active and within their optional commercial window. */
export async function listPublicPlans() {
  await ensureDefaultPlans();
  const now = new Date();
  return prisma.plan.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ availableFrom: null }, { availableFrom: { lte: now } }] },
        { OR: [{ availableUntil: null }, { availableUntil: { gte: now } }] },
      ],
    },
    orderBy: { displayOrder: "asc" },
    include: { planFeatures: { where: { enabled: true } } },
  });
}

export async function getPlanById(id: string) {
  const plan = await prisma.plan.findUnique({ where: { id }, include: { planFeatures: true } });
  if (!plan) {
    throw new NotFoundError("Plan introuvable.");
  }
  return plan;
}

function planScalarData(input: PlanInput) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    price: input.price ?? null,
    currency: input.currency,
    interval: input.interval,
    quizLimit: input.quizLimit ?? null,
    participantLimit: input.participantLimit ?? null,
    questionLimit: input.questionLimit ?? null,
    storageLimitMb: input.storageLimitMb ?? null,
    features: input.marketingFeatures,
    badge: input.badge || null,
    color: input.color || null,
    icon: input.icon || null,
    displayOrder: input.displayOrder,
    isActive: input.isActive,
    isPromoted: input.isPromoted,
    trialDays: input.trialDays ?? null,
    availableFrom: input.availableFrom ?? null,
    availableUntil: input.availableUntil ?? null,
  };
}

export async function createPlan(input: PlanInput) {
  const existing = await prisma.plan.findUnique({ where: { slug: input.slug } });
  if (existing) {
    throw new ValidationError("Un plan avec ce slug existe déjà.");
  }

  return prisma.plan.create({
    data: {
      ...planScalarData(input),
      planFeatures: {
        create: input.features.map((f) => ({
          feature: f.feature as FeatureKey,
          enabled: f.enabled,
          limit: f.limit ?? null,
        })),
      },
    },
    include: { planFeatures: true },
  });
}

export async function updatePlan(id: string, input: PlanInput) {
  await getPlanById(id);

  const conflict = await prisma.plan.findFirst({ where: { slug: input.slug, NOT: { id } } });
  if (conflict) {
    throw new ValidationError("Un plan avec ce slug existe déjà.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.planFeature.deleteMany({ where: { planId: id } });
    return tx.plan.update({
      where: { id },
      data: {
        ...planScalarData(input),
        planFeatures: {
          create: input.features.map((f) => ({
            feature: f.feature as FeatureKey,
            enabled: f.enabled,
            limit: f.limit ?? null,
          })),
        },
      },
      include: { planFeatures: true },
    });
  });
}

export async function deletePlan(id: string) {
  const subscriberCount = await prisma.subscription.count({ where: { planId: id } });
  if (subscriberCount > 0) {
    throw new ValidationError("Ce plan a des abonnés actifs — désactivez-le plutôt que de le supprimer.");
  }
  await prisma.plan.delete({ where: { id } });
}

export async function setPlanActive(id: string, isActive: boolean) {
  await getPlanById(id);
  return prisma.plan.update({ where: { id }, data: { isActive } });
}
