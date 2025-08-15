import fp from 'fastify-plugin';

import { requireRole } from '../../middleware/auth.middleware.js';

import { profileUpdateBody } from './profile.admin.schema.js';
import { getAdminProfile, updateAdminProfile } from './profile.admin.service.js';

export default fp(async (app) => {
  const adminOnly = { preHandler: [requireRole('admin')] };

  app.get('/', adminOnly, async (_req, reply) => {
    const data = await getAdminProfile();
    return reply.send({ success: true, data });
  });

  app.put('/', adminOnly, async (req, reply) => {
    const parsed = profileUpdateBody.safeParse(req.body);
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
    const data = await updateAdminProfile(actorId, parsed.data);
    return reply.send({ success: true, data });
  });
});
