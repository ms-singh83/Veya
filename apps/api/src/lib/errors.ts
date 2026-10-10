import type { ErrorCode } from '@veya/shared';

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONSENT_REQUIRED: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  AI_OUTPUT_INVALID: 502,
  AI_PROVIDER_UNAVAILABLE: 503,
};

export interface ErrorDetail {
  path: string;
  issue: string;
}

/** An expected, client-facing error. Anything else is reported as INTERNAL_ERROR. */
export class AppError extends Error {
  readonly status: number;

  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = 'AppError';
    this.status = STATUS_BY_CODE[code];
  }
}
