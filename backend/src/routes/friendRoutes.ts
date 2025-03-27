// File: backend/src/routes/friendRoutes.ts
// GET /users/:id/friends, POST /users/:id/friends, DELETE /users/:id/friends/:friendId

import { FastifyInstance } from 'fastify';
import { PublicUser } from '../schemas/userSchema.js';
import { sendError } from "../utils/error.js";

/**
 * Endpoints for managing friend relationships.
 * These endpoints are registered under the /users prefix.
 * They use paths like:
 *  - GET /users/:id/friends         → List friends for user :id
 *  - POST /users/:id/friends        → Add friend (body: { friendId: number })
 *  - DELETE /users/:id/friends/:friendId  → Remove friend
 */
export async function friendRoutes(fastify: FastifyInstance) {

  // GET /users/:id/friends: get friend list for a user
  fastify.get<{ Params: { id: string } }>(
    "/:id/friends",
    // { preValidation: [fastify.authenticate] },
    async (req, reply) => {
    try {
      const { id } = req.params;

      // Query friends table for friend IDs
      const stmt = await fastify.db.prepare(
        "SELECT friendId FROM friends WHERE userId = ?"
      );
      const rows = await stmt.all(id);
      const friendIds = rows.map((row: any) => row.friendId);

      if (friendIds.length === 0) return reply.send([]);

      // Fetch user details for these friend IDs
      const placeholders = friendIds.map(() => "?").join(",");
      const stmt2 = await fastify.db.prepare(
        "SELECT id, username, email, avatar, status, wins, losses, matchesPlayed FROM users WHERE id IN (" + placeholders + ")"
      );
      const friends: PublicUser[] = await stmt2.all(...friendIds);
      reply.send(friends);
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while fetching friend list", error);
    }
  });

  /**
   * POST /users/:id/friends: add a friend
   * Expects body: { friendId: number }
   * Makes sure that if a user’s status is "anonymized", they cannot be added as a friend.
   */
  fastify.post<{ Params: { id: string }, Body: { friendId: number } }>(
    "/:id/friends",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
    try {
      const { id } = req.params;
      const { friendId } = req.body;
      if (!friendId) return reply.status(400).send({ error: "Missing friendId" });
      if (parseInt(id) === friendId) {
        return reply.status(400).send({ error: "Cannot add yourself as a friend" });
      }

      // Check if the friend to be added is anonymized.
      const friendStmt = await fastify.db.prepare("SELECT status FROM users WHERE id = ?");
      const friend = await friendStmt.get(friendId);
      if (friend && friend.status === "anonymized") {
        return reply.status(400).send({ error: "Cannot add an anonymized user as a friend" });
      }

      // Check if friendship already exists
      const stmtCheck = await fastify.db.prepare("SELECT * FROM friends WHERE userId = ? AND friendId = ?");
      const existing = await stmtCheck.get(id, friendId);
      if (existing) {
        return reply.status(400).send({ error: "Friend already added" });
      }

      // Insert friendship in both directions
      const stmtInsert = await fastify.db.prepare("INSERT INTO friends (userId, friendId) VALUES (?, ?)");
      await stmtInsert.run(id, friendId);
      await stmtInsert.run(friendId, id);

      reply.send({ message: "Friend added successfully" });
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while adding friend", error);
    }
  });

  // DELETE /users/:id/friends/:friendId: remove a friend
  fastify.delete<{ Params: { id: string, friendId: string } }>(
    "/:id/friends/:friendId",
    // { preValidation: [fastify.authenticate] },
    async (req, reply) => {
    try {
      const { id, friendId } = req.params;
      const stmtDelete = await fastify.db.prepare(
        "DELETE FROM friends WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)"
      );
      const result = await stmtDelete.run(id, friendId, friendId, id);
      if (result.changes === 0) return reply.status(404).send({ error: "Friendship not found" });
      reply.send({ message: "Friendship removed successfully" });
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while removing friend", error);
    }
  });
}
