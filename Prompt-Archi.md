# PARTIE — ARCHITECTURE DE MONÉTISATION, FACTURATION ET GESTION DES OFFRES

## CONTEXTE

Tu travailles sur QuizNest.

QuizNest est une plateforme SaaS Multi-Tenant de création, gestion et diffusion de quiz, examens, évaluations et certifications.

### Stack technique

- **Framework** : Next.js 16 (App Router, Turbopack)
- **ORM** : Prisma 7.8 → génère dans `src/generated/prisma`
- **Base de données** : PostgreSQL (Neon en production)
- **Auth** : better-auth + prismaAdapter (email/password + Google OAuth)
- **UI** : shadcn/ui (base-nova) + Base UI (`@base-ui/react`) + Tailwind v4
- **Validation** : Zod
- **Package manager** : pnpm
- **Paiement** : FedaPay (SDK dans `src/lib/payments/fedapay-provider.ts`)
- **Déploiement** : Vercel (région cdg1)

### Conventions de code

Avant toute modification :

- Analyser entièrement le projet existant
- Identifier les services, composants, Prisma, routes existants
- Vérifier les modèles Prisma, Server Actions, hooks, providers
- Ne jamais recréer une fonctionnalité déjà existante
- Réutiliser au maximum l'architecture actuelle
- Ne jamais mettre de logique métier dans les composants React
- Toute la logique métier va dans `src/lib/services/` ou `src/features/*/actions.ts`
- Validation Zod dans `src/lib/validators/`
- Toutes les permissions passent par le Feature Gate (jamais de vérification directe du nom de plan)

---

# OBJECTIF

Construire un système complet de monétisation dynamique.

Aucune règle commerciale ne doit être codée en dur.

Toute la logique métier doit être pilotée par la base de données.

L'objectif est que le propriétaire de QuizNest puisse modifier toute son offre commerciale sans modifier le code.

---

# ARCHITECTURE DE MONÉTISATION — LES 5 LEVIERS

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

**Plans par défaut** (seed en DB) :
| Plan | Prix | Quiz | Participants | Questions/quiz | IA/mois | Features |
|------|------|------|-------------|----------------|---------|----------|
| Free | 0 XOF | 3 | 50 | 10 | 10 | AI_GENERATION (10), EXPORT_PDF |
| Starter | 5 000 XOF | 20 | 500 | 50 | 100 | AI_GENERATION, AI_IMPORT, QUESTION_BANK, EXPORT_PDF, EXPORT_EXCEL |
| Professional | 15 000 XOF | ∞ | ∞ | ∞ | ∞ | Toutes les features (13) |

Le Super Admin peut tout modifier depuis `/admin/plans`.

---

## 2. CRÉDITS / WALLET (Pay-as-you-go)

**Quoi ?** Un portefeuille de crédits prépayés. 1 crédit ≈ 1 XOF.

**Qui le gère ?** Le Super Admin crée les packs de rechargement. L'utilisateur achète et recharge son wallet.

**Cycle de vie ?** **Permanent** — les crédits n'expirent pas. Solde cumulatif (recharges - consommations).

**Quand est-ce utilisé ?** **Uniquement** quand le plan ne couvre pas l'action. C'est le filet de sécurité payant.

**Credit costs** (configurables via `PlatformSettings` en DB, fallback constants) :
| Action | Coût | Constante |
|--------|------|-----------|
| Génération IA | 2 crédits/question | `AI_GENERATION` |
| Export (PDF/Excel/CSV) | 1 crédit/export | `EXPORT` |
| Certificat | 3 crédits/certificat | `CERTIFICATE` |

**Priorité ?** **Dernier recours.** Le système vérifie d'abord : Pass actif → Add-on actif → Plan → Crédits.

---

## 3. MODULES / ADD-ONS (Achats ponctuels)

**Quoi ?** Des achats uniques qui s'ajoutent au plan sans le remplacer.

**Qui le gère ?** Le Super Admin crée les produits. L'utilisateur achète via FedaPay.

