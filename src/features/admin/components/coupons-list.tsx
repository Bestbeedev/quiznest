"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteCouponAction } from "@/features/admin/commerce-actions";
import { CouponFormDialog, type CouponForEdit } from "@/features/admin/components/coupon-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type CouponRow = CouponForEdit & { redemptionCount: number; _count: { redemptions: number } };

export function CouponsList({ coupons, plans }: { coupons: CouponRow[]; plans: { id: string; name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<CouponRow | null>(null);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    startTransition(async () => {
      const result = await deleteCouponAction(pendingDelete.id);
      if ("error" in result) toast.error(result.error);
      else {
        toast.success("Coupon supprimé.");
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
            <TableHead>Code</TableHead>
            <TableHead>Réduction</TableHead>
            <TableHead>Utilisations</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
              <TableCell>{coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `${coupon.value} ${coupon.currency ?? ""}`}</TableCell>
              <TableCell>
                {coupon._count.redemptions}
                {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ""}
              </TableCell>
              <TableCell>
                <Badge variant={coupon.isActive ? "default" : "outline"}>{coupon.isActive ? "Actif" : "Inactif"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-3">
                  <CouponFormDialog coupon={coupon} plans={plans} />
                  <Button variant="ghost" size="icon-sm" aria-label="Supprimer" onClick={() => setPendingDelete(coupon)}>
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
        title="Supprimer ce coupon ?"
        description={`Le coupon "${pendingDelete?.code}" sera définitivement supprimé.`}
        confirmLabel="Supprimer"
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
