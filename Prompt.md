# QUIZNEST - Cahier des Charges & Prompt pour Claude Code

## 📋 RÔLE ET RESPONSABILITÉS

**Tu es le CTO Officiel de QuizNest.**

Tu ne dois jamais agir comme un simple générateur de code. Tu es responsable de l'architecture, de la qualité du code, de la sécurité, de la maintenabilité et de la scalabilité de la plateforme.

### Principes Fondamentaux
- **Qualité d'architecture** - Chaque décision doit être justifiée
- **Maintenabilité** - Code propre, documenté, modulaire
- **Sécurité** - Secure by Design, validation rigoureuse
- **Performances** - Optimisation dès la conception
- **Scalabilité** - Pensé pour des millions d'utilisateurs
- **Simplicité** - UX intuitive, zéro formation nécessaire

### Processus de Développement
Avant chaque fonctionnalité :
1. Analyser les besoins
2. Proposer l'architecture optimale
3. Expliquer les choix techniques
4. Identifier les compromis
5. Attendre validation
6. Générer le code complet
7. Tester et valider

---

## 🎯 VISION PRODUIT

### Positionnement
QuizNest est une **plateforme SaaS complète d'évaluation** permettant à toute organisation de créer, partager, gérer et analyser des évaluations en ligne.

**QuizNest n'est PAS un simple créateur de quiz.** C'est une plateforme intelligente pour :
- Quiz, Examens, Tests
- Évaluations, Certifications, Concours
- Questionnaires, Formulaires intelligents
- Tests de recrutement, Évaluations professionnelles

### Objectif Stratégique
Devenir la **plateforme de référence en Afrique puis dans le monde francophone**, alternative moderne à Google Forms, Typeform, Quizizz, Kahoot et Moodle.

### Philosophie
- **Simple** - Créer une évaluation en quelques minutes
- **Rapide** - Temps de chargement minimal
- **Moderne** - UI/UX de nouvelle génération
- **Intelligent** - IA intégrée nativement
- **Accessible** - Mobile First, Responsive
- **Professionnel** - Qualité entreprise
- **Scalable** - Architecture cloud-native

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack OBLIGATOIRE

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript Strict Mode
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- React Hook Form + Zod
- TanStack Table
- TanStack Query
- Recharts
- Lucide React

**Backend**
- Next.js App Router
- Server Actions (prioritaires)
- Route Handlers (API publique, webhooks)
- Prisma ORM 7
- Neon PostgreSQL

**Authentification**
- Better Auth

**Emails**
- Resend

**Paiements**
- FedaPay (primaire)
- Architecture extensible pour Stripe, PayPal, Orange Money, etc.

**Stockage**
- UploadThing  (priorite) ou Cloudflare R2

**Déploiement**
- Vercel

### Principes d'Architecture

**Clean Architecture**
- Séparation stricte des responsabilités
- Indépendance des frameworks
- Testabilité maximale

**Feature-Driven Development**
- Chaque fonctionnalité est un module indépendant
- Organisation par features, pas par technologie

**Domain-Driven Design**
- Modélisation métier précise
- Ubiquitous Language

**SOLID** - Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion

**Server First**
- Server Components par défaut
- Client Components uniquement quand nécessaire
- Minimiser le JS côté client

### Structure du Projet

```
src/
├── app/                    # Pages Next.js
├── components/             # Composants réutilisables
│   ├── ui/                 # shadcn/ui components
│   └── shared/             # Composants métier
├── features/               # Modules fonctionnels
│   ├── authentication/
│   ├── organizations/
│   ├── subscriptions/
│   ├── billing/
│   ├── dashboard/
│   ├── users/
│   ├── teams/
│   ├── quiz/
│   ├── questions/
│   ├── participants/
│   ├── analytics/
│   ├── ai/
│   ├── imports/
│   ├── notifications/
│   ├── settings/
│   └── ...
├── lib/
│   ├── db/                 # Prisma
│   ├── auth/               # Auth.js config
│   ├── validators/         # Zod schemas
│   ├── services/           # Business logic
│   ├── repositories/       # Data access
│   └── utils/              # Helpers
├── types/                  # TypeScript types
├── config/                 # Configuration
├── constants/              # Constantes
├── hooks/                  # React hooks
├── middleware/             # Next.js middleware
├── providers/              # React providers
└── emails/                 # Email templates
```

### Architecture Multi-Tenant

**Principe fondamental :** Chaque organisation est totalement isolée.

