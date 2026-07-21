# PARTIE — ARCHITECTURE DE MONÉTISATION, FACTURATION ET GESTION DES OFFRES

## CONTEXTE

Tu travailles sur QuizNest.

QuizNest est une plateforme SaaS Multi-Tenant de création, gestion et diffusion de quiz, examens, évaluations et certifications.

Le projet existe déjà.

Avant toute modification :

- analyser entièrement le projet existant
- identifier les fonctionnalités déjà développées
- vérifier la structure Prisma
- vérifier les modèles existants
- vérifier les Server Actions
- vérifier les composants UI
- vérifier les hooks
- vérifier les services
- vérifier les providers
- vérifier les middlewares
- vérifier les variables d'environnement

Ne jamais recréer une fonctionnalité déjà existante.

Réutiliser au maximum l'architecture actuelle.

Améliorer uniquement ce qui est nécessaire.

Toutes les modifications doivent être compatibles avec le reste du projet.

---

# OBJECTIF

Construire un système complet de monétisation dynamique.

Aucune règle commerciale ne doit être codée en dur.

Toute la logique métier doit être pilotée par la base de données.

L'objectif est que le propriétaire de QuizNest puisse modifier toute son offre commerciale sans modifier le code.

---

# COMPARATIF DES LEVIERS DE MONÉTISATION

Le SaaS dispose de 5 leviers de monétisation distincts. Chacun a un rôle précis, un cycle de vie différent et des règles de priorité propres.

## 1. PLAN D'ABONNEMENT (Subscription)

**Quoi ?** Un abonnement mensuel ou annuel qui définit les droits de base de l'organisation.

**Qui le gère ?** Le Super Admin crée/modifie les plans. L'utilisateur choisit et paie via FedaPay.

**Cycle de vie ?** Récurrent (mensuel/annuel). Se renouvelle automatiquement. Expire si non renouvelé.

**Qu'est-ce qu'il détermine ?**
- Le quota de quiz, participants, questions par quiz
- Les fonctionnalités activées ou non (feature gate)
- Les quotas mensuels de générations IA, exports, etc.
- Le prix de base

**Priorité ?** C'est la **base de référence**. Tout part du plan. Si le plan couvre une action, rien d'autre n'est vérifié.

**Exemple ?** Le plan Starter donne 100 générations IA/mois. Tant qu'il en reste, pas de crédits consommés.

---

## 2. CRÉDITS / WALLET (Pay-as-you-go)

**Quoi ?** Un portefeuille de crédits prépayés. 1 crédit ≈ 1 XOF.

**Qui le gère ?** Le Super Admin crée les packs de rechargement. L'utilisateur achète et recharge son wallet.

**Cycle de vie ?** **Permanent** — les crédits n'expirent pas. Solde cumulatif (recharges - consommations).

**Quand est-ce utilisé ?** **Uniquement** quand le plan ne couvre pas l'action. C'est le filet de sécurité payant.

**Qu'est-ce qu'il couvre ?**
- Générations IA (2 crédits/question) — si quota plan épuisé
- Exports PDF/Excel/CSV (1 crédit/export) — si quota plan épuisé
- Certificats (3 crédits/certificat) — si non inclus dans le plan
- Participants supplémentaires, etc.

**Priorité ?** **Dernier recours.** Le système vérifie d'abord : Pass actif → Add-on actif → Plan → Crédits.

**Exemple ?** Le plan Starter donne 10 exports/mois. L'utilisateur fait son 11ème export → 1 crédit débité du wallet.

---

## 3. MODULES / ADD-ONS (Achats ponctuels)

**Quoi ?** Des achats uniques qui s'ajoutent au plan sans le remplacer.

**Qui le gère ?** Le Super Admin crée les produits. L'utilisateur achète via FedaPay.

**Cycle de vie ?** Deux types :
- **Quota** (metered) : ajoute un nombre de ressources (+100 participants, +50 générations IA). Se consomme progressivement. Peut être épuisé.
- **Déverrouillage** (unlock) : active une fonctionnalité pour toujours (EXPORT_UNLOCK, CERTIFICATE_UNLOCK). Pas de consommation, pas d'expiration.

