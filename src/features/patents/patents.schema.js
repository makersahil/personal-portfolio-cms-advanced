import { z } from 'zod';

export const patentListQuery = z.object({
  q: z.string().trim().optional(),
  year: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.string().trim().optional(),
});

export const patentSlugParam = z.object({
  slug: z.string().min(1),
});
