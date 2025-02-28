// File: backend/src/routes/setupRoutes.ts
// Registers all API routes with appropriate prefixes.

import { FastifyInstance } from 'fastify';
import { authRoutes } from './authRoutes.js';
import { userRoutes } from './userRoutes.js';
import { matchRoutes } from './matchRoutes.js';
import { tournamentRoutes } from './tournamentRoutes.js';
import { matchmakingRoutes } from './matchmakingRoutes.js';
import { websocketRoutes } from './wsRoutes.js';

export function setupRoutes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(userRoutes, { prefix: '/users' });
  fastify.register(matchRoutes, { prefix: '/matches' });
  fastify.register(tournamentRoutes, { prefix: '/tournaments' });
  fastify.register(matchmakingRoutes, { prefix: '/matchmaking' });
  fastify.register(websocketRoutes, { prefix: '/ws' });
}
