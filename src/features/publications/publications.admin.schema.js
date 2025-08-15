import { z } from 'zod';

export const publicationCreateBody = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  publisher: z.string().optional(),
  type: z.enum(['Book', 'Conference', 'Chapter']),
  year: z.number().int().min(0),
  link: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  slug: z.string().min(1).optional(),
});

export const publicationUpdateBody = publicationCreateBody.partial();

export const publicationIdParam = z.object({
  id: z.string().uuid(),
});
