import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Brain,
  Building2,
  Church,
  ClipboardList,
  CloudLightning,
  Command,
  Crown,
  FileText,
  Globe,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Lock,
  MessageSquareText,
  Monitor,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  QrCode,
  Timer,
  BarChart4,
  Palette,
  Headphones,
  Infinity,
  Share2,
  ArrowRightLeft,
  type Icon as LucideIconType,
} from "lucide-react";

export const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Pour qui", href: "#pour-qui" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
] as const;

export const TRUSTED_BY = [
  { name: "Établissements scolaires", initials: "ES" },
  { name: "Entreprises tech", initials: "ET" },
  { name: "ONG & organismes", initials: "ON" },
  { name: "Centres de formation", initials: "CF" },
  { name: "Cabinets de recrutement", initials: "CR" },
  { name: "Communautés religieuses", initials: "CG" },
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

export const FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
  size?: "sm" | "md" | "lg";
  gradient?: string;
}[] = [
  {
    icon: Sparkles,
    title: "IA intégrée",
    description: "Générez une évaluation complète en moins de 2 minutes à partir d'un simple sujet. L'IA suggère aussi les questions les plus pertinentes selon le niveau.",
    size: "lg",
    gradient: "from-primary/10 via-primary/5 to-transparent",
  },
  {
    icon: BarChart3,
    title: "Analytics avancés",
    description: "Taux de réussite, distribution des scores, temps de réponse et questions les plus difficiles en un coup d'œil.",
    size: "md",
    gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
  },
  {
    icon: Users,
    title: "Multi-tenant",
    description: "Chaque organisation dispose de son espace isolé, avec rôles, permissions granulaires et marque blanche.",
    size: "md",
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
  },
  {
    icon: Layers,
    title: "Tous types de questions",
    description: "QCM, vrai/faux, réponse courte, association, code, mathématiques, et bien d'autres à venir.",
    size: "sm",
    gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
  },
  {
    icon: QrCode,
    title: "Partage instantané",
    description: "Lien public, QR code ou code d'accès — les participants répondent sans compte.",
    size: "sm",
    gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
  },
  {
    icon: Timer,
    title: "Minutage & sessions",
    description: "Quiz chronométrés, fenêtres de soumission, et reprise automatique en cas d'interruption.",
    size: "sm",
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
  },
  {
    icon: FileText,
    title: " exports PDF & Excel",
    description: "Exportez les résultats individuels des particiapant et les statistiques globales en un clic.",
    size: "sm",
    gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
  },
];

export const TESTIMONIALS: {
  name: string;
  role: string;
  quote: string;
  highlight?: string;
}[] = [
  {
    name: "Aïcha K.",
    role: "Responsable formation, ONG",
    quote:
      "Nous avons digitalisé nos évaluations de fin de formation en une après-midi. Le gain de temps est considérable et les apprenants adorent le format interactif.",
    highlight: "Gain de temps considérable",
  },
  {
    name: "Marc D.",
    role: "Enseignant, lycée",
    quote:
      "Mes élèves passent leurs contrôles directement sur QuizNest. La correction automatique me fait gagner des heures chaque semaine, et je peux enfin me concentrer sur la pédagogie.",
    highlight: "Des heures gagnées chaque semaine",
  },
  {
    name: "Fatou S.",
    role: "RH, entreprise tech",
    quote:
      "Les tests techniques générés par l'IA sont bluffants de pertinence. Notre processus de recrutement est passé de 2 semaines à 3 jours.",
    highlight: "Recrutement 4× plus rapide",
  },
  {
    name: "Dr. Koffi A.",
    role: "Directeur pédagogique",
    quote:
      "Avec le multi-tenant, chaque département a son propre espace. Les rapports consolidés nous donnent une vue d'ensemble unique sur la performance des étudiants.",
    highlight: "Vision consolidée en temps réel",
  },
];

export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Combien de temps faut-il pour créer un quiz ?",
    answer:
      "Moins de 2 minutes pour un quiz simple : donnez un titre, ajoutez vos questions et publiez. L'IA peut aussi générer l'ensemble du quiz à partir d'un simple sujet en quelques secondes.",
  },
  {
    question: "Mes données sont-elles isolées des autres organisations ?",
    answer:
      "Oui. Chaque organisation dispose de son propre espace complètement isolé : les données sont filtrées automatiquement et aucun accès croisé n'est possible entre organisations.",
  },
  {
    question: "Puis-je utiliser QuizNest sans que mes participants créent un compte ?",
    answer:
      "Oui, les participants peuvent répondre via un lien public, un QR code ou un code d'accès, sans création de compte. Idéal pour les examens ponctuels ou les sondages.",
  },
  {
    question: "Quels types de questions sont supportés ?",
    answer:
      "QCM, choix multiple, vrai/faux, réponse courte, et bien d'autres à venir : association, remplir les blancs, code, mathématiques avec rendu LaTeX.",
  },
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer:
      "Oui, vous pouvez passer du plan Free à Professional ou Enterprise à tout moment depuis les paramètres de votre organisation. Pas de période d'engagement.",
  },
  {
    question: "Comment fonctionne la génération par IA ?",
    answer:
      "Donnez simplement un sujet et un niveau, et l'IA génère des questions pertinentes avec les bonnes réponses. Vous pouvez ensuite les modifier, les réorganiser ou en ajouter manuellement.",
  },
  {
    question: "Proposez-vous une période d'essai gratuite ?",
    answer:
      "Le plan Free est gratuit sans limite de durée. Vous pouvez tester toutes les fonctionnalités de base avant de passer à un plan supérieur.",
  },
  {
    question: "Comment fonctionnent les crédits ?",
    answer:
      "Les crédits sont une monnaie d'échange prépayée. Ils ne sont débités que lorsque votre plan ne couvre pas l'action — par exemple, si vous avez épuisé vos générations IA mensuelles. 1 crédit ≈ 1 XOF, et les crédits n'expirent jamais.",
  },
  {
    question: "Quelle différence entre un module et un pass ?",
    answer:
      "Un module est un achat permanent qui ajoute des ressources (+100 participants) ou débloque une fonctionnalité pour toujours (exports). Un pass est un accès temporaire à des fonctionnalités premium pendant 30, 60 ou 90 jours — idéal pour des projets ponctuels.",
  },
  {
    question: "Puis-je utiliser QuizNest gratuitement tout en achetant des fonctionnalités ?",
    answer:
      "Oui ! Le plan Free est gratuit. Si vous avez besoin de plus, vous pouvez acheter des modules ponctuels ou recharger votre wallet avec des crédits — sans changer de plan.",
  },
  {
    question: "Comment appliquer un code promo ?",
    answer:
      "Lors du paiement d'un plan, cliquez sur « J'ai un code promo » et entrez votre code. La réduction est appliquée instantanément. Les codes promo sont distribués par email, lors de campagnes ou via des partenariats.",
  },
];

export const DEMO_TABS = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  {
    id: "quiz",
    label: "Passation de quiz",
    icon: Monitor,
  },
  {
    id: "analytics",
    label: "Analytiques",
    icon: BarChart4,
  },
] as const;
