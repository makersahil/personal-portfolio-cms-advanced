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

describe('Patents (admin)', () => {
  it('POST create', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/patents',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title: 'Sensing Device',
        country: 'IN',
        patentNo: 'IN-999999',
        year: 2022,
        inventorsList: [{ firstName: 'Tripuresh', lastName: 'Joshi' }],
      },
    });
    expect(res.statusCode).toBe(201);
    id = res.json().data.id;
  });

  it('PUT update', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/admin/patents/${id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { country: 'US' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.country).toBe('US');
  });

  it('DELETE remove', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/admin/patents/${id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
  });
});
