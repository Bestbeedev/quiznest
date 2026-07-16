import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL_LINKS = [
  { label: "Twitter", href: "https://twitter.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Facebook", href: "https://facebook.com" },
];

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-3">
          <span className="text-lg font-semibold tracking-tight">QuizNest</span>
          <p className="max-w-xs text-sm text-muted-foreground">
            La plateforme d&apos;évaluation nouvelle génération pour l&apos;éducation, les
            entreprises et les organisations.
          </p>
          <div className="flex items-center gap-4 pt-1 text-sm text-muted-foreground">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">Légal</span>
          <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">Newsletter</span>
          <p className="max-w-xs text-sm text-muted-foreground">
            Les nouveautés QuizNest, occasionnellement.
          </p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input type="email" placeholder="vous@exemple.com" disabled className="h-8" />
            <Button type="submit" size="sm" disabled>
              S&apos;inscrire
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">Bientôt disponible.</p>
        </div>
      </div>

      <div className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} QuizNest. Tous droits réservés.
      </div>
    </footer>
  );
}