**Cycle de vie ?** Deux types (via `isOneTime`) :
- **Metered** (`isOneTime: false`) : ajoute un quota cumulatif (+100 participants, +50 générations IA). Le champ `remaining` se consomme progressivement. Peut être épuisé.
- **Unlock** (`isOneTime: true`) : déverrouille une fonctionnalité pour toujours (EXPORT_UNLOCK, CERTIFICATE_UNLOCK). Pas de consommation, pas d'expiration.

**Feature→Addon mapping** : Chaque addon peut être lié à une feature du plan via `AddOnProduct.targetFeature` (FeatureKey?). Quand défini, acheter cet addon étend le quota de cette feature.

**Effets disponibles** (`AddOnEffect`) :
| Effet | Type | Usage |
|-------|------|-------|
| EXTRA_PARTICIPANTS | Metered | Étend la limite participants de l'org |
| EXTRA_QUIZZES | Metered | Étend la limite quiz de l'org |
| EXTRA_QUESTIONS | Metered | Étend la limite questions/quiz |
| EXTRA_AI_GENERATIONS | Metered | Étend le quota IA mensuel |
| EXPORT_UNLOCK | Unlock | Déverrouille tous les exports |
| CERTIFICATE_UNLOCK | Unlock | Déverrouille les certificats

**Priorité ?** Vérifié **avant** les crédits. Si un add-on actif couvre l'action, aucun crédit n'est débité.

**Fonctions clés** :
- `getAddOnBonus(orgId, feature)` → somme des `remaining` pour un metered addon lié à une feature
- `getAddOnBonusByEffect(orgId, effect)` → somme des bonus par effet (utilisé par `limits.ts`)
- `hasAddOnUnlock(orgId, feature)` → true si un unlock permanent existe pour cette feature
- `decrementAddonRemaining(orgId, feature, qty)` → décrémente le `remaining` à chaque utilisation

---

## 4. PASS (Accès temporaire premium)

**Quoi ?** Un bundle temporaire de fonctionnalités premium.

**Qui le gère ?** Le Super Admin crée les pass. L'utilisateur achète via FedaPay.

**Cycle de vie ?** **Temporaire** — expire après X jours (`durationDays`). Non renouvelé automatiquement.

**Modèle** :
- `features FeatureKey[]` — liste des features déverrouillées
- `expiresAt = now + durationDays` au moment de l'achat
- `OrganizationPass` lie un pass à une organisation avec `paymentId`

**Fonction clé** : `getActivePassFeatures(orgId)` → union de toutes les features de tous les passes non expirés (`expiresAt > now()`).

**Priorité ?** Vérifié **en premier**. Si un pass actif contient la fonctionnalité, l'action est autorisée immédiatement, quel que soit le plan. Pas de quota sur les passes.

**Exemple** : L'utilisateur est sur Free. Il achète un "Pass Analytics 30 jours" qui inclut `ADVANCED_ANALYTICS`. Pendant 30 jours, il a accès aux analytics avancés. Après, il retourne sur Free.

---

## 5. COUPONS (Réductions)

**Quoi ?** Un code promo qui réduit le prix d'un plan ou d'un achat.

**Qui le gère ?** Le Super Admin crée les coupons. L'utilisateur l'applique lors du checkout.

**Cycle de vie ?** **Unique** — utilisé une fois par transaction. Peut avoir une date de validité et un nombre max d'utilisations global.

**Types** :
- Pourcentage (ex: -20%)
- Montant fixe (ex: -1000 XOF)

**Priorité ?** **Pas de priorité dans le feature gate.** Les coupons agissent uniquement sur le prix, pas sur l'accès aux fonctionnalités.

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

---

## ORDRE DE VÉRIFICATION DU FEATURE GATE

Quand une action est déclenchée, le système vérifie dans cet ordre :

