import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

import { env } from '../src/config/env.js';

export default fp(async function (app) {
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Professor Portfolio API',
        description: 'Public + Admin API for the personal portfolio backend',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    hideUntagged: true,
  });

  // Always expose raw JSON at /docs/json (useful for CI exporting)
  app.get('/docs/json', async (_req, reply) => {
    return reply.send(app.swagger());
  });

  // Swagger UI only in non-production
  if (env.NODE_ENV !== 'production') {
    await app.register(swaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
      staticCSP: true,
    });
  }
});
