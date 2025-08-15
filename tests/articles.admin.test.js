import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { createTestApp } from './helpers/app.js';
import { ensureAdminAndToken } from './helpers/auth.js';

let app, token, createdId;
beforeAll(async () => {
  app = await createTestApp();
  token = await ensureAdminAndToken(app);
});
afterAll(async () => {
  await app?.close();
});

describe('Articles (admin)', () => {
  it('POST create', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/articles',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title: 'New Article',
        journal: 'J1',
        year: 2024,
        authorsList: [{ firstName: 'A', lastName: 'B' }],
      },
    });
    expect(res.statusCode).toBe(201);
    createdId = res.json().data.id;
  });

  it('PUT update', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/admin/articles/${createdId}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: 'Updated Title' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.title).toBe('Updated Title');
  });

  it('DELETE remove', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/admin/articles/${createdId}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.deleted).toBe(true);
  });
});
