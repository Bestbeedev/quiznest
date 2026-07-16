import Link from "next/link";
import { Check } from "lucide-react";

import { PRICING_PLANS } from "@/constants/marketing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/shared/reveal";

export function PricingSection() {
  return (
    <section id="tarifs" className="mx-auto max-w-6xl px-6 py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Tarifs</h2>
        <p className="mt-3 text-muted-foreground">
          Commencez gratuitement, évoluez selon vos besoins.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PRICING_PLANS.map((plan, index) => (
          <Reveal key={plan.name} delay={index * 0.05}>
            <Card
              className={cn(
                "h-full",
                plan.highlighted && "ring-2 ring-primary",
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.highlighted && <Badge>Recommandé</Badge>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex h-full flex-col gap-6">
                <p className="text-3xl font-semibold">
                  {plan.price === "0" ? "Gratuit" : plan.price}
                </p>
                <ul className="flex flex-col gap-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ variant: plan.highlighted ? "default" : "outline" }),
                    "mt-auto w-full",
                  )}
                >
                  Commencer
                </Link>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
