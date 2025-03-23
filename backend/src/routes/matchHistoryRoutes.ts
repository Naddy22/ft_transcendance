// File: backend/src/routes/matchHistoryRoutes.ts

import { FastifyInstance } from 'fastify';
import { sendError } from "../utils/error.js";

export async function matchHistoryRoutes(fastify: FastifyInstance) {

  /**
   * Create a new match history entry
   */
  fastify.post(
    "/",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const { userId, type, result } = req.body as {
          userId: number;
          type: string;
          result: string;
        };

        if (!userId || !type || !result) {
          return reply.status(400).send({
            error: "Missing required fields"
          });
        }

        const date = new Date().toISOString();

        const stmt = await fastify.db.prepare(`
          INSERT INTO match_history (userId, date, type, result)
          VALUES (?, ?, ?, ?)
        `);
        const res = await stmt.run(userId, date, type, result);

        reply.status(201).send({
          message: "History entry created",
          id: res.lastID
        });
      } catch (error) {
        return sendError(reply, 500, "Internal server error while creating match history entry", error);
      }
    }
  );

  /**
   * Get a user's match history
   */
  fastify.get<{ Params: { userId: string } }>(
    "/:userId",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const { userId } = req.params;
        const stmt = await fastify.db.prepare(`
          SELECT date, type, result
          FROM match_history
          WHERE userId = ?
          ORDER BY date DESC
        `);
        const history = await stmt.all(userId);
        reply.send(history);
      } catch (error) {
        return sendError(reply, 500, "Internal server error while fetching match history", error);
      }
    }
  );
}