1. **Pass actif** → Si la feature est dans un pass non expiré → ✅ Autorisé (non usage-metered)
2. **Add-on unlock actif** → Si un add-on `isOneTime: true` cible cette feature → ✅ Autorisé (permanent)
3. **Plan actif** → Si le plan inclut la feature (`PlanFeature.enabled: true`) avec quota restant > 0 → ✅ Autorisé
4. **Bonus add-on metered** → La limite du plan est étendue par les `remaining` des add-ons metered
5. **Crédits wallet** → Si le wallet a assez de crédits → ✅ Autorisé (crédits débités)
6. **Rien ne correspond** → ❌ Refusé avec message + CTA (upgrade, acheter, recharger)

---

# FEATURE GATE — IMPLÉMENTATION

## Service central

Toutes les interfaces, API, Server Actions, pages et routes doivent utiliser uniquement :

```typescript
import { canUseFeature } from "@/lib/services/feature-gate";

const result = await canUseFeature(organizationId, featureKey);
// result.allowed → boolean
// result.limit → number | null (quota total)
// result.used → number (consommé ce mois)
// result.remaining → number | null (restant)
// result.source → "plan" | "pass"
// result.message → string (message user-facing en cas de refus)
// result.cta → "upgrade" | "pass" | "wallet" | "none"
```

**Ne jamais vérifier directement le nom d'un plan.** Exemple interdit : `if (plan.slug === "professional")`. Exemple correct : `canUseFeature(orgId, "ADVANCED_ANALYTICS")`.

## Type FeatureCheck

```typescript
type FeatureCheck = {
  allowed: boolean;
  reason?: string;
  limit?: number | null;
  used?: number;
  remaining?: number | null;
  source?: "plan" | "pass";
  message?: string;
  cta?: "upgrade" | "pass" | "wallet" | "none";
};
```

## Les 17 Features

| FeatureKey | Label | Exemples d'usage |
|-----------|-------|-----------------|
| AI_GENERATION | Génération IA | Générer des questions via IA |
| AI_IMPORT | Import IA | Importer des questions depuis un fichier IA |
| QUESTION_BANK | Banque de questions | Banque de questions partagée |
| CERTIFICATES | Certificats | Générer des certificats |
| EXPORT_PDF | Export PDF | Exporter en PDF |
| EXPORT_EXCEL | Export Excel | Exporter en Excel |
| EXPORT_CSV | Export CSV | Exporter en CSV |
| ADVANCED_ANALYTICS | Analyses avancées | Dashboard analytics détaillées |
| CUSTOM_BRANDING | Personnalisation de marque | Logo, couleurs personnalisées |
| CUSTOM_DOMAIN | Domaine personnalisé | URL personnalisée |
| WEBHOOKS | Webhooks | Événements webhook |
| API_ACCESS | Accès API | API REST |
| MULTI_TEAM | Équipes multiples | Gestion multi-équipes |
| LIVE_MONITORING | Suivi en temps réel | Monitoring des participations |
| EMAIL_NOTIFICATIONS | Notifications email | Notifications par email |
| SMS_NOTIFICATIONS | Notifications SMS | Notifications par SMS |
| WHITE_LABEL | White-label | Supprimer la marque QuizNest |

## Résolution interne de canUseFeature

```
1. getActivePassFeatures(orgId) → si feature dans le set → allowed, source="pass"
2. hasAddOnUnlock(orgId, feature) → si true → allowed, source="plan"
3. getOrganizationSubscription() → si pas d'abonnement ou statut CANCELED/PAST_DUE → denied
4. PlanFeature[feature] → si !enabled → denied
5. Si limit == null → allowed (illimité)
6. getAddOnBonus(orgId, feature) → effectiveLimit = plan.limit + bonus
7. getFeatureUsage(orgId, feature) → si used >= effectiveLimit → denied
8. Sinon → allowed avec remaining
```

---

# CONTRAINTES & LIMITES

## Limites org-wide (par organisation)

Ces limites sont définies au niveau du plan et étendues par les add-ons :

