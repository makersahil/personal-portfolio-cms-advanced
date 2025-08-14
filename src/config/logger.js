import pino from 'pino';

export function createLogger() {
  const isProd = process.env.NODE_ENV === 'production';
  return pino({
    level: isProd ? 'info' : 'debug',
    redact: {
      paths: [
        'req.headers.authorization',
        'request.headers.authorization',
        'headers.authorization',
        'password',
        '*.password',
        'token',
        '*.token',
      ],
      censor: '[REDACTED]',
    },
    base: undefined,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  });
}