**Quand est-ce utilisé ?** Quand l'utilisateur veut **étendre** son plan sans changer de plan. Par exemple : il est sur Starter mais a besoin de +200 participants ce mois-ci.

**Priorité ?** Vérifié **avant** les crédits. Si un add-on actif couvre l'action, aucun crédit n'est débité.

**Exemple ?** L'utilisateur achète "Export Unlock" pour 5000 XOF. Désormais, tous les exports sont gratuits (pas de credits, pas de quota plan).

---

## 4. PASS (Accès temporaire premium)

**Quoi ?** Un badge temporaire qui débloque des fonctionnalités premium pendant une durée définie.

**Qui le gère ?** Le Super Admin crée les pass. L'utilisateur achète via FedaPay.

**Cycle de vie ?** **Temporaire** — expire après X jours (30, 60, 90...). Non renouvelé automatiquement.

**Qu'est-ce qu'il détermine ?** Il **ajoute des features** au plan pendant sa durée. Par exemple : un "Pass Analytics" débloque ADVANCED_ANALYTICS pendant 30 jours.

**Quand est-ce utilisé ?** Pour des **projets ponctuels** — un audit de 2 semaines, un événement, une formation temporaire.

**Priorité ?** Vérifié **en premier**. Si un pass actif contient la fonctionnalité, l'action est autorisée immédiatement, quel que soit le plan.

**Exemple ?** L'utilisateur est sur Free. Il achète un "Pass Premium 30 jours". Pendant 30 jours, il a accès à toutes les features Premium. Après, il retourne sur Free.

---

## 5. COUPONS (Réductions)

**Quoi ?** Un code promo qui réduit le prix d'un plan ou d'un achat.

**Qui le gère ?** Le Super Admin crée les coupons. L'utilisateur l'applique lors du checkout.

**Cycle de vie ?** **Unique** — utilisé une fois par transaction. Peut avoir une date de validité et un nombre max d'utilisations global.

**Qu'est-ce qu'il couvre ?**
- Réduction en pourcentage (ex: -20%)
- Réduction en montant fixe (ex: -1000 XOF)
- Applicable sur des plans spécifiques ou tous les plans

**Quand est-ce utilisé ?** Lors du **paiement d'un plan** (upgrade/downgrade). L'utilisateur entre le code dans le dialogue de checkout.

**Priorité ?** **Pas de priorité dans le feature gate.** Les coupons agissent uniquement sur le prix, pas sur l'accès aux fonctionnalités.

**Exemple ?** L'utilisateur veut passer au plan Professional (10000 XOF/mois). Il applique le code "WELCOME20" → prix réduit à 8000 XOF.

---

## TABLEAU RÉCAPITULATIF

| Critère | Plan | Crédits/Wallet | Modules/Add-ons | Pass | Coupons |
|---|---|---|---|---|---|
| **Type** | Abonnement récurrent | Prépaiement | Achat unique | Achat temporaire | Réduction ponctuelle |
| **Durée** | Mensuel/Annuel | Permanent | Permanent (unlock) ou consommable (quota) | 30-90 jours | Valide à l'achat |
| **Qui paie** | L'utilisateur | L'utilisateur | L'utilisateur | L'utilisateur | L'utilisateur |
| **Qu'est-ce que ça donne** | Droits de base + quotas | Monnaie d'échange | Ressources ou accès permanent | Accès premium temporaire | Prix réduit |
| **Se consume ?** | Se renouvelle | Oui, par débit | Quota : oui / Unlock : non | Expire après durée | Non |
| **Vérifié en** | 2ème (après Pass) | Dernier | 3ème (après Pass, avant Plan) | 1er | Jamais (prix seul) |
| **Géré par** | Super Admin | Super Admin (packs) | Super Admin (produits) | Super Admin (pass) | Super Admin (coupons) |
| **Exemple** | Starter = 10 quiz, 100 IA/mois | 500 crédits pour 500 XOF | +100 participants ou Export Unlock | Pass Analytics 30 jours | -20% sur Professional |

