// File: backend/src/server.ts
// Main Fastify server setup, including routes, database, and shutdown handling.

import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import fastifyMultipart from "@fastify/multipart";
import helmet from '@fastify/helmet';
import dotenv from "dotenv";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fpSqlitePlugin } from 'fastify-sqlite-typed';

import { setupRoutes } from './routes/setupRoutes.js';
import { setupDatabase } from './database.js';
import { closeGracefully } from './shutdown.js';

import { userSchema } from './schemas/userSchema.js';
import { matchSchema } from './schemas/matchSchema.js';
import { tournamentSchema } from './schemas/tournamentSchema.js';
import { wsSchema } from './schemas/wsSchema.js';

// ────────────────────────────────────────────────────────────────────────────────
// Load environment variables
dotenv.config();

// Resolve __dirname and paths correctly in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ────────────────────────────────────────────────────────────────────────────────
// Setup SSL Certificates
const certPath = path.join(__dirname, '../certs/cert.pem');
const keyPath = path.join(__dirname, '../certs/key.pem');

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
console.log(`🗄️ Using SQLite database at: ${dbPath}`); // debug

// ────────────────────────────────────────────────────────────────────────────────
// Initialize Fastify Server
const fastify = Fastify({
  logger: true,
  https: {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  }
});

// ────────────────────────────────────────────────────────────────────────────────
// Register plugins
await fastify.register(helmet);
await fastify.register(fpSqlitePlugin, { dbFilename: dbPath });
await fastify.register(fastifyMultipart);
await fastify.register(fastifyWebsocket);
await fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../../frontend/dist'),
  prefix: '/',
});

// ────────────────────────────────────────────────────────────────────────────────
// Register JSON Schemas
// fastify.addSchema(userSchema);
// fastify.addSchema(matchSchema);
// fastify.addSchema(tournamentSchema);
// fastify.addSchema(wsSchema);
const schemas = [userSchema, matchSchema, tournamentSchema, wsSchema];
schemas.forEach(schema => fastify.addSchema(schema));

// ────────────────────────────────────────────────────────────────────────────────
// Register routes
setupRoutes(fastify);

// Health check endpoint
fastify.get('/health', (req, reply) => reply.send({ status: 'ok' }));

// ────────────────────────────────────────────────────────────────────────────────
// Ensure plugins are ready
await fastify.ready();

// Setup database
await setupDatabase(fastify);

// Handle graceful shutdown
closeGracefully(fastify);

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

// // Start Server (Fixed)
// fastify.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' })
//   .then(address => console.log(`Fastify running at ${address}`))
//   .catch(err => {
//     fastify.log.error(err);
//     process.exit(1);
// });


// TOCHECK:
// https://fastify.dev/docs/latest/Reference/Server/#ignoretrailingslash
