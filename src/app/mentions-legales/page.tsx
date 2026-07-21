import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/constants/seo";
import { SITE_NAME, SITE_URL } from "@/constants/seo";
import { CONTACT } from "@/constants/contact";

export const metadata: Metadata = buildMetadata({
  title: "Mentions légales",
  description: `Mentions légales du site ${SITE_NAME}. Informations sur l'éditeur, l'hébergeur et les conditions d'utilisation du site.`,
  path: "/mentions-legales",
});

const LAST_UPDATED = "21 juillet 2026";

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="text-sm text-muted-foreground">Dernière mise à jour : {LAST_UPDATED}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Mentions légales</h1>

      <div className="prose prose-neutral dark:prose-invert mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">

        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Éditeur du site</h2>
          <p>
            Le site <strong>{SITE_NAME}</strong> ({SITE_URL}) est édité par :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Dénomination sociale :</strong> QuizNest</li>
            <li><strong>Forme juridique :</strong> [À compléter — SAS, SARL, Auto-entrepreneur, etc.]</li>
            <li><strong>Siège social :</strong> [À compléter — adresse complète]</li>
            <li><strong>Capital social :</strong> [À compléter, le cas échéant]</li>
            <li><strong>RCS :</strong> [À compléter — numéro d&apos;immatriculation]</li>
            <li><strong>N° TVA intracommunautaire :</strong> [À compléter, le cas échéant]</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Directeur de la publication</h2>
          <p>
            Le directeur de la publication est le représentant légal de l&apos;entité éditrice.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Nom :</strong> [À compléter]</li>
            <li><strong>Fonction :</strong> [À compléter]</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Hébergeur</h2>
          <p>
            Le site est hébergé par :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Hébergeur :</strong> Vercel Inc.</li>
            <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
            <li><strong>Site :</strong>{" "}
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
                vercel.com
              </a>
            </li>
          </ul>
          <p className="mt-2">
            La base de données est hébergée par :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Hébergeur :</strong> Neon Inc.</li>
            <li><strong>Adresse :</strong> 48 Wall Street, New York, NY 10005, États-Unis</li>
            <li><strong>Site :</strong>{" "}
              <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
                neon.tech
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu de ce site (textes, images, graphismes, logos, icônes, sons, logiciels, base de données) est la propriété exclusive de {SITE_NAME} ou de ses concédants et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
          </p>
          <p className="mt-2">
            Toute reproduction, représentation, modification, publication, transmission ou dénaturation du site ou de son contenu, par quelque procédé que ce soit, est interdite sans autorisation préalable écrite.
          </p>
          <p className="mt-2">
            Les marques et logos figurant sur le site sont des marques déposées. Toute utilisation sans autorisation est prohibée.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Données personnelles</h2>
          <p>
            Le traitement des données personnelles est régi par notre{" "}
            <Link href="/confidentialite" className="text-primary underline underline-offset-4">
              politique de confidentialité
            </Link>.
          </p>
          <p className="mt-2">
            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez de droits sur vos données personnelles. Pour toute question, contactez-nous à l&apos;adresse indiquée ci-dessous.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Cookies</h2>
          <p>
            Le site utilise des cookies techniques nécessaires à son bon fonctionnement. Aucun cookie publicitaire ou de tracking n&apos;est déposé sans votre consentement.
          </p>
          <p className="mt-2">
            Pour plus d&apos;informations, consultez notre{" "}
            <Link href="/confidentialite" className="text-primary underline underline-offset-4">
              politique de confidentialité
            </Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Limitation de responsabilité</h2>
          <p>
            {SITE_NAME} s&apos;efforce de fournir des informations aussi précises que possible sur le site. Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes et des carences dans la mise à jour.
          </p>
          <p className="mt-2">
            Le site ne pourra être tenu responsable de tout dommage résultant d&apos;une utilisation des informations ou des données accessibles via le service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Liens hypertextes</h2>
          <p>
            Le site peut contenir des liens hypertextes vers d&apos;autres sites. {SITE_NAME} n&apos;exerce aucun contrôle sur le contenu de ces sites tiers et décline toute responsabilité quant à leur contenu.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Droit applicable</h2>
          <p>
            Les présentes mentions légales sont régies par le droit applicable dans la juridiction du siège social de {SITE_NAME}. En cas de litige, les tribunaux compétents seront ceux du ressort du siège social.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
          <p>
            Pour toute question relative aux mentions légales, contactez-nous :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Par email : <a href={CONTACT.emailLink} className="text-primary underline underline-offset-4">{CONTACT.email}</a></li>
            <li>Par téléphone : <a href={CONTACT.phoneLink} className="text-primary underline underline-offset-4">{CONTACT.phone}</a></li>
            <li>Par la page : <Link href="/contact" className="text-primary underline underline-offset-4">Contact</Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
