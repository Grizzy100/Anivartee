//server\post-service\src\validators\claim.schema.ts
import { z } from 'zod';

export const claimPostSchema = z.object({
  postId: z.string().uuid({ message: 'Invalid post ID' })
});

export type ClaimPostInput = z.infer<typeof claimPostSchema>;
