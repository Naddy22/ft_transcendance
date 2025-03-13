// File: backend/src/utils/error.ts

import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development"; // || "production"; // ?

/** Helper function for error handling
 * 
 */
// export function sendError(reply: any, statusCode: number, errorMsg: string, error?: any) {
//   reply.log.error(error || errorMsg);
//   return reply.status(statusCode).send({ error: errorMsg });
// }

export function sendError(reply: any, statusCode: number, errorMsg: string, error?: any) {
  reply.log.error(error || errorMsg);

  // Optionnaly, exposes more info in development:
  const response = NODE_ENV === 'development'
    ? { error: errorMsg, details: error?.message }
    : { error: errorMsg };
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
