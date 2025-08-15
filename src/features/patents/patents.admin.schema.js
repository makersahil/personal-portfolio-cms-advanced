import { z } from 'zod';

const inventorItem = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  affiliation: z.string().optional(),
});

export const patentCreateBody = z.object({
  title: z.string().min(1),
  country: z.string().min(1),
  patentNo: z.string().min(1),
  year: z.number().int().min(0),
  link: z.string().url().optional(),
  published: z.boolean().optional(),
  slug: z.string().min(1).optional(),
  legacyInventors: z.string().optional(),
  inventorsList: z.array(inventorItem).optional(),
});

export const patentUpdateBody = patentCreateBody.partial();

export const patentIdParam = z.object({
  id: z.string().uuid(),
});
