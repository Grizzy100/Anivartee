//server\post-service\src\validators\flag.schema.ts
import { z } from "zod";

// Currently flags don't require additional data beyond linkId and userId
// This schema is here for future extensibility (e.g., adding flag reasons)

export const createFlagSchema = z.object({
  reason: z.enum(["SPAM", "HATE_SPEECH", "MISLEADING", "OTHER"]).optional()
});

export type CreateFlagInput = z.infer<typeof createFlagSchema>;