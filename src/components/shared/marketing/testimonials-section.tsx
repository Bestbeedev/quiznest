import { TESTIMONIALS } from "@/constants/marketing";
import { Reveal } from "@/components/shared/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function TestimonialsSection() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Témoignages</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Ils parlent mieux que nous
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Des organisations de toutes tailles font confiance à QuizNest.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((testimonial, i) => (
            <Reveal key={testimonial.name} delay={0.1 + i * 0.1} direction={i % 2 === 0 ? "left" : "right"}>
              <Card className="group relative h-full overflow-hidden border-0 bg-gradient-to-br from-card to-muted/50 p-0 shadow-md ring-1 ring-border transition-all hover:shadow-lg hover:scale-[1.02] active:scale-100">
                <div className="absolute top-0 right-0 p-4 text-5xl font-serif leading-none text-primary/10 select-none">
                  &ldquo;
                </div>
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12 ring-2 ring-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {initials(testimonial.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>

                  {testimonial.highlight && (
                    <p className="mt-4 text-sm font-medium text-primary">
                      {testimonial.highlight}
                    </p>
                  )}

                  <blockquote className="mt-2 text-base leading-relaxed text-muted-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
