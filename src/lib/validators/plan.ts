import { z } from "zod";
import { ALL_FEATURES } from "@/constants/features";

export const planFeatureInputSchema = z.object({
  feature: z.enum(ALL_FEATURES as [string, ...string[]]),
  enabled: z.boolean(),
  limit: z.coerce.number().int().min(0).nullable().optional(),
});

export const planSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Lettres minuscules, chiffres et tirets uniquement."),
  description: z.string().max(500).optional().or(z.literal("")),
  price: z.coerce.number().int().min(0).nullable().optional(),
  currency: z.string().min(1).max(10).default("XOF"),
  interval: z.enum(["MONTH", "YEAR"]).default("MONTH"),
  quizLimit: z.coerce.number().int().min(0).nullable().optional(),
  participantLimit: z.coerce.number().int().min(0).nullable().optional(),
  questionLimit: z.coerce.number().int().min(0).nullable().optional(),
  storageLimitMb: z.coerce.number().int().min(0).nullable().optional(),
  badge: z.string().max(50).optional().or(z.literal("")),
  color: z.string().max(30).optional().or(z.literal("")),
  icon: z.string().max(50).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isPromoted: z.boolean().default(false),
  trialDays: z.coerce.number().int().min(0).nullable().optional(),
  availableFrom: z.coerce.date().nullable().optional(),
  availableUntil: z.coerce.date().nullable().optional(),
  marketingFeatures: z.array(z.string().min(1).max(150)).max(20).default([]),
  features: z.array(planFeatureInputSchema).default([]),
});

export type PlanInput = z.infer<typeof planSchema>;
