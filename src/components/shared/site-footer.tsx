import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
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
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} QuizNest. Tous droits réservés.</p>

        <nav className="flex items-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
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
    </footer>
  );
}
