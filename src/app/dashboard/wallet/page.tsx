import type { Metadata } from "next";
import Link from "next/link";
import { Coins, ArrowUpRight, ArrowDownRight, Wallet as WalletIcon, ShoppingCart } from "lucide-react";

import { buildMetadata } from "@/constants/seo";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { getOrCreateWallet, getWalletTransactions, listActiveCreditPacks } from "@/lib/services/wallet";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Section } from "@/components/shared/section";
import { CheckoutShopCard } from "@/features/billing/components/checkout-shop-card";

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
        subtitle="Votre solde de crédits et l'historique des transactions."
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
