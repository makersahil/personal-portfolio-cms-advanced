import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { createTestApp } from './helpers/app.js';

let app;

beforeAll(async () => {
  app = await createTestApp(); // ✅ returns a Fastify instance
});

afterAll(async () => {
  await app?.close();
});

describe('Health endpoints (smoke)', () => {
  it('GET /health/live → 200', async () => {
    const res = await app.inject({ method: 'GET', url: '/health/live' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ success: true, status: 'live' });
  });

  it('GET /health/ready → 200', async () => {
    const res = await app.inject({ method: 'GET', url: '/health/ready' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ success: true, status: 'ready' });
  });
});
