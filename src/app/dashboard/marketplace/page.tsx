import type { Metadata } from "next";
import { Coins, Puzzle, Ticket, ShoppingCart } from "lucide-react";

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
        description="Achetez des crédits pour débloquer des fonctionnalités à l'usage — participants, quiz, IA, exports."
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
        description="Achats ponctuels pour étendre votre plan sans le changer — participants, exports, certificats."
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
        description="Accès premium pour une durée limitée — parfaits pour des projets ponctuels."
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
