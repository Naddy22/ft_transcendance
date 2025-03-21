// File: backend/src/server.ts
// Main Fastify server setup, including routes, database, and shutdown handling.

import Fastify from 'fastify';
import { FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import fastifyGracefulExit from "@mgcrea/fastify-graceful-exit";
import fastifyStatic from '@fastify/static'; // https://github.com/fastify/fastify-static
import fastifyMultipart from "@fastify/multipart";
import fastifyRoutes from '@fastify/routes';
import fastifyJwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import dotenv from "dotenv";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fpSqlitePlugin } from 'fastify-sqlite-typed';

import fastifyRequestLogger from "@mgcrea/fastify-request-logger";

import { setupRoutes } from './routes/setupRoutes.js';
import { setupDatabase } from './database.js';

// ────────────────────────────────────────────────────────────────────────────────
// Load environment variables
dotenv.config();

// Resolve __dirname and paths correctly in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  **! maybe make this a decoration on instance ?
/*
// Assume your project root is one level up from your current directory:
const projectRoot = path.resolve(__dirname, '..');
fastify.decorate('projectRoot', projectRoot);

// In backend/src/routes/avatarRoutes.ts
export async function avatarRoutes(fastify: FastifyInstance) {
  const AVATAR_DIR = path.join(fastify.projectRoot, "uploads", "avatars");
  // ... rest of the code
}
*/

// ────────────────────────────────────────────────────────────────────────────────
// Ensure cert directory exists before initializing the certificates
// const sslDir = path.join(__dirname, '../certs');
// if (!fs.existsSync(sslDir)) {
//   console.log('Creating directory for SSL certificates...');
//   fs.mkdirSync(sslDir, { recursive: true });
// }

// // Setup SSL Certificates
// const certPath = path.join(sslDir, 'cert.pem');
// const keyPath = path.join(sslDir, 'key.pem');

// // Generate self-signed SSL certificates if they don't exist
// if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
//   console.log('Generating self-signed SSL certificates...');
//   const { execSync } = await import('child_process');
//   execSync(`openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost"`);
//   console.log('SSL certificates generated.');
// }

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
// console.log(`🗄️ Using SQLite database at: ${dbPath}`); // debug

// ────────────────────────────────────────────────────────────────────────────────
// Transport setup for "pretty" logs only in dev mode
const loggerOptions = process.env.NODE_ENV !== 'production' ? {
    // level: 'info',
    // file: './server.log',
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
// Initialize Fastify Server (allowing http for developpement)
// const isHttps = process.env.USE_HTTPS === "true";

// const fastify = Fastify({
//   // logger: true,
//   logger: loggerOptions,
//   disableRequestLogging: true,
//   ignoreTrailingSlash: true,
//   trustProxy: true,
//   ...(isHttps && {
//     https: {
//       key: fs.readFileSync(keyPath),
//       cert: fs.readFileSync(certPath),
//     }
//   })
// });

const fastify = Fastify({
  logger: loggerOptions,
  disableRequestLogging: true,
  ignoreTrailingSlash: true,
  trustProxy: true,
});

// ────────────────────────────────────────────────────────────────────────────────
// Register Request Logger plugin
await fastify.register(fastifyRequestLogger, {
  // logBody: false,
  logResponseTime: false,
  logBindings: {},
});

// ────────────────────────────────────────────────────────────────────────────────
// Register JWT plugin
await fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'supersecretkey',
  sign: { expiresIn: '1h' },
});
/*
fastify.jwt.sign() to generate tokens
request.jwtVerify() in protected routes.
*/

// Authentication decorator to require valid JWT on protected endpoints
fastify.decorate("authenticate", async function(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});
/*
fastify.get('/protected', { preValidation: [fastify.authenticate] }, async (req, reply) => {
  return { secretData: "This data is protected" };
});
*/

// ────────────────────────────────────────────────────────────────────────────────
// Register helmet plugin (prevent XSS)
await fastify.register(helmet, {
  // noSniff: true,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      // styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:"], // allow blob: URLs for images
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
});

// ────────────────────────────────────────────────────────────────────────────────
// Register database plugin
await fastify.register(fpSqlitePlugin, {
  dbFilename: dbPath
});

// ────────────────────────────────────────────────────────────────────────────────
// Register file upload plugin
await fastify.register(fastifyMultipart);

// ────────────────────────────────────────────────────────────────────────────────
// // Frontend 'dist/' folder path constant
// const FRONTEND_DIST = process.env.FRONTEND_DIST || "../../frontend/dist";

// const frontendPath = path.resolve(__dirname, FRONTEND_DIST);
// // console.log("Serving frontend from:", frontendPath); // Debugging output

// if (!fs.existsSync(frontendPath)) {
//   console.error("⚠️ Frontend dist folder does not exist:", frontendPath);
//   process.exit(1);
// }

// // Serve static frontend files (from 'frontend/dist') under '/'
// await fastify.register(fastifyStatic, {
//   root: frontendPath,
//   // root: path.resolve(__dirname, FRONTEND_DIST),
//   prefix: '/',
//   index: ['index.html'],
// });

// ────────────────────────────────────────────────────────────────────────────────
// 
await fastify.register(fastifyRoutes);

// ────────────────────────────────────────────────────────────────────────────────
// Register routes
setupRoutes(fastify);

// Health check endpoint
// fastify.get('/health', (req, reply) => reply.send({ message: 'Backend is running!' }));
fastify.get('/health', (req, reply) => reply.send({ status: 'ok' }));

// ────────────────────────────────────────────────────────────────────────────────
// Register `fastify-graceful-exit` AFTER `onClose` hook
await fastify.register(fastifyGracefulExit, { timeout: 3000 });

// ────────────────────────────────────────────────────────────────────────────────
// Ensure plugins are ready
await fastify.ready();

// Setup database
await setupDatabase(fastify);

// Log all registered routes
// console.log(fastify.routes);

// console.log("🛠️ Fastify Decorators:", Object.keys(fastify)); // debug

// ────────────────────────────────────────────────────────────────────────────────
// Start Server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;

    await fastify.listen({ port: port, host: '0.0.0.0' });
    console.log(`Fastify server running on https://localhost:${port}`);

  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
