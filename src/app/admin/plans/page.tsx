import type { Metadata } from "next";
import { buildMetadata } from "@/constants/seo";

import { listAllPlans } from "@/lib/services/plan";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Card, CardContent } from "@/components/ui/card";
import { PlanFormDialog } from "@/features/admin/components/plan-form-dialog";
import { PlansList } from "@/features/admin/components/plans-list";

export const metadata: Metadata = buildMetadata({
  title: "Plans",
  description: "Gestion des plans d'abonnement : création, modification et activation des offres.",
  path: "/admin/plans",
  noindex: true,
});

export default async function AdminPlansPage() {
  const plans = await listAllPlans();

  const rows = plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description,
    price: plan.price,
    currency: plan.currency,
    interval: plan.interval,
    quizLimit: plan.quizLimit,
    participantLimit: plan.participantLimit,
    questionLimit: plan.questionLimit,
    storageLimitMb: plan.storageLimitMb,
    badge: plan.badge,
    color: plan.color,
    icon: plan.icon,
    displayOrder: plan.displayOrder,
    isActive: plan.isActive,
    isPromoted: plan.isPromoted,
    trialDays: plan.trialDays,
    availableFrom: plan.availableFrom,
    availableUntil: plan.availableUntil,
    promoPrice: plan.promoPrice,
    promoEndsAt: plan.promoEndsAt,
    features: plan.features,
    planFeatures: plan.planFeatures,
    subscriberCount: plan._count.subscriptions,
  }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Plans"
        subtitle="Catalogue commercial de QuizNest — pilotez toute l'offre sans toucher au code."
        actions={<PlanFormDialog />}
      />

      <Section
        title="Tous les plans"
        description="Ces plans alimentent le pricing du site public, le dashboard billing et le Feature Gate."
      >
        <Card>
          <CardContent className="p-0">
            <PlansList plans={rows} />
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
