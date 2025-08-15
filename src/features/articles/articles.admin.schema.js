import { z } from 'zod';

const authorItem = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  affiliation: z.string().optional(),
});

export const articleCreateBody = z.object({
  title: z.string().min(1),
  abstract: z.string().optional(),
  journal: z.string().min(1),
  year: z.number().int().min(0),
  doi: z.string().optional(),
  link: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  slug: z.string().min(1).optional(),
  legacyAuthors: z.string().optional(),
  authorsList: z.array(authorItem).optional(), // compatibility mode
});

export const articleUpdateBody = articleCreateBody.partial();

export const articleIdParam = z.object({
  id: z.string().uuid(),
});
