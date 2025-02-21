/** 
 * Responsible for running the server.
 * - Starts the Fastify app by calling `app.listen()`.
 */

import app from "./app.js"

/**
 * Starts the Fastify server
 */
const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log(`✅ Server running on http://localhost:3000`);
  } catch (err) {
    app.log.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();
