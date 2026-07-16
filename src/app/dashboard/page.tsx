import { getCurrentOrganization } from "@/lib/db/tenant";

export default async function DashboardPage() {
  const organization = await getCurrentOrganization();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Tableau de bord</h1>
      <p className="text-muted-foreground text-sm">
        {organization
          ? `Organisation : ${organization.name}`
          : "Aucune organisation résolue pour ce domaine (accès via le domaine racine)."}
      </p>
    </div>
  );
}
