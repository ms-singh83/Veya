import express, { type Express } from 'express';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import type { Env } from './env';
import { genRequestId } from './middleware/requestId';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';

export function createApp(env: Env, logger: Logger): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    pinoHttp({
      logger,
      genReqId: genRequestId,
      // Log method + path only; never query strings or bodies (may contain health data).
      serializers: {
        req: (req: { id: unknown; method: string; url: string }) => ({
          id: req.id,
          method: req.method,
          path: req.url.split('?')[0],
        }),
      },
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.use(healthRouter(env.APP_VERSION));
  // Versioned routes are mounted here from Day 3 onward: app.use('/api/v1', v1Router)

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
