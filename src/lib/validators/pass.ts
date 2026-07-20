import { z } from "zod";
import { ALL_FEATURES } from "@/constants/features";

export const passSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  price: z.coerce.number().int().min(1),
  currency: z.string().min(1).max(10).default("XOF"),
  durationDays: z.coerce.number().int().min(1),
  features: z.array(z.enum(ALL_FEATURES as [string, ...string[]])).default([]),
  isActive: z.boolean().default(true),
  isPromoted: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export type PassInput = z.infer<typeof passSchema>;
