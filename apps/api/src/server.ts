import { createApp } from './app';
import { loadEnv } from './env';
import { createLogger } from './lib/logger';

const env = loadEnv();
const logger = createLogger(env.LOG_LEVEL, env.NODE_ENV === 'development');
const app = createApp(env, logger);

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'veya-api listening');
});

function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
