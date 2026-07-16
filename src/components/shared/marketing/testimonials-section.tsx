import { TESTIMONIALS } from "@/constants/marketing";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Reveal } from "@/components/shared/reveal";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Ils utilisent QuizNest</h2>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial, index) => (
          <Reveal key={testimonial.name} delay={index * 0.05}>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col gap-4">
                <p className="text-sm text-muted-foreground text-balance">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-auto flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{initials(testimonial.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
