import fp from 'fastify-plugin';
import cors from '@fastify/cors';

import { getCorsOriginChecker } from '../config/env.js';

export default fp(async (app) => {
  await app.register(cors, {
    origin: getCorsOriginChecker(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-Id'],
  });
});
