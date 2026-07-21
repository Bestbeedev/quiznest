import { AUDIENCES } from "@/constants/marketing";
import { Reveal } from "@/components/shared/reveal";
import { Card, CardContent } from "@/components/ui/card";

const GRADIENTS = [
  "from-blue-500/10 via-blue-500/5 to-transparent",
  "from-violet-500/10 via-violet-500/5 to-transparent",
  "from-emerald-500/10 via-emerald-500/5 to-transparent",
  "from-amber-500/10 via-amber-500/5 to-transparent",
];

const COLORS = [
  "text-blue-600 dark:text-blue-400",
  "text-violet-600 dark:text-violet-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-amber-600 dark:text-amber-400",
];

export function AudienceSection() {
  return (
    <section id="pour-qui" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Publics</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Pour qui est-ce fait ?
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Une solution adaptée à chaque type d&apos;organisation.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((audience, i) => (
            <Reveal key={audience.title} delay={0.1 + i * 0.1} direction="up">
              <Card className="group relative h-full overflow-hidden border bg-card p-0 shadow-sm transition-all hover:shadow-md hover:scale-[1.03] active:scale-100">
                <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i]}`} />
                <CardContent className="relative flex flex-col items-center p-4 text-center">
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${GRADIENTS[i]} ring-1 ring-border ${COLORS[i]}`}
                  >
                    <audience.icon className="size-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{audience.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                    {audience.description}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
