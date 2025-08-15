import { z } from 'zod';

export const grantCreateBody = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  year: z.number().int().min(0),
  amount: z.number().int().optional(),
  link: z.string().url().optional(),
  published: z.boolean().optional(),
  slug: z.string().min(1).optional(),
});

export const grantUpdateBody = grantCreateBody.partial();

export const grantIdParam = z.object({
  id: z.string().uuid(),
});
