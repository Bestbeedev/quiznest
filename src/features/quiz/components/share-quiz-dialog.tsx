"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";

export function ShareQuizDialog({ accessCode }: { accessCode: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/q/${accessCode}` : "";

  useEffect(() => {
    if (!open || !publicUrl) return;
    QRCode.toDataURL(publicUrl, { width: 220, margin: 1 }).then(setQrDataUrl);
  }, [open, publicUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Lien copié dans le presse-papiers.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 h-8 text-[13px] font-medium hover:bg-muted">
        <Share2 className="size-4" />
        Partager
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partager ce quiz</DialogTitle>
          <DialogDescription>
            Toute personne avec ce lien ou ce QR code peut répondre au quiz, sans compte.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="public-link">Lien public</FieldLabel>
            <div className="flex gap-2">
              <Input id="public-link" value={publicUrl} readOnly />
              <Button type="button" variant="outline" size="icon" onClick={handleCopy} aria-label="Copier">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="access-code">Code d&apos;accès</FieldLabel>
            <Input id="access-code" value={accessCode} readOnly />
          </Field>

          {qrDataUrl && (
            <div className="flex flex-col items-center gap-2 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL, not an optimizable remote image */}
              <img src={qrDataUrl} alt="QR code du quiz" className="rounded-lg border" width={220} height={220} />
              <p className="text-xs text-muted-foreground">Scannez pour accéder au quiz</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
