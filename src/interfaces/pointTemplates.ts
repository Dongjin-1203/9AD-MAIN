import z from 'zod';

export const PointTemplates = z.object({
  id:          z.string().uuid(),
  merit:       z.number(),
  demerit:     z.number(),
  value:       z.number(),
  unit:        z.string(),
  reason:      z.string(),
});

export type PointTemplates = z.infer<typeof PointTemplates>;