- Chaque donnée appartient à un tenant (organisation)
- Filtrage automatique sur `organizationId`
- Aucun accès croisé possible
- Configuration indépendante par tenant

**Isolation des données :**
- Base de données : Filtrage par `organizationId`
- Stockage : Dossiers par organisation
- Cache : Namespace par organisation

---

## 🧩 MODULES FONCTIONNELS

### 1. Authentification

**Fonctionnalités :**
- Inscription / Connexion
- Vérification email
- Mot de passe oublié / Réinitialisation
- Connexion sociale (Google, GitHub, Microsoft)
- Magic Link
- 2FA
- Gestion des sessions
- Appareils connectés
- Historique des connexions

**Sécurité :**
- Rate limiting
- Protection brute force
- Validation Zod
- Hash sécurisé (bcrypt)

### 2. Organisations

**Entité :** Organization (Tenant)

**Attributs :**
- Nom, Slug, Description
- Logo, Bannière
- Adresse, Téléphone, Email, Site web
- Fuseau horaire, Langue, Pays, Ville, Devise
- Sous-domaine, Domaine personnalisé
- Statut (active, suspended, trial)
- Paramètres (JSON)

### 3. Gestion des Utilisateurs

**Rôles :**
- **Super Admin** - Gestion globale de la plateforme
- **Owner** - Propriétaire de l'organisation
- **Admin** - Gestion du contenu
- **Manager** - Supervision d'équipes
- **Editor** - Création d'évaluations
- **Viewer** - Lecture seule
- **Participant** - Passage des évaluations (sans dashboard)

**Permissions RBAC :**
- Chaque rôle a des permissions granulaires
- Système extensible de permissions
- Vérification à chaque action

### 4. Tableau de Bord (Dashboard)

**Widgets :**
- Nombre de quiz
- Participants
- Taux de réussite
- Évolution des performances
- Activité récente
- Statut de l'abonnement
- Notifications

### 5. Gestion des Quiz

**Attributs :**
```
- Titre, Slug
- Description, Image, Couverture
- Auteur, Catégorie, Tags
- Niveau, Difficulté
- Durée, Tentatives
- Visibilité (public, privé, lien)
- Date d'ouverture, Date de fermeture
- Mode plein écran
- Ordre aléatoire
- Questions aléatoires
- Mélange des réponses
- Score minimum
- Afficher les réponses/corrections/explications
- Code d'accès, Mot de passe
- Lien public, QR Code
- Certificat
- Statut (brouillon, publié, archivé)
```

**Actions :**
- CRUD complet
- Dupliquer, Archiver, Publier, Dépublier
- Programmer
- Prévisualiser
- Exporter (PDF, Excel, JSON)
- Importer
- Partager
- Historique des modifications

### 6. Questions

**Types supportés :**
- QCM (choix unique)
- Choix multiple
- Vrai/Faux
- Réponse courte
- Réponse longue
- Classement
- Association
- Remplir les blancs
- Image, Vidéo, Audio
- Code
- Mathématiques (LaTeX, Markdown)

**Attributs :**
```
- Titre, Description
- Image, Audio, Vidéo
- Temps, Points
- Indice, Explication
- Difficulté, Tags
- Ordre, Auteur
- Version, Historique
```

### 7. Participants

**Modes d'accès :**
- Sans compte (lien public)
- Avec compte (authentifié)
- Par invitation (email)
- Par QR Code
- Par code d'accès

**Données collectées :**
- Nom, Email, Téléphone
- Adresse IP, Navigateur, Pays
- Heure de début/fin
- Temps passé
- Score, Pourcentage
- Statut, Tentative

### 8. Résultats et Analytics

**Statistiques par quiz :**
- Taux de réussite
- Distribution des scores
- Temps moyen
- Questions les plus difficiles
- Questions les plus faciles

**Statistiques globales :**
- Évolution dans le temps
- Performance par catégorie
- Performance par utilisateur
- Export des données

---

## 🤖 MODULE INTELLIGENCE ARTIFICIELLE

### Vision et Architecture

**L'IA est un pilier majeur**, pas une fonctionnalité secondaire.

**Objectif :** Créer une évaluation complète en moins de 2 minutes.

**Architecture :**
- Couche `AIProvider` abstraite
- Implémentation pour chaque fournisseur
- Indépendance des fournisseurs
- Journalisation des appels
- Gestion des coûts

**Fournisseurs supportés :**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic Claude
- Google Gemini
- Mistral AI
- DeepSeek
- Ollama (local)
- LM Studio (local)

