import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Check, Zap, FileText } from "lucide-react";

import { buildMetadata } from "@/constants/seo";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { getOrganizationSubscription } from "@/lib/services/billing";
import { getEffectiveQuizLimit, getEffectiveParticipantLimit } from "@/lib/services/limits";
import { listPublicPlans, effectivePlanPrice } from "@/lib/services/plan";
import { getQuizStats } from "@/lib/services/quiz";
import { getOrgParticipantStats } from "@/lib/services/participation";
import { canUseFeature } from "@/lib/services/feature-gate";
import { getOrganizationInvoices } from "@/lib/services/payment";
import { listActiveCreditPacks, getOrCreateWallet } from "@/lib/services/wallet";
import { listActiveAddOnProducts, listOrganizationAddOns } from "@/lib/services/addon";
import { listActivePasses, listOrganizationPasses } from "@/lib/services/pass";
import { ADDON_EFFECT_LABELS } from "@/constants/addon-effects";
import { ShopCard } from "@/features/billing/components/shop-card";
import { PlanCheckoutSection } from "@/features/billing/components/plan-checkout-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { FeatureStatusBadge } from "@/components/shared/feature-status-badge";
import {
  initiateWalletTopUpAction,
  initiateAddOnCheckoutAction,
  initiatePassCheckoutAction,
} from "@/features/billing/actions";
import { formatCurrency } from "@/lib/format";
import { ALL_FEATURES, FEATURE_LABELS } from "@/constants/features";
import type { FeatureKey } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { UsageChart } from "./usage-chart";

export const metadata: Metadata = buildMetadata({
  title: "Abonnement & Facturation",
  description:
    "Gérez votre abonnement QuizNest : plans, limites d'utilisation et options de facturation.",
  path: "/dashboard/billing",
  noindex: true,
});

function planPriceLabel(price: number | null, currency: string) {
  if (price === null) return "Sur devis";
  if (price === 0) return "Gratuit";
  return formatCurrency(price, currency);
}

function QuotaRow({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const pct = limit ? Math.min(Math.round((used / limit) * 100), 100) : 0;
  const nearLimit = limit !== null && pct >= 80;
  const atLimit = limit !== null && used >= limit;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn("text-muted-foreground", atLimit && "font-medium text-destructive")}>
          {limit === null ? `${used} · Illimité` : `${used} / ${limit}`}
        </span>
      </div>
      {limit !== null && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              atLimit ? "bg-destructive" : nearLimit ? "bg-amber-500" : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {nearLimit && (
        <p className={cn("text-xs", atLimit ? "text-destructive" : "text-amber-600 dark:text-amber-500")}>
          {atLimit
            ? `Limite atteinte — passez à un plan supérieur pour continuer.`
            : `Vous approchez de votre limite (${limit! - used} restant${limit! - used !== 1 ? "s" : ""}).`}{" "}
          <a href="#plans" className="font-medium underline underline-offset-4">
            Voir les plans
          </a>
        </p>
      )}
    </div>
  );
}

