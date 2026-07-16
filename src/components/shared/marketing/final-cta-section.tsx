import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

export function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-violet-600/90 to-emerald-500/80 px-8 py-16 text-center text-primary-foreground">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Prêt à créer votre première évaluation ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-balance text-primary-foreground/90">
            Rejoignez QuizNest gratuitement et publiez votre premier quiz en moins de 2 minutes.
          </p>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg", variant: "secondary" }),
              "mt-6 gap-1.5 transition-transform hover:scale-[1.03] active:scale-95",
            )}
          >
            Commencer gratuitement
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
