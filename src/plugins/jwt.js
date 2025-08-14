import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

import env from '../config/env.js';

export default fp(async function (app) {
  // Register JWT once (access tokens). Refresh can be added later if needed.
  await app.register(fastifyJwt, {
    secret: env.JWT_ACCESS_SECRET,
  });

  // Authentication guard
  app.decorate('authenticate', async function (req, reply) {
    try {
      await req.jwtVerify();
    } catch {
      reply.code(401).send({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing token',
      });
    }
  });

  // Role guard
  app.decorate('requireRole', function (role) {
    return async function (req, reply) {
      await app.authenticate(req, reply);
      if (reply.sent) return;
      if (!req.user || req.user.role !== role) {
        reply.code(403).send({
          success: false,
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        });
      }
    };
  });
});
