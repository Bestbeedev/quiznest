import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/constants/seo";
import { SITE_NAME, SITE_URL } from "@/constants/seo";
import { CONTACT } from "@/constants/contact";

export const metadata: Metadata = buildMetadata({
  title: "Conditions Générales d'Utilisation (CGU)",
  description: `Conditions générales d'utilisation du service ${SITE_NAME}. Droits, obligations et responsabilités des utilisateurs.`,
  path: "/cgu",
});

const LAST_UPDATED = "21 juillet 2026";

export default function CguPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="text-sm text-muted-foreground">Dernière mise à jour : {LAST_UPDATED}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Conditions Générales d&apos;Utilisation</h1>
      <p className="mt-3 text-muted-foreground">
        Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;utilisation du service {SITE_NAME} fourni par QuizNest.
      </p>

      <div className="prose prose-neutral dark:prose-invert mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 1 — Objet</h2>
          <p>
            Les présentes CGU ont pour objet de définir les conditions et modalités dans lesquelles {SITE_NAME} met à disposition de ses utilisateurs le service de plateforme d&apos;évaluation en ligne, ainsi que les droits et obligations des parties.
          </p>
          <p className="mt-2">
            Toute inscription ou utilisation du service implique l&apos;acceptation sans réserve des présentes CGU.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 2 — Définitions</h2>
          <ul className="list-inside list-disc space-y-1">
            <li><strong>Service :</strong> l&apos;ensemble des fonctionnalités accessibles via {SITE_URL}, incluant la création, gestion et diffusion de quiz, examens et évaluations.</li>
            <li><strong>Utilisateur :</strong> toute personne physique ou morale qui utilise le Service.</li>
            <li><strong>Compte :</strong> l&apos;espace personnel créé par un Utilisateur pour accéder au Service.</li>
            <li><strong>Organisation :</strong> l&apos;entité (entreprise, école, ONG, etc.) au sein de laquelle un Utilisateur opère.</li>
            <li><strong>Contenu :</strong> l&apos;ensemble des données créées par les Utilisateurs (quiz, questions, résultats, certificats, etc.).</li>
            <li><strong>Plan :</strong> l&apos;abonnement souscrit par une Organisation, définissant les quotas et fonctionnalités accessibles.</li>
            <li><strong>Crédits :</strong> la monnaie d&apos;échange utilisée pour les actions hors-plan (wallet).</li>
            <li><strong>Participant :</strong> une personne qui répond à un quiz via un lien public, sans necessiter de compte.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 3 — Inscription et compte</h2>
          <p>
            L&apos;utilisation du Service nécessite la création d&apos;un compte. L&apos;Utilisateur s&apos;engage à :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Fournir des informations exactes et complètes lors de l&apos;inscription</li>
            <li>Maintenir la confidentialité de ses identifiants de connexion</li>
            <li>Ne pas partager son compte avec des tiers</li>
            <li>Notifier immédiatement {SITE_NAME} de toute utilisation non autorisée de son compte</li>
          </ul>
          <p className="mt-2">
            {SITE_NAME} se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 4 — Description du Service</h2>
          <p>{SITE_NAME} propose :</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Création de quiz interactifs (QCM, vrai/faux, réponse courte, etc.)</li>
            <li>Génération de questions par intelligence artificielle</li>
            <li>Diffusion de quiz via liens publics, QR codes ou codes d&apos;accès</li>
            <li>Analyse des résultats et statistiques</li>
            <li>Génération de certificats</li>
            <li>Export de données (PDF, Excel, CSV)</li>
            <li>Gestion multi-tenant avec rôles et permissions</li>
            <li>Système de facturation (abonnements, crédits, modules, pass)</li>
          </ul>
          <p className="mt-2">
            Les fonctionnalités disponibles varient selon le plan souscrit.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 5 — Plans, tarifs et paiement</h2>
          <p>
            {SITE_NAME} propose différents plans d&apos;abonnement (Free, Starter, Professional, Enterprise) avec des quotas et fonctionnalités variables.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Les prix sont exprimés en XOF (ou la devise affichée) et sont susceptibles d&apos;évolution</li>
            <li>Le paiement s&apos;effectue via FedaPay (ou tout autre prestataire proposé)</li>
            <li>Les abonnements se renouvellent automatiquement sauf annulation</li>
            <li>Les crédits (wallet) sont prépayés et n&apos;expirent pas</li>
            <li>Les modules complémentaires sont des achats uniques</li>
            <li>Les pass temporaires expirent automatiquement après leur durée</li>
            <li>Les codes promo sont applicables lors du checkout</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 6 — Obligations de l&apos;Utilisateur</h2>
          <p>L&apos;Utilisateur s&apos;engage à :</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Utiliser le Service conformément à sa destination et aux présentes CGU</li>
            <li>Ne pas utiliser le Service à des fins illicites, frauduleuses ou nuisibles</li>
            <li>Ne pas tenter de contourner les limites techniques ou les quotas du Service</li>
            <li>Ne pas reproduire, copier ou revendre le Service ou tout ou partie de ses fonctionnalités</li>
            <li>Respecter les droits de propriété intellectuelle de {SITE_NAME} et des tiers</li>
            <li>Ne pas publier de contenus contraires à la loi, diffamatoires, haineux ou portant atteinte à la vie privée</li>
            <li>Obtenir les consentements nécessaires auprès des Participants conformément au RGPD</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 7 — Propriété intellectuelle</h2>
          <p>
            Le Service et ses composants (code, design, logos, bases de données) sont la propriété exclusive de {SITE_NAME} et sont protégés par les lois relatives à la propriété intellectuelle.
          </p>
          <p className="mt-2">
            <strong>Le Contenu créé par les Utilisateurs reste leur propriété.</strong> {SITE_NAME} n&apos;acquiert aucun droit sur les quiz, questions, résultats ou certificats créés par les Utilisateurs.
          </p>
          <p className="mt-2">
            {SITE_NAME} dispose d&apos;une licence non exclusive pour stocker, traiter et afficher le Contenu dans le cadre strict de la fourniture du Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 8 — Données personnelles</h2>
          <p>
            Le traitement des données personnelles est régi par notre{" "}
            <Link href="/confidentialite" className="text-primary underline underline-offset-4">
              politique de confidentialité
            </Link>.
          </p>
          <p className="mt-2">
            Chaque Organisation est responsable du traitement des données de ses Participants. {SITE_NAME} agit en tant que sous-traitant technique.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 9 — Disponibilité et maintenance</h2>
          <p>
            {SITE_NAME} s&apos;efforce d&apos;assurer une disponibilité maximale du Service. Toutefois, des interruptions peuvent survenir pour maintenance, mises à jour ou causes indépendantes de notre volonté.
          </p>
          <p className="mt-2">
            {SITE_NAME} ne saurait être tenu responsable des pertes de données, pertes de chiffre d&apos;affaires ou tout autre dommage résultant d&apos;une interruption du Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 10 — Limitation de responsabilité</h2>
          <p>
            Le Service est fourni &quot;en l&apos;état&quot;. {SITE_NAME} ne garantit pas l&apos;absence d&apos;erreurs ou d&apos;interruptions.
          </p>
          <p className="mt-2">
            En aucun cas {SITE_NAME} ne pourra être tenu responsable de :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>La perte de données due à une mauvaise utilisation</li>
            <li>Les dommages indirects, perte de revenus, ou pertes de données</li>
            <li>Les contenus créés par les Utilisateurs</li>
            <li>Les litiges entre Utilisateurs ou entre un Utilisateur et un Participant</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 11 — Résiliation</h2>
          <p>
            L&apos;Utilisateur peut résilier son compte à tout moment depuis les paramètres de son organisation ou en contactant le support.
          </p>
          <p className="mt-2">
            {SITE_NAME} se réserve le droit de suspendre ou résilier un compte en cas de :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Violation des présentes CGU</li>
            <li>Non-paiement des sommes dues</li>
            <li>Utilisation frauduleuse ou abusive du Service</li>
            <li>Inactivité prolongée (avec notification préalable)</li>
          </ul>
          <p className="mt-2">
            La résiliation entraîne la suppression des données selon les délais décrits dans la politique de confidentialité.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 12 — Modification des CGU</h2>
          <p>
            {SITE_NAME} se réserve le droit de modifier les présentes CGU à tout moment. Les Utilisateurs seront notifiés des modifications substantielles par email ou via le Service.
          </p>
          <p className="mt-2">
            L&apos;utilisation continue du Service après modification vaut acceptation des nouvelles CGU.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 13 — Droit applicable et juridiction</h2>
          <p>
            Les présentes CGU sont régies par le droit applicable dans la juridiction du siège social de {SITE_NAME}.
          </p>
          <p className="mt-2">
            En cas de litige, les parties s&apos;engagent à rechercher une solution amiable avant toute action judiciaire. À défaut, les tribunaux compétents seront ceux du ressort du siège social de {SITE_NAME}.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Article 14 — Contact</h2>
          <p>
            Pour toute question relative aux présentes CGU :
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Email : <a href={CONTACT.emailLink} className="text-primary underline underline-offset-4">{CONTACT.email}</a></li>
            <li>Téléphone : <a href={CONTACT.phoneLink} className="text-primary underline underline-offset-4">{CONTACT.phone}</a></li>
            <li>Page : <Link href="/contact" className="text-primary underline underline-offset-4">Contact</Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
