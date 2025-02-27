// File: backend/src/routes/tournamentRoutes.ts

import { FastifyInstance } from 'fastify';
export async function tournamentRoutes(fastify: FastifyInstance) {
  fastify.get("/list", async (req, reply) => {
    const tournaments = fastify.sqlite.prepare("SELECT * FROM tournaments").all();
    reply.send(tournaments);
  });
}
