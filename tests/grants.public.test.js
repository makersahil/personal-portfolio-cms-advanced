import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { createTestApp } from './helpers/app.js';
import { createGrant } from './helpers/factories.js';

let app, grant;
beforeAll(async () => {
  app = await createTestApp();
  grant = await createGrant({ year: 2022 });
});
afterAll(async () => {
  await app?.close();
});

describe('Grants (public)', () => {
  it('list -> filter by year', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/grants?year=2022' });
    expect(res.statusCode).toBe(200);
  });

  it('detail -> by slug', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/grants/${grant.slug}` });
    expect(res.statusCode).toBe(200);
  });
});
