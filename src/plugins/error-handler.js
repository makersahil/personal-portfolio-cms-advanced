import fp from 'fastify-plugin';
import { ZodError } from 'zod';

function formatError(err) {
  let status = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Something went wrong';
  let details;

  // Zod validation
  if (err instanceof ZodError) {
    status = 400;
    code = 'VALIDATION_ERROR';
    details = err.flatten();
    message = 'Invalid request data';
  }

  // Fastify content-type errors
  if (err.code === 'FST_ERR_CTP_INVALID_MEDIA_TYPE') {
    status = 415;
    code = 'UNSUPPORTED_MEDIA_TYPE';
    message = 'Unsupported content type';
  }

  // Prisma known errors (optional mapping)
  if (typeof err.code === 'string' && err.code.startsWith('P2')) {
    status = 400;
    code = `DB_${err.code}`;
    message = err.message || 'Database error';
    details = err.meta || details;
  }

  return {
    status,
    body: {
      success: false,
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}

export default fp(async (app) => {
  app.setErrorHandler((err, req, reply) => {
    req.log.error({ err }, 'request failed');
    const { status, body } = formatError(err);
    reply.code(status).send(body);
  });
});
