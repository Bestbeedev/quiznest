import type { Metadata } from "next";
import { Check } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Abonnement — QuizNest",
};

const FREE_PLAN_FEATURES = ["3 quiz", "50 participants", "10 questions par quiz", "100 Mo de stockage"];

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Abonnement</h1>
        <p className="text-sm text-muted-foreground">Gérez votre plan et votre facturation.</p>
      </div>

      <Card className="max-w-md">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Plan actuel</CardTitle>
            <CardDescription>Vous êtes sur le plan gratuit.</CardDescription>
          </div>
          <Badge variant="secondary">Free</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2 text-sm">
            {FREE_PLAN_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
          <Button disabled className="w-fit">
            Changer de plan
          </Button>
          <p className="text-xs text-muted-foreground">
            Les paiements (FedaPay) seront bientôt disponibles pour passer aux plans Professional et
            Enterprise.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
