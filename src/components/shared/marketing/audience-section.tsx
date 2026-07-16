import { AUDIENCES } from "@/constants/marketing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";

export function AudienceSection() {
  return (
    <section id="pour-qui" className="mx-auto max-w-6xl px-6 py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Pour qui ?</h2>
        <p className="mt-3 text-muted-foreground">
          QuizNest s&apos;adapte à tous les contextes d&apos;évaluation.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map((audience, index) => (
          <Reveal key={audience.title} delay={index * 0.05}>
            <Card className="h-full">
              <CardHeader>
                <audience.icon className="size-6 text-primary" />
                <CardTitle className="pt-2">{audience.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {audience.description}
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
