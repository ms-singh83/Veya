import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ErrorResponse } from '@veya/shared';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError('NOT_FOUND', 'Route not found'));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = String(req.id ?? '');
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof ZodError) {
    appError = new AppError(
      'VALIDATION_ERROR',
      'Request validation failed',
      err.issues.map((i) => ({ path: i.path.join('.'), issue: i.code })),
    );
  } else if (isBodyParseError(err)) {
    appError = new AppError('VALIDATION_ERROR', 'Malformed JSON body');
  } else {
    req.log.error({ err }, 'unhandled error');
    appError = new AppError('INTERNAL_ERROR', 'Something went wrong');
  }

  const body: ErrorResponse = {
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
      request_id: requestId,
    },
  };
  res.status(appError.status).json(body);
};

function isBodyParseError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    (err as { type: unknown }).type === 'entity.parse.failed'
  );
}
