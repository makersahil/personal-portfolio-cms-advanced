// src/middlewares/auth.middleware.js
// Reusable Fastify preHandlers for auth. No reliance on app.decorate timing.
// Requires @fastify/jwt to be registered in app.js before routes.

export async function requireAuth(req, reply) {
  try {
    await req.jwtVerify(); // attaches decoded token to req.user
  } catch {
    return reply.code(401).send({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Invalid or missing token',
    });
  }
}

// Optional auth (no 401). Useful for endpoints that behave differently if logged in.
export async function optionalAuth(req, _reply) {
  try {
    await req.jwtVerify();
  } catch {
    req.user = null;
  }
}

// Role-based guard (verifies + checks role)
export function requireRole(role) {
  return async function (req, reply) {
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing token',
      });
    }

    if (!req.user || req.user.role !== role) {
      return reply.code(403).send({
        success: false,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      });
    }
  };
}
