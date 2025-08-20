import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { createTestApp } from './helpers/app.js';
import { createArticle } from './helpers/factories.js';

let app, art;
beforeAll(async () => {
  app = await createTestApp();
  art = await createArticle({
    title: 'Quantum NN',
    journal: 'Nature AI',
    year: 2024,
    tags: ['quantum'],
  });
});
afterAll(async () => {
  await app?.close();
});

describe('Articles (public)', () => {
  it('list -> paginated', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/articles?page=1&pageSize=5&sort=-year',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.meta).toBeTruthy();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('detail -> by slug', async () => {
    const res = await app.inject({ method: 'GET', url: `/articles/${art.slug}` });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.slug).toBe(art.slug);
  });
});
