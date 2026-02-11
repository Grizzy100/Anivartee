//server\post-service\src\validators\verdict.schema.ts
import { z } from 'zod';
import { CONSTANTS } from '../config/constants.js';

export const submitVerdictSchema = z.object({
  verdict: z
    .string()
    .min(1, { message: 'You must select a verdict.' })
    .refine(v => ['VALIDATED', 'DEBUNKED'].includes(v), {
      message: 'Invalid verdict value.'
    }),

  header: z
    .string()
    .min(CONSTANTS.FACT_CHECK_HEADER_MIN_LENGTH, { message: 'Header must be at least 6 characters.' })
    .max(150, { message: 'Header must be 150 characters or less.' }),

  description: z
    .string()
    .min(CONSTANTS.FACT_CHECK_DESCRIPTION_MIN_LENGTH, { message: 'Description must be at least 10 characters.' })
    .max(500, { message: 'Description must be 500 characters or less.' })
    .optional(),

  referenceUrls: z
    .array(z.string().url({ message: 'Each source must be a valid URL.' }))
    .min(1, { message: 'At least one source link is required.' })
    .max(CONSTANTS.FACT_CHECK_MAX_SOURCES, { message: `You can add up to ${CONSTANTS.FACT_CHECK_MAX_SOURCES} source links.` })
});

export const saveDraftSchema = z.object({
  verdict: z.string().optional(),
  header: z.string().max(150).optional(),
  description: z.string().max(500).optional(),
  referenceUrls: z.array(z.string().url()).max(CONSTANTS.FACT_CHECK_MAX_SOURCES).optional()
});

export type SubmitVerdictInput = z.infer<typeof submitVerdictSchema>;
export type SaveDraftInput = z.infer<typeof saveDraftSchema>;
