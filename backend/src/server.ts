
import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const app = Fastify({ logger: true });
const prisma = new PrismaClient();

// ✅ Register Fastify plugins
app.register(require("@fastify/cors"), { origin: "*" });
app.register(require("@fastify/formbody"));

/**
 * Root route
 */
app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
  return { message: "Backend is running!" };
});

// ✅ Global error handler to catch Prisma & Fastify errors
app.setErrorHandler((error, request, reply) => {
  console.error("❌ Server Error:", error);
  reply.status(500).send({ error: "Internal server error" });
});

// ✅ Register Routes
userRoutes(app);

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
