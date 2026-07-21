import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/constants/seo";
import { SITE_NAME, SITE_URL } from "@/constants/seo";
import { CONTACT } from "@/constants/contact";

export const metadata: Metadata = buildMetadata({
  title: "Politique de confidentialité",
  description: `Comment ${SITE_NAME} collecte, utilise et protège vos données personnelles. Conformité RGPD.`,
  path: "/confidentialite",
});

const LAST_UPDATED = "21 juillet 2026";

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="text-sm text-muted-foreground">Dernière mise à jour : {LAST_UPDATED}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Politique de confidentialité</h1>
      <p className="mt-3 text-muted-foreground">
        Chez {SITE_NAME}, la protection de vos données personnelles est une priorité. Cette politique explique comment nous collectons, utilisons, partageons et protégeons vos informations.
      </p>

      <div className="prose prose-neutral dark:prose-invert mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">

        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Responsable du traitement</h2>
          <p>Le responsable du traitement des données personnelles est :</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Entité :</strong> QuizNest</li>
            <li><strong>Email :</strong> <a href={CONTACT.emailLink} className="text-primary underline underline-offset-4">{CONTACT.email}</a></li>
            <li><strong>Téléphone :</strong> <a href={CONTACT.phoneLink} className="text-primary underline underline-offset-4">{CONTACT.phone}</a></li>
            <li><strong>Site :</strong> {SITE_URL}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Données collectées</h2>
          <p>Nous collectons les données suivantes dans le cadre de l&apos;utilisation de {SITE_NAME} :</p>

          <div className="mt-4">
            <h3 className="text-base font-medium text-foreground">a) Données d&apos;inscription</h3>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Mot de passe (hashé)</li>
              <li>Photo de profil (optionnelle, via OAuth Google)</li>
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-medium text-foreground">b) Données d&apos;organisation</h3>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Nom de l&apos;organisation</li>
              <li>Logo (optionnel)</li>
              <li>Rôle de l&apos;utilisateur au sein de l&apos;organisation (propriétaire, administrateur, membre)</li>
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-medium text-foreground">c) Données d&apos;utilisation</h3>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Quiz créés, questions rédigées, sujets traités</li>
              <li>Réponses des participants (anonymisées ou identifiées selon la configuration)</li>
              <li>Statistiques d&apos;utilisation (scores, temps de réponse, taux de réussite)</li>
              <li>Historique des transactions et paiements</li>
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-medium text-foreground">d) Données techniques</h3>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Adresse IP</li>
              <li>Type de navigateur et système d&apos;exploitation</li>
              <li>Pages visitées et actions effectuées</li>
              <li>Données de connexion (horodatage, durée de session)</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Finalités du traitement</h2>
          <p>Vos données sont traitées pour les finalités suivantes :</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Fourniture du service :</strong> création de comptes, gestion des organisations, création et diffusion de quiz, analyse des résultats</li>
            <li><strong>Authentification :</strong> connexion sécurisée via email/mot de passe ou Google OAuth</li>
            <li><strong>Facturation :</strong> gestion des abonnements, paiements, factures et wallets</li>
            <li><strong>Communication :</strong> envoi de notifications relatives au service (résultats, alertes de quota, renouvellements)</li>
            <li><strong>Amélioration du service :</strong> analyse anonymisée de l&apos;utilisation pour améliorer les fonctionnalités</li>
            <li><strong>Obligations légales :</strong> comptabilité, facturation, réponse aux demandes des autorités</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Base légale du traitement</h2>
          <p>Chaque traitement repose sur une base légale valide (RGPD) :</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Exécution du contrat</strong> (art. 6.1.b) — fourniture du service</li>
            <li><strong>Intérêt légitime</strong> (art. 6.1.f) — amélioration du service, prévention de la fraude</li>
            <li><strong>Consentement</strong> (art. 6.1.a) — cookies non essentiels, newsletters</li>
            <li><strong>Obligation légale</strong> (art. 6.1.c) — comptabilité, fiscalité</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Destinataires des données</h2>
          <p>Vos données peuvent être partagées avec :</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Autres membres de votre organisation :</strong> selon les rôles et permissions définis par le propriétaire</li>
            <li><strong>Prestataires techniques :</strong> hébergeurs (Vercel, Neon), processeurs de paiement (FedaPay), services d&apos;email (Resend)</li>
            <li><strong>Autorités compétentes :</strong> uniquement en cas d&apos;obligation légale</li>
          </ul>
          <p className="mt-2">
            Aucune donnée n&apos;est vendue à des tiers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Transferts hors UE</h2>
          <p>
            Certains de nos prestataires sont situés hors de l&apos;Union européenne (États-Unis). Dans ce cas, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types, adequacy decisions) conformément au RGPD.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Durée de conservation</h2>
          <ul className="list-inside list-disc space-y-1">
            <li><strong>Données de compte :</strong> conservées tant que le compte est actif, puis supprimées dans les 30 jours suivant la demande</li>
            <li><strong>Données de quiz et résultats :</strong> conservées tant que l&apos;organisation est active</li>
            <li><strong>Données de facturation :</strong> 5 ans (obligation comptable)</li>
            <li><strong>Logs de connexion :</strong> 12 mois</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Vos droits</h2>
          <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Droit d&apos;accès</strong> (art. 15) — obtenir une copie de vos données</li>
            <li><strong>Droit de rectification</strong> (art. 16) — corriger des données inexactes</li>
            <li><strong>Droit à l&apos;effacement</strong> (art. 17) — demander la suppression de vos données</li>
            <li><strong>Droit à la limitation</strong> (art. 18) — limiter le traitement</li>
            <li><strong>Droit à la portabilité</strong> (art. 20) — récupérer vos données dans un format structuré</li>
            <li><strong>Droit d&apos;opposition</strong> (art. 21) — vous opposer au traitement pour motifs légitimes</li>
            <li><strong>Droit de retrait du consentement</strong> — à tout moment, pour les traitements fondés sur le consentement</li>
          </ul>
          <p className="mt-2">
            Pour exercer vos droits, contactez-nous à <a href={CONTACT.emailLink} className="text-primary underline underline-offset-4">{CONTACT.email}</a>. Nous répondrons dans un délai de 30 jours.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Chiffrement des mots de passe (bcrypt)</li>
            <li>Connexions sécurisées (HTTPS/TLS)</li>
            <li>Isolation des données par organisation (multi-tenant)</li>
            <li>Accès restreint selon les rôles</li>
            <li>Monitoring et journaux d&apos;audit</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Cookies</h2>
          <p>Le site utilise les cookies suivants :</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Cookies de session :</strong> authentification et fonctionnement (essentiels, sans consentement)</li>
            <li><strong>Cookies de thème :</strong> préférence clair/sombre (essentiel)</li>
            <li><strong>Analytics :</strong> Vercel Analytics (sans cookies, respectueux de la vie privée)</li>
          </ul>
          <p className="mt-2">
            Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">11. Mineurs</h2>
          <p>
            {SITE_NAME} n&apos;est pas destiné aux personnes de moins de 16 ans. Si nous apprenons que des données de mineurs ont été collectées, nous les supprimerons dans les plus brefs délais.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">12. Modifications</h2>
          <p>
            Cette politique peut être mise à jour à tout moment. La date de dernière mise à jour est indiquée en haut de cette page. En cas de modification substantielle, nous vous en notifierons par email ou via le service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">13. Contact</h2>
          <p>
            Pour toute question relative à la protection de vos données :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Email : <a href={CONTACT.emailLink} className="text-primary underline underline-offset-4">{CONTACT.email}</a></li>
            <li>Téléphone : <a href={CONTACT.phoneLink} className="text-primary underline underline-offset-4">{CONTACT.phone}</a></li>
            <li>Page : <Link href="/contact" className="text-primary underline underline-offset-4">Contact</Link></li>
          </ul>
          <p className="mt-2">
            Vous pouvez également adresser une réclamation à la CNIL :{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
              www.cnil.fr
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
