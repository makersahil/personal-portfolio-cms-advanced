import fp from 'fastify-plugin';

import { getPublicProfile } from './profile.service.js';

export default fp(async (app) => {
  app.get('/', async (_req, reply) => {
    const data = await getPublicProfile();
    if (!data)
      return reply
        .code(404)
        .send({ success: false, code: 'NOT_FOUND', message: 'Profile not found' });
    reply.send({ success: true, data });
  });
});
