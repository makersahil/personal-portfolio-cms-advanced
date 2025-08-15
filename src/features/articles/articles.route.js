import fp from 'fastify-plugin';

import { articleListQuery, articleSlugParam } from './articles.schema.js';
import { listArticles, getArticleBySlug } from './articles.service.js';

export default fp(async (app) => {
  // GET /articles
  app.get('/', async (req, reply) => {
    const parsed = articleListQuery.safeParse(req.query);
    if (!parsed.success)
      return reply
        .code(400)
        .send({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Invalid query',
          details: parsed.error.flatten(),
        });

    const { data, total, page, pageSize } = await listArticles(parsed.data);
    reply.send({
      success: true,
      data,
      meta: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) },
    });
  });

  // GET /articles/:slug
  app.get('/:slug', async (req, reply) => {
    const parsed = articleSlugParam.safeParse(req.params);
    if (!parsed.success)
      return reply
        .code(400)
        .send({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Invalid slug',
          details: parsed.error.flatten(),
        });

    const item = await getArticleBySlug(parsed.data.slug);
    if (!item || item.published === false)
      return reply
        .code(404)
        .send({ success: false, code: 'NOT_FOUND', message: 'Article not found' });

    reply.send({ success: true, data: item });
  });
});
