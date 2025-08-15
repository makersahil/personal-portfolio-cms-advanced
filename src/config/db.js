// src/config/db.js
import { PrismaClient } from '@prisma/client';

import { dbQueriesTotal, dbQueryDurationSeconds } from '../observability/metrics.js';

// Enable query events for the fallback path
let prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Prefer modern query extension (Prisma v5+)
if (typeof prisma.$extends === 'function') {
  prisma = prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const start = process.hrtime.bigint();
          let success = 'true';
          try {
            const result = await query(args);
            return result;
          } catch (e) {
            success = 'false';
            throw e;
          } finally {
            const end = process.hrtime.bigint();
            const sec = Number(end - start) / 1e9;
            dbQueriesTotal.inc({ model: model || 'unknown', action: operation || 'op', success });
            dbQueryDurationSeconds.observe(
              { model: model || 'unknown', action: operation || 'op', success },
              sec
            );
          }
        },
      },
    },
  });
}
// Older Prisma (v2/3/4): use middleware if available
else if (typeof prisma.$use === 'function') {
  prisma.$use(async (params, next) => {
    const start = process.hrtime.bigint();
    let success = 'true';
    try {
      const result = await next(params);
      return result;
    } catch (e) {
      success = 'false';
      throw e;
    } finally {
      const end = process.hrtime.bigint();
      const sec = Number(end - start) / 1e9;
      const model = params.model || 'raw';
      const action = params.action || 'query';
      dbQueriesTotal.inc({ model, action, success });
      dbQueryDurationSeconds.observe({ model, action, success }, sec);
    }
  });
}
// Fallback: event listener (needs log: query emit)
else if (typeof prisma.$on === 'function') {
  prisma.$on('query', (e) => {
    // e: { query, params, duration, target }
    const sec = (e.duration || 0) / 1000; // duration is ms
    dbQueriesTotal.inc({ model: 'unknown', action: 'query', success: 'true' });
    dbQueryDurationSeconds.observe({ model: 'unknown', action: 'query', success: 'true' }, sec);
  });
}

export default prisma;
