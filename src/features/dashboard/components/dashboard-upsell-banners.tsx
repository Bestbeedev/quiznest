"use client";

import Link from "next/link";
import { ArrowRight, Coins, Crown, Sparkles, AlertTriangle, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Banner = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  cta: string;
  href: string;
  variant: "upsell" | "warning" | "promo";
};

const VARIANT_STYLES = {
  upsell: "border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5",
  warning: "border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5",
  promo: "border-violet-500/20 bg-gradient-to-r from-violet-500/5 via-violet-500/10 to-violet-500/5",
};

const VARIANT_ICON_BG = {
  upsell: "bg-primary/10 text-primary",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  promo: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

type Props = {
  planSlug: string;
  quizCount: number;
  quizLimit: number | null;
  participantCount: number;
  participantLimit: number | null;
  walletBalance: number;
};

function buildBanners({ planSlug, quizCount, quizLimit, participantCount, participantLimit, walletBalance }: Props): Banner[] {
  const banners: Banner[] = [];

  // Quota warnings
  if (quizLimit !== null && quizLimit !== undefined) {
    if (quizCount >= quizLimit) {
      banners.push({
        id: "quiz-limit",
        icon: AlertTriangle,
        title: "Limite de quiz atteinte",
        description: `Vous utilisez ${quizCount} quiz sur ${quizLimit}. Passez à un plan supérieur pour créer davantage.`,
        cta: "Voir les plans",
        href: "/dashboard/billing",
        variant: "warning",
      });
    } else if (quizCount >= quizLimit * 0.8) {
      banners.push({
        id: "quiz-approaching",
        icon: Crown,
        title: "Bientôt la limite de quiz",
        description: `${quizCount} / ${quizLimit} quiz utilisés. Anticipez en passant à un plan supérieur.`,
        cta: "Voir les plans",
        href: "/dashboard/billing",
        variant: "upsell",
      });
    }
  }

  if (participantLimit !== null && participantLimit !== undefined) {
    if (participantCount >= participantLimit) {
      banners.push({
        id: "participant-limit",
        icon: AlertTriangle,
        title: "Limite de participants atteinte",
        description: `${participantCount} / ${participantLimit} participants. Pour recevoir plus de réponses, upgradez votre plan.`,
        cta: "Voir les plans",
        href: "/dashboard/billing",
        variant: "warning",
      });
    } else if (participantCount >= participantLimit * 0.8) {
      banners.push({
        id: "participant-approaching",
        icon: Crown,
        title: "Bientôt la limite de participants",
        description: `${participantCount} / ${participantLimit} participants utilisés. Pensez à upgrader.`,
        cta: "Voir les plans",
        href: "/dashboard/billing",
        variant: "upsell",
      });
    }
  }

  // Wallet low balance
  if (walletBalance > 0 && walletBalance <= 5) {
    banners.push({
      id: "wallet-low",
      icon: Coins,
      title: "Crédits wallet faibles",
      description: `Il vous reste ${walletBalance} crédit${walletBalance !== 1 ? "s" : ""}. Rechargez pour continuer à utiliser les fonctionnalités premium.`,
      cta: "Recharger",
      href: "/dashboard/billing",
      variant: "promo",
    });
  }

  // Free plan upsell
  if (planSlug === "free") {
    banners.push({
      id: "free-upgrade",
      icon: Sparkles,
      title: "Débloquez tout le potentiel de QuizNest",
      description: "Avec un plan payant : IA illimitée, exports, analytics avancés, certificats et bien plus.",
      cta: "Voir les plans",
      href: "/dashboard/billing",
      variant: "upsell",
    });
  }

  return banners;
}

export function DashboardUpsellBanners(props: Props) {
  const banners = buildBanners(props);

  if (banners.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {banners.map((banner) => {
        const Icon = banner.icon;
        return (
          <div
            key={banner.id}
            className={cn(
              "relative overflow-hidden rounded-xl border p-4",
              VARIANT_STYLES[banner.variant],
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", VARIANT_ICON_BG[banner.variant])}>
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{banner.title}</p>
                  <p className="text-xs text-muted-foreground">{banner.description}</p>
                </div>
              </div>
              <Link
                href={banner.href}
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "shrink-0 gap-1.5",
                )}
              >
                {banner.cta}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
