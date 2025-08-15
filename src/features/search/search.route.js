import fp from 'fastify-plugin';

import { searchQuery } from './search.schema.js';
import { unifiedSearch } from './search.service.js';

export default fp(async (app) => {
  app.get('/', async (req, reply) => {
    const parsed = searchQuery.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Invalid query',
        details: parsed.error.flatten(),
      });
    }
    const { data, total, page, pageSize, pages } = await unifiedSearch(parsed.data);
    reply.send({ success: true, data, meta: { page, pageSize, total, pages } });
  });
});
