import { randomUUID } from 'node:crypto';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { createTestApp } from './helpers/app.js';
import {
  createArticle,
  createPublication,
  createGrant,
  createPatent,
  createCertification,
} from './helpers/factories.js';

let app;
beforeAll(async () => {
  app = await createTestApp();
});
afterAll(async () => {
  await app?.close();
});

describe('Search (public)', () => {
  it('returns empty dataset with meta when nothing matches', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/search?q=__nothing-to-match__&page=1&pageSize=5',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(0);
    expect(body.meta).toMatchObject({ page: 1, pageSize: 5 });
  });

  it('merges results across kinds and returns kind field', async () => {
    const token = `K-${randomUUID()}`;
    await createArticle({ title: `Article ${token}`, journal: 'J1', year: 2024 });
    await createPublication({
      title: `Publication ${token}`,
      description: 'Desc',
      type: 'Book',
      year: 2023,
    });
    await createGrant({ title: `Grant ${token}`, summary: 'Sum', year: 2022 });
    await createPatent({
      title: `Patent ${token}`,
      country: 'IN',
      patentNo: `IN-${Math.floor(Math.random() * 1e6)}`,
      year: 2021,
    });
    await createCertification({ title: `Certification ${token}`, issuer: 'Issuer', year: 2020 });

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/search?q=${encodeURIComponent(token)}&page=1&pageSize=10`,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(5);

    const kinds = new Set(body.data.map((x) => x.kind));
    expect(kinds).toEqual(new Set(['article', 'publication', 'grant', 'patent', 'certification']));
    expect(body.meta.total).toBe(5);
  });

  it('filters by kind=publication and respects query', async () => {
    const token = `P-${randomUUID()}`;
    await createPublication({
      title: `AI Ethics ${token}`,
      description: 'A',
      type: 'Book',
      year: 2024,
    });
    await createPublication({
      title: `AI Methods ${token}`,
      description: 'B',
      type: 'Conference',
      year: 2022,
    });

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/search?kind=publication&q=${encodeURIComponent(token)}&page=1&pageSize=10`,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(2);
    body.data.forEach((row) => expect(row.kind).toBe('publication'));
  });

  it('sorts by year desc when sort=-year', async () => {
    const token = `S-${randomUUID()}`;
    await createPublication({
      title: `Monograph ${token}`,
      description: 'x',
      type: 'Book',
      year: 2021,
    });
    await createPublication({
      title: `Monograph ${token}`,
      description: 'y',
      type: 'Book',
      year: 2024,
    });
    await createPublication({
      title: `Monograph ${token}`,
      description: 'z',
      type: 'Book',
      year: 2022,
    });

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/search?kind=publication&q=${encodeURIComponent(token)}&sort=-year&page=1&pageSize=10`,
    });
    expect(res.statusCode).toBe(200);
    const years = res.json().data.map((x) => x.year);
    expect(years).toEqual([2024, 2022, 2021]);
  });

  it('paginates results (kind=article)', async () => {
    const token = `A-${randomUUID()}`;
    // Create 12 articles to test pagination
    for (let i = 0; i < 12; i++) {
      await createArticle({ title: `A${i} ${token}`, journal: 'J', year: 2020 + (i % 3) });
    }

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/search?kind=article&q=${encodeURIComponent(token)}&page=2&pageSize=5`,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(5);
    expect(body.meta).toMatchObject({ page: 2, pageSize: 5, total: 12, pages: 3 });
  });
});
