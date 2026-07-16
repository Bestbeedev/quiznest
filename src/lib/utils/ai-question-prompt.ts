export function buildQuestionGenerationPrompt(topic: string, count: number): string {
  return `Tu es un générateur de questions de quiz. Génère ${count} questions sur le sujet suivant : "${topic}".

Réponds UNIQUEMENT avec un objet JSON valide (aucun texte avant ou après), au format exact suivant :

{
  "questions": [
    {
      "type": "single_choice",
      "question": "Texte de la question",
      "points": 1,
      "choices": [
        { "text": "Choix A", "correct": true },
        { "text": "Choix B", "correct": false },
        { "text": "Choix C", "correct": false }
      ],
      "explanation": "Courte explication de la bonne réponse"
    }
  ]
}

Règles :
- "type" doit être l'une de : "single_choice" (une seule bonne réponse), "multiple_choice" (plusieurs bonnes réponses possibles), "true_false" (exactement 2 choix : Vrai / Faux).
- Chaque question doit avoir au moins 2 choix, et au moins une bonne réponse ("correct": true).
- "points" est un entier entre 1 et 10.
- "explanation" est optionnel mais recommandé.
- Ne mets aucun commentaire, aucun markdown, uniquement le JSON.`;
}
