import fp from 'fastify-plugin';

import { requireRole } from '../../middleware/auth.middleware.js';

import {
  certificationCreateBody,
  certificationUpdateBody,
  certificationIdParam,
} from './certifications.admin.schema.js';
import {
  createCertification,
  updateCertification,
  deleteCertification,
} from './certifications.admin.service.js';

export default fp(async (app) => {
  const adminOnly = { preHandler: [requireRole('admin')] };
  const writeRate = { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } };

  app.post('/', { ...adminOnly, ...writeRate }, async (req, reply) => {
    const b = certificationCreateBody.safeParse(req.body);
    if (!b.success)
      return reply
        .code(400)
        .send({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Invalid body',
          details: b.error.flatten(),
        });
    const data = await createCertification(req.user?.sub ?? null, b.data);
    reply.code(201).send({ success: true, data });
  });

  app.put('/:id', { ...adminOnly, ...writeRate }, async (req, reply) => {
    const p = certificationIdParam.safeParse(req.params);
    const b = certificationUpdateBody.safeParse(req.body);
    if (!p.success || !b.success)
      return reply
        .code(400)
        .send({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Invalid data',
          details: { params: p.error?.flatten(), body: b.error?.flatten() },
        });
    const data = await updateCertification(req.user?.sub ?? null, p.data.id, b.data);
    if (!data)
      return reply
        .code(404)
        .send({ success: false, code: 'NOT_FOUND', message: 'Certification not found' });
    reply.send({ success: true, data });
  });

  app.delete('/:id', { ...adminOnly, ...writeRate }, async (req, reply) => {
    const p = certificationIdParam.safeParse(req.params);
    if (!p.success)
      return reply
        .code(400)
        .send({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Invalid id',
          details: p.error.flatten(),
        });
    const ok = await deleteCertification(req.user?.sub ?? null, p.data.id);
    if (!ok)
      return reply
        .code(404)
        .send({ success: false, code: 'NOT_FOUND', message: 'Certification not found' });
    reply.send({ success: true, data: { id: p.data.id, deleted: true } });
  });
});
