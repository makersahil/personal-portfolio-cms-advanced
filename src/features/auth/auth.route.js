// src/features/auth/auth.route.js
import fp from 'fastify-plugin';

import { requireAuth } from '../../middleware/auth.middleware.js';
import env from '../../config/env.js';

import { loginHandler, meHandler } from './auth.controller.js';

// const requireAuth = async (req, reply) => {
//   try {
//     await req.jwtVerify();
//   } catch {
//     reply.code(401).send({
//       success: false,
//       code: 'UNAUTHORIZED',
//       message: 'Invalid or missing token',
//     });
//   }
// };

export default fp(async function (app) {
  // Per-route rate limit (since rate-limit is global:false)
  const loginRate = { config: { rateLimit: { max: env.RATE_LIMIT_AUTH, timeWindow: '1 minute' } } };

  // public
  app.post('/login', loginRate, loginHandler);

  // protected
  app.get('/me', { preHandler: [requireAuth] }, meHandler);
});
