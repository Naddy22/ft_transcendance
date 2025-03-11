// File: backend/src/server.ts
// Main Fastify server setup, including routes, database, and shutdown handling.

import Fastify from 'fastify';
import pino from 'pino';
import fastifyGracefulExit from "@mgcrea/fastify-graceful-exit";
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import fastifyMultipart from "@fastify/multipart";
import fastifyRoutes from '@fastify/routes';
// import fastifyRateLimit from "@fastify/rate-limit";
import helmet from '@fastify/helmet';
import dotenv from "dotenv";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fpSqlitePlugin } from 'fastify-sqlite-typed';

// import fastifyRequestLogger from "@mgcrea/fastify-request-logger";
// import prettifier from "@mgcrea/pino-pretty-compact";

import { setupRoutes } from './routes/setupRoutes.js';
import { setupDatabase } from './database.js';

// ────────────────────────────────────────────────────────────────────────────────
// Load environment variables
dotenv.config();

// Resolve __dirname and paths correctly in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  **! maybe make this a decoration on instance ?

// ────────────────────────────────────────────────────────────────────────────────
// Ensure cert directory exists before initializing the certificates
const sslDir = path.join(__dirname, '../certs');
if (!fs.existsSync(sslDir)) {
  console.log('Creating directory for SSL certificates...');
  fs.mkdirSync(sslDir, { recursive: true });
}

// Setup SSL Certificates
const certPath = path.join(sslDir, 'cert.pem');
const keyPath = path.join(sslDir, 'key.pem');

// Generate self-signed SSL certificates if they don't exist
if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.log('Generating self-signed SSL certificates...');
  const { execSync } = await import('child_process');
  execSync(`openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost"`);
  console.log('SSL certificates generated.');
}

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
// Initialize Fastify Server (allowing http for developpement)
const isHttps = process.env.USE_HTTPS === "true";

// // Example: set up a transport for "pretty" logs only in dev mode
// const loggerOptions = process.env.NODE_ENV !== 'production'
//   ? {
//       transport: {
//         target: 'pino-pretty',
//         options: {
//           colorize: true,         // Adds ANSI color codes to the output
//           translateTime: 'SYS:standard',
//           ignore: 'pid,hostname'  // Hide some fields if you want
//         }
//       }
//     }
//   : true;  // In production, default pino logs or you can supply an object

const loggerOptions = {
  level: 'info',
  file: './server.log',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
};

const fastify = Fastify({
  logger: loggerOptions,
  // logger: true,
  // disableRequestLogging: true, // to replace with custom or better one eventually...
  ignoreTrailingSlash: true,
  // trustProxy: true, // uncomment when/if we setup nginx
  ...(isHttps && {
    https: {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  })
});

// ────────────────────────────────────────────────────────────────────────────────
// Custom request/response logging
const now = () => Date.now();

// fastify.addHook("onRequest", (req, reply, done) => {
//   reply.startTime = now();
//   req.log.info({ url: req.raw.url, id: req.id }, "recieved request");
//   done();
// })

// ────────────────────────────────────────────────────────────────────────────────
// Register plugins

await fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      // Optionally, we can set styleSrcElem explicitly as well:
      // styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:"], // allow blob: URLs for images
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
});


// await fastify.register(fastifyRateLimit, {
//   max: 5, // Allow only 5 login attempts per minute per IP
//   timeWindow: "1 minute",
//   errorResponseBuilder: () => {
//     return { error: "Too many requests. Please try again later." };
//   }
// });

await fastify.register(fpSqlitePlugin, {
  dbFilename: dbPath
});


await fastify.register(fastifyMultipart);
await fastify.register(fastifyWebsocket);

const FRONTEND_DIST = process.env.FRONTEND_DIST || "../../frontend/dist";
// const frontendPath = path.resolve(__dirname, FRONTEND_DIST);
// console.log("Serving frontend from:", frontendPath); // Debugging output

// if (!fs.existsSync(frontendPath)) {
//   console.error("⚠️ Frontend dist folder does not exist:", frontendPath);
//   process.exit(1);
// }

// Serve static frontend files
await fastify.register(fastifyStatic, {
  // root: frontendPath,
  root: path.resolve(__dirname, FRONTEND_DIST),
  prefix: '/',
  index: ['index.html'],
});

await fastify.register(fastifyRoutes);

// ────────────────────────────────────────────────────────────────────────────────
// Register JSON Schemas
// const schemas = [userSchema, matchSchema, tournamentSchema];
// schemas.forEach(schema => fastify.addSchema(schema));

// ────────────────────────────────────────────────────────────────────────────────
// Register routes
setupRoutes(fastify);

// Health check endpoint
// fastify.get('/health', (req, reply) => reply.send({ message: 'Backend is running!' }));
fastify.get('/health', (req, reply) => reply.send({ status: 'ok' }));

// ────────────────────────────────────────────────────────────────────────────────
// // Ensure proper shutdown of SQLite on Fastify close
// fastify.addHook("onClose", async (instance) => {
//   if (instance.db) {
//     try {
//       console.log("🗄️ Closing SQLite database...");
//       await instance.db.exec("PRAGMA wal_checkpoint(FULL);"); // Ensure writes are finished
//       await instance.db.close();
//       console.log("✅ SQLite database closed.");
//     } catch (error) {
//       console.error("❌ Error closing SQLite database:", error);
//     }
//   }
// });

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
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Fastify server running on https://localhost:${port}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
