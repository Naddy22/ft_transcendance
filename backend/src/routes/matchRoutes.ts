// File: backend/src/routes/matchRoutes.ts

import { FastifyInstance } from 'fastify';

export async function matchRoutes(fastify: FastifyInstance) {
  fastify.get("/history", async (req, reply) => {
    const matches = fastify.sqlite.prepare("SELECT * FROM matches").all();
    reply.send(matches);
  });
}
