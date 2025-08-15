import { env } from './env.js';

export function parseCorsOrigins(csv) {
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const ALLOWLIST = new Set(parseCorsOrigins(env.CORS_ORIGINS));

export function corsOrigin(origin, cb) {
  // Allow server-to-server/no-origin (curl, Postman), block browser unknown origins
  if (!origin) return cb(null, true);
  if (ALLOWLIST.has(origin)) return cb(null, true);
  return cb(new Error('CORS origin not allowed'), false);
}

export function applySecurityHeaders(reply, isHttps = false) {
  // Always-on basic headers
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('Referrer-Policy', 'no-referrer');

  // Only set HSTS when behind HTTPS (avoid breaking local dev)
  if (env.HSTS_ENABLED && isHttps) {
    reply.header('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  // CSP is usually for HTML; since this is JSON APIs, we skip to avoid breaking docs/tools.
}
