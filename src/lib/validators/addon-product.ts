import { z } from "zod";

const addOnEffectKeys = [
  "EXTRA_PARTICIPANTS",
  "EXTRA_QUIZZES",
  "EXTRA_QUESTIONS",
  "EXTRA_AI_GENERATIONS",
  "EXPORT_UNLOCK",
  "CERTIFICATE_UNLOCK",
] as const;

const featureKeys = [
  "AI_GENERATION",
  "AI_IMPORT",
  "QUESTION_BANK",
  "CERTIFICATES",
  "EXPORT_PDF",
  "EXPORT_EXCEL",
  "EXPORT_CSV",
  "ADVANCED_ANALYTICS",
  "CUSTOM_BRANDING",
  "CUSTOM_DOMAIN",
  "WEBHOOKS",
  "API_ACCESS",
  "MULTI_TEAM",
  "LIVE_MONITORING",
  "EMAIL_NOTIFICATIONS",
  "SMS_NOTIFICATIONS",
  "WHITE_LABEL",
] as const;

export const addOnProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  price: z.coerce.number().int().min(1),
  currency: z.string().min(1).max(10).default("XOF"),
  effect: z.enum(addOnEffectKeys),
  amount: z.coerce.number().int().min(1).nullable().optional(),
  targetFeature: z.enum(featureKeys).nullable().optional(),
  isOneTime: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isPromoted: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export type AddOnProductInput = z.infer<typeof addOnProductSchema>;
