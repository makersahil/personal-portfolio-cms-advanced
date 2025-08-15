import { buildApp } from './app.js';
import env from './config/env.js';

const app = await buildApp();
const port = env.PORT;
const host = process.env.HOST || '0.0.0.0';

app
  .listen({ port, host })
  .then(() => app.log.info({ port, host }, 'server listening'))
  .catch((err) => {
    app.log.error({ err }, 'failed to start');
    process.exit(1);
  });
