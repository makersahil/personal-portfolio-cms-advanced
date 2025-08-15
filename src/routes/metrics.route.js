import fp from 'fastify-plugin';

import { register } from '../observability/metrics.js';

export default fp(async function (app) {
  app.get('/', async (_req, reply) => {
    reply.header('Content-Type', register.contentType);
    const body = await register.metrics();
    return reply.send(body);
  });
});
