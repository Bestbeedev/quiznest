import { Fragment } from "react";
import { CheckIcon, MinusIcon } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";

type FeatureRow = {
  label: string;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
};

const COMPARISON_FEATURES: { category: string; rows: FeatureRow[] }[] = [
  {
    category: "Création de quiz",
    rows: [
      { label: "Nombre de quiz", free: "3", pro: "Illimité", enterprise: "Illimité" },
      { label: "Questions par quiz", free: "10", pro: "Illimité", enterprise: "Illimité" },
      { label: "Types de questions", free: "QCM, Vrai/Faux", pro: "Tous types", enterprise: "Tous types" },
      { label: "Génération par IA", free: "5 quiz/mois", pro: "Illimité", enterprise: "Illimité" },
      { label: "Import CSV/JSON", free: true, pro: true, enterprise: true },
    ],
  },
  {
    category: "Passation",
    rows: [
      { label: "Participants par quiz", free: "50", pro: "Illimité", enterprise: "Illimité" },
      { label: "Lien public / QR code", free: true, pro: true, enterprise: true },
      { label: "Code d'accès", free: true, pro: true, enterprise: true },
      { label: "Minutage & sessions", free: false, pro: true, enterprise: true },
      { label: "Anti-triche", free: false, pro: true, enterprise: true },
      { label: "Score de passage", free: false, pro: true, enterprise: true },
    ],
  },
  {
    category: "Analytics & rapports",
    rows: [
      { label: "Statistiques de base", free: true, pro: true, enterprise: true },
      { label: "Analytics avancés", free: false, pro: true, enterprise: true },
      { label: "Export PDF", free: true, pro: true, enterprise: true },
      { label: "Export Excel & CSV", free: false, pro: true, enterprise: true },
      { label: "Rapports consolidés", free: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Organisation & sécurité",
    rows: [
      { label: "Espace multi-tenant", free: false, pro: true, enterprise: true },
      { label: "Rôles & permissions", free: false, pro: true, enterprise: true },
      { label: "Multi-équipes", free: false, pro: false, enterprise: true },
      { label: "SSO (SAML, OIDC)", free: false, pro: false, enterprise: true },
      { label: "Audit logs", free: false, pro: false, enterprise: true },
      { label: "API & Webhooks", free: false, pro: false, enterprise: true },
      { label: "White Label", free: false, pro: false, enterprise: true },
    ],
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true)
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <CheckIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
      </span>
    );
  if (value === false)
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-muted">
        <MinusIcon className="size-3.5 text-muted-foreground/50" />
      </span>
    );
  return <span className="text-sm font-medium">{value}</span>;
}

export function ComparisonSection() {
  return (
    <section className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Comparaison</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Comparez les fonctionnalités
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Trouvez le plan qui correspond exactement à vos besoins.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-14 overflow-x-auto rounded-2xl border bg-card shadow-lg ring-1 ring-border">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                    Fonctionnalité
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Professional
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((group) => (
                  <Fragment key={group.category}>
                    <tr>
                      <td
                        colSpan={4}
                        className="border-b bg-muted/30 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {group.category}
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr
                        key={row.label}
                        className="border-b last:border-0 transition-colors hover:bg-muted/30"
                      >
                        <td className="px-6 py-3 text-sm text-muted-foreground">
                          {row.label}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <CellValue value={row.free} />
                        </td>
                        <td className="px-6 py-3 text-center">
                          <CellValue value={row.pro} />
                        </td>
                        <td className="px-6 py-3 text-center">
                          <CellValue value={row.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
