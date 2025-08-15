import client from 'prom-client';

export const register = new client.Registry();

// Default Node/process metrics
client.collectDefaultMetrics({ register, prefix: 'portfolio_' });

// HTTP metrics
export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});
export const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationSeconds);

// DB metrics
export const dbQueriesTotal = new client.Counter({
  name: 'db_queries_total',
  help: 'Total Prisma DB queries',
  labelNames: ['model', 'action', 'success'],
});
export const dbQueryDurationSeconds = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Prisma DB query duration in seconds',
  labelNames: ['model', 'action', 'success'],
  buckets: [0.002, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5],
});
register.registerMetric(dbQueriesTotal);
register.registerMetric(dbQueryDurationSeconds);

// Helper for route label
export function routeLabel(req) {
  return req?.routeOptions?.url || req?.routerPath || req?.url || 'unknown';
}