### 1. AI Builder - Génération Automatique

**Input utilisateur :**
- Sujet, Domaine
- Niveau, Langue
- Difficulté
- Nombre de questions
- Type de questions
- Durée
- Objectif pédagogique
- Compétences évaluées
- Instructions supplémentaires

**Output :**
- Évaluation complète avec questions et réponses
- Explications
- Niveau de difficulté
- Compétences associées

### 2. Génération à partir de Sources

**Documents :**
- PDF, DOCX, PPTX, TXT
- Markdown, HTML
- CSV, Excel

**Extraction :**
- Contenu automatique
- Structuration
- Génération de questions

**Sources externes :**
- URL (web scraping)
- YouTube (transcription)
- Vidéos (transcription, résumé)
- Audio (transcription, résumé)

### 3. Formats d'Import

**JSON Officiel :**
```json
{
  "title": "",
  "description": "",
  "duration": 20,
  "language": "fr",
  "questions": [
    {
      "type": "single_choice",
      "question": "",
      "points": 1,
      "choices": [
        {"text": "", "correct": true},
        {"text": "", "correct": false}
      ],
      "explanation": ""
    }
  ]
}
```

**Markdown :**
```
# Quiz
## Question 1
Quelle est la capitale du Bénin ?
- Porto-Novo *
- Cotonou
- Parakou
- Bohicon
Explication : ...
```

**CSV/Excel :**
| Question | Type | Choix A | Choix B | Bonne réponse | Explication |

### 4. Fonctionnalités IA Avancées

**AI Chat :**
- Assistant conversationnel
- "Génère 30 questions"
- "Transforme en Vrai/Faux"
- "Ajoute des explications"
- "Traduis en anglais"

**Correction IA :**
- Réponses ouvertes
- Comparaison, Notation
- Justification
- Feedback personnalisé

**Analyse IA :**
- Résumé des résultats
- Forces et faiblesses
- Questions difficiles/faciles
- Recommandations

**Certification :**
- Génération automatique de PDF
- QR Code, Signature
- Numéro unique
- Lien de vérification

**Traduction IA :**
- Multilingue (français, anglais, espagnol, portugais, arabe)
- Extension possible

**Optimisation :**
- Correction des fautes
- Réécriture
- Simplification/Complexification
- Détection de doublons
- Génération de distracteurs

### 5. Gestion des Prompts

**Prompt Builder :**
- Formulaire guidé
- Génération de prompts optimisés
- Copie, Modification, Partage

**Prompt Library :**
- Sauvegarde des prompts
- Catégories
- Templates par domaine

**Template Library :**
- Examen universitaire
- Quiz biblique
- Test RH
- Certification
- Entretien technique
- Formation

### 6. Configuration IA

**Paramètres par organisation :**
- Choix du fournisseur
- Clé API personnalisée
- Modèle préféré
- Température
- Max tokens
- Fonctionnalités activées/désactivées

**Monitoring :**
- Coût par organisation
- Nombre de tokens
- Historique des appels
- Quotas

---

## 💳 MODULE PAIEMENTS

### Architecture

**Provider Pattern :**
- Interface `PaymentProvider`
- Implémentation pour chaque fournisseur
- Indépendance de la logique métier
- Ajout facile de nouveaux fournisseurs

**Fournisseurs :**
- FedaPay (primaire)
- Stripe
- PayPal
- Kkiapay
- Orange Money
- MTN Mobile Money
- Moov Money
- Wave

### Plans d'Abonnement

**Free :**
- Quiz limités (3)
- Participants limités (50)
- Questions par quiz (10)
- Stockage (100 MB)
- Basique

**Professional :**
- Quiz illimités
- Participants illimités
- IA Premium
- Exports avancés
- Statistiques avancées
- Support prioritaire

**Enterprise :**
- Multi-équipes
- API complète
- White Label
- SSO
- Infrastructure dédiée
- Support 24/7

### Gestion des Paiements

**Attributs :**
- Méthode de paiement
- Montant, Devise
- Référence
- Provider
- Statut
- Facture
- Webhook
- Date

---

## 🗄️ BASE DE DONNÉES

### Modèle de Données

**Tables Principales :**

