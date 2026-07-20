import type { Metadata } from "next";
import { listCoupons } from "@/lib/services/coupon";
import { listAllPlans } from "@/lib/services/plan";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Card, CardContent } from "@/components/ui/card";
import { CouponFormDialog } from "@/features/admin/components/coupon-form-dialog";
import { CouponsList } from "@/features/admin/components/coupons-list";

export const metadata: Metadata = { title: "Coupons — Admin QuizNest" };

export default async function AdminCouponsPage() {
  const [coupons, plans] = await Promise.all([listCoupons(), listAllPlans()]);
  const planOptions = plans.map((plan) => ({ id: plan.id, name: plan.name }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Coupons"
        subtitle="Codes de réduction applicables au moment du paiement d'un abonnement."
        actions={<CouponFormDialog plans={planOptions} />}
      />

      <Section title="Tous les coupons" description={`${coupons.length} coupon${coupons.length !== 1 ? "s" : ""}.`}>
        <Card>
          <CardContent className="p-0">
            <CouponsList coupons={coupons} plans={planOptions} />
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
