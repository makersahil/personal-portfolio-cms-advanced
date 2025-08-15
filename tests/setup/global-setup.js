// Runs ONCE before all tests (main thread)
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { config as loadEnv } from 'dotenv';

export default async function () {
  const root = process.cwd();
  const envTestPath = path.join(root, '.env.test');

  // Load .env.test (fallback to .env)
  if (fs.existsSync(envTestPath)) loadEnv({ path: envTestPath });
  else loadEnv();

  process.env.NODE_ENV = 'test';

  // Do one-time DB prep here
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    execSync('npx prisma migrate reset -f --skip-seed', { stdio: 'inherit' });
  } catch (err) {
    // Throw (do NOT process.exit) so Vitest reports the error properly
    throw new Error(`Global DB setup failed:\n${err?.message || err}`);
  }
}
