import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { createTestApp } from './helpers/app.js';
import { createPublication } from './helpers/factories.js';

let app, pub;
beforeAll(async () => {
  app = await createTestApp();
  pub = await createPublication({ type: 'Book', year: 2024 });
});
afterAll(async () => {
  await app?.close();
});

describe('Publications (public)', () => {
  it('list -> filtered by type', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/publications?type=Book' });
    expect(res.statusCode).toBe(200);
  });

  it('detail -> by slug', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/publications/${pub.slug}` });
    expect(res.statusCode).toBe(200);
  });
});
