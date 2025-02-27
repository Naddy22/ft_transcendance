// File: backend/src/shutdown.ts

import { FastifyInstance } from 'fastify';

/**
 * Handles graceful shutdown of the Fastify server.
 */
export function closeGracefully(fastify: FastifyInstance) {
  async function shutdown(signal: string) {
    console.log(`Received signal to terminate: ${signal}`);
    try {
      await fastify.close();
      console.log("Fastify server closed successfully.");
    } catch (error) {
      console.error("Error closing Fastify:", error);
    }
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
