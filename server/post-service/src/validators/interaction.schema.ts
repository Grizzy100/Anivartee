//server\post-service\src\validators\interaction.schema.ts
import { z } from "zod";

export const createViewSchema = z.object({
  sessionId: z.string().optional()
});

export const createShareSchema = z.object({
  platform: z.enum(["TWITTER", "FACEBOOK", "WHATSAPP", "OTHER"]).optional()
});

export type CreateViewInput = z.infer<typeof createViewSchema>;
export type CreateShareInput = z.infer<typeof createShareSchema>;