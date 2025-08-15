import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { createTestApp } from './helpers/app.js';
import { ensureAdminAndToken } from './helpers/auth.js';

let app, token, id;
beforeAll(async () => {
  app = await createTestApp();
  token = await ensureAdminAndToken(app);
});
afterAll(async () => {
  await app?.close();
});

describe('Publications (admin)', () => {
  it('POST create', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/publications',
      headers: { authorization: `Bearer ${token}` },
      payload: { title: 'AI & Ethics', description: '...', type: 'Book', year: 2024 },
    });
    expect(res.statusCode).toBe(201);
    id = res.json().data.id;
  });

  it('PUT update', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/admin/publications/${id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { publisher: 'Oxford' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.publisher).toBe('Oxford');
  });

  it('DELETE remove', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/admin/publications/${id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
  });
});
