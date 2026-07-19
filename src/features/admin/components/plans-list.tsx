"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deletePlanAction, setPlanActiveAction } from "@/features/admin/plans-actions";
import { PlanFormDialog, type PlanForEdit } from "@/features/admin/components/plan-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

type PlanRow = PlanForEdit & { subscriberCount: number };

export function PlansList({ plans }: { plans: PlanRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<PlanRow | null>(null);

  const toggleActive = (plan: PlanRow, isActive: boolean) => {
    startTransition(async () => {
      await setPlanActiveAction(plan.id, isActive);
      router.refresh();
      toast.success(isActive ? "Plan activé." : "Plan désactivé.");
    });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    startTransition(async () => {
      const result = await deletePlanAction(pendingDelete.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Plan supprimé.");
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
            <TableHead>Plan</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Quotas</TableHead>
            <TableHead>Abonnés</TableHead>
            <TableHead>Actif</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {plan.name}
                  {plan.isPromoted && <Badge variant="default">Mis en avant</Badge>}
                  {plan.badge && <Badge variant="outline">{plan.badge}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{plan.slug}</p>
              </TableCell>
              <TableCell>
                {plan.price === null ? "Sur devis" : plan.price === 0 ? "Gratuit" : formatCurrency(plan.price, plan.currency)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {plan.quizLimit ?? "∞"} quiz · {plan.participantLimit ?? "∞"} participants
              </TableCell>
              <TableCell>{plan.subscriberCount}</TableCell>
              <TableCell>
                <Checkbox
                  checked={plan.isActive}
                  disabled={isPending}
                  onCheckedChange={(c) => toggleActive(plan, c === true)}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <PlanFormDialog
                    plan={plan}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="Modifier">
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Supprimer"
                    disabled={plan.subscriberCount > 0}
                    onClick={() => setPendingDelete(plan)}
                  >
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
        title="Supprimer ce plan ?"
        description={`Le plan "${pendingDelete?.name}" sera définitivement supprimé. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
