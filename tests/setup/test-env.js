// Loads .env.test, resets DB, generates Prisma client before test run.
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

import { config } from 'dotenv';

const root = process.cwd();
const envTestPath = path.join(root, '.env.test');
if (fs.existsSync(envTestPath)) {
  config({ path: envTestPath });
} else {
  // Fallback to .env if .env.test not present
  config();
}

process.env.NODE_ENV = 'test';

try {
  // Ensure prisma client is generated
  execSync('npx prisma generate', { stdio: 'inherit' });
  // Hard reset test DB without seeding (tests create their own data)
  execSync('npx prisma migrate reset -f --skip-seed', { stdio: 'inherit' });
} catch (err) {
  console.error('Test DB setup failed:', err);
  process.exit(1);
}
