import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { createTestApp } from './helpers/app.js';
import { ensureAdminAndToken } from './helpers/auth.js';

let app;
beforeAll(async () => {
  app = await createTestApp();
});
afterAll(async () => {
  await app?.close();
});

describe('Auth', () => {
  it('login returns token and /me works', async () => {
    const token = await ensureAdminAndToken(app, {
      email: 'admin@test.local',
      password: 'secret123',
    });

    const me = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(me.statusCode).toBe(200);
    const body = me.json();
    expect(body.success).toBe(true);
    expect(body.data.email).toBe('admin@test.local');
  });

  it('me without token -> 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/auth/me' });
    expect(res.statusCode).toBe(401);
  });
});
