import type { Metadata } from "next";
import Link from "next/link";
import { Puzzle, CheckCircle2, Clock, Infinity, ShoppingCart, Plus, Unlock, RefreshCw } from "lucide-react";

import { buildMetadata } from "@/constants/seo";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { listOrganizationAddOns, listActiveAddOnProducts } from "@/lib/services/addon";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ADDON_EFFECT_LABELS, METERED_ADDON_EFFECTS } from "@/constants/addon-effects";
import { Section } from "@/components/shared/section";
import { CheckoutShopCard } from "@/features/billing/components/checkout-shop-card";

export const metadata: Metadata = buildMetadata({
  title: "Modules",
  description: "Gérez vos modules complémentaires et achetez-en de nouveaux.",
  path: "/dashboard/addons",
  noindex: true,
});

export default async function AddonsPage() {
  const organization = await requireActiveOrganization();
  const [orgAddOns, addOnProducts] = await Promise.all([
    listOrganizationAddOns(organization.id),
    listActiveAddOnProducts(),
  ]);

  const activeAddOns = orgAddOns.filter((a) => a.remaining === null || a.remaining > 0);
  const exhaustedAddOns = orgAddOns.filter((a) => a.remaining !== null && a.remaining <= 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Modules"
        subtitle="Vos modules complémentaires et boutique."
        actions={
          <Link
            href="/dashboard/marketplace"
            className={cn(buttonVariants({ size: "sm" }), "gap-2")}
          >
            <ShoppingCart className="size-3.5" />
            Marketplace
          </Link>
        }
      />

      {/* Explainer Banner */}
      <Card className="border-primary/15 bg-gradient-to-br from-primary/[0.03] to-transparent">
        <CardContent className="py-5">
          <p className="mb-4 text-sm font-medium">Qu&apos;est-ce qu&apos;un module ?</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Plus,
                title: "Quota additionnel",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                description: "Ajoute des ressources supplémentaires à votre plan actuel — participants, quiz, questions, générations IA. Le quota s'ajoute à celui déjà inclus.",
              },
              {
                icon: Unlock,
                title: "Déverrouillage permanent",
                color: "text-violet-500",
                bg: "bg-violet-500/10",
                description: "Débloque une fonctionnalité pour toujours sans changement de plan — exports (PDF, Excel, CSV) et certificats. Pas de limite de durée.",
              },
              {
                icon: RefreshCw,
                title: "Consommation progressive",
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                description: "Les modules à quota se consomment au fur et à mesure. Une fois le quota épuisé, vous pouvez en racheter un ou passer à un plan supérieur.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", item.bg)}>
                  <item.icon className={cn("size-4", item.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Modules */}
      <Section
        title="Modules actifs"
        description={activeAddOns.length > 0 ? `${activeAddOns.length} module${activeAddOns.length !== 1 ? "s" : ""} en cours d'utilisation sur votre organisation.` : "Aucun module actif."}
      >
        {activeAddOns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Puzzle className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Vous n&apos;avez aucun module actif.</p>
              <Link
                href="/dashboard/marketplace"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2")}
              >
                Découvrir les modules
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeAddOns.map((addon) => {
              const effectLabel = ADDON_EFFECT_LABELS[addon.product.effect as keyof typeof ADDON_EFFECT_LABELS] ?? addon.product.effect;
              const isMetered = METERED_ADDON_EFFECTS.has(addon.product.effect as "EXTRA_PARTICIPANTS" | "EXTRA_QUIZZES" | "EXTRA_QUESTIONS" | "EXTRA_AI_GENERATIONS");

              return (
                <Card key={addon.id} className="relative overflow-hidden">
                  <CardContent className="flex flex-col gap-3 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      </div>
                      <Badge variant="default" className="gap-1 text-xs">
                        <CheckCircle2 className="size-3" />
                        Actif
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{addon.product.name}</p>
                      <p className="text-xs text-muted-foreground">{effectLabel}</p>
                    </div>
                    {isMetered && addon.remaining != null && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Infinity className="size-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          <span className="font-medium text-foreground">{addon.remaining}</span> restant{addon.remaining !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    {!isMetered && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Infinity className="size-3" />
                        Accès permanent
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      Acheté le {new Date(addon.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* Exhausted Modules */}
      {exhaustedAddOns.length > 0 && (
        <Section
          title="Modules épuisés"
          description="Ces modules ont utilisé tout leur quota. Leur effet n'est plus actif. Rachetez-en pour restaurer l'accès."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {exhaustedAddOns.map((addon) => {
              const effectLabel = ADDON_EFFECT_LABELS[addon.product.effect as keyof typeof ADDON_EFFECT_LABELS] ?? addon.product.effect;
              return (
                <Card key={addon.id} className="relative overflow-hidden opacity-60">
                  <CardContent className="flex flex-col gap-3 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <Puzzle className="size-4 text-muted-foreground" />
                      </div>
                      <Badge variant="secondary" className="gap-1 text-xs">
                        Épuisé
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{addon.product.name}</p>
                      <p className="text-xs text-muted-foreground">{effectLabel}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      Acheté le {new Date(addon.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Section>
      )}

      {/* All Purchases History */}
      {orgAddOns.length > 0 && (
        <Section
          title="Historique des achats"
          description={`${orgAddOns.length} achat${orgAddOns.length !== 1 ? "s" : ""} au total.`}
        >
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Module</th>
                    <th className="px-4 py-3 font-medium">Effet</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Restant</th>
                    <th className="px-4 py-3 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orgAddOns.map((addon) => {
                    const effectLabel = ADDON_EFFECT_LABELS[addon.product.effect as keyof typeof ADDON_EFFECT_LABELS] ?? addon.product.effect;
                    const isMetered = METERED_ADDON_EFFECTS.has(addon.product.effect as "EXTRA_PARTICIPANTS" | "EXTRA_QUIZZES" | "EXTRA_QUESTIONS" | "EXTRA_AI_GENERATIONS");
                    const isActive = addon.remaining === null || addon.remaining > 0;

                    return (
                      <tr key={addon.id} className="border-b last:border-b-0">
                        <td className="px-4 py-3 font-medium">{addon.product.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{effectLabel}</td>
                        <td className="px-4 py-3">
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? "Actif" : "Épuisé"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {isMetered ? `${addon.remaining ?? 0}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(addon.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>
      )}

      {/* Marketplace: Available Modules */}
      {addOnProducts.length > 0 && (
        <Section
          title="Modules disponibles"
          description="Achetez un module pour étendre votre plan. Les modules à quota s'ajoutent à vos limites actuelles, les déverrouillages activent des fonctionnalités pour toujours."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addOnProducts.map((product) => {
              const effectLabel = ADDON_EFFECT_LABELS[product.effect as keyof typeof ADDON_EFFECT_LABELS] ?? product.effect;
              return (
                <CheckoutShopCard
                  key={product.id}
                  checkoutType="addon"
                  itemId={product.id}
                  title={product.name}
                  description={effectLabel}
                  price={product.price}
                  currency={product.currency}
                  meta={effectLabel}
                  badge={product.isPromoted ? "Promo" : undefined}
                  actionLabel="Acheter"
                />
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}
