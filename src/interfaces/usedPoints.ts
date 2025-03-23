import z from 'zod';

export const UsedPoint = z.object({
  id:          z.string().uuid(),
  created_at:  z.date(),
  recorded_by: z.string(),
  user_id:     z.string(),
  value:       z.number(),
  reason:      z.string(),
});

export type UsedPoint = z.infer<typeof UsedPoint>;
