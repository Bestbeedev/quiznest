export type PromptOptions = {
  topic: string;
  count: number;
  types: string[];
  difficulty: string;
  choicesPerQuestion: number;
  pointsPerQuestion: number;
  includeExplanations: boolean;
  includeHints: boolean;
  category: string;
  tags: string[];
  language: string;
};

const LANGUAGE_MAP: Record<string, string> = {
  fr: "français",
  en: "anglais",
  es: "espagnol",
  de: "allemand",
  pt: "portugais",
  ar: "arabe",
};

const TYPE_INSTRUCTIONS: Record<string, string> = {
  single_choice:
    `"single_choice" : une seule bonne réponse possible. Au moins 2 choix.`,
  multiple_choice:
    `"multiple_choice" : plusieurs bonnes réponses possibles (au moins 2). Au moins 3 choix au total.`,
  true_false:
    `"true_false" : exactement 2 choix — "Vrai" et "Faux".`,
  short_answer:
    `"short_answer" : pas de choix. Le participant tape sa réponse. Fournis un champ "acceptedAnswers" avec les réponses acceptées (tableau de chaînes).`,
};

function buildTypeExamples(): string {
  return `  Exemples :

  // Choix unique
  {
    "type": "single_choice",
    "question": "Quelle est la capitale de la France ?",
    "difficulty": "easy",
    "points": 2,
    "category": "Géographie",
    "tags": ["europe", "capitales"],
    "hint": "C'est la ville la plus peuplée du pays.",
    "choices": [
      { "text": "Paris", "correct": true },
      { "text": "Lyon", "correct": false },
      { "text": "Marseille", "correct": false },
      { "text": "Toulouse", "correct": false }
    ],
    "explanation": "Paris est la capitale et la ville la plus peuplée de France."
  },

  // Choix multiple
  {
    "type": "multiple_choice",
    "question": "Quels sont des pays d'Europe ? (plusieurs réponses)",
    "difficulty": "easy",
    "points": 3,
    "category": "Géographie",
    "tags": ["europe"],
    "choices": [
      { "text": "France", "correct": true },
      { "text": "Japon", "correct": false },
      { "text": "Allemagne", "correct": true },
      { "text": "Brésil", "correct": false }
    ],
    "explanation": "La France et l'Allemagne sont en Europe."
  },

  // Vrai ou Faux
  {
    "type": "true_false",
    "question": "La Terre est plate.",
    "difficulty": "easy",
    "points": 1,
    "category": "Sciences",
    "hint": "Pensez à la forme de la Terre vue de l'espace.",
    "choices": [
      { "text": "Vrai", "correct": false },
      { "text": "Faux", "correct": true }
    ],
    "explanation": "La Terre est un sphéroïde oblate, pas plate."
  },

  // Réponse courte
  {
    "type": "short_answer",
    "question": "Quel est le symbole chimique de l'eau ?",
    "difficulty": "medium",
    "points": 2,
    "category": "Chimie",
    "acceptedAnswers": ["H2O", "h2o"],
    "explanation": "L'eau est composée de 2 atomes d'hydrogène et 1 atome d'oxygène."
  }`;
}

export function buildQuestionGenerationPrompt(options: PromptOptions): string {
  const {
    topic,
    count,
    types,
    difficulty,
    choicesPerQuestion,
    pointsPerQuestion,
    includeExplanations,
    includeHints,
    category,
    tags,
    language,
  } = options;

  const langName = LANGUAGE_MAP[language] ?? "français";

  const typeList = types
    .map((t) => TYPE_INSTRUCTIONS[t])
    .filter(Boolean)
    .join("\n  ");

  const diffLabel =
    difficulty === "mixed"
      ? "Mélange les difficultés (easy, medium, hard) de manière équilibrée."
      : difficulty === "easy"
        ? "Toutes les questions doivent être de difficulté 'easy'."
        : difficulty === "medium"
          ? "Toutes les questions doivent être de difficulté 'medium'."
          : "Toutes les questions doivent être de difficulté 'hard'.";

  const choiceRules =
    types.includes("short_answer") && types.length === 1
      ? `Pour les questions "short_answer", ne génère PAS de champ "choices". À la place, fournis un champ "acceptedAnswers" (tableau de chaînes) contenant les réponses acceptées.`
      : `- Chaque question à choix doit avoir exactement ${choicesPerQuestion} choix.
- Au moins un choix doit être "correct": true.`;

  const optionalFields: string[] = [];
  if (includeExplanations) {
    optionalFields.push(`"explanation" : courte explication de la bonne réponse (recommandé).`);
  }
  if (includeHints) {
    optionalFields.push(`"hint" : un indice pour aider le participant (optionnel).`);
  }
  if (category) {
    optionalFields.push(`"category" : "${category}" (catégorie de la question).`);
  }
  if (tags.length > 0) {
    optionalFields.push(`"tags" : tableau de tags (${tags.map((t) => `"${t}"`).join(", ")}).`);
  }

  return `Tu es un expert en création de quiz. Génère exactement ${count} questions de qualité sur le sujet : "${topic}".

Langue des réponses : ${langName}.

Types de questions autorisés :
  ${typeList}

Difficulté : ${diffLabel}

Champs requis pour chaque question :
  - "type" : type de la question (voir ci-dessus)
  - "question" : énoncé clair et précis
  - "difficulty" : "easy", "medium" ou "hard"
  - "points" : nombre de points (${pointsPerQuestion})
  - "choices" : tableau de choix (sauf pour "short_answer")
  ${optionalFields.length > 0 ? `\nChamps optionnels :\n  ${optionalFields.join("\n  ")}` : ""}

Règles :
${choiceRules}
- Les mauvaises réponses doivent être crédibles et plausibles (pas de réponses absurdes).
- Les questions doivent être variées et couvrir différents aspects du sujet.
- Les explications doivent être courtes et instructives.
- Ne mets aucun commentaire, aucun markdown, uniquement le JSON pur.

Format de sortie (JSON unique, aucun texte avant ou après) :

{
  "questions": [
    {
      "type": "single_choice",
      "question": "...",
      "difficulty": "medium",
      "points": ${pointsPerQuestion},
      "choices": [
        { "text": "...", "correct": true },
        { "text": "...", "correct": false },
        { "text": "...", "correct": false },
        { "text": "...", "correct": false }
      ],
      "explanation": "...",
      "hint": "..."
    }
  ]
}

Exemples détaillés :
${buildTypeExamples()}`;
}
