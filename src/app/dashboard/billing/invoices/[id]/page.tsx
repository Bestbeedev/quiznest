import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { getOrganizationInvoiceById } from "@/lib/services/payment";
import { formatCurrency } from "@/lib/format";
import { buildMetadata } from "@/constants/seo";
import { PrintButton } from "./print-button";

export const metadata: Metadata = buildMetadata({
  title: "Facture",
  noindex: true,
});

const STATUS_LABELS: Record<string, string> = {
  SUCCEEDED: "Payée",
  PENDING: "En attente",
  FAILED: "Échouée",
  REFUNDED: "Remboursée",
};

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const organization = await requireActiveOrganization();
  const invoice = await getOrganizationInvoiceById(organization.id, id);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 print:max-w-none">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-lg font-semibold">Facture {invoice.number}</h1>
        <PrintButton />
      </div>

      <div className="rounded-xl border bg-card p-8">
        <div className="flex items-start justify-between border-b pb-6">
          <div>
            <p className="text-xl font-bold tracking-tight">QuizNest</p>
            <p className="text-sm text-muted-foreground">Facture</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-medium">{invoice.number}</p>
            <p className="text-sm text-muted-foreground">
              {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(invoice.issuedAt)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Facturé à</p>
            <p className="mt-1 text-sm font-medium">{organization.name}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Statut</p>
            <p className="mt-1 text-sm font-medium">{STATUS_LABELS[invoice.status] ?? invoice.status}</p>
          </div>
        </div>

        <table className="w-full border-t text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="py-3 font-medium">Description</th>
              <th className="py-3 text-right font-medium">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="py-3">Abonnement QuizNest</td>
              <td className="py-3 text-right">{formatCurrency(invoice.amount, invoice.currency)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t font-medium">
              <td className="py-3">Total</td>
              <td className="py-3 text-right">{formatCurrency(invoice.amount, invoice.currency)}</td>
            </tr>
          </tfoot>
        </table>

        {invoice.payment.reference && (
          <p className="mt-6 border-t pt-4 text-xs text-muted-foreground">
            Référence de paiement : {invoice.payment.reference}
          </p>
        )}
      </div>
    </div>
  );
}
