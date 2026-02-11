//server\post-service\src\validators\activity.schema.ts
import { z } from 'zod';

export const recordActivitySchema = z.object({
  userId: z.string().uuid(),
  activityType: z.enum(['POST_CREATED', 'COMMENT_CREATED', 'FACT_CHECK_COMPLETED'])
});

export const calendarQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12)
});

export type RecordActivityInput = z.infer<typeof recordActivitySchema>;
export type CalendarQueryInput = z.infer<typeof calendarQuerySchema>;
