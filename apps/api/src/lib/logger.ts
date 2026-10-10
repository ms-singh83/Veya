import { pino, type Logger } from 'pino';

/**
 * Paths that must never reach logs: credentials and any user-provided health content.
 * See docs/05-api-spec.md (Logging) and docs/09-safety-privacy.md.
 */
export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'res.headers["set-cookie"]',
  '*.password',
  '*.access_token',
  '*.refresh_token',
  '*.content',
  '*.description',
  '*.notes',
];

export function createLogger(level: string, pretty = false): Logger {
  return pino({
    level,
    base: { service: 'veya-api' },
    redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
    ...(pretty ? { transport: { target: 'pino-pretty', options: { colorize: true } } } : {}),
  });
}