| Limite | Champ Plan | Add-on Effect | Vérification |
|--------|-----------|---------------|--------------|
| Nombre de quiz | `plan.quizLimit` | `EXTRA_QUIZZES` | `getEffectiveQuizLimit()` |
| Nombre de participants | `plan.participantLimit` | `EXTRA_PARTICIPANTS` | `getEffectiveParticipantLimit()` |
| Stockage | `plan.storageLimitMb` | — | Vérifié à l'upload |

**Fonctions** (`src/lib/services/limits.ts`) :
```typescript
getEffectiveQuizLimit(orgId, baseLimit)      // baseLimit + bonus EXTRA_QUIZZES
getEffectiveParticipantLimit(orgId, baseLimit) // baseLimit + bonus EXTRA_PARTICIPANTS
getEffectiveQuestionLimit(orgId, baseLimit)   // baseLimit + bonus EXTRA_QUESTIONS
```

`null` = illimité, quel que soit le bonus add-on.

## Limite questions par quiz

**Fonction** : `checkQuestionLimit(orgId, quizId?)` dans `src/features/quiz/actions.ts`

- Si `quizId` fourni → compte les questions de CE quiz
- Si `quizId` absent → compte toutes les questions de l'organisation
- Compare à `getEffectiveQuestionLimit(orgId, plan.questionLimit)`
- Retourne un message d'erreur si limite atteinte, `null` sinon

**Utilisée dans** : `createQuizAction`, les actions d'ajout/import de questions, et la génération IA.

## Messages d'erreur

Quand une limite est atteinte, le système affiche :
- La limite actuelle
- Le quota utilisé / total
- Un CTA clair : "Passez à un plan supérieur", "Achetez des quiz supplémentaires", etc.
- Jamais de messages frustrants

---

# LOGIQUE IA

## Règle fondamentale

**Tous les utilisateurs** (y compris Free) peuvent utiliser l'IA pour générer et importer des questions.

La seule contrainte est le **quota AI_GENERATION** du plan via le feature gate.

## AI Generate (dialog dans un quiz)

- Vérifie `checkQuestionLimit(orgId, quizId)` — la contrainte est le nombre de questions par quiz
- Pas de gate AI_GENERATION sur ce bouton
- Le quota IA n'est débité que si le plan a un `limit` sur AI_GENERATION

## AI Chat (`/dashboard/ai`)

- Vérifie `canUseFeature(orgId, "AI_GENERATION")` — gate complet
- Si refusé et plateforme IA activée → affiche un UpgradeBanner
- Si plateforme IA désactivée → affiche un message explicatif
- Conversations persistantes avec renommage inline
- Templates de prompts prédéfinis (8 modèles)
- Paramètres IA dans un dialog (fournisseur, modèle, base URL)

## Quiz detail "Générer avec l'IA"

C'est un **funnel marketing** : l'utilisateur copie le prompt, utilise n'importe quel AI externe, puis colle la réponse.

- **PAS de gate AI_GENERATION** sur ce bouton
- La seule contrainte est `checkQuestionLimit(orgId, quizId)`
- Le bouton est toujours accessible

---

# CRÉDITS & WALLET

## Principe

1 crédit ≈ 1 XOF. Le wallet est un portefeuille prépayé indépendant des abonnements.

## Credit costs (configurables en DB)

Les coûts en crédits sont lus depuis `PlatformSettings` avec fallback sur les constantes :

| Clé | Défaut | Label | Description |
|-----|--------|-------|-------------|
| `AI_GENERATION` | 2 | Génération IA | Par question générée |
| `EXPORT` | 1 | Export de données | Par export (PDF/Excel/CSV) |
| `CERTIFICATE` | 3 | Certificat | Par certificat généré |

**Fonctions** (`src/lib/services/credit-costs.ts`) :
```typescript
getCreditCost(key: CreditCostKey)    // coût pour une action
getAllCreditCosts()                   // tous les coûts pour affichage UI
```

## Packs de rechargement

Le Super Admin crée des packs (ex: 500 XOF = 500 crédits, 1000 XOF = 1100 crédits).

## Débit

Quand le plan ne couvre pas l'action et qu'aucun pass/addon ne l'autorise :
1. Vérifier le solde du wallet
2. Déduire le coût en crédits
3. Logger la transaction

