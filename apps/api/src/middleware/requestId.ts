import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

const HEADER = 'x-request-id';
const SAFE_ID = /^[A-Za-z0-9_-]{8,64}$/;

/** Reuses a well-formed incoming request id, otherwise creates one. Echoed back in the response. */
export function genRequestId(req: IncomingMessage, res: ServerResponse): string {
  const incoming = req.headers[HEADER];
  const id =
    typeof incoming === 'string' && SAFE_ID.test(incoming) ? incoming : `req_${randomUUID()}`;
  res.setHeader(HEADER, id);
  return id;
}