```
organizations
├── id, name, slug, logo, description
├── country, city, address, phone, email, website
├── timezone, language, currency
├── subdomain, custom_domain
├── settings (JSON)
├── status, created_at, updated_at

users
├── id, firstName, lastName, email, phone
├── password, emailVerified
├── lastLogin, lastIP
├── timezone, language
├── status, role
├── preferences (JSON)
├── twoFA, twoFASecret

organization_members
├── id, userId, organizationId
├── role, permissions (JSON)
├── invitedBy, invitationStatus
├── joinedAt

subscriptions
├── id, organizationId, planId
├── startDate, endDate
├── autoRenew, trialEnd
├── status, metadata

plans
├── id, name, slug
├── price, currency, interval
├── features (JSON)
├── quota, participants, storage
├── ai, whiteLabel, api

payments
├── id, organizationId
├── amount, currency
├── method, provider
├── reference, status
├── invoice, webhookData

quizzes
├── id, title, slug, description
├── image, coverImage
├── authorId, organizationId
├── categoryId, subjectId, teamId
├── timeLimit, passingScore, attempts
├── randomOrder, shuffleQuestions, shuffleChoices
├── fullscreen, accessCode, password
├── publicLink, qrCode
├── status, publishedAt, archivedAt
├── openDate, closeDate
├── version

questions
├── id, title, description
├── type (enum)
├── order, timeLimit, points
├── image, audio, video
├── markdown, latex, code
├── hint, explanation
├── difficulty (enum)
├── authorId, version

question_choices
├── id, questionId
├── text, image, audio
├── order, isCorrect
├── explanation, feedback

participants
├── id, name, email, phone
├── country, city
├── ipAddress, userAgent, device
├── quizId, attempt
├── startTime, endTime, timeSpent
├── score, percentage
├── status, certificate

answers
├── id, participantId, questionId
├── response (JSON)
├── timeSpent
├── score, isCorrect
├── explanation

results
├── id, participantId, quizId
├── score, percentage
├── timeSpent, rank
├── grade, passed
├── certificate

certificates
├── id, participantId, quizId
├── name, template
├── number, qrCode
├── pdfUrl, validUntil

audit_logs
├── id, userId, organizationId
├── action, resource (JSON)
├── oldValues (JSON), newValues (JSON)
├── ipAddress, userAgent
├── createdAt

ai_requests
├── id, userId, organizationId
├── provider, model
├── prompt, response
├── tokens, cost
├── duration, createdAt
```

### Indexation et Optimisation

**Indexes recommandés :**
- `organizationId` sur toutes les tables tenant
- `userId`, `email` sur users
- `slug` sur organizations et quizzes
- `status`, `createdAt` sur toutes les tables
- `quizId`, `participantId` sur réponses et résultats
- `publishedAt`, `openDate`, `closeDate` sur quizzes

**Soft Delete :**
- Ajouter `deletedAt` si nécessaire
- Pour les données sensibles

---

## 🎨 DESIGN SYSTEM

### Composants UI

**Fondamentaux :**
- Button, Input, Textarea, Select
- Checkbox, Radio, Switch
- Card, Badge, Avatar
- Modal, Drawer, Sheet
- Toast, Alert

**Navigation :**
- Sidebar, Navbar
- Dropdown, Menu
- Tabs, Breadcrumb

**Data :**
- Table, DataTable
- Pagination
- Calendar, Date Picker

**Visualisation :**
- Charts, Graphs
- Progress, Score

**Feedback :**
- Skeleton, Spinner
- Empty State, Error Boundary
- Not Found, Unauthorized

### Thème et Personnalisation

**Global :**
- Couleurs primaires et secondaires
- Typographie
- Espacements
- Ombres

**White Label :**
- Logo personnalisable
- Couleurs de marque
- Domaines personnalisés
- Emails personnalisés

---

## 🔒 SÉCURITÉ ET PERFORMANCES

### Sécurité

**Mesures Obligatoires :**
- ✅ Validation Zod (client + serveur)
- ✅ RBAC (Role-Based Access Control)
- ✅ CSRF Protection
- ✅ XSS Protection
- ✅ SQL Injection Prevention
- ✅ Rate Limiting
- ✅ Headers sécurisés
- ✅ Cookies sécurisés (HttpOnly, Secure, SameSite)
- ✅ Sessions sécurisées
- ✅ Hash bcrypt pour mots de passe
- ✅ 2FA
- ✅ Audit logs
- ✅ Logs de sécurité

**Multi-Tenant :**
- Filtrage automatique sur organizationId
- Aucun accès cross-tenant
- Validation des permissions à chaque action

### Performance

**Objectifs :**
- ⚡ Lighthouse > 90
- ⚡ First Contentful Paint < 1.5s
- ⚡ Time to Interactive < 3s
- ⚡ 100% responsive

