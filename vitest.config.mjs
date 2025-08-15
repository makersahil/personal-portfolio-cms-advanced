import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: ['./tests/setup/global-setup.js'],
    setupFiles: ['./tests/setup/per-worker.js'], // optional
    include: ['tests/**/*.test.js'],
    hookTimeout: 120_000,
    testTimeout: 60_000,
    poolOptions: { threads: { singleThread: true } } // safer with shared DB
  }
});
