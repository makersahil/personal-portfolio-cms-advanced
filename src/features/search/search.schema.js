import { z } from 'zod';

export const searchQuery = z.object({
  q: z.string().trim().optional(),
  // restrict to one kind, or omit for all
  kind: z.enum(['article', 'publication', 'grant', 'patent', 'certification']).optional(),
  // filters forwarded to specific kinds
  type: z.enum(['Book', 'Conference', 'Chapter']).optional(), // publications only
  year: z.coerce.number().int().min(0).optional(),
  tag: z.string().trim().optional(), // articles/publications lists use array tags
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
  // fields allowed across kinds
  sort: z.string().trim().optional(), // e.g. "-year,createdAt"
});
