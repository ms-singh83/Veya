import { z } from 'zod';

/** Error codes returned by the API (see docs/05-api-spec.md). */
export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'CONSENT_REQUIRED',
  'RATE_LIMITED',
  'AI_PROVIDER_UNAVAILABLE',
  'AI_OUTPUT_INVALID',
  'INTERNAL_ERROR',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.enum(ERROR_CODES),
    message: z.string(),
    details: z.array(z.object({ path: z.string(), issue: z.string() })).optional(),
    request_id: z.string(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
