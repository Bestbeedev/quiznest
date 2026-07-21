"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-xl border bg-card p-5 shadow-xl ring-1 ring-border sm:flex-row sm:items-center sm:gap-5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Cookie className="size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Nous utilisons des cookies</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Des cookies techniques essentiels sont utilisés pour le bon fonctionnement du site (authentification, thème).
              Aucun cookie publicitaire n&apos;est déposé.{" "}
              <a href="/confidentialite" className="text-primary underline underline-offset-2 hover:text-foreground">
                En savoir plus
              </a>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto sm:shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={decline}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            Refuser
          </Button>
          <Button size="sm" onClick={accept} className="gap-1">
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
