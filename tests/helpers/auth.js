import bcrypt from 'bcryptjs';

import prisma from './prisma.js';

// Create or upsert an admin and get a JWT via /login
export async function ensureAdminAndToken(
  app,
  { email = 'sahilkgupta@gmail.com', password = 'Sahil@@123', role = 'admin' } = {}
) {
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, role },
    create: { email, passwordHash, role },
  });

  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { email, password },
  });

  const body = res.json();
  if (res.statusCode !== 200) {
    throw new Error(`Login failed in test: ${res.statusCode} ${JSON.stringify(body)}`);
  }
  return body.data.token;
}
