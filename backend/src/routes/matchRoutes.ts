// File: backend/src/routes/matchRoutes.ts
// Handles match history and specific match retrieval.

import { FastifyInstance } from 'fastify';

export async function matchRoutes(fastify: FastifyInstance) {

  // Get all past matches
  fastify.get("/", async (req, reply) => {
    try {
      const stmt = await fastify.db.prepare("SELECT * FROM matches");
      const matches = await stmt.all();
      reply.send(matches);
    } catch (error) {
      console.error("❌ Error fetching match history:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  // Get details of a specific match
  fastify.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    try {
      const { id: matchId } = req.params;
      const stmt = await fastify.db.prepare("SELECT * FROM matches WHERE matchId = ?");
      stmt.bind(matchId);
      const match = await stmt.get();

      if (!match) return reply.status(404).send({ error: "Match not found" });
      reply.send(match);
      
    } catch (error) {
      console.error("❌ Error fetching match:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

}