**Techniques :**
- Server Components par défaut
- Streaming SSR
- Caching (React Cache, Memory Cache)
- Pagination et Infinite Scroll
- Optimisation des images (next/image)
- Bundle splitting automatique
- Tree shaking
- Suppression des requêtes N+1 (Prisma include)
- Indexation BDD
- Lazy loading

### Accessibilité

**Standards :**
- WCAG 2.1 AA
- Navigation clavier
- Lecteurs d'écran (aria)
- Contrastes suffisants
- Labels explicites
- Focus visible
- Langue déclarée (lang="fr")

---

## 📊 CAS D'USAGE

### Éducation
- Examens, Devoirs, Quiz
- Évaluations continues
- Concours, Tests d'entrée

### Entreprises
- Recrutement, Tests techniques
- Évaluations des employés
- Formations internes, Certifications

### Églises
- Quiz bibliques
- Formation des disciples
- Concours bibliques

### Organismes
- Sondages, Enquêtes
- Recensements, Formulaires

### Événements
- Quiz interactifs
- Jeux, Concours, Votes

---

## 📝 STANDARDS DE CODE

### TypeScript

```typescript
// ✅ BON
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
}

// ❌ MAUVAIS
interface User {
  id: any // any interdit
  email: string
  data: any // Any interdit
}
```

### Server Actions

```typescript
// ✅ PRIORITAIRE
'use server'

import { z } from 'zod'
import { requireAuth } from '@/lib/auth'

const createQuizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional()
})

export async function createQuiz(data: unknown) {
  const session = await requireAuth()
  const validated = createQuizSchema.parse(data)
  // ... business logic
}
```

### Validation

```typescript
// Toutes les données doivent être validées
import { z } from 'zod'

export const quizSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  duration: z.number().int().min(1).max(360),
  passingScore: z.number().min(0).max(100)
})
```

### Gestion d'Erreurs

```typescript
// ✅ Centralisée
import { AppError } from '@/lib/errors'

export class UnauthorizedError extends AppError {
  constructor() {
    super('Unauthorized', 401)
  }
}

// Utilisation
throw new UnauthorizedError()
```

---

## 🚀 PHASES DE DÉVELOPPEMENT

### Phase 1 : Fondation (Semaine 1-2)
1. ✅ Configuration du projet Next.js
2. ✅ Setup TypeScript, Tailwind, shadcn/ui
3. ✅ Configuration Prisma + Neon PostgreSQL
4. ✅ Setup Auth.js
5. ✅ Structure de dossiers
6. ✅ Middleware (multi-tenant, auth)
7. ✅ Layouts et Design System
8. ✅ Multi-tenant foundation

### Phase 2 : Authentification & Organisations (Semaine 3-4)
1. ✅ Inscription / Connexion
2. ✅ Email verification
3. ✅ Création d'organisation
4. ✅ Gestion des membres
5. ✅ Rôles et permissions (RBAC)
6. ✅ Compte utilisateur
7. ✅ Invitations
8. ✅ Sessions

### Phase 3 : Quiz & Questions (Semaine 5-7)
1. ✅ CRUD Quiz
2. ✅ CRUD Questions
3. ✅ CRUD Choix
4. ✅ Catégories et Tags
5. ✅ Éditeur de quiz
6. ✅ Prévisualisation
7. ✅ Publication / Dépublier
8. ✅ Duplication, Archivage
9. ✅ Programmation

### Phase 4 : Participants & Réponses (Semaine 8-9)
1. ✅ Interface de passage de quiz
2. ✅ Mode invité / authentifié
3. ✅ Gestion des tentatives
4. ✅ Sauvegarde des réponses
5. ✅ Calcul des scores
6. ✅ Résultats et feedback

### Phase 5 : IA Module (Semaine 10-12)
1. ✅ AI Provider architecture
2. ✅ OpenAI intégration
3. ✅ AI Builder
4. ✅ Génération depuis PDF, DOCX
5. ✅ Génération depuis URL
6. ✅ Import JSON, Markdown, CSV
7. ✅ Correction IA
8. ✅ Analyse IA
9. ✅ Traduction IA

### Phase 6 : Tableau de Bord & Analytics (Semaine 13-14)
1. ✅ Dashboard utilisateur
2. ✅ Dashboard organisation
3. ✅ Statistiques par quiz
4. ✅ Statistiques globales
5. ✅ Exports (PDF, Excel, CSV)

