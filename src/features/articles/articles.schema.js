import { z } from 'zod';

export const articleListQuery = z.object({
  q: z.string().trim().optional(),
  year: z.coerce.number().int().min(0).optional(),
  tag: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.string().trim().optional(), // e.g., "-year,title"
});

export const articleSlugParam = z.object({
  slug: z.string().min(1),
});
