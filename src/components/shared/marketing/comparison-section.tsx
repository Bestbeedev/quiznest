import { Fragment } from "react";
import { CheckIcon, MinusIcon } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";

type FeatureRow = {
  label: string;
  free: boolean | string;
  starter: boolean | string;
  pro: boolean | string;
};

const COMPARISON_FEATURES: { category: string; rows: FeatureRow[] }[] = [
  {
    category: "Création de quiz",
    rows: [
      { label: "Nombre de quiz", free: "3", starter: "20", pro: "Illimité" },
      { label: "Questions par quiz", free: "10", starter: "50", pro: "Illimité" },
      { label: "Participants par quiz", free: "50", starter: "500", pro: "Illimité" },
      { label: "Types de questions", free: "Tous types", starter: "Tous types", pro: "Tous types" },
      { label: "Stockage", free: "100 Mo", starter: "500 Mo", pro: "5 Go" },
    ],
  },
  {
    category: "Intelligence artificielle",
    rows: [
      { label: "Génération de prompt IA", free: "10 / mois", starter: "100 / mois", pro: "Illimité" },
      { label: "Import de questions IA", free: false, starter: true, pro: true },
      { label: "Banque de questions", free: false, starter: true, pro: true },
    ],
  },
  {
    category: "Passation",
    rows: [
      { label: "Lien public / QR code", free: true, starter: true, pro: true },
      { label: "Code d'accès", free: true, starter: true, pro: true },
      { label: "Score de passage", free: false, starter: true, pro: true },
    ],
  },
  {
    category: "Analytics & exports",
    rows: [
      { label: "Statistiques de base", free: true, starter: true, pro: true },
      { label: "Analytics avancés", free: false, starter: false, pro: true },
      { label: "Export PDF", free: true, starter: true, pro: true },
      { label: "Export Excel", free: false, starter: true, pro: true },
      { label: "Export CSV", free: false, starter: false, pro: true },
      { label: "Certificats", free: false, starter: false, pro: true },
    ],
  },
  {
    category: "Équipe & sécurité",
    rows: [
      { label: "Multi-équipes", free: false, starter: false, pro: true },
      { label: "API & Webhooks", free: false, starter: false, pro: true },
      { label: "Personnalisation de marque", free: false, starter: false, pro: true },
      { label: "Notifications email", free: false, starter: false, pro: true },
      { label: "Support prioritaire", free: false, starter: false, pro: true },
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
            <table className="w-full min-w-[580px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                    Fonctionnalité
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Starter
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Professional
                    </span>
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
                          <CellValue value={row.starter} />
                        </td>
                        <td className="px-6 py-3 text-center">
                          <CellValue value={row.pro} />
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
