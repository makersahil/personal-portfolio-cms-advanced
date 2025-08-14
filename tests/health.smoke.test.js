// tests/health.smoke.test.js
import { describe, it, beforeAll, afterAll, expect } from 'vitest';

import { buildApp } from '../src/app.js';

let app;

describe('Health endpoints (smoke)', () => {
  beforeAll(async () => {
    app = buildApp(); // do NOT call listen() in tests
  });

  afterAll(async () => {
    if (app?.close) await app.close(); // triggers onClose hooks (e.g., prisma disconnect)
  });

  it('GET /health/live → 200', async () => {
    const res = await app.inject({ method: 'GET', url: '/health/live' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ success: true, status: 'live' });
  });

  // Optional (enable if DB is reliably up during tests)
  // it('GET /health/ready → 200 when DB reachable', async () => {
  //   const res = await app.inject({ method: 'GET', url: '/health/ready' });
  //   expect([200, 503]).toContain(res.statusCode);
  // });
});
