import fp from 'fastify-plugin';

import { patentListQuery, patentSlugParam } from './patents.schema.js';
import { listPatents, getPatentBySlug } from './patents.service.js';

export default fp(async (app) => {
  app.get('/', async (req, reply) => {
    const parsed = patentListQuery.safeParse(req.query);
    if (!parsed.success)
      return reply
        .code(400)
        .send({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Invalid query',
          details: parsed.error.flatten(),
        });

    const { data, total, page, pageSize } = await listPatents(parsed.data);
    reply.send({
      success: true,
      data,
      meta: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) },
    });
  });

  app.get('/:slug', async (req, reply) => {
    const parsed = patentSlugParam.safeParse(req.params);
    if (!parsed.success)
      return reply
        .code(400)
        .send({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Invalid slug',
          details: parsed.error.flatten(),
        });

    const item = await getPatentBySlug(parsed.data.slug);
    if (!item || item.published === false)
      return reply
        .code(404)
        .send({ success: false, code: 'NOT_FOUND', message: 'Patent not found' });

    reply.send({ success: true, data: item });
  });
});
