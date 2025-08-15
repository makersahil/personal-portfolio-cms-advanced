import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { createTestApp } from './helpers/app.js';
import { ensureAdminAndToken } from './helpers/auth.js';
import { upsertProfile } from './helpers/factories.js';

let app, token;
beforeAll(async () => {
  app = await createTestApp();
  token = await ensureAdminAndToken(app);
  await upsertProfile({ name: 'Initial', published: true });
});
afterAll(async () => {
  await app?.close();
});

describe('Profile (admin)', () => {
  it('GET /api/v1/admin/profile', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/profile',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
  });

  it('PUT /api/v1/admin/profile', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/api/v1/admin/profile',
      headers: { authorization: `Bearer ${token}` },
      payload: { title: 'New Title' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.title).toBe('New Title');
  });
});
