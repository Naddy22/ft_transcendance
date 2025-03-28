// File: backend/src/routes/userRoutes.ts

import { FastifyInstance } from 'fastify';
import sanitizeHtml from 'sanitize-html';
import { PublicUser, UpdateUserRequest } from "../schemas/userSchema.js";
import { sendError } from "../utils/error.js";

export async function userRoutes(fastify: FastifyInstance) {

  /**
   * Get all users (Excludes passwords)
   */
  fastify.get(
    "/",
    async (req, reply) => {
      try {
        const users: PublicUser[] = await fastify.db.all(`
          SELECT id, username, email, avatar, status, wins, losses, matchesPlayed, isTwoFactorEnabled
          FROM users
        `);

        reply.send(users);
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error while fetching users", error);
      }
    }
  );

  /**
   * Get a specific user's profile by id (Excludes password)
   */
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    async (request, reply) => {
      try {
        const { id } = request.params;
        const userId = request.params.id; // ?

        const stmt = await fastify.db.prepare(`
          SELECT id, username, email, avatar, status, wins, losses, matchesPlayed, isTwoFactorEnabled 
          FROM users 
          WHERE id = ?
        `);
        const user = await stmt.get(id) as PublicUser | undefined;

        if (!user) return reply.status(404).send({
          error: "User not found"
        });

        reply.send(user);
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error while fetching user", error);
      }
    }
  );

  /**
   * Update a user (Username, Email, Status)
   */
  fastify.put<{ Params: { id: string }, Body: UpdateUserRequest }>(
    "/:id",
    { preValidation: [fastify.authenticate, fastify.isAuthorized] },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { username, email, avatar, status } = request.body;

        if (!id) {
          return reply.status(400).send({
            error: "Missing user ID"
          });
        }

        // Check if user exists
        const userCheck = await fastify.db.prepare(`
          SELECT *
          FROM users
          WHERE id = ?
        `);
        const user = await userCheck.get(id);
        if (!user) return reply.status(404).send({
          error: "User not found"
        });

        // Validate new username if provided
        if (username) {
          const sanitizedUsername = sanitizeHtml(username, { allowedTags: [], allowedAttributes: {} });
          if (!sanitizedUsername.match(/^[a-zA-Z0-9_-]+$/)) {
            return reply.status(400).send({
              error: "Invalid username format."
            });
          }

          // Case-insensitive username check (excluding current user)
          const usernameCheck = await fastify.db.prepare(`
            SELECT id
            FROM users
            WHERE LOWER(username) = LOWER(?) AND id != ?
          `);
          const existingUser = await usernameCheck.get(username, id);
          if (existingUser) {
            return reply.status(400).send({
              error: "Username is already taken."
            });
          }
        }

        // Validate new email if provided
        if (email) {
          const sanitizedEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
          if (!sanitizedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return reply.status(400).send({
              error: "Invalid email format."
            });
          }

          // Case-insensitive email check (excluding current user)
          const emailCheck = await fastify.db.prepare(`
            SELECT id
            FROM users
            WHERE LOWER(email) = LOWER(?) AND id != ?
          `);
          const existingEmail = await emailCheck.get(email, id);
          if (existingEmail) {
            return reply.status(400).send({
              error: "Email is already registered."
            });
          }
        }

        // Build update statement dynamically
        const updates: string[] = [];
        const values: any[] = [];


        // 🛡️ Sanitize and validate input before updating
        if (username) {
          const sanitizedUsername = sanitizeHtml(username, { allowedTags: [], allowedAttributes: {} });
          updates.push("username = ?");
          values.push(sanitizedUsername);
        }
        if (email) {
          const sanitizedEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
          updates.push("email = ?");
          values.push(sanitizedEmail);
        }
        if (avatar) {
          updates.push("avatar = ?");
          values.push(avatar);
        }
        if (status) {
          updates.push("status = ?");
          values.push(status);
        }

        if (updates.length === 0) {
          return reply.status(400).send({
            error: "No valid fields to update"
          });
        }

        values.push(id);
        const stmt = await fastify.db.prepare(`
          UPDATE users
          SET ${updates.join(", ")}
          WHERE id = ?
        `);
        await stmt.run(...values);

        // Fetch updated user data
        const updatedUserStmt = await fastify.db.prepare(`
          SELECT id, username, email, avatar, status, wins, losses, matchesPlayed
          FROM users
          WHERE id = ?
        `);
        const updatedUser = await updatedUserStmt.get(id);

        reply.send({
          message: "User updated",
          user: updatedUser
        });
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error while updating user", error);
      }
    }
  );

  /**
   * Delete a user
   */
  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    { preValidation: [fastify.authenticate, fastify.isAuthorized] },
    async (request, reply) => {
      try {
        const { id } = request.params;

        // console.log(`🔍 Received request to delete user with ID: ${id}`); // Debug log

        if (!id) {
          return reply.status(400).send({
            error: "Missing user Id"
          });
        }

        const stmt = await fastify.db.prepare(`
          DELETE FROM users
          WHERE id = ?
        `);
        const result = await stmt.run(id);

        // console.log(`✅ Deleted Rows: ${result.changes}`); // Debug log

        if (result.changes === 0) {
          return reply.status(404).send({
            error: "User not found"
          });
        }

        reply.send({
          message: "User deleted"
        });
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error while deleting user", error);
      }
    }
  );
}
