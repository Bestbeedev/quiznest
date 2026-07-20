"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deletePassAction, setPassActiveAction } from "@/features/admin/commerce-actions";
import { PassFormDialog, type PassForEdit } from "@/features/admin/components/pass-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

export function PassesList({ passes }: { passes: PassForEdit[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<PassForEdit | null>(null);

  const toggleActive = (pass: PassForEdit, isActive: boolean) => {
    startTransition(async () => {
      await setPassActiveAction(pass.id, isActive);
      router.refresh();
      toast.success(isActive ? "Pass activé." : "Pass désactivé.");
    });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    startTransition(async () => {
      const result = await deletePassAction(pendingDelete.id);
      if ("error" in result) toast.error(result.error);
      else {
        toast.success("Pass supprimé.");
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
            <TableHead>Pass</TableHead>
            <TableHead>Durée</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Fonctionnalités</TableHead>
            <TableHead>Actif</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {passes.map((pass) => (
            <TableRow key={pass.id}>
              <TableCell className="font-medium">
                {pass.name}
                {pass.isPromoted && <Badge className="ml-2">Mis en avant</Badge>}
              </TableCell>
              <TableCell>{pass.durationDays} jours</TableCell>
              <TableCell>{formatCurrency(pass.price, pass.currency)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{pass.features.length}</TableCell>
              <TableCell>
                <Checkbox checked={pass.isActive} disabled={isPending} onCheckedChange={(c) => toggleActive(pass, c === true)} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-3">
                  <PassFormDialog pass={pass} />
                  <Button variant="ghost" size="icon-sm" aria-label="Supprimer" onClick={() => setPendingDelete(pass)}>
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
        title="Supprimer ce pass ?"
        description={`Le pass "${pendingDelete?.name}" sera définitivement supprimé.`}
        confirmLabel="Supprimer"
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
