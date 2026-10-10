import { Router } from 'express';
import type { HealthResponse } from '@veya/shared';

export function healthRouter(version: string): Router {
  const router = Router();
  router.get('/health', (_req, res) => {
    const body: HealthResponse = { status: 'ok', service: 'veya-api', version };
    res.json(body);
  });
  return router;
}
