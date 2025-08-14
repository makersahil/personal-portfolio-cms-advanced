// src/app.js
import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';

import { createLogger } from './config/logger.js';
import env from './config/env.js';
import corsPlugin from './plugins/cors.js';
import jwtPlugin from './plugins/jwt.js';
import routes from './routes/index.js';
import errorHandler from './plugins/error-handler.js';

export function buildApp(opts = {}) {
  const app = Fastify({
    loggerInstance: createLogger(),
    genReqId(req) {
      return (
        req.headers['x-request-id'] ||
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
      );
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
    ...opts,
  });

  // Core plugins
  app.register(corsPlugin);

  // rate-limit: disable global; use per-route configs
  app.register(rateLimit, { global: false });

  // JWT plugin (adds app.authenticate / app.requireRole)
  app.register(jwtPlugin);

  // ✅ Register all routes through the routes hub
  // (Health is included there; feature routes will be added later)
  app.register(routes);

  // Error handler last to catch everything above
  app.register(errorHandler);

  // Optionally expose validated env
  app.decorate('config', env);

  return app;
}
