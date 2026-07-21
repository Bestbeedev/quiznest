import { FEATURES } from "@/constants/marketing";
import { Reveal } from "@/components/shared/reveal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function FeatureIcon({ icon: Icon }: { icon: typeof FEATURES[number]["icon"] }) {
  return (
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
    </div>
  );
}

export function FeaturesSection() {
  const lgFeature = FEATURES.find((f) => f.size === "lg");
  const mdFeatures = FEATURES.filter((f) => f.size === "md");
  const smFeatures = FEATURES.filter((f) => f.size === "sm");

  return (
    <section id="fonctionnalites" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Fonctionnalités</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Tout ce dont vous avez besoin pour évaluer
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Une plateforme complète qui couvre chaque étape, de la création à l&apos;analyse.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {lgFeature && (
            <Reveal delay={0.1} direction="scale" className="lg:row-span-2">
              <Card className="relative h-full overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-0 shadow-lg ring-1 ring-primary/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(0.52_0.22_265/0.1),transparent_60%)]" />
                <CardHeader className="relative p-4 pb-0">
                  <FeatureIcon icon={lgFeature.icon} />
                </CardHeader>
                <CardContent className="relative p-4">
                  <h3 className="text-sm font-semibold">{lgFeature.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                    {lgFeature.description}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[
                      { label: "Temps de génération", value: "< 2 min" },
                      { label: "Taux de pertinence", value: "> 90%" },
                      { label: "Langues supportées", value: "15+" },
                      { label: "Questions générées", value: "Illimité" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-lg bg-background/60 p-2.5 ring-1 ring-border"
                      >
                        <p className="text-[11px] text-muted-foreground">{s.label}</p>
                        <p className="mt-0.5 text-sm font-semibold tracking-tight">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          )}

          <div className="flex flex-col gap-4">
            {mdFeatures.map((feature, i) => (
              <Reveal key={feature.title} delay={0.1 + i * 0.1}>
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br p-0 shadow-md ring-1 ring-border transition-all hover:shadow-lg hover:scale-[1.02] active:scale-100">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`} />
                  <CardHeader className="relative flex-row items-center gap-2.5 space-y-0 p-4 pb-0">
                    <FeatureIcon icon={feature.icon} />
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                  </CardHeader>
                  <CardContent className="relative p-4 pt-2">
                    <p className="text-[12px] leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {smFeatures.map((feature, i) => (
            <Reveal key={feature.title} delay={0.2 + i * 0.08}>
              <Card className="group relative overflow-hidden border bg-card/50 p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.03] active:scale-100">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`} />
                <div className="relative">
                  <FeatureIcon icon={feature.icon} />
                  <h3 className="mt-2 font-semibold text-[13px]">{feature.title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
