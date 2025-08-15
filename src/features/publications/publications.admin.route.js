import fp from 'fastify-plugin';

import { requireRole } from '../../middleware/auth.middleware.js';

import {
  publicationCreateBody,
  publicationUpdateBody,
  publicationIdParam,
} from './publications.admin.schema.js';
import {
  createPublication,
  updatePublication,
  deletePublication,
} from './publications.admin.service.js';

export default fp(async (app) => {
  const adminOnly = { preHandler: [requireRole('admin')] };
  const writeRate = { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } };

  app.post('/', { ...adminOnly, ...writeRate }, async (req, reply) => {
    const b = publicationCreateBody.safeParse(req.body);
    if (!b.success)
      return reply
        .code(400)
        .send({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Invalid body',
          details: b.error.flatten(),
        });
    const actorId = req.user?.sub ?? null;
    const data = await createPublication(actorId, b.data);
    return reply.code(201).send({ success: true, data });
  });

  app.put('/:id', { ...adminOnly, ...writeRate }, async (req, reply) => {
    const p = publicationIdParam.safeParse(req.params);
    const b = publicationUpdateBody.safeParse(req.body);
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
    const data = await updatePublication(actorId, p.data.id, b.data);
    if (!data)
      return reply
        .code(404)
        .send({ success: false, code: 'NOT_FOUND', message: 'Publication not found' });
    return reply.send({ success: true, data });
  });

  app.delete('/:id', { ...adminOnly, ...writeRate }, async (req, reply) => {
    const p = publicationIdParam.safeParse(req.params);
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
    const ok = await deletePublication(actorId, p.data.id);
    if (!ok)
      return reply
        .code(404)
        .send({ success: false, code: 'NOT_FOUND', message: 'Publication not found' });
    return reply.send({ success: true, data: { id: p.data.id, deleted: true } });
  });
});
