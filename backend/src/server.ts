// File: backend/src/server.ts
// Main Fastify server setup, including routes, database, and shutdown handling.

import { Fastify, FastifyRequest, FastifyReply } from 'fastify';
import fastifyRequestLogger from '@mgcrea/fastify-request-logger';
import fastifyGracefulExit from '@mgcrea/fastify-graceful-exit';
import { fpSqlitePlugin } from 'fastify-sqlite-typed';
import fastifyMultipart from '@fastify/multipart';
import fastifyRoutes from '@fastify/routes';
import fastifyJwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { setupRoutes } from "./routes/setupRoutes.js";
import { setupDatabase } from "./database.js";

// ────────────────────────────────────────────────────────────────────────────────
// Load environment variables
dotenv.config();

// Resolve __dirname and paths correctly in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ────────────────────────────────────────────────────────────────────────────────
// Ensure data directory exists before initializing the database
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  console.log('Creating data directory...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// Setup SQLite database
const dbPath = path.join(dataDir, 'database.sqlite');
if (!fs.existsSync(dbPath)) {
  console.log('🆕 Creating new SQLite database at:', dbPath);
  fs.writeFileSync(dbPath, ''); // Ensure the file exists
}

// ────────────────────────────────────────────────────────────────────────────────
// Transport setup for "pretty" logs only in dev mode
const loggerOptions = process.env.NODE_ENV !== 'production' ? {
  transport: {
    target: "@mgcrea/pino-pretty-compact",
    options: {
      colorize: true,
      translateTime: "SYS:H:MM:ss",
      ignore: 'pid,hostname',
    }
  }
} : true;  // Raw JSON logs in production for better machine parsing and performance.

// ────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// Initialize Fastify Server
const fastify = Fastify({
  logger: loggerOptions,
  disableRequestLogging: true,
  ignoreTrailingSlash: true,
  trustProxy: true,
});

// ────────────────────────────────────────────────────────────────────────────────
// Register Request Logger plugin
await fastify.register(fastifyRequestLogger, {
  logResponseTime: false,
  logBindings: {},
});

// ────────────────────────────────────────────────────────────────────────────────
// Register JWT plugin
await fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'supersecretkey',
  sign: { expiresIn: '1h' },
});

// ────────────────────────────────────────────────────────────────────────────────
// Authentication decorators to require valid JWT on protected endpoints

fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

fastify.decorate("isAuthorized", async function (request: FastifyRequest, reply: FastifyReply) {
  const jwtUserId = request.user?.id;
  const paramId = Number((request.params as { id: string }).id);

  if (jwtUserId !== paramId) {
    return reply.status(403).send({ error: "Forbidden" });
  }
});

// ────────────────────────────────────────────────────────────────────────────────
// Register helmet plugin (prevent XSS)
await fastify.register(helmet, {
  noSniff: true,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
});

// ────────────────────────────────────────────────────────────────────────────────
// Register database plugin
await fastify.register(fpSqlitePlugin, { dbFilename: dbPath });

// ────────────────────────────────────────────────────────────────────────────────
// Register file upload plugin
await fastify.register(fastifyMultipart);

// ────────────────────────────────────────────────────────────────────────────────
// Register routes
await fastify.register(fastifyRoutes);

setupRoutes(fastify);

// ────────────────────────────────────────────────────────────────────────────────
// Health check endpoint -> curl -X GET http://localhost:3000/health
fastify.get('/health', (request, reply) => reply.send({ status: 'ok' }));

// ────────────────────────────────────────────────────────────────────────────────
// Register 'fastify-graceful-exit'
await fastify.register(fastifyGracefulExit, { timeout: 3000 });

// ────────────────────────────────────────────────────────────────────────────────
// Ensure all plugins are ready
await fastify.ready();

// ────────────────────────────────────────────────────────────────────────────────
// Setup database
await setupDatabase(fastify);

// Log all registered routes and decorators
// console.log(fastify.routes);
// console.log("🛠️ Fastify Decorators:", Object.keys(fastify));

// ────────────────────────────────────────────────────────────────────────────────
// Start Server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;

    await fastify.listen({ port: port, host: '0.0.0.0' });

  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
