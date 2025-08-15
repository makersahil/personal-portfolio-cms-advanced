import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { createTestApp } from './helpers/app.js';
import { createPatent } from './helpers/factories.js';

let app, pat;
beforeAll(async () => {
  app = await createTestApp();
  pat = await createPatent({ country: 'IN', year: 2022 });
});
afterAll(async () => {
  await app?.close();
});

describe('Patents (public)', () => {
  it('list -> query', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/patents?q=IN' });
    expect(res.statusCode).toBe(200);
  });

  it('detail -> by slug', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/patents/${pat.slug}` });
    expect(res.statusCode).toBe(200);
  });
});
