"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteCreditPackAction, setCreditPackActiveAction } from "@/features/admin/commerce-actions";
import { CreditPackFormDialog, type CreditPackForEdit } from "@/features/admin/components/credit-pack-form-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

export function CreditPacksList({ packs }: { packs: CreditPackForEdit[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<CreditPackForEdit | null>(null);

  const toggleActive = (pack: CreditPackForEdit, isActive: boolean) => {
    startTransition(async () => {
      await setCreditPackActiveAction(pack.id, isActive);
      router.refresh();
      toast.success(isActive ? "Pack activé." : "Pack désactivé.");
    });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    startTransition(async () => {
      const result = await deleteCreditPackAction(pendingDelete.id);
      if ("error" in result) toast.error(result.error);
      else {
        toast.success("Pack supprimé.");
        router.refresh();
      }
      setPendingDelete(null);
    });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pack</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Crédits</TableHead>
            <TableHead>Actif</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packs.map((pack) => (
            <TableRow key={pack.id}>
              <TableCell className="font-medium">{pack.name}</TableCell>
              <TableCell>{formatCurrency(pack.price, pack.currency)}</TableCell>
              <TableCell>{pack.credits}</TableCell>
              <TableCell>
                <Checkbox checked={pack.isActive} disabled={isPending} onCheckedChange={(c) => toggleActive(pack, c === true)} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-3">
                  <CreditPackFormDialog pack={pack} />
                  <Button variant="ghost" size="icon-sm" aria-label="Supprimer" onClick={() => setPendingDelete(pack)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Supprimer ce pack ?"
        description={`Le pack "${pendingDelete?.name}" sera définitivement supprimé.`}
        confirmLabel="Supprimer"
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
