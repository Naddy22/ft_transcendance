// File: backend/src/routes/exportRoutes.ts

import { FastifyInstance } from 'fastify';
import { sendError } from "../utils/error.js";

export async function exportRoutes(fastify: FastifyInstance) {

  /**
   * Exports all personal data for the user
   */
  fastify.get<{ Params: { id: string } }>(
    "/:id/export",
    { preValidation: [fastify.authenticate, fastify.isAuthorized] },
    async (req, reply) => {
      try {
        const { id } = req.params;

        // Retrieve user personal data (exclude password)
        const userStmt = await fastify.db.prepare(`
          SELECT id, username, email, avatar, status, wins, losses, matchesPlayed
          FROM users
          WHERE id = ?
        `);
        const user = await userStmt.get(id);
        if (!user) {
          return reply.status(404).send({
            error: "User not found"
          });
        }

        // Retrieve match history for the user
        const historyStmt = await fastify.db.prepare(`
          SELECT date, type, result
          FROM match_history
          WHERE userId = ?
          ORDER BY date DESC
        `);
        const matchHistory = await historyStmt.all(id);

        // Retrieve friend list: first get friend IDs...
        const friendsStmt = await fastify.db.prepare(`
          SELECT friendId
          FROM friends
          WHERE userId = ?
        `);
        const friendRows = await friendsStmt.all(id);
        const friendIds = friendRows.map((row: any) => row.friendId);

        // ... then get details (if any)
        let friends = [];
        if (friendIds.length > 0) {
          const placeholders = friendIds.map(() => "?").join(",");
          const friendsDetailsStmt = await fastify.db.prepare(`
            SELECT id, username, email, avatar, status
            FROM users
            WHERE id IN (${placeholders})
          `);
          friends = await friendsDetailsStmt.all(...friendIds);
        }

        const exportData = {
          user,
          matchHistory,
          friends,
        };

        reply.send(exportData);
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error during data export", error);
      }
    }
  );
}
