import "server-only";

/**
 * Architecture for the future "Résumé IA" feature (roadmap Phase 5 — AI
 * results analysis). Not wired to a real provider yet: this codebase has no
 * AIProvider abstraction or API key configured anywhere (see AI page, which
 * is still a manual copy/paste flow). This file exists so the UI has a real
 * contract to call against, and so a provider can be dropped in later without
 * touching the calling components.
 */

export type QuizSummaryInput = {
  quizTitle: string;
  totalCompleted: number;
  averageScore: number | null;
  passRate: number | null;
  questionStats: { title: string; successRate: number | null }[];
};

export type QuizSummaryResult = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
};

export class AiSummaryNotConfiguredError extends Error {
  constructor() {
    super("Aucun fournisseur IA n'est configuré pour cette fonctionnalité.");
    this.name = "AiSummaryNotConfiguredError";
  }
}

/** Stub — always throws until an AIProvider is wired in. Kept async and
 * signature-stable so the eventual real implementation is a drop-in. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateQuizSummary(input: QuizSummaryInput): Promise<QuizSummaryResult> {
  throw new AiSummaryNotConfiguredError();
}
