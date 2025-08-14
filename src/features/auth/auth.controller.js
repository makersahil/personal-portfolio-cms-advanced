import { loginSchema } from './auth.schema.js';
import { findAdminByEmail, verifyPassword } from './auth.service.js';

export async function loginHandler(req, reply) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.code(400).send({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: parsed.error.flatten(),
    });
  }
  const { email, password } = parsed.data;

  const admin = await findAdminByEmail(email);
  if (!admin) {
    return reply.code(401).send({
      success: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    });
  }

  const match = await verifyPassword(password, admin.passwordHash);
  if (!match) {
    return reply.code(401).send({
      success: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    });
  }

  // sign short-lived access token
  const token = req.server.jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role },
    { expiresIn: '15m' }
  );

  return reply.send({
    success: true,
    message: 'Login successful',
    data: { token },
  });
}

export async function meHandler(req, reply) {
  // req.user set by authenticate()
  return reply.send({
    success: true,
    data: {
      id: req.user.sub,
      email: req.user.email,
      role: req.user.role,
    },
  });
}
