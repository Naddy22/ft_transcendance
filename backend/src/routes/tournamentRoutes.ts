// File: backend/src/routes/tournamentRoutes.ts
// Handles listing and retrieving tournament details.

import { FastifyInstance } from 'fastify';

export async function tournamentRoutes(fastify: FastifyInstance) {

  // Get all tournaments
  fastify.get("/", async (req, reply) => {
    try {
      const stmt = await fastify.db.prepare("SELECT * FROM tournaments");
      const tournaments = await stmt.all();
      reply.send(tournaments);
    } catch (error) {
      console.error("❌ Error fetching tournaments:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  // Get specific tournament details
  fastify.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    try {
      const { id: tournamentId } = req.params;
      const stmt = await fastify.db.prepare("SELECT * FROM tournaments WHERE tournamentId = ?");
      stmt.bind(tournamentId);
      const tournament = await stmt.get();

      if (!tournament) return reply.status(404).send({ error: "Tournament not found" });
      reply.send(tournament);
      
    } catch (error) {
      console.error("❌ Error fetching tournament:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

}