---

# PLANS

## Seed par défaut

3 plans sont créés à l'initialisation (idempotent upsert) :

### Free (0 XOF)
- 3 quiz, 50 participants, 10 questions/quiz, 100 Mo
- Features : AI_GENERATION (10/mois), EXPORT_PDF

### Starter (5 000 XOF/mois ou/an)
- 20 quiz, 500 participants, 50 questions/quiz, 500 Mo
- Essai gratuit : 14 jours
- Features : AI_GENERATION (100/mois), AI_IMPORT, QUESTION_BANK, EXPORT_PDF, EXPORT_EXCEL

### Professional (15 000 XOF/mois ou/an)
- Quiz ∞, participants ∞, questions ∞, 5000 Mo
- Essai gratuit : 14 jours
- Badge "Recommandé"
- Features : toutes (13 features dont ADVANCED_ANALYTICS, CERTIFICATES, CUSTOM_BRANDING, API_ACCESS, etc.)

## Tout est en DB

Le Super Admin peut modifier depuis `/admin/plans` :
- nom, description, prix, devise, fréquence
- quotas (quiz, participants, questions, stockage)
- features activées/désactivées avec quotas
- badge, couleur, icône, ordre d'affichage
- essai gratuit, dates de promotion

**Aucune modification de code n'est nécessaire** pour changer l'offre commerciale.

---

# ADD-ONS (MODULES)

## Modèle

```prisma
model AddOnProduct {
  name          String
  description   String?
  price         Int
  currency      String     @default("XOF")
  effect        AddOnEffect  // EXTRA_PARTICIPANTS, EXPORT_UNLOCK, etc.
  amount        Int?        // nombre de ressources (metered) ou ignoré (unlock)
  targetFeature FeatureKey? // lien vers une feature du plan (optionnel)
  isOneTime     Boolean     @default(false)  // true = unlock permanent, false = metered
  isActive      Boolean     @default(true)
  isPromoted    Boolean     @default(false)
  displayOrder  Int         @default(0)
}
```

## Deux types

| Type | `isOneTime` | Comportement | Exemples |
|------|------------|--------------|----------|
| **Metered** | `false` | `remaining` se consommé, ajoute au quota | +100 participants, +50 IA |
| **Unlock** | `true` | Déverrouille pour toujours, pas de consommation | EXPORT_UNLOCK, CERTIFICATE_UNLOCK |

## Feature→Addon mapping

Quand `targetFeature` est défini, l'addon étend le quota de cette feature dans le feature gate :
- `getAddOnBonus(orgId, feature)` somme les `remaining` de tous les addons metered ciblant cette feature
- `canUseFeature()` utilise ce bonus pour calculer `effectiveLimit = plan.limit + bonus`

---

# PAIEMENTS

## Architecture

```typescript
// src/lib/payments/fedapay-provider.ts
// Le code métier ne dépend JAMAIS directement de FedaPay
// Couche d'abstraction pour supporter plusieurs providers
```

## MVP : FedaPay

- Transactions, webhooks, callback URLs
- Configuration via variables d'environnement

## Providers prévus

- Stripe
- Kkiapay
- Orange Money / MTN MoMo / Moov Money / Wave

---

# SUPER ADMIN

## Authentification

Deux mécanismes combinés :
1. **Env-based** : `SUPER_ADMIN_EMAIL` dans `.env`
2. **DB-based** : champ `isSuperAdmin` sur le modèle User

`requireSuperAdmin()` vérifie les deux.

## Redirect

Après login, `getDefaultRedirectPath()` redirige vers `/admin` si super admin, sinon vers `/dashboard`.

## Modules admin (`/admin`)

| Module | Description |
|--------|-------------|
| Dashboard | Vue d'ensemble |
| Users | Gestion des utilisateurs |
| Organizations | Gestion des organisations |
| Plans | CRUD plans + features |
| Add-ons | CRUD modules (metered/unlock) |
| Passes | CRUD pass temporaires |
| Coupons | CRUD coupons promo |
| Credit Costs | Configuration des coûts en crédits |
| Payments | Historique des paiements |
| Audit Logs | Journal d'audit |
| AI Settings | Configuration IA globale |

