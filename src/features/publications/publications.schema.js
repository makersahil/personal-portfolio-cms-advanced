import { z } from 'zod';

export const publicationListQuery = z.object({
  q: z.string().trim().optional(),
  type: z.enum(['Book', 'Conference', 'Chapter']).optional(),
  year: z.coerce.number().int().min(0).optional(),
  tag: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.string().trim().optional(),
});

export const publicationSlugParam = z.object({
  slug: z.string().min(1),
});
