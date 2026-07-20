import type { Metadata } from "next";
import { listPasses } from "@/lib/services/pass";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Card, CardContent } from "@/components/ui/card";
import { PassFormDialog } from "@/features/admin/components/pass-form-dialog";
import { PassesList } from "@/features/admin/components/passes-list";

export const metadata: Metadata = { title: "Pass — Admin QuizNest" };

export default async function AdminPassesPage() {
  const passes = await listPasses();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Pass"
        subtitle="Bundles de fonctionnalités accessibles pendant une durée limitée, indépendants du plan."
        actions={<PassFormDialog />}
      />

      <Section title="Tous les pass" description={`${passes.length} pass.`}>
        <Card>
          <CardContent className="p-0">
            <PassesList passes={passes} />
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
