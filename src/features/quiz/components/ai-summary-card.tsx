import { Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AiSummaryCard() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Résumé IA</CardTitle>
          <CardDescription>Analyse automatique des résultats</CardDescription>
        </div>
        <Badge variant="secondary">Bientôt</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
          <Sparkles className="size-8 text-muted-foreground" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Un résumé généré par IA (points forts, points faibles, recommandations) apparaîtra ici
            une fois le fournisseur IA connecté.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
