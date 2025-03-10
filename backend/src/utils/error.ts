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
