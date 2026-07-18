import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Lock } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UpgradeBannerVariant = "default" | "compact" | "card";

interface UpgradeBannerProps {
  title: string;
  description: string;
  variant?: UpgradeBannerVariant;
  features?: string[];
  href?: string;
  ctaLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function UpgradeBanner({
  title,
  description,
  variant = "default",
  features,
  href = "/dashboard/billing",
  ctaLabel = "Voir les plans",
  icon: Icon = Sparkles,
}: UpgradeBannerProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "shrink-0 gap-1.5",
          )}
        >
          {ctaLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="p-6">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">{title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>

          {features && features.length > 0 && (
            <ul className="mt-4 space-y-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="size-3.5 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          <Link
            href={href}
            className={cn(
              buttonVariants({ variant: "default" }),
              "mt-6 w-full gap-2",
            )}
          >
            {ctaLabel}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6">
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/5" />
      <div className="absolute -bottom-6 -left-6 size-24 rounded-full bg-primary/5" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            {features && features.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    <Zap className="size-3" />
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: "default" }),
            "shrink-0 gap-2",
          )}
        >
          {ctaLabel}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

interface FeatureGateProps {
  featureName: string;
  description: string;
  features?: string[];
}

export function FeatureGate({ featureName, description, features }: FeatureGateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <Lock className="size-6 text-primary" />
      </div>
      <h3 className="mt-5 text-xl font-semibold">{featureName}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>

      {features && features.length > 0 && (
        <div className="mt-6 grid max-w-md gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
            >
              <Zap className="size-3.5 shrink-0 text-primary" />
              {feature}
            </div>
          ))}
        </div>
      )}

      <Link
        href="/dashboard/billing"
        className={cn(
          buttonVariants({ variant: "default" }),
          "mt-8 gap-2",
        )}
      >
        Débloquer avec un plan payant
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
