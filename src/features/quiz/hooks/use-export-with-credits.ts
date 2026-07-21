"use client";

import { useState } from "react";
import { chargeExportCreditsAction } from "@/features/billing/actions";
import type { FeatureKey } from "@/generated/prisma/client";

/**
 * Hook that wraps an export function with credit charging logic.
 * Returns a wrapped onExport callback and loading/error state.
 */
export function useExportWithCredits() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chargeAndExport = async (
    featureKey: FeatureKey,
    exportFn: () => void,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await chargeExportCreditsAction(featureKey);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      exportFn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'export.");
    } finally {
      setLoading(false);
    }
  };

  return { chargeAndExport, loading, error, setError };
}