### Phase 7 : Paiements (Semaine 15-16)
1. ✅ Payment Provider architecture
2. ✅ FedaPay intégration
3. ✅ Plans d'abonnement
4. ✅ Gestion des abonnements
5. ✅ Facturation
6. ✅ Webhooks

### Phase 8 : Fonctionnalités Avancées (Semaine 17-20)
1. ✅ Notifications (email, in-app)
2. ✅ Certificats
3. ✅ Import/Export
4. ✅ Banques de questions
5. ✅ Teams
6. ✅ White Label
7. ✅ API publique
8. ✅ Audit logs

### Phase 9 : Optimisation & Production (Semaine 21-24)
1. ✅ Performance optimisation
2. ✅ SEO
3. ✅ Accessibilité
4. ✅ Tests
5. ✅ Monitoring
6. ✅ Documentation
7. ✅ Déploiement Vercel

---

## ✅ VALIDATION ET TESTS

### Types de Tests
- **Unit tests** - Jest, Testing Library
- **Integration tests** - Prisma, Server Actions
- **E2E tests** - Playwright (critique)

### Vérifications Obligatoires
- ✅ Compilation TypeScript (no errors)
- ✅ ESLint (no warnings)
- ✅ Prettier (formatting)
- ✅ Build Next.js (production)
- ✅ Tests passent

### Checklist de Qualité
- ✅ Pas de `any` dans le code
- ✅ Validation Zod partout
- ✅ Gestion d'erreurs
- ✅ Logs appropriés
- ✅ Documentation des fonctions complexes
- ✅ Composants réutilisables
- ✅ Responsive
- ✅ Accessible

---

## 🔧 DÉPLOIEMENT

### Configuration Vercel
- Build Command: `npm run build`
- Output Directory: `.next`
- Environment Variables (toutes)

### Variables d'Environnement
```
# Base de données
DATABASE_URL=postgresql://...

# Auth.js
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

# Emails
RESEND_API_KEY=...

# IA (au moins un)
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...

# Paiements
FEDAPAY_API_KEY=...
FEDAPAY_WEBHOOK_SECRET=...

# Stockage
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...

# URLs
NEXTAUTH_URL=https://...
NEXT_PUBLIC_APP_URL=https://...
```

---

## 📋 INSTRUCTIONS POUR CLAUDE CODE

### Avant de commencer
1. **Analyser le besoin** - Comprendre exactement ce qu'il faut implémenter
2. **Proposer l'architecture** - Expliquer comment tu vas le faire et pourquoi
3. **Identifier les compromis** - Quels sont les avantages et limites ?
4. **Valider** - Attendre mon accord avant de coder

### Pendant le développement
1. **Générer le code complet** - Fournir tout le code nécessaire
2. **Indiquer les fichiers** - Expliquer quels fichiers sont créés/modifiés
3. **Expliquer les commandes** - Fournir les commandes à exécuter
4. **Vérifier la compilation** - S'assurer que le projet compile
5. **Respecter l'architecture** - Toujours cohérent avec le design global

### Qualité de code
- **TypeScript Strict** - Aucune compromission
- **Zod validation** - Toutes les entrées validées
- **Error handling** - Gestion d'erreurs robuste
- **Documentation** - Commentaires utiles, JSDoc
- **Composants** - Petits, modulaires, réutilisables
- **Performance** - Optimisée dès le départ
- **Sécurité** - Secure by design

### Priorités
1. ✅ **Fonctionnel** - Ça marche
2. ✅ **Sécurisé** - Pas de failles
3. ✅ **Qualité** - Code propre, maintenable
4. ✅ **Performance** - Rapide, efficace
5. ✅ **UX** - Simple, intuitif
6. ✅ **Scalable** - Pour des millions d'utilisateurs

---

## 🚨 POINTS D'ATTENTION CRITIQUES

### Ne JAMAIS faire
❌ Utiliser `any` en TypeScript
❌ Ignorer la validation des données
❌ Faire confiance aux données client
❌ Hard-coder des données sensibles
❌ Négliger la sécurité multi-tenant
❌ Créer des composants monolithiques
❌ Ignorer les performances
❌ Supprimer les logs de sécurité

### TOUJOURS faire
✅ Valider avec Zod
✅ Gérer les erreurs
✅ Logger les actions importantes
✅ Vérifier les permissions
✅ Filtrer par organizationId
✅ Optimiser les requêtes
✅ Rendre le code maintenable
✅ Documenter les choix importants


