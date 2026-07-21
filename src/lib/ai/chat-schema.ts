import { z } from "zod";
import { aiImportQuestionSchema } from "@/lib/validators/ai-import";

/** Shared between the streaming route (`streamObject`) and the client
 * (`useObject`) — the assistant always replies with a short conversational
 * message, and optionally a batch of quiz questions in the exact shape the
 * existing import pipeline (`aiImportQuestionSchema`) already validates. */
export const aiChatTurnSchema = z.object({
  reply: z.string().describe("Réponse conversationnelle courte, dans la langue de l'utilisateur."),
  questions: z
    .array(aiImportQuestionSchema)
    .max(20)
    .optional()
    .describe("Questions de quiz proposées pendant ce tour, si l'utilisateur en a demandé."),
});

export type AiChatTurn = z.infer<typeof aiChatTurnSchema>;
