// File: backend/src/routes/setupRoutes.ts
// Registers all API routes with appropriate prefixes.

import { FastifyInstance } from 'fastify';
import { authRoutes } from './authRoutes.js';
import { userRoutes } from './userRoutes.js';
import { userStatsRoutes } from './userStatsRoutes.js';
import { changePasswordRoutes } from './changePasswordRoutes.js';
import { friendRoutes } from './friendRoutes.js';
import { matchRoutes } from './matchRoutes.js';
import { matchHistoryRoutes } from './matchHistoryRoutes.js';
import { tournamentRoutes } from './tournamentRoutes.js';
import { matchmakingRoutes } from './matchmakingRoutes.js';
import { avatarRoutes } from './avatarRoutes.js';
import { anonymizationRoutes } from './anonymizationRoutes.js';
import { exportRoutes } from './exportRoutes.js';

import { twoFactorRoutes } from './twoFactorRoutes.js';

export function setupRoutes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: '/auth' });

  fastify.register(twoFactorRoutes, { prefix: '/auth' });
  
  fastify.register(userRoutes, { prefix: '/users' });
  fastify.register(userStatsRoutes, { prefix: '/users' });
  fastify.register(changePasswordRoutes, { prefix: '/users' });
  fastify.register(friendRoutes, { prefix: '/users' });
  fastify.register(matchRoutes, { prefix: '/matches' });
  fastify.register(matchHistoryRoutes, { prefix: '/matchHistory' });
  fastify.register(tournamentRoutes, { prefix: '/tournaments' });
  fastify.register(matchmakingRoutes, { prefix: '/matchmaking' });
  fastify.register(avatarRoutes, { prefix: '/' }); // Endpoints will be at /avatars, /avatars (PUT), /avatars (DELETE)
  fastify.register(anonymizationRoutes, { prefix: '/users' });
  fastify.register(exportRoutes, { prefix: '/users' });
}
