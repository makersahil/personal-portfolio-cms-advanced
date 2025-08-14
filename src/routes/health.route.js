import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

let prisma; // lazy init

export default fp(async (app) => {
  app.get('/health/live', async () => ({ success: true, status: 'live' }));

  app.get('/health/ready', async (req, reply) => {
    try {
      if (!prisma) prisma = new PrismaClient();
      await prisma.$queryRaw`SELECT 1`;
      return { success: true, status: 'ready', db: 'ok' };
    } catch (err) {
      req.log.error({ err }, 'db readiness failed');
      reply.code(503);
      return { success: false, code: 'READINESS_FAILED', message: 'Database is not reachable' };
    }
  });

  app.addHook('onClose', async () => {
    if (prisma) await prisma.$disconnect().catch(() => {});
  });
});
