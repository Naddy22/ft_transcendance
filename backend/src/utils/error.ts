// File: backend/src/utils/error.ts

import { FastifyReply } from 'fastify';
import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "production";

/**
 * A consistent way to handle and send error responses to the client.
 * Includes detailed error info in development mode.
 */
export function sendError(
  reply: FastifyReply,
  statusCode: number,
  errorMsg: string,
  error?: any
) {
  reply.log.error(error || errorMsg);

  const isDev = NODE_ENV === 'development';

  const response = isDev
    ? {
        error: errorMsg,
        // details: error?.message,
        // stack: error?.stack,
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    : {
        error: errorMsg,
      };

  if (isDev) {
    console.debug("🔍 Detailed error:", error);
    }

  return reply.status(statusCode).send(response);
};

/* 
https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

RFC9110 - HTTP Semantics - Status Codes
https://httpwg.org/specs/rfc9110.html#status.codes
https://httpwg.org/specs/rfc9110.html#overview.of.status.codes

HTTP Response Status Codes (easier to read than RFC9110)
https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

RFC9110 - HTTP Semantics - Methods
https://httpwg.org/specs/rfc9110.html#methods

HTTP Request Methods
https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods

Informational responses (100 – 199)

Successful responses    (200 – 299)
200 - ok
201 - created

Redirection messages    (300 – 399)

Client error responses  (400 – 499)
400 - bad request
401 - unauthorized
403 - forbidden
404 - not found
415 unsupported media type

Server error responses  (500 – 599)
500 - internal server error





*/
