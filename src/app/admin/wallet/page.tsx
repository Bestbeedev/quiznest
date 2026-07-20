import type { Metadata } from "next";
import { listCreditPacks } from "@/lib/services/wallet";
import { prisma } from "@/lib/db/client";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditPackFormDialog } from "@/features/admin/components/credit-pack-form-dialog";
import { CreditPacksList } from "@/features/admin/components/credit-packs-list";

export const metadata: Metadata = { title: "Wallet — Admin QuizNest" };

export default async function AdminWalletPage() {
  const [packs, wallets] = await Promise.all([
    listCreditPacks(),
    prisma.wallet.findMany({
      where: { balance: { gt: 0 } },
      orderBy: { balance: "desc" },
      take: 20,
      include: { organization: { select: { name: true, slug: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Wallet"
        subtitle="Portefeuille de crédits indépendant des abonnements — packs achetables et soldes des organisations."
        actions={<CreditPackFormDialog />}
      />

      <Section title="Packs de crédits" description={`${packs.length} pack${packs.length !== 1 ? "s" : ""}.`}>
        <Card>
          <CardContent className="p-0">
            <CreditPacksList packs={packs} />
          </CardContent>
        </Card>
      </Section>

      <Section title="Soldes les plus élevés" description="Top 20 des organisations par solde de crédits.">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organisation</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-8 text-center text-sm text-muted-foreground">
                      Aucun wallet avec un solde positif pour le moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  wallets.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell className="font-medium">{wallet.organization.name}</TableCell>
                      <TableCell className="text-right">{wallet.balance} crédits</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
