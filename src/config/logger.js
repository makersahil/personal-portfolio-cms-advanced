import pino from 'pino';

import env from './env.js';

const redact = {
  paths: [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.headers["set-cookie"]',
    'response.headers["set-cookie"]',
    'password',
    'token',
  ],
  remove: true,
};

export const loggerOptions = {
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact,
  base: null, // no pid/hostname
  timestamp: pino.stdTimeFunctions.isoTime,
};
