import { FEATURES } from "@/constants/marketing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";

export function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="mx-auto max-w-6xl px-6 py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Fonctionnalités clés</h2>
        <p className="mt-3 text-muted-foreground">
          Tout ce qu&apos;il faut pour créer, publier et analyser vos évaluations.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delay={index * 0.05}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <feature.icon className="size-6 text-primary" />
                <CardTitle className="pt-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {feature.description}
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
