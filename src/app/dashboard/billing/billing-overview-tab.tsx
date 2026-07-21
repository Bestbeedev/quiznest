"use client";

import Link from "next/link";
import { Check, Zap, Wallet, Ticket, ArrowRight, Clock, Puzzle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeatureStatusBadge } from "@/components/shared/feature-status-badge";
import { Section } from "@/components/shared/section";
import { buttonVariants } from "@/components/ui/button";
import { ALL_FEATURES, FEATURE_LABELS } from "@/constants/features";
import { effectivePlanPrice } from "@/lib/utils/plan-price";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FeatureKey } from "@/generated/prisma/client";
import { UsageChart } from "@/app/dashboard/billing/usage-chart";
import { useBillingDialog } from "@/app/dashboard/billing/billing-dialog-provider";

function QuotaBar({ label, used, limit }: { label: string; used: number; limit: number | null }) {
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
            ? `Limite atteinte — passez à un plan supérieur.`
            : `${limit! - used} restant${limit! - used !== 1 ? "s" : ""}.`}{" "}
          <a href="#plans" className="font-medium underline underline-offset-4">
            Voir les plans
          </a>
        </p>
      )}
    </div>
  );
}

type Props = {
  plan: { slug: string; name: string; price: number | null; currency: string; interval: string; isPromoted: boolean; badge: string | null; features: unknown; description: string | null; promoPrice: number | null; promoEndsAt: Date | null; planFeatures: { feature: string; limit: number | null }[] } | null | undefined;
  currentPlanSlug: string;
  plans: { id: string; slug: string; name: string; description: string | null; price: number | null; currency: string; interval: string; isPromoted: boolean; badge: string | null; features: unknown; promoPrice: number | null; promoEndsAt: Date | null }[];
  quizStats: { total: number };
  participantStats: { totalParticipants: number };
  quizLimit: number | null;
  participantLimit: number | null;
  usage: { metric: string; pct: number }[] | null;
  grantByFeature: Map<string, { feature: string; enabled: boolean; limit: number | null }>;
  featureCheckMap: Map<string, { allowed: boolean; limit?: number | null; used?: number; remaining?: number | null }>;
  walletBalance: number;
  activePasses: { id: string; pass: { name: string; description: string | null; features: string[] }; expiresAt: Date }[];
  orgAddOns: { id: string; product: { name: string; effect: string; amount: number | null }; remaining: number | null }[];
};

