import { Writable } from 'node:stream';
import express from 'express';
import { pino } from 'pino';
import { pinoHttp } from 'pino-http';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { ErrorResponseSchema, HealthResponseSchema } from '@veya/shared';
import { createApp } from '../src/app';
import { loadEnv } from '../src/env';
import { REDACT_PATHS } from '../src/lib/logger';
import { errorHandler } from '../src/middleware/errorHandler';

const silent = pino({ level: 'silent' });
const app = createApp(loadEnv({ NODE_ENV: 'test' }), silent);

describe('GET /health', () => {
  it('returns ok with the service name and version', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(HealthResponseSchema.parse(res.body)).toEqual({
      status: 'ok',
      service: 'veya-api',
      version: '0.1.0',
    });
  });

  it('sets a request id header', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-request-id']).toMatch(/^req_/);
  });

  it('reuses a well-formed incoming request id', async () => {
    const res = await request(app).get('/health').set('x-request-id', 'client-abc-12345');
    expect(res.headers['x-request-id']).toBe('client-abc-12345');
  });

  it('ignores a malformed incoming request id', async () => {
    const res = await request(app).get('/health').set('x-request-id', 'bad id with spaces');
    expect(res.headers['x-request-id']).toMatch(/^req_/);
  });
});

describe('error envelope', () => {
  it('returns NOT_FOUND for unknown routes', async () => {
    const res = await request(app).get('/nope').expect(404);
    const body = ErrorResponseSchema.parse(res.body);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.request_id).toBe(res.headers['x-request-id']);
  });

  it('returns VALIDATION_ERROR for malformed JSON', async () => {
    const res = await request(app)
      .post('/health')
      .set('content-type', 'application/json')
      .send('{"oops":');
    expect(res.status).toBe(400);
    expect(ErrorResponseSchema.parse(res.body).error.code).toBe('VALIDATION_ERROR');
  });

  it('hides internal error details', async () => {
    const boom = express();
    boom.use(pinoHttp({ logger: silent }));
    boom.get('/boom', () => {
      throw new Error('secret internals');
    });
    boom.use(errorHandler);

    const res = await request(boom).get('/boom').expect(500);
    expect(ErrorResponseSchema.parse(res.body).error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(res.body)).not.toContain('secret internals');
  });
});

describe('env', () => {
  it('rejects an invalid port', () => {
    expect(() => loadEnv({ PORT: 'not-a-port' })).toThrow(/PORT/);
  });
});

describe('logger redaction', () => {
  it('never writes authorization headers or health content', () => {
    const lines: string[] = [];
    const sink = new Writable({
      write(chunk, _enc, cb) {
        lines.push(String(chunk));
        cb();
      },
    });
    const log = pino({ redact: { paths: REDACT_PATHS, censor: '[REDACTED]' } }, sink);
    log.info({
      req: { headers: { authorization: 'Bearer secret-token' } },
      body: { content: 'I have a headache', description: '2 rotis', notes: 'private' },
    });
    const output = lines.join('');
    expect(output).not.toContain('secret-token');
    expect(output).not.toContain('headache');
    expect(output).not.toContain('2 rotis');
    expect(output).toContain('[REDACTED]');
  });
});
