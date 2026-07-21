import type { Metadata } from "next";
import { Coins, Puzzle, Ticket, ShoppingCart, CreditCard, Layers, Clock } from "lucide-react";

import { buildMetadata } from "@/constants/seo";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { getOrCreateWallet, listActiveCreditPacks } from "@/lib/services/wallet";
import { listActiveAddOnProducts } from "@/lib/services/addon";
import { listActivePasses } from "@/lib/services/pass";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutShopCard } from "@/features/billing/components/checkout-shop-card";
import { ADDON_EFFECT_LABELS } from "@/constants/addon-effects";
import { Section } from "@/components/shared/section";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Marketplace",
  description: "Rechargez votre wallet, achetez des modules complémentaires et des pass temporaires.",
  path: "/dashboard/marketplace",
  noindex: true,
});

export default async function MarketplacePage() {
  const organization = await requireActiveOrganization();
  const [wallet, creditPacks, addOnProducts, passes] = await Promise.all([
    getOrCreateWallet(organization.id),
    listActiveCreditPacks(),
    listActiveAddOnProducts(),
    listActivePasses(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Marketplace"
        subtitle="Rechargez, étendez et personnalisez votre expérience QuizNest."
      />

      {/* Explainer Banner */}
      <Card className="border-primary/15 bg-gradient-to-br from-primary/[0.03] to-transparent">
        <CardContent className="py-5">
          <p className="mb-4 text-sm font-medium">Comment fonctionne la marketplace ?</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Coins,
                title: "Crédits (Wallet)",
                color: "text-primary",
                bg: "bg-primary/10",
                description: "Rechargez votre wallet pour payer à l'usage. Les crédits sont débités uniquement lorsque votre plan ne couvre pas l'action (générations IA, exports, certificats).",
              },
              {
                icon: Puzzle,
                title: "Modules complémentaires",
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                description: "Achats ponctuels pour étendre votre plan sans le changer — participants supplémentaires, exports débloqués, certificats débloqués. Effet permanent ou quota additionnel.",
              },
              {
                icon: Ticket,
                title: "Pass temporaires",
                color: "text-violet-500",
                bg: "bg-violet-500/10",
                description: "Accès premium pour une durée limitée (30, 60, 90 jours). Parfait pour des projets ponctuels nécessitant des fonctionnalités avancées temporairement.",
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

      {/* Wallet Quick Status */}
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Coins className="size-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold tracking-tight">{wallet.balance} crédit{wallet.balance !== 1 ? "s" : ""}</p>
            <p className="text-sm text-muted-foreground">Solde actuel de votre wallet</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {creditPacks.length} pack{creditPacks.length !== 1 ? "s" : ""} disponible{creditPacks.length !== 1 ? "s" : ""}
          </Badge>
        </CardContent>
      </Card>

      {/* ─── Crédits / Recharge ─── */}
      <Section
        title="Recharger votre wallet"
        description="Les crédits servent de monnaie d'échange pour les actions hors-plan. 1 crédit ≈ 1 XOF. Utilisez-les uniquement si votre plan ne couvre pas l'action."
        action={
          <a href="/dashboard/wallet" className="text-xs font-medium text-primary underline underline-offset-4">
            Voir l&apos;historique
          </a>
        }
      >
        {creditPacks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Coins className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aucun pack de crédits disponible pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creditPacks.map((pack) => (
              <CheckoutShopCard
                key={pack.id}
                checkoutType="wallet"
                itemId={pack.id}
                title={pack.name}
                description={`${pack.credits} crédits pour ${formatCurrency(pack.price, pack.currency)}`}
                price={pack.price}
                currency={pack.currency}
                meta={`${pack.credits} crédits`}
                actionLabel="Recharger"
              />
            ))}
          </div>
        )}
      </Section>

      {/* ─── Modules complémentaires ─── */}
      <Section
        title="Modules complémentaires"
        description="Achats uniques qui s'ajoutent à votre plan. Certains ajoutent un quota (ex: +100 participants), d'autres débloquent une fonctionnalité pour toujours (ex: exports)."
        action={
          <a href="/dashboard/addons" className="text-xs font-medium text-primary underline underline-offset-4">
            Mes modules actifs
          </a>
        }
      >
        {addOnProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Puzzle className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aucun module disponible pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
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
        )}
      </Section>

      {/* ─── Pass temporaires ─── */}
      <Section
        title="Pass temporaires"
        description="Accès à des fonctionnalités premium pendant une durée définie (ex: analytics avancés, branding custom). Utile pour des missions ou projets spécifiques."
        action={
          <a href="/dashboard/billing" className="text-xs font-medium text-primary underline underline-offset-4">
            Voir les passes actifs
          </a>
        }
      >
        {passes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Ticket className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aucun pass disponible pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {passes.map((pass) => (
              <CheckoutShopCard
                key={pass.id}
                checkoutType="pass"
                itemId={pass.id}
                title={pass.name}
                description={pass.description ?? `${pass.durationDays} jours d'accès premium`}
                price={pass.price}
                currency={pass.currency}
                meta={`${pass.durationDays} jours`}
                badge={pass.isPromoted ? "Promo" : undefined}
                actionLabel="Acheter le pass"
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
