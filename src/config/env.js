import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(10, 'JWT_ACCESS_SECRET too short'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET too short'),
  CORS_ORIGINS: z.string().default('*'), // comma-separated or "*"
  RATE_LIMIT_GLOBAL: z.coerce.number().int().default(300),
  RATE_LIMIT_AUTH: z.coerce.number().int().default(10),
  BODY_LIMIT: z.coerce.number().int().default(1048576),
  HSTS_ENABLED: z
    .string()
    .optional()
    .transform((v) => String(v || '').toLowerCase() === 'true'),
  JWT_ACCESS_SECRET_PREV: z.string().optional().default(''),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

// helper: normalize CORS origins
export function getCorsOriginChecker() {
  if (env.CORS_ORIGINS === '*') return true; // allow all
  const allowList = env.CORS_ORIGINS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return (origin, cb) => {
    if (!origin) return cb(null, true); // allow non-browser tools
    cb(null, allowList.includes(origin));
  };
}

export default env;
