import { z } from 'zod';

// Generic API envelopes for documentation (keep them aligned with your real responses)
export const SuccessEnvelope = z.object({
  success: z.literal(true),
  data: z.any(),
  meta: z.any().optional(),
});

export const ErrorEnvelope = z.object({
  success: z.literal(false),
  code: z.string().optional(),
  message: z.string(),
  details: z.any().optional(),
});
