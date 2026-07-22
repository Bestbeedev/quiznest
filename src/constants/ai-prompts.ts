import {
  BookOpen,
  Brain,
  GraduationCap,
  Lightbulb,
  Microscope,
  Puzzle,
  Target,
  Zap,
} from "lucide-react";

export type AiPromptTemplate = {
  id: string;
  label: string;
  description: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

export const AI_PROMPT_TEMPLATES: AiPromptTemplate[] = [
  {
    id: "quiz-topic",
    label: "Quiz sur un sujet",
    description: "Génère un quiz complet sur un thème de ton choix",
    prompt:
      "Génère 10 questions de quiz sur le sujet de ton choix, difficulté mélangée (easy, medium, hard). Mélange les types : choix unique, vrai/faux et réponse courte. Inclus les explications pour chaque réponse.",
    icon: BookOpen,
    color: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  },
  {
    id: "exam-prep",
    label: "Prépa examen",
    description: "Crée des questions pour réviser un chapitre précis",
    prompt:
      "Crée 15 questions d'examen sur le chapitre que je vais te décrire. Difficulté moyenne à difficile. Principalement des choix uniques et des réponses courtes. Inclus des explications détaillées pour chaque bonne réponse et des indices pour les plus difficiles.",
    icon: GraduationCap,
    color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  {
    id: "true-false",
    label: "Vrai ou Faux",
    description: "Questions true/false sur un sujet précis",
    prompt:
      "Génère 20 questions vrai ou false sur le sujet que je vais préciser. Les affirmations doivent être crédibles et nuancées — pas d'évidence. Difficulté mélangée. Inclus une explication courte pour chaque réponse.",
    icon: Target,
    color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  },
  {
    id: "quick-fire",
    label: "Questions rapides",
    description: "Quiz court et rapide pour un icebreaker",
    prompt:
      "Crée 8 questions rapides et fun pour un icebreaker. Difficulté facile, mélange de types. Les questions doivent être engageantes et accessibles à tout le monde. Avec explications sympas.",
    icon: Zap,
    color: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  },
  {
    id: "science-quiz",
    label: "Quiz sciences",
    description: "Questions de sciences naturelles ou physiques",
    prompt:
      "Génère 12 questions de quiz sur un domaine scientifique (physique, chimie, biologie, etc.). Difficulté moyenne. Mélange de choix uniques, choix multiples et réponses courtes. Inclus des explications scientifiques précises.",
    icon: Microscope,
    color: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
  },
  {
    id: "logic-puzzle",
    label: "Défi logique",
    description: "Questions de logique et résolution de problèmes",
    prompt:
      "Crée 10 questions de logique et résolution de problèmes. Difficulté croissante. Mélange de types. Les questions doivent réfléchir le participant sans être piégeuses. Avec les explications du raisonnement.",
    icon: Puzzle,
    color: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400",
  },
  {
    id: "brainstorm",
    label: "Idées de quiz",
    description: "L'IA te propose des idées et structures de quiz",
    prompt:
      "Je veux créer un quiz mais je ne sais pas trop sur quel sujet. Propose-moi 5 idées de quiz avec un titre accrocheur, le sujet, le nombre de questions suggéré et le public cible. Ensuite, pour l'idée que je choisis, génère les questions.",
    icon: Lightbulb,
    color: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  },
  {
    id: "deep-knowledge",
    label: "Quiz approfondi",
    description: "Questions détaillées pour des experts",
    prompt:
      "Génère 10 questions de quiz approfondies pour des étudiants avancés ou des professionnels. Difficulté haute. Inclus des questions à choix multiples complexes (3+ bonnes réponses possibles) et des réponses courtes. Explications détaillées et références.",
    icon: Brain,
    color: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
  },
];
