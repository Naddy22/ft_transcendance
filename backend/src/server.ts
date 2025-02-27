
// TOCHECK:
// https://fastify.dev/docs/latest/Reference/Server/#ignoretrailingslash

// https://github.com/yoav0gal/fastify-sqlite-typed

// File: backend/src/server.ts

import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import { fpSqlitePlugin } from 'fastify-sqlite-typed';
import dotenv from "dotenv";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { setupRoutes } from './routes/setupRoutes.js';
import { setupDatabase } from './database.js';
import { closeGracefully } from './shutdown.js';
import { userSchema } from './schemas/userSchema.js';
import { matchSchema } from './schemas/matchSchema.js';
import { tournamentSchema } from './schemas/tournamentSchema.js';
import { wsSchema } from './schemas/wsSchema.js';

// Resolve __dirname and paths correctly in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL Certificate Paths
const certPath = path.join(__dirname, '../certs/cert.pem');
const keyPath = path.join(__dirname, '../certs/key.pem');

// Generate self-signed SSL certificates if they don't exist
if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.log('Generating self-signed SSL certificates...');
    const { execSync } = await import('child_process');
    execSync(`openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost"`);
    console.log('SSL certificates generated.');
}

// Ensure `data/` directory exists before initializing the database
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    console.log('Creating data directory...');
    fs.mkdirSync(dataDir, { recursive: true });
}

// Set database path for SQLite
const dbPath = path.join(dataDir, 'database.sqlite');
// if (!fs.existsSync(dbPath)) {
//     console.log('🆕 Creating new SQLite database at:', dbPath);
//     fs.writeFileSync(dbPath, ''); // Ensure the file exists
// }

// Load environment variables
dotenv.config();

// Initialize Fastify Server
const fastify = Fastify({
  logger: true,
  https: {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  }
});

// 🔍 Debugging - Print the resolved path before registering the plugin
console.log(`🗄️ Using SQLite database at: ${dbPath}`);

// Register SQLite Plugin
await fastify.register(fpSqlitePlugin, {
	dbFilename: dbPath
	// connectionString: `sqlite://${dbPath}`
	// connectionString: dbPath
});

// Register Fastify Plugins
await fastify.register(fastifyWebsocket);
await fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../../frontend/dist'),
  prefix: '/',
});

// Register Schemas
fastify.addSchema(userSchema);
fastify.addSchema(matchSchema);
fastify.addSchema(tournamentSchema);
fastify.addSchema(wsSchema);

// Register routes
setupRoutes(fastify);

// Ensure all plugins are ready
await fastify.ready();

// 
console.log("🛠️ Fastify Decorators:", Object.keys(fastify)); // debug
// 

// Setup database
await setupDatabase(fastify);

// Handle shutdown
closeGracefully(fastify);

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
