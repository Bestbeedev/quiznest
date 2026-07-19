import type { Metadata } from "next";
import { CreditCard, Check, Zap, HelpCircle } from "lucide-react";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { getOrganizationSubscription } from "@/lib/services/billing";
import { getQuizStats } from "@/lib/services/quiz";
import { getOrgParticipantStats } from "@/lib/services/participation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { UsageChart } from "./usage-chart";

export const metadata: Metadata = {
  title: "Abonnement — QuizNest",
};

const PLANS = [
  {
    slug: "free",
    name: "Free",
    price: "0 €",
    description: "Pour démarrer",
    features: [
      "3 quiz",
      "50 participants par mois",
      "10 questions par quiz",
      "100 Mo de stockage",
      "Statistiques de base",
    ],
  },
  {
    slug: "professional",
    name: "Professional",
    price: "19 €",
    period: "/mois",
    description: "Pour les équipes",
    features: [
      "Quiz illimités",
      "Participants illimités",
      "Questions illimitées",
      "1 Go de stockage",
      "Analytics avancés",
      "Export des résultats",
      "Support prioritaire",
    ],
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    price: "Sur mesure",
    description: "Pour les grandes organisations",
    features: [
      "Tout du plan Professional",
      "Stockage illimité",
      "SSO / SAML",
      "API dédiée",
      "Audit logs",
      "SLA garantie",
      "Account manager dédié",
    ],
  },
];

export default async function BillingPage() {
  const organization = await requireActiveOrganization();
  const [subscription, quizStats, participantStats] = await Promise.all([
    getOrganizationSubscription(organization.id),
    getQuizStats(organization.id),
    getOrgParticipantStats(organization.id),
  ]);

  const currentPlanSlug = subscription?.plan.slug ?? "free";
  const plan = subscription?.plan;

  const usage =
    plan && plan.quizLimit !== null && plan.participantLimit !== null
      ? [
          { metric: "Quiz", pct: Math.min(Math.round((quizStats.total / plan.quizLimit) * 100), 100) },
          {
            metric: "Participants",
            pct: Math.min(
              Math.round((participantStats.totalParticipants / plan.participantLimit) * 100),
              100,
            ),
          },
        ]
      : null;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Abonnement" subtitle="Gérez votre plan et votre facturation." />

      <Section title="Plans" description="Choisissez le plan qui correspond à vos besoins">
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.slug === currentPlanSlug;
            return (
              <Card
                key={plan.slug}
                className={`relative flex flex-col ${plan.slug === "professional" ? "border-primary shadow-md" : ""}`}
              >
                {plan.slug === "professional" && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Badge className="gap-1">
                      <Zap className="size-3" />
                      Recommandé
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                    <Badge variant={isCurrent ? "default" : "outline"}>
                      {isCurrent ? "Actuel" : "Bientôt"}
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-6">
                  <ul className="flex flex-col gap-2.5 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="size-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <Button
                      disabled
                      variant="outline"
                      className="w-full"
                      title="La facturation sera activée lors du lancement des plans payants."
                    >
                      {isCurrent ? "Plan actuel" : "Bientôt disponible"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      {usage && (
        <Section title="Utilisation" description="Consommation de votre quota">
          <UsageChart usage={usage} />
        </Section>
      )}

      <Section title="Paiement" description="Moyens de paiement et facturation">
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-8 text-center">
              <CreditCard className="size-8 text-muted-foreground" />
              <p className="max-w-sm text-sm text-muted-foreground">
                Aucune carte de crédit enregistrée. La facturation sera activée lors du lancement des
                plans payants.
              </p>
            </div>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
