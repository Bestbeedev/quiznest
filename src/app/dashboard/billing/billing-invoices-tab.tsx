"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

type Invoice = {
  id: string;
  number: string;
  issuedAt: Date;
  amount: number;
  currency: string;
  status: string;
};

export function BillingInvoicesTab({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <FileText className="size-8 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">Aucune facture</p>
            <p className="text-xs text-muted-foreground">
              Vos factures apparaîtront ici après vos premiers paiements.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
  );
}
