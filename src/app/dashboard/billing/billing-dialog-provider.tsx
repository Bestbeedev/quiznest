"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { PlanUpgradeDialog } from "@/features/billing/components/plan-upgrade-dialog";

type PlanOption = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  interval: string;
  isPromoted: boolean;
  badge: string | null;
  features: unknown;
  promoPrice: number | null;
  promoEndsAt: Date | null;
};

type BillingDialogContextValue = {
  openPlanUpgrade: (slug: string) => void;
};

const BillingDialogContext = createContext<BillingDialogContextValue>({
  openPlanUpgrade: () => {},
});

export function useBillingDialog() {
  return useContext(BillingDialogContext);
}

export function BillingDialogProvider({
  plans,
  currentPlanSlug,
  initialPlanSlug,
  children,
}: {
  plans: PlanOption[];
  currentPlanSlug: string;
  initialPlanSlug?: string | null;
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const [openPlanSlug, setOpenPlanSlug] = useState<string | null>(initialPlanSlug ?? null);

  // Sync from URL ?plan= param
  useEffect(() => {
    const urlPlan = searchParams.get("plan");
    if (urlPlan) {
      setOpenPlanSlug(urlPlan); // eslint-disable-line react-hooks/set-state-in-effect
      const url = new URL(window.location.href);
      url.searchParams.delete("plan");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  const openPlanUpgrade = useCallback((slug: string) => {
    setOpenPlanSlug(slug);
  }, []);

  return (
    <BillingDialogContext.Provider value={{ openPlanUpgrade }}>
      {children}
      <PlanUpgradeDialog
        plans={plans}
        currentPlanSlug={currentPlanSlug}
        openPlanSlug={openPlanSlug}
        onOpenChange={setOpenPlanSlug}
      />
    </BillingDialogContext.Provider>
  );
}
