import bcrypt from 'bcryptjs';

import prisma from '../../config/db.js';

export async function findAdminByEmail(email) {
  return prisma.admin.findUnique({ where: { email } });
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