export function BillingOverviewTab({
  plan,
  currentPlanSlug,
  plans,
  quizStats,
  participantStats,
  quizLimit,
  participantLimit,
  usage,
  grantByFeature,
  featureCheckMap,
  walletBalance,
  activePasses,
  orgAddOns,
}: Props) {
  const { openPlanUpgrade } = useBillingDialog();
  return (
    <div className="flex flex-col gap-8">
      {/* Current Plan + Quotas */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Plan actuel</CardTitle>
              {plan?.isPromoted && (
                <Badge className="gap-1">
                  <Zap className="size-3" />
                  {plan.badge || "Pro"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <p className="text-2xl font-bold">{plan?.name ?? "Free"}</p>
              <p className="text-sm text-muted-foreground">
                {plan
                  ? plan.price === 0
                    ? "Gratuit"
                    : `${formatCurrency(effectivePlanPrice(plan) ?? 0, plan.currency)}/${plan.interval === "YEAR" ? "an" : "mois"}`
                  : "Aucun abonnement"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const firstUpgradeable = plans.find((p) => p.slug !== currentPlanSlug && p.price !== null && effectivePlanPrice(p) !== null);
                if (firstUpgradeable) openPlanUpgrade(firstUpgradeable.slug);
              }}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
            >
              {currentPlanSlug === "free" ? "Choisir un plan" : "Changer de plan"}
              <ArrowRight className="size-3.5 ml-1" />
            </button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Utilisation</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <QuotaBar label="Quiz" used={quizStats.total} limit={quizLimit} />
            <QuotaBar label="Participants" used={participantStats.totalParticipants} limit={participantLimit} />
          </CardContent>
          {usage && (
            <div className="px-6 pb-6">
              <UsageChart usage={usage} />
            </div>
          )}
        </Card>
      </section>

      {/* Quick Stats */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{walletBalance} crédit{walletBalance !== 1 ? "s" : ""}</p>
              <p className="text-xs text-muted-foreground">Solde wallet</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10">
              <Ticket className="size-4 text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{activePasses.length} actif{activePasses.length !== 1 ? "s" : ""}</p>
              <p className="text-xs text-muted-foreground">Pass actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10">
              <Check className="size-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{orgAddOns.length} module{orgAddOns.length !== 1 ? "s" : ""}</p>
              <p className="text-xs text-muted-foreground">Add-ons actifs</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Active Passes + Add-ons Details */}
      {(activePasses.length > 0 || orgAddOns.length > 0) && (
        <section className="grid gap-4 lg:grid-cols-2">
          {activePasses.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Ticket className="size-4 text-violet-500" />
                  Pass actifs
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {activePasses.map((purchase) => {
                  const daysLeft = Math.max(0, Math.ceil((purchase.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))); // eslint-disable-line react-hooks/purity
                  return (
                    <div key={purchase.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{purchase.pass.name}</p>
                        <Badge variant={daysLeft <= 7 ? "destructive" : "secondary"} className="gap-1 text-xs">
                          <Clock className="size-3" />
                          {daysLeft}j restant{daysLeft !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      {purchase.pass.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{purchase.pass.description}</p>
                      )}
                      {purchase.pass.features.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {purchase.pass.features.map((f) => (
                            <Badge key={f} variant="outline" className="text-[10px]">
                              {FEATURE_LABELS[f as FeatureKey] ?? f}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {orgAddOns.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Puzzle className="size-4 text-amber-500" />
                  Add-ons actifs
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {orgAddOns.map((addon) => {
                  const isMetered = addon.remaining !== null;
                  const isExhausted = isMetered && addon.remaining !== null && addon.remaining <= 0;
                  const isUnlock = addon.product.effect === "EXPORT_UNLOCK" || addon.product.effect === "CERTIFICATE_UNLOCK";
                  return (
                    <div key={addon.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{addon.product.name}</p>
                        {isUnlock ? (
                          <Badge className="gap-1 text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            <Check className="size-3" />
                            Débloqué
                          </Badge>
                        ) : isMetered ? (
                          <Badge
                            variant={isExhausted ? "destructive" : "secondary"}
                            className="gap-1 text-xs"
                          >
                            {addon.remaining} restant{addon.remaining !== 1 ? "s" : ""}
                          </Badge>
                        ) : null}
                      </div>
                      {isMetered && !isUnlock && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {isExhausted
                            ? "Quota épuisé — achetez un nouveau pack."
                            : `${addon.product.amount ?? "?"} au total.`}
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* Features */}
      <Section
        title="Fonctionnalités de votre plan"
        description="Ce que votre abonnement inclut — à jour en temps réel."
        action={
          <Link href="#plans" className="text-xs font-medium text-primary underline underline-offset-4">
            Voir les plans
          </Link>
        }
      >
        <Card>
          <CardContent className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2 py-4">
            {ALL_FEATURES.map((feature) => {
              const grant = grantByFeature.get(feature);
              return (
                <div key={feature} className="flex items-center justify-between gap-3 py-0.5">
                  <span className="text-sm">{FEATURE_LABELS[feature]}</span>
                  <FeatureStatusBadge
                    enabled={grant?.enabled ?? false}
                    limit={grant?.limit}
                    remaining={featureCheckMap.get(feature as FeatureKey)?.remaining}
                    used={featureCheckMap.get(feature as FeatureKey)?.used}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </Section>

      {/* Plans */}
      <section id="plans" className="scroll-mt-20">
        <Section
          title="Plans"
          description="Choisissez le plan qui correspond à vos besoins. Lors du paiement, vous pouvez appliquer un code promo pour bénéficier d'une réduction."
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

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-semibold">{planOption.name}</p>
                        <p className="text-xs text-muted-foreground">{planOption.description}</p>
                      </div>
                      <Badge variant={isCurrent ? "default" : "outline"}>
                        {isCurrent ? "Actuel" : ""}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      {onPromo && (
                        <span className="text-sm text-muted-foreground line-through">
                          {planOption.price != null ? formatCurrency(planOption.price, planOption.currency) : "Sur devis"}
                        </span>
                      )}
                      <span className="text-3xl font-bold tracking-tight">
                        {displayPrice === 0 ? "Gratuit" : displayPrice != null ? formatCurrency(displayPrice, planOption.currency) : "Sur devis"}
                      </span>
                      {displayPrice !== null && displayPrice > 0 && (
                        <span className="text-sm text-muted-foreground">
                          /{planOption.interval === "YEAR" ? "an" : "mois"}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-4">
                    <ul className="flex flex-col gap-2 text-sm">
                      {marketingFeatures.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="size-3.5 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-2">
                      {isCurrent ? (
                        <button disabled className={cn(buttonVariants({ variant: "outline" }), "w-full opacity-60 cursor-not-allowed")}>
                          Plan actuel
                        </button>
                      ) : planOption.price === null ? (
                        <button disabled className={cn(buttonVariants({ variant: "outline" }), "w-full opacity-60 cursor-not-allowed")}>
                          Sur devis
                        </button>
                      ) : displayPrice === 0 ? (
                        <button disabled className={cn(buttonVariants({ variant: "outline" }), "w-full opacity-60 cursor-not-allowed")}>
                          Plan gratuit
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openPlanUpgrade(planOption.slug)}
                          className={cn(buttonVariants(), "w-full")}
                        >
                          Passer à {planOption.name}
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Section>
      </section>
    </div>
  );
}
