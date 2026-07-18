"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Card className="max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <CardTitle className="mt-2">Une erreur est survenue</CardTitle>
          <CardDescription>
            Impossible de charger cette page pour le moment. Réessayez, ou revenez au tableau de
            bord.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-2">
          <Button onClick={reset}>Réessayer</Button>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
            Retour au dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
