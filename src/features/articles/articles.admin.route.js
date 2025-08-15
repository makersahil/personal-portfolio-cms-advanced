import fp from 'fastify-plugin';

import { requireRole } from '../../middleware/auth.middleware.js';

import { articleCreateBody, articleUpdateBody, articleIdParam } from './articles.admin.schema.js';
import { createArticle, updateArticle, deleteArticle } from './articles.admin.service.js';

export default fp(async (app) => {
  const adminOnly = { preHandler: [requireRole('admin')] };
  const writeRate = { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } };

  app.post('/', { ...adminOnly, ...writeRate }, async (req, reply) => {
    const parsed = articleCreateBody.safeParse(req.body);
    if (!parsed.success)
      return reply
        .code(400)
        .send({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Invalid body',
          details: parsed.error.flatten(),
        });

    const actorId = req.user?.sub ?? null;
    const data = await createArticle(actorId, parsed.data);
    return reply.code(201).send({ success: true, data });
  });

  app.put('/:id', { ...adminOnly, ...writeRate }, async (req, reply) => {
    const p = articleIdParam.safeParse(req.params);
    const b = articleUpdateBody.safeParse(req.body);
    if (!p.success || !b.success)
      return reply
        .code(400)
        .send({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Invalid data',
          details: { params: p.error?.flatten(), body: b.error?.flatten() },
        });

    const actorId = req.user?.sub ?? null;
    const data = await updateArticle(actorId, p.data.id, b.data);
    if (!data)
      return reply
        .code(404)
        .send({ success: false, code: 'NOT_FOUND', message: 'Article not found' });
    return reply.send({ success: true, data });
  });

  app.delete('/:id', { ...adminOnly, ...writeRate }, async (req, reply) => {
    const p = articleIdParam.safeParse(req.params);
    if (!p.success)
      return reply
        .code(400)
        .send({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Invalid id',
          details: p.error.flatten(),
        });

    const actorId = req.user?.sub ?? null;
    const ok = await deleteArticle(actorId, p.data.id);
    if (!ok)
      return reply
        .code(404)
        .send({ success: false, code: 'NOT_FOUND', message: 'Article not found' });
    return reply.send({ success: true, data: { id: p.data.id, deleted: true } });
  });
});
