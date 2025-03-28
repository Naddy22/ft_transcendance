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
