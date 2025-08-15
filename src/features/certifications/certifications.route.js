// Public: list + detail
import fp from 'fastify-plugin';

import { certificationListQuery, certificationSlugParam } from './certifications.schema.js';
import { listCertifications, getCertificationBySlug } from './certifications.service.js';

export default fp(async (app) => {
  // GET /certifications
  app.get('/', async (req, reply) => {
    const parsed = certificationListQuery.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Invalid query',
        details: parsed.error.flatten(),
      });
    }
    const { data, total, page, pageSize } = await listCertifications(parsed.data);
    return reply.send({
      success: true,
      data,
      meta: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) },
    });
  });

  // GET /certifications/:slug
  app.get('/:slug', async (req, reply) => {
    const parsed = certificationSlugParam.safeParse(req.params);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Invalid slug',
        details: parsed.error.flatten(),
      });
    }
    const item = await getCertificationBySlug(parsed.data.slug);
    if (!item) {
      return reply.code(404).send({
        success: false,
        code: 'NOT_FOUND',
        message: 'Certification not found',
      });
    }
    return reply.send({ success: true, data: item });
  });
});
