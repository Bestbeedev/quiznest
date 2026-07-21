"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

const PRODUCT_LINKS = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
  { label: "API", href: "/api" },
];

const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "CGU", href: "/cgu" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL_LINKS = [
  { label: "Twitter", href: "https://twitter.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "GitHub", href: "https://github.com" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Logo />
            <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              La plateforme d&apos;évaluation nouvelle génération pour l&apos;éducation, les
              entreprises et les organisations.
            </p>
            <div className="flex items-center gap-2.5 pt-0.5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={social.label}
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium">Produit</span>
            <nav className="flex flex-col gap-1 text-[13px] text-muted-foreground">
              {PRODUCT_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium">Légal</span>
            <nav className="flex flex-col gap-1 text-[13px] text-muted-foreground">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium">Newsletter</span>
            <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              Recevez les dernières nouveautés QuizNest, occasionnellement.
            </p>
            <form
              className="flex gap-1.5"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="vous@exemple.com"
                className="h-7 flex-1 rounded-lg border border-input bg-background px-2.5 text-[13px] outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
              <Button type="submit" size="sm" className="h-7 px-2.5 text-[11px]">
                OK
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t px-4 py-3 text-center text-[11px] text-muted-foreground sm:px-6">
        &copy; {new Date().getFullYear()} QuizNest. Tous droits réservés.
      </div>
    </footer>
  );
}
