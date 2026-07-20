import type { Metadata } from "next";
import { listAddOnProducts } from "@/lib/services/addon";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Card, CardContent } from "@/components/ui/card";
import { AddOnFormDialog } from "@/features/admin/components/addon-form-dialog";
import { AddOnsList } from "@/features/admin/components/addons-list";

export const metadata: Metadata = { title: "Pay-as-you-go — Admin QuizNest" };

export default async function AdminAddOnsPage() {
  const products = await listAddOnProducts();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Pay-as-you-go"
        subtitle="Achats ponctuels qui étendent un plan (participants, quiz, IA...) sans le remplacer."
        actions={<AddOnFormDialog />}
      />

      <Section title="Modules disponibles" description={`${products.length} module${products.length !== 1 ? "s" : ""}.`}>
        <Card>
          <CardContent className="p-0">
            <AddOnsList products={products} />
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