---

# DASHBOARD USER

## Layout

- **Compact** : racine 14px, responsive mobile
- **Grid** : sections structurées avec cartes

## Sections

1. **Header** : salutation + badges (plan, wallet)
2. **Quick Actions** : actions rapides (créer quiz, voir analytics, etc.)
3. **Vue d'ensemble** : 5 stat cards (quiz, participants, IA, exports, score moyen)
4. **Vos quotas** : `QuotaOverview` avec barres de progression (Quiz, Participants, AI Generations, Wallet)
5. **Analytics** : charts d'activité, donut de statut, top quiz, feed d'activité
6. **Organisation** : revenus, membres récents, quiz récents
7. **Upgrade Banner** : si plan Free, affiche une bannière d'upgrade

## QuotaOverview

Composant `src/features/dashboard/components/quota-overview.tsx` :
- Barres de progression pour chaque quota
- Affiche utilisé / total / restant
- Récupère `canUseFeature()` pour les quotas IA
- Style coloré selon le niveau (vert → orange → rouge)

---

# UI & COMPOSANTS

## Stack UI

- **shadcn/ui** (base-nova) : Button, Input, Card, Badge, Dialog, Tabs, etc.
- **Base UI** (`@base-ui/react`) : Select, Dialog (base primitives)
- **Tailwind v4** : styling

## Composants clés

### Select (Base UI)

**IMPORTANT** : Base UI `<Select.Value>` affiche la raw value par défaut (contrairement à Radix UI).

Pour afficher les labels, passer la prop `items` à `<Select.Root>` (= `<Select>`) :

```tsx
// ✅ Correct
<Select value={type} onValueChange={setType} items={TYPE_LABELS}>
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    {Object.entries(TYPE_LABELS).map(([value, label]) => (
      <SelectItem key={value} value={value}>{label}</SelectItem>
    ))}
  </SelectContent>
</Select>

// ❌ Incorrect — affichera "SINGLE_CHOICE" au lieu de "QCM (choix unique)"
<Select value={type} onValueChange={setType}>
  <SelectTrigger><SelectValue /></SelectTrigger>
  ...
</Select>
```

`items` accepte :
- `Record<string, React.ReactNode>` (ex: `{ SINGLE_CHOICE: "QCM", ... }`)
- `ReadonlyArray<{ value: any; label: React.ReactNode }>` (ex: `[{ value: "all", label: "Tous" }, ...options]`)

### Dialog (Base UI)

- `DialogContent` a `max-h-[90dvh] overflow-y-auto` pour le scroll mobile
- `DialogTrigger` nécessite `render={<Button ... />}` pour le polymorphisme
- `showCloseButton` prop (défaut: true)

### Bouton

Le composant Button utilise `@base-ui/react/button` — ne supporte **PAS** `asChild`.

Pour un bouton avec Link :
```tsx
import { Link } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

<Link className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}>
  Label
</Link>
```

### FeatureLockNotice

Composant `src/components/shared/feature-lock.tsx` :
- `FeatureCheckUI` type pour les vérifications côté client
- `FeatureLockNotice` affiche un bloc verrouillé avec CTA contextuel
- Supporte les CTA : upgrade, pass, wallet, none

---

# ARCHITECTURE TECHNIQUE

## Structure des fichiers

