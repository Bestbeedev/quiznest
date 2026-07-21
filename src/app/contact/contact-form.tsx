"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="lg:col-span-3">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="size-6 text-emerald-500" />
          </div>
          <p className="text-lg font-semibold">Message envoyé !</p>
          <p className="text-sm text-muted-foreground">
            Merci pour votre message. Notre équipe vous répondra sous 24 heures.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setSubmitted(false)}
          >
            Envoyer un autre message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-3">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Nom
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Votre nom"
                required
                className="h-10"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="vous@exemple.com"
                required
                className="h-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="subject" className="text-sm font-medium">
              Sujet
            </label>
            <Input
              id="subject"
              name="subject"
              placeholder="Question technique, demande commerciale, bug report..."
              required
              className="h-10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Décrivez votre demande en détail..."
              rows={5}
              required
              className="min-h-[120px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2 sm:w-auto"
          >
            {loading ? (
              "Envoi en cours..."
            ) : (
              <>
                <Send className="size-4" />
                Envoyer
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
