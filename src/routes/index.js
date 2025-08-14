// src/routes/index.js
import fp from 'fastify-plugin';

import authRoutes from '../features/auth/auth.route.js';

import healthRoutes from './health.route.js';

/**
 * Central route hub.
 * Registers all route modules. For now: health.
 * Add feature routes here later with prefixes (e.g., /api/v1/...).
 */
export default fp(async (app) => {
  // Health routes → /health/live and /health/ready
  app.register(healthRoutes);

  // Grouped API under /api/v1
  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(authRoutes);
    },
    { prefix: '/api/v1/auth' }
  );

  // Add other features here later:
  // api.register(grantsRoutes, { prefix: '/grants' });
  // api.register(articlesRoutes, { prefix: '/articles' });
  // api.register(patentsRoutes, { prefix: '/patents' });
  // api.register(publicationsRoutes, { prefix: '/publications' });

  // TEMP DEBUG: list routes at startup (remove after confirming)
  app.ready(() => {
    // print to stdout so we can see exact paths & methods
    console.log('\n=== ROUTE MAP START ===');
    console.log(app.printRoutes());
    console.log('=== ROUTE MAP END ===\n');
  });
});
