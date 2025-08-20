// src/routes/index.js
import fp from 'fastify-plugin';

import articleRoutes from '../features/articles/articles.route.js';
import authRoutes from '../features/auth/auth.route.js';
import publicationRoutes from '../features/publications/publications.route.js';
import grantRoutes from '../features/grants/grants.route.js';
import patentRoutes from '../features/patents/patents.route.js';
import profileRoutes from '../features/profile/profile.route.js';
import certificationRoutes from '../features/certifications/certifications.route.js';
import searchRoutes from '../features/search/search.route.js';
import profileAdminRoutes from '../features/profile/profile.admin.route.js';
import articlesAdminRoutes from '../features/articles/articles.admin.route.js';
import publicationsAdminRoutes from '../features/publications/publications.admin.route.js';
import grantsAdminRoutes from '../features/grants/grants.admin.route.js';
import patentsAdminRoutes from '../features/patents/patents.admin.route.js';
import certificationsAdminRoutes from '../features/certifications/certifications.admin.route.js';

import healthRoutes from './health.route.js';
import metricsRoute from './metrics.route.js';

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

  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(profileRoutes);
    },
    { prefix: '/profile' }
  );

  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(articleRoutes);
    },
    { prefix: '/articles' }
  );

  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(publicationRoutes);
    },
    { prefix: '/publications' }
  );

  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(grantRoutes);
    },
    { prefix: '/grants' }
  );

  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(patentRoutes);
    },
    { prefix: '/patents' }
  );

  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(certificationRoutes);
    },
    { prefix: '/certifications' }
  );

  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(searchRoutes);
    },
    { prefix: '/api/v1/search' }
  );

  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(profileAdminRoutes);
    },
    { prefix: '/api/v1/admin/profile' }
  );

  app.register(
    async (api) => {
      api.register(metricsRoute);
    },
    { prefix: '/api/v1/metrics' } // may need to be edited
  );

  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(articlesAdminRoutes);
    },
    { prefix: '/api/v1/admin/articles' }
  );

  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(publicationsAdminRoutes);
    },
    { prefix: '/api/v1/admin/publications' }
  );

  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(grantsAdminRoutes);
    },
    { prefix: '/api/v1/admin/grants' }
  );

  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(patentsAdminRoutes);
    },
    { prefix: '/api/v1/admin/patents' }
  );

  app.register(
    async (api) => {
      // /api/v1/auth/*
      api.register(certificationsAdminRoutes);
    },
    { prefix: '/api/v1/admin/certifications' }
  );

  // Add other features here later:
  // app.register(async (pub) => {
  //   pub.register(profileRoutes, { prefix: '/profile' });
  //   pub.register(articleRoutes, { prefix: '/articles' });
  //   pub.register(publicationRoutes, { prefix: '/publications' });
  //   pub.register(grantRoutes, { prefix: '/grants' });
  //   pub.register(patentRoutes, { prefix: '/patents' });
  // });
  // TEMP DEBUG: list routes at startup (remove after confirming)
  app.ready(() => {
    // print to stdout so we can see exact paths & methods
    console.log('\n=== ROUTE MAP START ===');
    console.log(app.printRoutes());
    console.log('=== ROUTE MAP END ===\n');
  });
});
