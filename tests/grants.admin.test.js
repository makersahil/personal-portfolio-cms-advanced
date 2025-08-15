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

describe('Grants (admin)', () => {
  it('POST create', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/grants',
      headers: { authorization: `Bearer ${token}` },
      payload: { title: 'Grant X', summary: 'Summary', year: 2023 },
    });
    expect(res.statusCode).toBe(201);
    id = res.json().data.id;
  });

  it('PUT update', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/admin/grants/${id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { year: 2024 },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.year).toBe(2024);
  });

  it('DELETE remove', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/admin/grants/${id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
  });
});
