"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteAddOnProductAction, setAddOnProductActiveAction } from "@/features/admin/commerce-actions";
import { AddOnFormDialog, type AddOnProductForEdit } from "@/features/admin/components/addon-form-dialog";
import { ADDON_EFFECT_LABELS } from "@/constants/addon-effects";
import { FEATURE_LABELS } from "@/constants/features";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import type { AddOnEffect, FeatureKey } from "@/generated/prisma/client";

export function AddOnsList({ products }: { products: AddOnProductForEdit[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<AddOnProductForEdit | null>(null);

  const toggleActive = (product: AddOnProductForEdit, isActive: boolean) => {
    startTransition(async () => {
      await setAddOnProductActiveAction(product.id, isActive);
      router.refresh();
      toast.success(isActive ? "Module activé." : "Module désactivé.");
    });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    startTransition(async () => {
      const result = await deleteAddOnProductAction(pendingDelete.id);
      if ("error" in result) toast.error(result.error);
      else {
        toast.success("Module supprimé.");
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
            <TableHead>Module</TableHead>
            <TableHead>Effet</TableHead>
            <TableHead>Feature cible</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Actif</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {ADDON_EFFECT_LABELS[product.effect as AddOnEffect]}
                {product.amount ? ` (+${product.amount})` : ""}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {product.targetFeature ? FEATURE_LABELS[product.targetFeature as FeatureKey] ?? product.targetFeature : "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {product.isOneTime ? "Déverrouillage" : "Consommable"}
              </TableCell>
              <TableCell>{formatCurrency(product.price, product.currency)}</TableCell>
              <TableCell>
                <Checkbox checked={product.isActive} disabled={isPending} onCheckedChange={(c) => toggleActive(product, c === true)} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-3">
                  <AddOnFormDialog product={product} />
                  <Button variant="ghost" size="icon-sm" aria-label="Supprimer" onClick={() => setPendingDelete(product)}>
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
        title="Supprimer ce module ?"
        description={`Le module "${pendingDelete?.name}" sera définitivement supprimé.`}
        confirmLabel="Supprimer"
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
