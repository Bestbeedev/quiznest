import type { Metadata } from "next";
import { buildMetadata } from "@/constants/seo";
import { Activity, Building2, ListChecks, ShieldCheck, Users } from "lucide-react";

import { getPlatformStats } from "@/lib/services/admin";
import { getRevenueStats, getSubscriptionStatsByPlan } from "@/lib/services/billing";
import { getPlatformSettings, checkDatabaseHealth } from "@/lib/services/platform-settings";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { AdminSettingsNav } from "@/features/admin/components/admin-settings-nav";
import { MaintenanceModeCard } from "@/features/admin/components/maintenance-mode-card";
import { FeatureFlagsCard } from "@/features/admin/components/feature-flags-card";
import { NotificationSettingsCard } from "@/features/admin/components/notification-settings-card";
import { CreditCostsCard } from "@/features/admin/components/credit-costs-card";

export const metadata: Metadata = buildMetadata({
  title: "Paramètres",
  description: "Paramètres de la plateforme : configuration système, fonctionnalités et notifications.",
  path: "/admin/settings",
  noindex: true,
});

export default async function AdminSettingsPage() {
  const [stats, revenue, planStats, platformSettings, dbHealth] = await Promise.all([
    getPlatformStats(),
    getRevenueStats(),
    getSubscriptionStatsByPlan(),
    getPlatformSettings(),
    checkDatabaseHealth(),
  ]);

  const totalSubs = planStats.reduce((s, p) => s + p.subscriberCount, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Paramètres"
        subtitle="Configuration et gestion globale de la plateforme QuizNest."
      />

      <AdminSettingsNav
        system={
          <div className="flex flex-col gap-6">
            <Section title="Informations système" description="État actuel de la plateforme.">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard icon={Building2} label="Organisations" value={String(stats.organizations)} />
                <StatCard icon={Users} label="Utilisateurs" value={String(stats.users)} />
                <StatCard icon={ListChecks} label="Quiz" value={String(stats.quizzes)} />
                <StatCard icon={ShieldCheck} label="Abonnements actifs" value={String(stats.activeSubscriptions)} />
                <StatCard icon={Activity} label="Revenu total" value={formatCurrency(revenue.totalRevenue)} />
              </div>
            </Section>

            <Section title="Environnement" description="Informations sur le déploiement.">
              <Card>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Application</span>
                    <span className="text-sm font-medium">QuizNest SaaS</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Framework</span>
                    <span className="text-sm font-medium">Next.js 16 + React 19</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Base de données</span>
                    <span className="text-sm font-medium">NeonDB (PostgreSQL)</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">ORM</span>
                    <span className="text-sm font-medium">Prisma</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Authentification</span>
                    <span className="text-sm font-medium">better-auth</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Hébergement</span>
                    <span className="text-sm font-medium">Vercel</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Domaine</span>
                    <span className="text-sm font-medium">quiznest-six.vercel.app</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Dernier déploiement</span>
                    <span className="text-sm font-medium">
                      {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date())}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Section>

            <Section title="Santé de la base de données" description="Vérification en direct.">
              <Card>
                <CardContent className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Connexion PostgreSQL</span>
                    <span className="text-sm font-medium">{dbHealth.healthy ? "Opérationnelle" : "Indisponible"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{dbHealth.latencyMs} ms</span>
                    <Badge variant={dbHealth.healthy ? "default" : "destructive"}>
                      {dbHealth.healthy ? "OK" : "Erreur"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Section>

            <Section
              title="Mode maintenance"
              description="Bloque l'application pour tous les utilisateurs sauf les super-admins."
            >
              <MaintenanceModeCard
                maintenanceMode={platformSettings.maintenanceMode}
                maintenanceMessage={platformSettings.maintenanceMessage}
              />
            </Section>
          </div>
        }
        plans={
          <div className="flex flex-col gap-6">
            <Section title="Plans disponibles" description="Configuration des plans d'abonnement.">
              <div className="grid gap-4 sm:grid-cols-3">
                {planStats.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{plan.name}</CardTitle>
                        {plan.name === "Free" ? (
                          <Badge variant="outline">Gratuit</Badge>
                        ) : (
                          <Badge variant="secondary">
                            {plan.price === null ? "Sur devis" : formatCurrency(plan.price, plan.currency)}
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {plan.subscriberCount} abonné{plan.subscriberCount !== 1 ? "s" : ""}
                        {totalSubs > 0 && ` (${Math.round((plan.subscriberCount / totalSubs) * 100)}%)`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${totalSubs > 0 ? (plan.subscriberCount / totalSubs) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {plan.subscriberCount} sur {totalSubs} abonnés totaux
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Section>

            <Section title="Détails des plans" description="Limites et fonctionnalités de chaque plan.">
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Quiz max</TableHead>
                        <TableHead>Participants max</TableHead>
                        <TableHead>Questions max</TableHead>
                        <TableHead>Abonnés</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {planStats.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.name}</TableCell>
                          <TableCell>
                            {plan.price === null ? "Sur devis" : plan.price === 0 ? "Gratuit" : formatCurrency(plan.price, plan.currency)}
                          </TableCell>
                          <TableCell>{plan.quizLimit ?? "Illimité"}</TableCell>
                          <TableCell>{plan.participantLimit ?? "Illimité"}</TableCell>
                          <TableCell>{plan.questionLimit ?? "Illimité"}</TableCell>
                          <TableCell>{plan.subscriberCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Section>
          </div>
        }
        features={
          <div className="flex flex-col gap-6">
            <Section
              title="Feature Flags"
              description="Interrupteurs plateforme globaux — le Feature Gate par plan (/admin/plans) reste la source de vérité pour l'accès par organisation."
            >
              <FeatureFlagsCard
                settings={{
                  aiGeneration: platformSettings.aiGeneration,
                  exportsEnabled: platformSettings.exportsEnabled,
                  allowSignups: platformSettings.allowSignups,
                  billingEnabled: platformSettings.billingEnabled,
                }}
              />
            </Section>

            <Section
              title="Coûts en crédits (Wallet)"
              description="Prix débité du wallet quand le quota plan est épuisé. Laissez vide pour la valeur par défaut."
            >
              <CreditCostsCard
                creditCostAiGeneration={platformSettings.creditCostAiGeneration}
                creditCostExport={platformSettings.creditCostExport}
                creditCostCertificate={platformSettings.creditCostCertificate}
              />
            </Section>
          </div>
        }
        notifications={
          <div className="flex flex-col gap-6">
            <Section title="Notifications" description="Alertes email envoyées à l'équipe QuizNest.">
              <NotificationSettingsCard
                notificationEmail={platformSettings.notificationEmail}
                notifyOnNewOrganization={platformSettings.notifyOnNewOrganization}
                notifyOnNewSubscription={platformSettings.notifyOnNewSubscription}
              />
            </Section>
          </div>
        }
        database={
          <div className="flex flex-col gap-6">
            <Section title="Base de données" description="Informations sur la base de données.">
              <Card>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Fournisseur</span>
                    <span className="text-sm font-medium">NeonDB</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Type</span>
                    <span className="text-sm font-medium">PostgreSQL (serverless)</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Région</span>
                    <span className="text-sm font-medium">us-east-1 (AWS)</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">ORM</span>
                    <span className="text-sm font-medium">Prisma (adapter-pg)</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">SSL</span>
                    <span className="text-sm font-medium">
                      <Badge variant="default" className="text-xs">Activé</Badge>
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Pooler</span>
                    <span className="text-sm font-medium">
                      <Badge variant="default" className="text-xs">Activé</Badge>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Section>

            <Section title="Modèles de données" description="Nombre d'enregistrements par table.">
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table</TableHead>
                        <TableHead className="text-right">Enregistrements</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Utilisateurs</TableCell>
                        <TableCell className="text-right">{stats.users}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Organisations</TableCell>
                        <TableCell className="text-right">{stats.organizations}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Quiz</TableCell>
                        <TableCell className="text-right">{stats.quizzes}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Abonnements actifs</TableCell>
                        <TableCell className="text-right">{stats.activeSubscriptions}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Section>
          </div>
        }
      />
    </div>
  );
}
