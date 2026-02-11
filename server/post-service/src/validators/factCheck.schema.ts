//server\post-service\src\validators\factCheck.schema.ts
import { z } from "zod";
import { CONSTANTS } from "../config/constants.js";

// ✅ ADD THIS EXPORT
export const createFactCheckSchema = z.object({
  verdict: z
  .string()
  .min(1, { message: "You must select a verdict." })
  .refine(v => ["VALIDATED", "DEBUNKED"].includes(v), {
    message: "Invalid verdict value.",
  }),


  
  header: z
    .string()
    .min(CONSTANTS.FACT_CHECK_HEADER_MIN_LENGTH, { message: "Header must be at least 6 characters." })
    .max(150, { message: "Header must be 150 characters or less." }),
  
  description: z
    .string()
    .min(CONSTANTS.FACT_CHECK_DESCRIPTION_MIN_LENGTH, { message: "Description must be at least 10 characters." })
    .max(500, { message: "Description must be 500 characters or less." })
    .optional(),
  
  referenceUrls: z
    .array(z.string().url({ message: "Each source must be a valid URL." }))
    .min(1, { message: "At least one source link is required." })
    .max(CONSTANTS.FACT_CHECK_MAX_SOURCES, { message: "You can add up to 3 source links." })
});

export type CreateFactCheckInput = z.infer<typeof createFactCheckSchema>;