import { z } from 'zod';

export const startSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  regionTier: z.enum(['IN', 'SEA', 'GLOBAL', 'EU', 'JP', 'ME']).optional(),
});

export type StartSubscriptionInput = z.infer<typeof startSubscriptionSchema>;

