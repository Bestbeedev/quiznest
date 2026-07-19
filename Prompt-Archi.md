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