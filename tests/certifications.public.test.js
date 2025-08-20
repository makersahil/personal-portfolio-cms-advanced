import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { createTestApp } from './helpers/app.js';
import { createCertification } from './helpers/factories.js';

let app, cert;
beforeAll(async () => {
  app = await createTestApp();
  cert = await createCertification({ year: 2024 });
});
afterAll(async () => {
  await app?.close();
});

describe('Certifications (public)', () => {
  it('list -> ok', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/certifications?page=1&pageSize=5',
    });
    expect(res.statusCode).toBe(200);
  });

  it('detail -> by slug', async () => {
    const res = await app.inject({ method: 'GET', url: `/certifications/${cert.slug}` });
    expect(res.statusCode).toBe(200);
  });
});
