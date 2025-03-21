// File: backend/src/routes/userStatsRoutes.ts

import { FastifyInstance } from 'fastify';
import { sendError } from '../utils/error.js';

export async function userStatsRoutes(fastify: FastifyInstance) {

  //  Get a specific user's match stats
  fastify.get<{ Params: { id: string } }>(
    "/:id/stats",
    // { preValidation: [fastify.authenticate] },
    async (req, reply) => {
    try {
      const { id } = req.params;

      // const stmt = await fastify.db.prepare("SELECT wins, losses, matchesPlayed FROM users WHERE id = ?");
      const stmt = await fastify.db.prepare(`
        SELECT wins, losses, matchesPlayed,
          CASE WHEN matchesPlayed > 0 THEN (wins * 100.0 / matchesPlayed) ELSE 0 END AS winRatio
        FROM users
        WHERE id = ?
      `);
      stmt.bind(id);
      const stats = await stmt.get();

      if (!stats) return reply.status(404).send({ error: "User not found" });

      reply.send(stats);
    } catch (error) {
      return sendError(reply, 500, "❌ Error fetching user stats", error);
    }
  });

  // 
  fastify.put<{ Params: { id: string }, Body: { wins?: number; losses?: number; matchesPlayed?: number } }>(
    "/:id/stats",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const { id } = req.params;
        const { wins, losses, matchesPlayed } = req.body;

        const stmt = await fastify.db.prepare(`
          UPDATE users 
          SET 
            wins = wins + COALESCE(?, 0), 
            losses = losses + COALESCE(?, 0), 
            matchesPlayed = matchesPlayed + COALESCE(?, 0)
          WHERE id = ?
        `);
        await stmt.run(wins, losses, matchesPlayed, id);
        reply.send({ message: "User stats updated" });
      } catch (error) {
        return sendError(reply, 500, "Error updating user stats", error);
      }
    }
  );
}
