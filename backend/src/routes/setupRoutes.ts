// File: backend/src/routes/setupRoutes.ts
// Registers all API routes with appropriate prefixes.

import { FastifyInstance } from 'fastify';
import { anonymizationRoutes } from './anonymizationRoutes.js';
import { authRoutes } from './authRoutes.js';
import { avatarRoutes } from './avatarRoutes.js';
import { changePasswordRoutes } from './changePasswordRoutes.js';
import { exportRoutes } from './exportRoutes.js';
import { friendRoutes } from './friendRoutes.js';
import { matchHistoryRoutes } from './matchHistoryRoutes.js';
import { matchRoutes } from './matchRoutes.js';
import { twoFactorRoutes } from './twoFactorRoutes.js';
import { userRoutes } from './userRoutes.js';
import { userStatsRoutes } from './userStatsRoutes.js';

export function setupRoutes(fastify: FastifyInstance) {
  fastify.register(anonymizationRoutes, { prefix: '/users' });
  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(avatarRoutes, { prefix: '/' });
  fastify.register(changePasswordRoutes, { prefix: '/users' });
  fastify.register(exportRoutes, { prefix: '/users' });
  fastify.register(friendRoutes, { prefix: '/users' });
  fastify.register(matchHistoryRoutes, { prefix: '/matchHistory' });
  fastify.register(matchRoutes, { prefix: '/matches' });
  fastify.register(twoFactorRoutes, { prefix: '/auth' });
  fastify.register(userRoutes, { prefix: '/users' });
  fastify.register(userStatsRoutes, { prefix: '/users' });
}
