import Link from "next/link";
import { CheckIcon, Sparkles } from "lucide-react";

import { listPublicPlans } from "@/lib/services/plan";
import { formatCurrency } from "@/lib/format";
import { Reveal } from "@/components/shared/reveal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export async function PricingSection() {
  const plans = await listPublicPlans();

  return (
    <section id="tarifs" className="scroll-mt-20 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Tarifs</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Un plan pour chaque besoin
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Commencez gratuitement, passez à un plan supérieur quand vous êtes prêt.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const isHighlighted = plan.isPromoted;
            const marketingFeatures = Array.isArray(plan.features) ? (plan.features as string[]) : [];

            return (
              <Reveal
                key={plan.slug}
                delay={0.1 + i * 0.15}
                direction={i === 1 ? "scale" : i === 0 ? "left" : "right"}
              >
                <Card
                  className={`relative flex flex-col overflow-hidden border-0 p-0 shadow-md ring-1 transition-all hover:shadow-lg ${
                    isHighlighted
                      ? "ring-primary/40 shadow-primary/10 scale-105 lg:scale-110"
                      : "ring-border hover:ring-primary/20"
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                  )}

                  {plan.badge && (
                    <div
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold ${
                        isHighlighted
                          ? "bg-gradient-to-r from-primary to-violet-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isHighlighted && <Sparkles className="size-3" />}
                      {plan.badge}
                    </div>
                  )}

                  <CardHeader className="relative p-4 pb-0">
                    <p className="text-sm font-semibold">{plan.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {plan.description}
                    </p>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight">
                        {plan.price === null
                          ? "Sur devis"
                          : plan.price === 0
                            ? "Gratuit"
                            : formatCurrency(plan.price, plan.currency)}
                      </span>
                      {plan.price !== null && plan.price > 0 && (
                        <span className="text-sm text-muted-foreground">
                          /{plan.interval === "YEAR" ? "an" : "mois"}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="relative flex flex-1 flex-col p-4 pt-3">
                    <div className="border-t pt-3">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Inclus
                      </p>
                      <ul className="flex-1 space-y-2">
                        {marketingFeatures.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2.5 text-sm"
                          >
                            <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link href={plan.price === 0 ? "/register" : `/register?callbackUrl=${encodeURIComponent(`/dashboard/billing?plan=${plan.slug}`)}`} className="mt-4 block">
                      <Button
                        variant={isHighlighted ? "default" : "outline"}
                        className="w-full transition-all hover:scale-[1.02] active:scale-100"
                      >
                        {plan.price === 0
                          ? "Commencer gratuitement"
                          : "Choisir ce plan"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
