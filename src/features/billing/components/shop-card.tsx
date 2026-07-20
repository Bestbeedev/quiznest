"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/features/billing/components/checkout-button";
import { formatCurrency } from "@/lib/format";

type CheckoutResult = { success: true; checkoutUrl: string } | { error: string };

export function ShopCard({
  title,
  description,
  price,
  currency,
  meta,
  badge,
  action,
  actionLabel = "Acheter",
}: {
  title: string;
  description?: string | null;
  price: number;
  currency: string;
  meta?: string;
  badge?: string;
  action: () => Promise<CheckoutResult>;
  actionLabel?: string;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {badge && <Badge>{badge}</Badge>}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="mt-auto flex flex-col gap-3">
        <div>
          <p className="text-2xl font-bold tracking-tight">{formatCurrency(price, currency)}</p>
          {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
        </div>
        <CheckoutButton action={action} label={actionLabel} className="w-full" variant="outline" />
      </CardContent>
    </Card>
  );
}
