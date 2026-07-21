import type { Metadata } from "next";
import Link from "next/link";
import { Coins, ArrowUpRight, ArrowDownRight, Wallet as WalletIcon, ShoppingCart, Sparkles, FileDown, Award, CircleDollarSign, ArrowRight, ListChecks } from "lucide-react";

import { buildMetadata } from "@/constants/seo";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { getOrCreateWallet, getWalletTransactions, listActiveCreditPacks } from "@/lib/services/wallet";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Section } from "@/components/shared/section";
import { CheckoutShopCard } from "@/features/billing/components/checkout-shop-card";
import { CREDIT_COSTS, CREDIT_COST_LABELS, type CreditCostKey } from "@/constants/credit-costs";

export const metadata: Metadata = buildMetadata({
  title: "Wallet",
  description: "Consultez votre solde de crédits, rechargez et consultez l'historique.",
  path: "/dashboard/wallet",
  noindex: true,
});

export default async function WalletPage() {
  const organization = await requireActiveOrganization();
  const [wallet, transactions, creditPacks] = await Promise.all([
    getOrCreateWallet(organization.id),
    getWalletTransactions(organization.id, 50),
    listActiveCreditPacks(),
  ]);

  const totalTopUps = transactions.filter((t) => t.type === "TOPUP").reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = transactions.filter((t) => t.type === "SPEND").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Wallet"
        subtitle="Votre solde de crédits, comment ils fonctionnent et l'historique des transactions."
        actions={
          <Link
            href="/dashboard/marketplace"
            className={cn(buttonVariants({ size: "sm" }), "gap-2")}
          >
            <ShoppingCart className="size-3.5" />
            Recharger
          </Link>
        }
      />

      {/* Balance + Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent sm:col-span-1">
          <CardContent className="flex flex-col gap-3 py-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Coins className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight">{wallet.balance}</p>
              <p className="text-sm text-muted-foreground">
                crédit{wallet.balance !== 1 ? "s" : ""} disponible{wallet.balance !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <ArrowDownRight className="size-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{totalTopUps} crédits</p>
              <p className="text-xs text-muted-foreground">Total rechargé</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10">
              <ArrowUpRight className="size-4 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{totalSpent} crédits</p>
              <p className="text-xs text-muted-foreground">Total utilisé</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* How Credits Work */}
      <section className="flex flex-col gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">Comprendre les crédits</h2>
          <p className="text-xs text-muted-foreground">
            Les crédits ne sont utilisés que lorsque votre plan ne couvre pas l&apos;action. Voici comment le système fonctionne.
          </p>
        </div>

        {/* Step-by-step flow */}
        <Card>
          <CardContent className="py-5">
            <div className="flex flex-col gap-3">
              {[
                {
                  step: "1",
                  title: "Vous effectuez une action",
                  description: "Générer des questions IA, exporter un rapport ou créer un certificat.",
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
                {
                  step: "2",
                  title: "Le système vérifie votre plan",
                  description: "Si votre plan actuel couvre l'action (quota restant), rien n'est débité.",
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                },
                {
                  step: "3",
                  title: "Si le quota est épuisé, les crédits sont débités",
                  description: "Le coût est déduit automatiquement de votre wallet. Pas de surprise — vous voyez le débit en temps réel.",
                  color: "text-amber-500",
                  bg: "bg-amber-500/10",
                },
              ].map((item, i) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", item.bg, item.color)}>
                      {item.step}
                    </div>
                    {i < 2 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Credit Cost Table */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <ListChecks className="size-3.5" />
                Coût par action
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-2.5">
                {[
                  { key: "AI_GENERATION" as CreditCostKey, icon: Sparkles, color: "text-violet-500", bg: "bg-violet-500/10" },
                  { key: "EXPORT" as CreditCostKey, icon: FileDown, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { key: "CERTIFICATE" as CreditCostKey, icon: Award, color: "text-amber-500", bg: "bg-amber-500/10" },
                ].map(({ key, icon: Icon, color, bg }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", bg)}>
                      <Icon className={cn("size-3.5", color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{CREDIT_COST_LABELS[key].label}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {CREDIT_COSTS[key]} <span className="text-xs font-normal text-muted-foreground">crédit{CREDIT_COSTS[key] > 1 ? "s" : ""}</span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <CircleDollarSign className="size-3.5" />
                Points importants
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary" />
                  <span>Les crédits ne sont <strong className="text-foreground">jamais débités</strong> si votre plan couvre l&apos;action.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary" />
                  <span>Un module d&apos;export ou de certificats acheté une fois <strong className="text-foreground">contourne</strong> les restrictions du plan sans credits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary" />
                  <span>Les pass temporaires offrent un accès premium temporaire — pas de crédits consommés pendant leur durée.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary" />
                  <span>Les crédits restent valables indéfiniment et ne expirent pas.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Top-up */}
      {creditPacks.length > 0 && (
        <Section
          title="Recharger"
          description="Choisissez un pack de crédits pour recharger votre wallet."
          action={
            <Link href="/dashboard/marketplace" className="text-xs font-medium text-primary underline underline-offset-4">
              Tous les packs
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        </Section>
      )}

      {/* Transaction History */}
      <Section
        title="Historique des transactions"
        description={transactions.length > 0 ? `${transactions.length} dernière(s) transaction(s)` : "Aucune transaction pour le moment."}
      >
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <WalletIcon className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aucune transaction pour le moment.</p>
              <Link
                href="/dashboard/marketplace"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2")}
              >
                Recharger votre wallet
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Montant</th>
                    <th className="px-4 py-3 font-medium">Raison</th>
                    <th className="px-4 py-3 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <Badge
                          variant={tx.type === "TOPUP" ? "default" : "secondary"}
                          className="gap-1"
                        >
                          {tx.type === "TOPUP" ? (
                            <ArrowDownRight className="size-3" />
                          ) : tx.type === "REFUND" ? (
                            <Coins className="size-3" />
                          ) : (
                            <ArrowUpRight className="size-3" />
                          )}
                          {tx.type === "TOPUP" ? "Recharge" : tx.type === "REFUND" ? "Remboursement" : "Utilisation"}
                        </Badge>
                      </td>
                      <td className={cn(
                        "px-4 py-3 font-medium",
                        tx.type === "TOPUP" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
                      )}>
                        {tx.type === "TOPUP" ? "+" : tx.type === "REFUND" ? "+" : "-"}{tx.amount}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[300px] truncate">
                        {tx.reason}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </Section>
    </div>
  );
}
