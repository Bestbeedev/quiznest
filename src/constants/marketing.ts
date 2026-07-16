import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Church,
  ClipboardList,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Pour qui", href: "#pour-qui" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
] as const;

export const AUDIENCES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: GraduationCap,
    title: "Éducation",
    description: "Examens, devoirs et évaluations continues pour établissements et enseignants.",
  },
  {
    icon: Building2,
    title: "Entreprises",
    description: "Recrutement, tests techniques et formations internes pour vos équipes.",
  },
  {
    icon: Church,
    title: "Églises",
    description: "Quiz bibliques, formation des disciples et concours communautaires.",
  },
  {
    icon: ClipboardList,
    title: "Organismes",
    description: "Sondages, enquêtes et recensements pour ONG et institutions.",
  },
];

export const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Sparkles,
    title: "IA intégrée",
    description: "Générez une évaluation complète en moins de 2 minutes à partir d'un simple sujet.",
  },
  {
    icon: BarChart3,
    title: "Analytics avancés",
    description: "Taux de réussite, distribution des scores et questions les plus difficiles en un coup d'œil.",
  },
  {
    icon: Users,
    title: "Multi-tenant",
    description: "Chaque organisation dispose de son espace isolé, avec rôles et permissions granulaires.",
  },
  {
    icon: ShieldCheck,
    title: "Sécurisé par design",
    description: "Validation systématique, sessions sécurisées et isolation stricte des données.",
  },
  {
    icon: Zap,
    title: "Rapide",
    description: "Interface pensée pour créer, publier et partager une évaluation sans friction.",
  },
  {
    icon: ClipboardList,
    title: "Tous types de questions",
    description: "QCM, vrai/faux, réponse courte, association, code, mathématiques et plus.",
  },
];

export const TESTIMONIALS: { name: string; role: string; quote: string }[] = [
  {
    name: "Aïcha K.",
    role: "Responsable formation, ONG",
    quote:
      "Nous avons digitalisé nos évaluations de fin de formation en une après-midi. Le gain de temps est considérable.",
  },
  {
    name: "Marc D.",
    role: "Enseignant, lycée",
    quote:
      "Mes élèves passent leurs contrôles directement sur QuizNest. La correction automatique me fait gagner des heures chaque semaine.",
  },
  {
    name: "Fatou S.",
    role: "RH, entreprise tech",
    quote:
      "Les tests techniques générés par l'IA sont bluffants de pertinence. Notre processus de recrutement est bien plus rapide.",
  },
];

export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Combien de temps faut-il pour créer un quiz ?",
    answer:
      "Moins de 2 minutes pour un quiz simple : donnez un titre, ajoutez vos questions et publiez. L'IA peut aussi générer l'ensemble du quiz à partir d'un simple sujet.",
  },
  {
    question: "Mes données sont-elles isolées des autres organisations ?",
    answer:
      "Oui. Chaque organisation dispose de son propre espace : les données sont filtrées automatiquement et aucun accès croisé n'est possible entre organisations.",
  },
  {
    question: "Puis-je utiliser QuizNest sans que mes participants créent un compte ?",
    answer:
      "Oui, les participants peuvent répondre via un lien public, un QR code ou un code d'accès, sans création de compte.",
  },
  {
    question: "Quels types de questions sont supportés ?",
    answer:
      "QCM, choix multiple, vrai/faux, réponse courte, et bien d'autres à venir (association, remplir les blancs, code, mathématiques).",
  },
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer:
      "Oui, vous pouvez passer du plan Free à Professional ou Enterprise à tout moment depuis les paramètres de votre organisation.",
  },
];

export const PRICING_PLANS = [
  {
    name: "Free",
    price: "0",
    description: "Pour démarrer et tester la plateforme.",
    features: ["3 quiz", "50 participants", "10 questions par quiz", "100 Mo de stockage"],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "—",
    description: "Pour les organisations qui évaluent régulièrement.",
    features: [
      "Quiz illimités",
      "Participants illimités",
      "IA Premium",
      "Exports avancés",
      "Statistiques avancées",
      "Support prioritaire",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "—",
    description: "Pour les grandes organisations et le multi-équipes.",
    features: ["Multi-équipes", "API complète", "White Label", "SSO", "Support 24/7"],
    highlighted: false,
  },
] as const;
