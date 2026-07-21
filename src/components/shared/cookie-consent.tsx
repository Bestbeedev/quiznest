"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "quiznest_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      setVisible(true); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-2 sm:p-3">
      <div className="mx-auto flex max-w-2xl flex-col gap-2.5 rounded-xl border bg-card p-3 shadow-xl ring-1 ring-border sm:flex-row sm:items-center sm:gap-4 sm:p-3.5">
        <div className="flex items-start gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Cookie className="size-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium">Cookies</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              Cookies techniques essentiels uniquement (auth, thème). Aucun cookie publicitaire.{" "}
              <a href="/confidentialite" className="text-primary underline underline-offset-2 hover:text-foreground">
                En savoir plus
              </a>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:ml-auto sm:shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={decline}
            className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
            Refuser
          </Button>
          <Button size="sm" onClick={accept} className="h-7 gap-1 px-3 text-[11px]">
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
