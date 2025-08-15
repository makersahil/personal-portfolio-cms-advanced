import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { createTestApp } from './helpers/app.js';
import { upsertProfile } from './helpers/factories.js';

let app;
beforeAll(async () => {
  app = await createTestApp();
  await upsertProfile({ published: true });
});
afterAll(async () => {
  await app?.close();
});

describe('Profile (public)', () => {
  it('GET /profile -> returns latest published profile', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/profile' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBeTruthy();
  });
});