```
src/
├── app/
│   ├── (auth)/           # Pages auth (login, register, reset)
│   ├── admin/            # Super admin panels
│   ├── dashboard/        # User dashboard
│   ├── q/[code]/         # Quiz public (participation)
│   └── api/              # API routes
├── components/
│   ├── ui/               # shadcn/ui + Base UI wrappers
│   └── shared/           # Composants partagés
├── constants/            # Constantes (features, roles, credit costs, etc.)
├── features/
│   ├── admin/            # Admin components + actions
│   ├── ai/               # AI chat workspace
│   ├── authentication/   # Login, register forms
│   ├── billing/          # Checkout, payment components
│   ├── dashboard/        # Dashboard components
│   └── quiz/             # Quiz CRUD, questions, participation
├── generated/prisma/     # Prisma generated client
├── lib/
│   ├── auth/             # Auth utilities (require-auth, etc.)
│   ├── db/               # Prisma client, tenant
│   ├── payments/         # Payment provider abstraction
│   ├── services/         # Toute la logique métier
│   ├── validators/       # Zod schemas
│   └── utils/            # Utilitaires
└── prisma/
    └── schema.prisma     # Schema Prisma
```

## Modèles Prisma principaux

| Modèle | Usage |
|--------|-------|
| `User` | Utilisateurs, `isSuperAdmin` |
| `Organization` | Multi-tenant, lien vers owner |
| `OrganizationMember` | Rôles par org (OWNER, ADMIN, MANAGER, EDITOR, VIEWER) |
| `Subscription` | Abonnement org → plan |
| `Plan` | Plans d'abonnement |
| `PlanFeature` | Features par plan (feature, enabled, limit) |
| `Quiz` | Quiz avec settings (passingScore, timeLimit, etc.) |
| `Question` | Questions avec type, difficulté, points |
| `Participant` | Sessions de participation |
| `Wallet` + `WalletTransaction` | Crédits prépayés |
| `AddOnProduct` | Produits add-ons (effect, targetFeature, isOneTime) |
| `OrganizationAddOn` | Achats add-ons par org (remaining) |
| `Pass` | Pass temporaires (features, durationDays) |
| `OrganizationPass` | Achats pass par org (expiresAt) |
| `Payment` | Transactions paiement |
| `Coupon` | Codes promo |
| `PlatformSettings` | Config globale (credit costs, AI settings) |

## Server Actions

Format : `src/features/*/actions.ts`

```typescript
"use server";
// requireAuth() → session
// requireActiveOrganization() → org
// requireOrgRole(orgId, userId, "EDITOR") → vérifie le rôle
// Logique métier → service
// revalidatePath() → cache invalidation
```

## Validation

Zod schemas dans `src/lib/validators/` :
- `quiz.ts`, `question.ts`, `ai-import.ts`
- `plan.ts`, `addon-product.ts`, `pass.ts`
- `coupon.ts`, `wallet.ts`

`applyZodErrors()` convertit les erreurs Zod en erreurs react-hook-form.

---

# CI/CD

## GitHub Actions

`.github/workflows/ci.yml` :
- Lint + typecheck + build
- Vérifie Prisma generate

## Vercel

`vercel.json` :
- Région : cdg1 (Paris)
- Headers de sécurité
- Build : `pnpm build`

## Prisma Migrate en prod

`scripts/vercel-migrate.sh` :
- Exécute `prisma migrate deploy`
- Warmup Neon cold-start (5 retries avec délais croissants)
- Appelé via `postbuild` ou hook Vercel

## Variables d'environnement Vercel

Toutes configurées en production :
- `DATABASE_URL` (Neon)
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `AI_PROVIDER_API_KEY`, `AI_PROVIDER_BASE_URL`, `AI_PROVIDER_MODEL`
- `AI_KEY_ENCRYPTION_SECRET`
- `SUPER_ADMIN_EMAIL`
- `FEDAPAY_*`

---

# RÈGLES QUALITÉ

Avant toute modification :

1. Analyser le projet
2. Réutiliser l'existant
3. Identifier composants, services, Prisma, routes
4. Puis seulement implémenter

Après chaque modification :

1. Corriger TypeScript (`pnpm tsc --noEmit`)
2. Corriger ESLint (`pnpm lint`)
3. Vérifier Build
4. Optimiser Prisma (index, includes)
5. Supprimer la duplication
6. Améliorer les performances
7. Produire un résumé des fichiers modifiés

**Objectif** : architecture SaaS professionnelle, maintenable, évolutive et entièrement pilotée par les données administrables depuis le Super Admin.