export default async function BillingPage() {
  const organization = await requireActiveOrganization();
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

  const activePasses = orgPasses.filter((p) => p.expiresAt > new Date());

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
  const remainingByFeature = new Map(
    await Promise.all(
      limitedFeatures.map(
        async (feature) => [feature, (await canUseFeature(organization.id, feature)).remaining] as const,
      ),
    ),
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Abonnement" subtitle="Gérez votre plan et votre facturation." />

      <Section title="Utilisation" description="Consommation actuelle par rapport aux limites de votre plan.">
        <Card>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <QuotaRow label="Quiz" used={quizStats.total} limit={quizLimit} />
            <QuotaRow label="Participants" used={participantStats.totalParticipants} limit={participantLimit} />
          </CardContent>
        </Card>
        {usage && <UsageChart usage={usage} />}
      </Section>

      <Section
        title="Fonctionnalités de votre plan"
        description="Ce que votre abonnement actuel inclut — pilotée par le Feature Gate, à jour en temps réel."
      >
        <Card>
          <CardContent className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {ALL_FEATURES.map((feature) => {
              const grant = grantByFeature.get(feature);
              return (
                <div key={feature} className="flex items-center justify-between gap-3 py-1">
                  <span className="text-sm">{FEATURE_LABELS[feature]}</span>
                  <FeatureStatusBadge
                    enabled={grant?.enabled ?? false}
                    limit={grant?.limit}
                    remaining={remainingByFeature.get(feature as FeatureKey)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </Section>

      <Section
        id="plans"
        title="Plans"
        description="Choisissez le plan qui correspond à vos besoins"
        className="scroll-mt-20"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((planOption) => {
            const isCurrent = planOption.slug === currentPlanSlug;
            const marketingFeatures = Array.isArray(planOption.features) ? (planOption.features as string[]) : [];
            const displayPrice = effectivePlanPrice(planOption);
            const onPromo = displayPrice !== planOption.price;

            return (
              <Card
                key={planOption.slug}
                className={`relative flex flex-col ${planOption.isPromoted ? "border-primary shadow-md" : ""}`}
              >
                {planOption.isPromoted && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Badge className="gap-1">
                      <Zap className="size-3" />
                      {planOption.badge || "Recommandé"}
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{planOption.name}</CardTitle>
                      <CardDescription>{planOption.description}</CardDescription>
                    </div>
                    <Badge variant={isCurrent ? "default" : "outline"}>
                      {isCurrent ? "Actuel" : "Bientôt"}
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    {onPromo && (
                      <span className="text-sm text-muted-foreground line-through">
                        {planPriceLabel(planOption.price, planOption.currency)}
                      </span>
                    )}
                    <span className="text-3xl font-bold tracking-tight">
                      {planPriceLabel(displayPrice, planOption.currency)}
                    </span>
                    {displayPrice !== null && displayPrice > 0 && (
                      <span className="text-sm text-muted-foreground">
                        /{planOption.interval === "YEAR" ? "an" : "mois"}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-6">
                  <ul className="flex flex-col gap-2.5 text-sm">
                    {marketingFeatures.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="size-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    {isCurrent ? (
                      <Button disabled variant="outline" className="w-full">
                        Plan actuel
                      </Button>
                    ) : planOption.price === null ? (
                      <Button disabled variant="outline" className="w-full" title="Contactez-nous pour ce plan.">
                        Sur devis
                      </Button>
                    ) : displayPrice === 0 ? (
                      <Button disabled variant="outline" className="w-full" title="Plan gratuit — aucun paiement requis.">
                        Plan gratuit
                      </Button>
                    ) : (
                      <PlanCheckoutSection planId={planOption.id} planName={planOption.name} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section title="Wallet" description={`Solde actuel : ${wallet.balance} crédit${wallet.balance !== 1 ? "s" : ""}, indépendant de votre plan.`}>
        {creditPacks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Aucun pack de crédits disponible pour le moment.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {creditPacks.map((pack) => (
              <ShopCard
                key={pack.id}
                title={pack.name}
                price={pack.price}
                currency={pack.currency}
                meta={`${pack.credits} crédits`}
                action={() => initiateWalletTopUpAction(pack.id)}
                actionLabel="Recharger"
              />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Pay-as-you-go"
        description="Achats ponctuels qui étendent votre plan sans le remplacer."
      >
        {addOnProducts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Aucun module disponible pour le moment.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {addOnProducts.map((product) => (
              <ShopCard
                key={product.id}
                title={product.name}
                description={product.description}
                price={product.price}
                currency={product.currency}
                meta={ADDON_EFFECT_LABELS[product.effect]}
                badge={product.isPromoted ? "Promo" : undefined}
                action={() => initiateAddOnCheckoutAction(product.id)}
              />
            ))}
          </div>
        )}
        {orgAddOns.length > 0 && (
          <Card>
            <CardContent className="flex flex-col divide-y p-0">
              {orgAddOns.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>{purchase.product.name}</span>
                  <span className="text-muted-foreground">
                    {purchase.remaining != null ? `${purchase.remaining} restant(s)` : "Actif"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </Section>

      <Section title="Pass" description="Bundles de fonctionnalités accessibles pendant une durée limitée.">
        {passes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Aucun pass disponible pour le moment.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {passes.map((pass) => (
              <ShopCard
                key={pass.id}
                title={pass.name}
                description={pass.description}
                price={pass.price}
                currency={pass.currency}
                meta={`${pass.durationDays} jours`}
                badge={pass.isPromoted ? "Promo" : undefined}
                action={() => initiatePassCheckoutAction(pass.id)}
              />
            ))}
          </div>
        )}
        {activePasses.length > 0 && (
          <Card>
            <CardContent className="flex flex-col divide-y p-0">
              {activePasses.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>{purchase.pass.name}</span>
                  <span className="text-muted-foreground">
                    Jusqu&apos;au {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(purchase.expiresAt)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </Section>

      <Section title="Factures" description="Historique de vos paiements et factures.">
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
              <FileText className="size-8 text-muted-foreground" />
              <p className="max-w-sm text-sm text-muted-foreground">Aucune facture pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col divide-y p-0">
              {invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/dashboard/billing/invoices/${invoice.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="size-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invoice.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(invoice.issuedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(invoice.amount, invoice.currency)}</span>
                    <Badge variant={invoice.status === "SUCCEEDED" ? "default" : "outline"}>
                      {invoice.status === "SUCCEEDED" ? "Payée" : invoice.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </Section>

      <Section title="Paiement" description="Comment vous êtes facturé.">
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-8 text-center">
              <CreditCard className="size-8 text-muted-foreground" />
              <p className="max-w-sm text-sm text-muted-foreground">
                Le paiement s&apos;effectue via une redirection sécurisée vers FedaPay au moment de
                l&apos;achat d&apos;un plan — aucune carte n&apos;est enregistrée sur QuizNest.
              </p>
            </div>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
