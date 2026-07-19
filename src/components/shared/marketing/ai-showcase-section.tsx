import {
  Brain,
  Sparkles,
  Wand2,
  Globe,
  Languages,
  ShieldCheck,
  BarChart3,
  Zap,
} from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { Card, CardContent } from "@/components/ui/card";

const AI_FEATURES = [
  {
    icon: Wand2,
    title: "Génération en un clic",
    description:
      "Donnez un sujet, un niveau et le nombre de questions souhaité. L'IA génère un quiz complet avec les bonnes réponses.",
  },
  {
    icon: Languages,
    title: "Multi-langues",
    description:
      "Générez des questions en français, anglais, espagnol, arabe et 11 autres langues automatiquement.",
  },
  {
    icon: ShieldCheck,
    title: "Difficulté calibrée",
    description:
      "L'IA adapte la difficulté (facile, moyen, difficile) selon le niveau ciblé et le domaine disciplinaire.",
  },
  {
    icon: BarChart3,
    title: "Analyse intelligente",
    description:
      "L'IA identifie les questions trop faciles ou trop difficiles et suggère des ajustements basés sur les résultats réels.",
  },
];

function AiBrainVisual() {
  return (
    <div className="relative mx-auto size-64 sm:size-80">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-violet-500/10 to-emerald-500/10 blur-3xl" />
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/10 to-violet-500/5 ring-1 ring-primary/20" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-violet-600 shadow-2xl shadow-primary/30">
            <Brain className="size-10 text-white" />
          </div>
          <div className="absolute -top-3 -right-3 flex size-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <Sparkles className="size-4 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-4 flex size-7 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-500/30">
            <Zap className="size-3.5 text-white" />
          </div>
        </div>
      </div>
      <div className="absolute top-6 left-6 flex size-10 items-center justify-center rounded-xl bg-card shadow-lg ring-1 ring-border">
        <Globe className="size-5 text-primary" />
      </div>
      <div className="absolute bottom-8 right-6 flex size-10 items-center justify-center rounded-xl bg-card shadow-lg ring-1 ring-border">
        <BarChart3 className="size-5 text-violet-500" />
      </div>
    </div>
  );
}

export function AiShowcaseSection() {
  return (
    <section id="ia" className="scroll-mt-20 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Intelligence artificielle</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              L&apos;IA au service de vos évaluations
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Générez des dizaines de questions pertinentes en quelques secondes, sans effort.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          <Reveal delay={0.1} direction="left">
            <AiBrainVisual />
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {AI_FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={0.15 + i * 0.1} direction="right">
                <Card className="group border-0 bg-card/50 shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:ring-primary/20">
                  <CardContent className="p-5">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <feature.icon className="size-5" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
