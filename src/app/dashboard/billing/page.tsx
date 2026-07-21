import type { Metadata } from "next";

import { buildMetadata } from "@/constants/seo";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { getOrganizationSubscription } from "@/lib/services/billing";
import { getEffectiveQuizLimit, getEffectiveParticipantLimit } from "@/lib/services/limits";
import { listPublicPlans } from "@/lib/services/plan";
import { getQuizStats } from "@/lib/services/quiz";
import { getOrgParticipantStats } from "@/lib/services/participation";
import { canUseFeature } from "@/lib/services/feature-gate";
import { getOrganizationInvoices } from "@/lib/services/payment";
import { listActiveCreditPacks, getOrCreateWallet } from "@/lib/services/wallet";
import { listActiveAddOnProducts, listOrganizationAddOns } from "@/lib/services/addon";
import { listActivePasses, listOrganizationPasses } from "@/lib/services/pass";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ALL_FEATURES } from "@/constants/features";

import { BillingOverviewTab } from "./billing-overview-tab";
import { BillingInvoicesTab } from "./billing-invoices-tab";
import { BillingDialogProvider } from "./billing-dialog-provider";

export const metadata: Metadata = buildMetadata({
  title: "Abonnement & Facturation",
  description:
    "Gérez votre abonnement QuizNest : plans, limites d'utilisation et facturation.",
  path: "/dashboard/billing",
  noindex: true,
});

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string }>;
}) {
  const organization = await requireActiveOrganization();
  const params = await searchParams;
  const initialPlanSlug = params?.plan ?? null;

  const [
    subscription,
    plans,
    quizStats,
    participantStats,
    invoices,
    wallet,
    creditPacks,
    addOnProducts,
    orgAddOns,
    passes,
    orgPasses,
  ] = await Promise.all([
    getOrganizationSubscription(organization.id),
    listPublicPlans(),
    getQuizStats(organization.id),
    getOrgParticipantStats(organization.id),
    getOrganizationInvoices(organization.id),
    getOrCreateWallet(organization.id),
    listActiveCreditPacks(),
    listActiveAddOnProducts(),
    listOrganizationAddOns(organization.id),
    listActivePasses(),
    listOrganizationPasses(organization.id),
  ]);

  const activePasses = orgPasses
    .filter((p) => p.expiresAt > new Date())
    .map((p) => ({
      ...p,
      pass: { ...p.pass, features: p.pass.features as string[] },
    }));

  const orgAddOnsEnriched = orgAddOns.map((a) => ({
    ...a,
    product: { ...a.product, effect: a.product.effect as string, amount: a.product.amount ?? null },
  }));
  const currentPlanSlug = subscription?.plan.slug ?? "free";
  const plan = subscription?.plan;

  const [quizLimit, participantLimit] = await Promise.all([
    getEffectiveQuizLimit(organization.id, plan?.quizLimit ?? null),
    getEffectiveParticipantLimit(organization.id, plan?.participantLimit ?? null),
  ]);

  const usage =
    quizLimit !== null && participantLimit !== null
      ? [
          { metric: "Quiz", pct: Math.min(Math.round((quizStats.total / quizLimit) * 100), 100) },
          {
            metric: "Participants",
            pct: Math.min(Math.round((participantStats.totalParticipants / participantLimit) * 100), 100),
          },
        ]
      : null;

  const grantByFeature = new Map((plan?.planFeatures ?? []).map((f) => [f.feature, f]));

  const limitedFeatures = ALL_FEATURES.filter((feature) => grantByFeature.get(feature)?.limit != null);
  const featureCheckMap = new Map(
    await Promise.all(
      limitedFeatures.map(
        async (feature) => [feature, await canUseFeature(organization.id, feature)] as const,
      ),
    ),
  );

  return (
    <BillingDialogProvider
      plans={plans}
      currentPlanSlug={currentPlanSlug}
      initialPlanSlug={initialPlanSlug}
    >
      <div className="flex flex-col gap-6">
        <PageHeader title="Abonnement" subtitle="Gérez votre plan et vos factures." />

        <Tabs defaultValue="plans" className="flex flex-col gap-6">
          <TabsList variant="line">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="invoices">Factures</TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <BillingOverviewTab
              plan={plan}
              currentPlanSlug={currentPlanSlug}
              plans={plans}
              quizStats={quizStats}
              participantStats={participantStats}
              quizLimit={quizLimit}
              participantLimit={participantLimit}
              usage={usage}
              grantByFeature={grantByFeature}
              featureCheckMap={featureCheckMap}
              walletBalance={wallet.balance}
              activePasses={activePasses}
              orgAddOns={orgAddOnsEnriched}
            />
          </TabsContent>

          <TabsContent value="invoices">
            <BillingInvoicesTab invoices={invoices} />
          </TabsContent>
        </Tabs>
      </div>
    </BillingDialogProvider>
  );
}
