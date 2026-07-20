"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type CheckoutResult = { success: true; checkoutUrl: string } | { error: string };

export function CheckoutButton({
  action,
  label,
  className,
  variant,
}: {
  action: () => Promise<CheckoutResult>;
  label: string;
  className?: string;
  variant?: "default" | "outline" | "secondary";
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const result = await action();
    if (!("checkoutUrl" in result) || !result.checkoutUrl) {
      toast.error("error" in result ? result.error : "Impossible d'initier le paiement.");
      setLoading(false);
      return;
    }
    window.location.href = result.checkoutUrl;
  };

  return (
    <Button className={className} variant={variant} onClick={handleClick} disabled={loading}>
      {loading ? "Redirection..." : label}
    </Button>
  );
}
