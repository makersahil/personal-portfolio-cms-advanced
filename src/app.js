// src/app.js
import { randomUUID } from 'node:crypto';

import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';

import { loggerOptions } from './config/logger.js';
import env from './config/env.js';
import corsPlugin from './plugins/cors.js';
import jwtPlugin from './plugins/jwt.js';
import routes from './routes/index.js';
// import openapiPlugin from './docs/openapi.plugin.js';
import {
  httpRequestsTotal,
  httpRequestDurationSeconds,
  routeLabel,
} from './observability/metrics.js';
import errorHandler from './plugins/error-handler.js';

export async function buildApp(opts = {}) {
  const app = Fastify({
    logger: opts.logger ?? loggerOptions, // ✅ use the instance
    disableRequestLogging: true,
    requestIdHeader: 'x-request-id',
    genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
  });

  // Annotate responses with x-request-id
  app.addHook('onRequest', async (req, reply) => {
    if (req.id) reply.header('x-request-id', req.id);
    // store high-res start time for metrics
    req._startAt = process.hrtime.bigint();
  });

  app.addHook('onResponse', async (req, reply) => {
    const start = req._startAt || process.hrtime.bigint();
    const durSec = Number(process.hrtime.bigint() - start) / 1e9;
    const route = routeLabel(req);
    const method = req.method;
    const status = String(reply.statusCode);

    // metrics
    httpRequestsTotal.inc({ method, route, status });
    httpRequestDurationSeconds.observe({ method, route, status }, durSec);

    // structured info log
    app.log.info(
      {
        reqId: req.id,
        method,
        route,
        url: req.url,
        statusCode: reply.statusCode,
        durationMs: Math.round(durSec * 1000),
      },
      'request completed'
    );
  });

  // await app.register(openapiPlugin);

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
