import { Mail, Phone, Clock } from "lucide-react";

import { buildMetadata } from "@/constants/seo";
import { SITE_NAME } from "@/constants/seo";
import { CONTACT } from "@/constants/contact";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ContactForm } from "./contact-form";

export const metadata = buildMetadata({
  title: "Contact",
  description: `Contactez l'équipe ${SITE_NAME}. Questions, support, partenariats — nous répondons sous 24h.`,
  path: "/contact",
});

const CONTACT_INFO = [
  {
    icon: Mail,
    title: "Email",
    value: CONTACT.email,
    href: CONTACT.emailLink,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Phone,
    title: "Téléphone",
    value: CONTACT.phone,
    href: CONTACT.phoneLink,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Clock,
    title: "Délai de réponse",
    value: "Sous 24 heures ouvrées",
    href: null,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">Contact</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Parlons de votre projet
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Une question, une demande de support ou un partenariat ? Notre équipe vous répond sous 24 heures.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {CONTACT_INFO.map((item) => (
            <Card key={item.title} className="border-0 bg-muted/30">
              <CardContent className="flex items-start gap-3 py-4">
                <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", item.bg)}>
                  <item.icon className={cn("size-4", item.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-0 bg-muted/30">
            <CardContent className="py-4">
              <p className="text-sm font-medium">Autres liens</p>
              <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
                <a href="/mentions-legales" className="transition-colors hover:text-foreground">Mentions légales</a>
                <a href="/confidentialite" className="transition-colors hover:text-foreground">Politique de confidentialité</a>
                <a href="/cgu" className="transition-colors hover:text-foreground">Conditions Générales d&apos;Utilisation</a>
              </div>
            </CardContent>
          </Card>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