---

## ORDRE DE VÉRIFICATION DU FEATURE GATE

Quand une action est déclenchée, le système vérifie dans cet ordre :

1. **Pass actif** → Si la feature est dans un pass non expiré → ✅ Autorisé
2. **Add-on actif** → Si un add-on unlock couvre la feature OU un add-on quota a du stock restant → ✅ Autorisé
3. **Plan actif** → Si le plan inclut la feature avec quota restant > 0 → ✅ Autorisé
4. **Crédits wallet** → Si le wallet a assez de crédits → ✅ Autorisé (crédits débités)
5. **Rien ne correspond** → ❌ Refusé avec message + CTA (upgrade, acheter, recharger)

---

# LES PLANS RESTENT LE CŒUR DU SAAS

Le système doit conserver des plans d'abonnement.

Par défaut créer :

Free

Starter

Professional

Enterprise

MAIS

Ces plans ne doivent jamais être codés dans le projet.

Ils doivent être créés en base de données.

Ils doivent pouvoir être modifiés depuis le Super Admin.

Le Super Admin peut :

- créer un plan
- modifier un plan
- supprimer un plan
- désactiver un plan
- changer le nom
- changer la description
- changer le prix
- changer la devise
- changer la fréquence
- changer les quotas
- changer les fonctionnalités
- mettre un plan en promotion
- définir un badge
- choisir une couleur
- choisir une icône
- définir un ordre d'affichage
- définir un essai gratuit
- programmer une date de début
- programmer une date de fin

Toutes ces modifications doivent être immédiatement reflétées dans toute l'application.

---

# LES FONCTIONNALITÉS (FEATURES)

Créer un système Feature Gate.

Chaque fonctionnalité de QuizNest devient une Feature.

Exemples :

AI_GENERATION

AI_IMPORT

QUESTION_BANK

CERTIFICATES

EXPORT_PDF

EXPORT_EXCEL

EXPORT_CSV

ADVANCED_ANALYTICS

CUSTOM_BRANDING

CUSTOM_DOMAIN

WEBHOOKS

API_ACCESS

MULTI_TEAM

LIVE_MONITORING

EMAIL_NOTIFICATIONS

SMS_NOTIFICATIONS

WHITE_LABEL

Toutes les permissions de la plateforme doivent utiliser ce système.

Ne jamais vérifier directement le nom d'un plan.

---

# FEATURE GATE

Créer un service central.

Toutes les interfaces.

Toutes les API.

Toutes les Server Actions.

Toutes les pages.

Toutes les Routes.

Toutes les opérations sensibles.

Doivent utiliser uniquement ce service.

Exemple :

featureGate.can(user, FEATURE)

Ce service vérifie automatiquement :

Plan actif

Achats ponctuels

Pass actifs

Wallet

Promotions

Quota

Expiration

Restrictions

Puis autorise ou refuse l'action.

Toute la logique commerciale doit être centralisée.

---

# PAY AS YOU GO

Les utilisateurs Free doivent pouvoir acheter des fonctionnalités.

Exemples :

+100 participants

+500 participants

+1000 participants

Export Excel

Export CSV

Import Word

Import PDF

Import PowerPoint

Certificat Premium

Pack IA 50 questions

Pack IA 100 questions

Pack IA 500 questions

Chaque module est entièrement configurable.

Le Super Admin peut :

modifier le prix

modifier le nom

modifier la durée

désactiver

activer

modifier la description

changer l'ordre

mettre en promotion

---

# WALLET

Créer un portefeuille.

Le Wallet est indépendant des abonnements.

Le Super Admin crée des packs.

Exemple :

500 FCFA

500 crédits

1000 FCFA

1100 crédits

5000 FCFA

6500 crédits

10000 FCFA

14000 crédits

Les crédits peuvent être utilisés pour :

IA

Imports

Exports

Participants supplémentaires

Certificats

SMS

Fonctionnalités Premium

---

# PASS

Créer un système Pass.

Exemple :

Pass IA

Pass Premium

Pass Export

Pass White Label

