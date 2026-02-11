import { z } from 'zod';

export const awardPointsSchema = z.object({
  userId: z.string().uuid(),
  points: z.number().int().refine(v => v !== 0, 'Points must be non-zero'),
  reason: z.string().min(1).max(50),
  contextId: z.string().uuid().optional()
});

export type AwardPointsInput = z.infer<typeof awardPointsSchema>;
