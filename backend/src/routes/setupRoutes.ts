// File: backend/src/routes/setupRoutes.ts

import { FastifyInstance } from 'fastify';
import { userRoutes } from './userRoutes';
import { matchRoutes } from './matchRoutes';
import { tournamentRoutes } from './tournamentRoutes';
import { websocketRoutes } from './wsRoutes';

export function setupRoutes(fastify: FastifyInstance) {
  fastify.register(userRoutes, { prefix: '/users' });
  fastify.register(matchRoutes, { prefix: '/matches' });
  fastify.register(tournamentRoutes, { prefix: '/tournaments' });
  fastify.register(websocketRoutes, { prefix: '/ws' });
}
