import Link from "next/link";
import { Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { formatCurrency } from "@/lib/format";

export function RevenueSummaryCard({
  planName,
  totalPaid,
  lastPaymentAt,
}: {
  planName: string | null;
  totalPaid: number;
  lastPaymentAt: Date | null;
}) {
  if (!planName) {
    return (
      <EmptyStateCard
        icon={Wallet}
        title="Facturation"
        description="Aucun abonnement actif pour le moment."
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Facturation</CardTitle>
        <Badge variant="outline">{planName}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {totalPaid > 0 ? (
          <div>
            <p className="text-2xl font-semibold tracking-tight">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-muted-foreground">
              Total payé
              {lastPaymentAt &&
                ` · dernier paiement le ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(lastPaymentAt)}`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun paiement pour le moment — vous êtes sur le plan {planName}.
          </p>
        )}

        <Link href="/dashboard/billing" className="text-sm text-primary underline underline-offset-4">
          Gérer l&apos;abonnement
        </Link>
      </CardContent>
    </Card>
  );
}
