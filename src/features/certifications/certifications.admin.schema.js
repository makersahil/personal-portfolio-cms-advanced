import { z } from 'zod';

export const certificationCreateBody = z.object({
  title: z.string().min(1),
  issuer: z.string().min(1),
  year: z.number().int().min(0),
  link: z.string().url().optional(),
  published: z.boolean().optional(),
  slug: z.string().min(1).optional(),
});

export const certificationUpdateBody = certificationCreateBody.partial();

export const certificationIdParam = z.object({
  id: z.string().uuid(),
});
