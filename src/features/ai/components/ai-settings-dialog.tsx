"use client";

import { useState } from "react";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AiSettingsForm } from "@/features/ai/components/ai-settings-form";
import type { AiSettingsView } from "@/lib/services/ai-settings";

export function AiSettingsDialog({
  initialSettings,
  canManage,
}: {
  initialSettings: AiSettingsView;
  canManage: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" className="gap-1.5" />}>
        <Settings className="size-4" />
        Réglages IA
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Réglages IA</DialogTitle>
          <DialogDescription>
            {canManage
              ? "Configurez votre propre clé API IA (BYOK) ou utilisez le fournisseur par défaut de QuizNest."
              : "Seuls les membres ADMIN ou OWNER peuvent modifier ces réglages — vous êtes en lecture seule."}
          </DialogDescription>
        </DialogHeader>
        <AiSettingsForm initialSettings={initialSettings} readOnly={!canManage} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
