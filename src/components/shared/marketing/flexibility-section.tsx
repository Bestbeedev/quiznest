import { Coins, Puzzle, Ticket, CreditCard, Tag, ArrowRight, Shield, Zap, Clock, CheckCircle2 } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LEVERS = [
  {
    icon: CreditCard,
    title: "Plans d'abonnement",
    color: "text-primary",
    bg: "bg-primary/10",
    ring: "ring-primary/20",
    headline: "Votre base, votre rythme",
    description: "Choisissez un plan qui correspond à vos besoins actuels. Passez à un supérieur quand vous êtes prêt — sans engagement, sans surprise.",
    details: [
      "Plan Free gratuit sans limite de durée",
      "Quotas de quiz, participants et IA inclus",
      "Fonctionnalités débloquées progressivement",
      "Changement de plan à tout moment",
    ],
  },
  {
    icon: Coins,
    title: "Crédits (Wallet)",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
    headline: "Payez à l'usage, pas avant",
    description: "Rechargez votre wallet et utilisez des crédits uniquement quand votre plan ne couvre pas l'action. Zéro gaspillage.",
    details: [
      "1 crédit ≈ 1 XOF — tarification transparente",
      "Débité seulement si votre plan est insuffisant",
      "Crédits qui n'expirent jamais",
      "Historique complet de vos transactions",
    ],
  },
  {
    icon: Puzzle,
    title: "Modules complémentaires",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
    headline: "Étendez sans changer de plan",
    description: "Besoin de plus de participants ou d'exports ? Achetez un module ponctuel et gardez votre plan actuel.",
    details: [
      "Quotas additionnels (+100 participants, etc.)",
      "Déverrouillages permanents (exports, certificats)",
      "Achats uniques — pas d'abonnement",
      "Effet immédiat après paiement",
    ],
  },
  {
    icon: Ticket,
    title: "Pass temporaires",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/20",
    headline: "Premium le temps d'un projet",
    description: "Accédez à des fonctionnalités avancées pendant 30, 60 ou 90 jours. Parfait pour un audit, un événement ou une formation.",
    details: [
      "Accès premium temporaire, sans engagement",
      "Analytics avancés, branding custom, API...",
      "Expiration automatique — pas de reconduction",
      "Idéal pour des besoins ponctuels",
    ],
  },
  {
    icon: Tag,
    title: "Codes promo",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    ring: "ring-rose-500/20",
    headline: "Réductions sur mesure",
    description: "Bénéficiez de réductions exclusives lors de vos achats. Codes promo par email, campagnes ou partenariats.",
    details: [
      "Réduction en pourcentage ou montant fixe",
      "Applicable sur les plans et achats",
      "Utilisable lors du checkout en un clic",
      "Offres ponctuelles et campagnes spéciales",
    ],
  },
];

const STEPS = [
  { icon: Ticket, label: "Pass", color: "text-violet-500", bg: "bg-violet-500/10" },
  { icon: Puzzle, label: "Module", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: CreditCard, label: "Plan", color: "text-primary", bg: "bg-primary/10" },
  { icon: Coins, label: "Crédits", color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

export function FlexibilitySection() {
  return (
    <section className="relative overflow-hidden bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Flexibilité</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Pas juste un abonnement.{" "}
              <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                Un système intelligent.
              </span>
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              QuizNest s&apos;adapte à votre budget et à vos besoins. Payez seulement ce que vous utilisez, quand vous en avez besoin.
            </p>
          </div>
        </Reveal>

        {/* 5 Levers Grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LEVERS.map((lever, i) => (
            <Reveal key={lever.title} delay={0.1 + i * 0.08}>
              <Card className={cn(
                "group relative overflow-hidden border-0 bg-gradient-to-br from-background to-background p-0 shadow-sm ring-1 transition-all hover:shadow-md hover:scale-[1.02] active:scale-100",
                lever.ring,
              )}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", lever.bg)}>
                      <lever.icon className={cn("size-5", lever.color)} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{lever.title}</p>
                      <p className={cn("mt-0.5 text-xs font-medium", lever.color)}>{lever.headline}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {lever.description}
                  </p>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {lever.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className={cn("mt-0.5 size-3 shrink-0", lever.color)} />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          ))}

          {/* Priority Flow Card */}
          <Reveal delay={0.5}>
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-violet-500/5 to-background p-0 shadow-sm ring-1 ring-primary/20 sm:col-span-2 lg:col-span-1">
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Shield className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Ordre de vérification</p>
                    <p className="text-xs text-primary">Automatique et transparent</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Quand vous effectuez une action, le système vérifie automatiquement dans cet ordre pour vous offrir le meilleur prix :
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {STEPS.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                          {i + 1}
                        </span>
                        <div className={cn("flex size-6 items-center justify-center rounded-md", step.bg)}>
                          <step.icon className={cn("size-3", step.color)} />
                        </div>
                        <span className="text-sm font-medium">{step.label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <ArrowRight className="size-3 text-muted-foreground/40" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  <Zap className="mr-1 inline size-3 text-primary" />
                  Si le Pass couvre l&apos;action → <strong className="text-foreground">gratuit</strong>. Sinon → le système continue la vérification.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        {/* Bottom CTA */}
        <Reveal delay={0.3}>
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Tous ces leviers sont entièrement gérés depuis le Super Admin.{" "}
              <span className="font-medium text-foreground">
                Aucun code à modifier pour ajuster votre offre.
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