Chaque Pass possède :

nom

prix

durée

fonctionnalités

description

promotion

disponibilité

Le Super Admin peut tout modifier.

---

# RESTRICTIONS

Toutes les restrictions doivent être dynamiques.

Exemples :

nombre de quiz

nombre de questions

nombre de participants

stockage

IA

Exports

Branding

Analytics

API

Question Banks

Toutes les restrictions doivent être vérifiées automatiquement.

Lorsqu'une limite est atteinte :

bloquer l'action

afficher une explication

afficher la limite actuelle

afficher le quota restant

proposer :

Upgrade

Achat ponctuel

Wallet

Pass

Le message doit être clair.

Jamais frustrant.

---

# DASHBOARD BILLING

Créer un Dashboard Billing moderne.

Afficher :

plan actuel

historique

wallet

crédits

pass actifs

achats

factures

quota utilisé

quota restant

consommation

prochain renouvellement

graphiques

paiements

promotions

coupons

Tout doit être dynamique.

---

# SUPER ADMIN

Créer un véritable centre de contrôle.

Modules :

Dashboard

Utilisateurs

Organisations

Plans

Features

Restrictions

Wallet

Pass

Paiements

FedaPay

Coupons

Promotions

Landing Page

Emails

Notifications

Audit Logs

IA

Configuration

Le Super Admin doit pouvoir gérer entièrement la plateforme.

Sans modifier le code.

---

# LANDING PAGE

La Landing Page doit devenir entièrement dynamique.

Toutes les informations doivent provenir de la base de données.

Le Super Admin peut modifier :

Hero

Titre

Sous-titre

CTA

Prix

Plans

Fonctionnalités

Comparatif

FAQ

Témoignages

Captures

Statistiques

Promotions

Badges

Ruban "Recommandé"

Section IA

Toutes les cartes de prix doivent utiliser les données de la base.

Aucun prix codé.

Aucune offre codée.

---

# UI

Toute l'interface doit refléter automatiquement les permissions.

Les composants doivent connaître leur état.

Disponible

Premium

Verrouillé

Promotion

Bêta

Bientôt disponible

Inclus

Limité

Afficher des badges.

Afficher les quotas.

Afficher les crédits restants.

Afficher les limitations.

Afficher les recommandations.

Les CTA doivent évoluer automatiquement selon les droits de l'utilisateur.

---

# PAIEMENTS

Créer une architecture Payment Provider.

Support MVP :

FedaPay

Préparer :

Stripe

Kkiapay

Orange Money

MTN MoMo

Moov Money

Wave

Créer une couche d'abstraction.

Le code métier ne dépend jamais directement de FedaPay.

---

# FACTURES

Créer :

Factures PDF

Téléchargement

Historique

Numérotation

Taxes

Devise

Statut

---

# WEBHOOKS

Créer un moteur générique.

Paiement réussi

Paiement échoué

Recharge Wallet

Renouvellement

Expiration

Annulation

---

# COUPONS

Créer un moteur complet.

Pourcentage

Montant fixe

Date début

Date fin

Plans concernés

Fonctionnalités concernées

Nombre maximal d'utilisations

---

# ESSAI GRATUIT

Créer un système d'essai.

Durée configurable.

Le Super Admin choisit :

7 jours

14 jours

30 jours

ou toute autre durée.

---

# ARCHITECTURE

Utiliser :

Services

Repositories

Policies

Feature Gates

Guards

Helpers

DTO

Validation Zod

Prisma

Server Actions

Ne jamais mettre la logique métier dans les composants React.

---

# QUALITÉ

Avant toute implémentation :

analyser le projet

réutiliser l'existant

identifier les composants

identifier les services

identifier Prisma

identifier les routes

Puis seulement implémenter.

Après chaque modification :

corriger TypeScript

corriger ESLint

vérifier Build

optimiser Prisma

supprimer la duplication

améliorer les performances

produire un résumé des fichiers modifiés.

L'objectif est d'obtenir une architecture SaaS professionnelle, maintenable, évolutive et entièrement pilotée par les données administrables depuis le Super Admin.