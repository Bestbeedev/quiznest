import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-violet-700/90 dark:from-primary/80 dark:via-primary/70 dark:to-violet-600/80" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(1_0_0/0.15),transparent)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary-foreground/70">Prêt à démarrer ?</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
              Transformez vos évaluations dès aujourd&apos;hui
            </h2>
            <p className="mt-2 text-[13px] text-primary-foreground/80">
              Créez votre premier quiz en moins de 2 minutes. Gratuit, sans engagement.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-10 gap-2 rounded-xl border-0 bg-white px-5 text-sm font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-xl hover:scale-105 active:scale-100 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90"
                >
                  Commencer gratuitement
                  <Sparkles className="size-4" />
                </Button>
              </Link>
              <Link href="#fonctionnalites">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-10 gap-2 rounded-xl border-primary-foreground/20 bg-primary-foreground/10 px-5 text-sm text-primary-foreground shadow-lg transition-all hover:bg-primary-foreground/20 hover:scale-105 active:scale-100"
                >
                  Voir les fonctionnalités
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
