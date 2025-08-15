// Build Fastify app for tests (no listen)
import * as appModule from '../../src/app.js';

const buildApp = appModule.buildApp || appModule.default;

export async function createTestApp() {
  const app = await buildApp({ logger: false }); // logger false for quieter tests
  return app;
}
