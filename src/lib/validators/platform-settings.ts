import { z } from "zod";

export const updatePlatformSettingsSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().max(500).nullable().optional(),
  allowSignups: z.boolean().optional(),
  aiGeneration: z.boolean().optional(),
  exportsEnabled: z.boolean().optional(),
  billingEnabled: z.boolean().optional(),
  notificationEmail: z.union([z.email(), z.literal("")]).nullable().optional(),
  notifyOnNewOrganization: z.boolean().optional(),
  notifyOnNewSubscription: z.boolean().optional(),
});

export type UpdatePlatformSettingsInput = z.infer<typeof updatePlatformSettingsSchema>;
