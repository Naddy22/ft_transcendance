/** Responsible for setting up Fastify (but not starting it).
 * - Initializes Fastify, registers routes/plugins, sets error handler.
 * - Makes the app easier to test (unit tests can import app.ts without running the server).
 * - Allows other services (like workers) to reuse the Fastify instance without re-initializing it.
 */

import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import authRoutes from "./routes/authRoutes.js";

dotenv.config(); // Load environment variables

const app = Fastify({ logger: true }); // Create Fastify instance

// Register Plugins
app.register(cors, { origin: "*" });
app.register(formbody);

// (Middlewares go here)

// Register Routes
authRoutes(app);

// Root route (Health Check)
app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
  return { message: "Backend is running!" };
});

// Global error handler
app.setErrorHandler((error, request, reply) => {
	console.error("❌ Server Error:", error);
	reply.status(500).send({ error: "Internal server error" });
});

export default app;


// 🔹 Logical Setup Order:
// 1️⃣ Environment Setup (Load .env)
// 2️⃣ Create Fastify Instance
// 3️⃣ Register Plugins (CORS, body parsers, etc.)
// 4️⃣ Register Middlewares (Authentication, Logging, etc.) → if applicable
// 5️⃣ Define Routes (Register route handlers)
// 6️⃣ Global Error Handler
