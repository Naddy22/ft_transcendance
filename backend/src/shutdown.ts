// File: backend/src/shutdown.ts
// Ensures Fastify and SQLite are shut down properly.

import { FastifyInstance } from "fastify";

/**
 * Handles graceful shutdown of the Fastify server.
 */
export function closeGracefully(fastify: FastifyInstance) {
  async function shutdown(signal: string) {
    console.log(`Received signal to terminate: ${signal}`);

    try {
      console.log("🛑 Stopping Fastify server...");
      await fastify.close(); // Fastify will close all plugins, including SQLite
      console.log("✅ Fastify server closed successfully.");
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
    }

    process.exit(0);
  }

  process.on("SIGINT", shutdown); // Ctrl+C in terminal
  process.on("SIGTERM", shutdown); // Docker stop signal
}
