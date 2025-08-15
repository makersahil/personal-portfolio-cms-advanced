import { z } from 'zod';

export const profileUpdateBody = z.object({
  name: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  bio: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  phone: z.string().min(3).max(30).optional().nullable(),
  socials: z.record(z.string()).optional().nullable(),
  published: z.boolean().optional(),
});
