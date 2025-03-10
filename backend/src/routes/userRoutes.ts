// File: backend/src/routes/userRoutes.ts

import { FastifyInstance } from 'fastify';
// import fastifyStatic from "@fastify/static";
import { PublicUser, UpdateUserRequest } from "../schemas/userSchema.js";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from 'url';
import sanitizeHtml from 'sanitize-html';
import { sendError } from "../utils/error.js";

// // Fix `__dirname` in ESModules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Avatar storage setup
// const AVATAR_DIR = path.join(__dirname, "../../uploads/avatars");
// if (!fs.existsSync(AVATAR_DIR)) {
//   fs.mkdirSync(AVATAR_DIR, { recursive: true });
// }

export async function userRoutes(fastify: FastifyInstance) {

  /**
   * Get all users (Excludes passwords)
   */
  fastify.get("/", async (req, reply) => {
    try {
      // const stmt = await fastify.db.prepare("SELECT id, username, email, avatar, status FROM users");
      // const users: PublicUser[] = await stmt.all();

      const users: PublicUser[] = await fastify.db.all(
        "SELECT id, username, email, avatar, status, wins, losses, matchesPlayed FROM users"
      );

      reply.send(users);
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while fetching users", error);
    }
  });

  /**
   * Get a specific user's profile by id (Excludes password)
   */
  fastify.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    try {
      const { id } = req.params;

      const stmt = await fastify.db.prepare(
        "SELECT id, username, email, avatar, status FROM users WHERE id = ?"
      );
      const user = await stmt.get(id) as PublicUser | undefined;

      if (!user) return reply.status(404).send({ error: "User not found" });

      reply.send(user);
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while fetching user", error);
    }
  });

  /**
   * Update a user (Username, Email, Status)
   */
  fastify.put<{ Params: { id: string }, Body: UpdateUserRequest }>('/:id', async (req, reply) => {
    try {
      const { id } = req.params;
      const { username, email, avatar, status } = req.body;

      if (!id) {
        return reply.status(400).send({ error: "Missing user ID" });
      }

      // Check if user exists
      const userCheck = await fastify.db.prepare("SELECT * FROM users WHERE id = ?");
      const user = await userCheck.get(id);
      if (!user) return reply.status(404).send({ error: "User not found" });

      // Validate new username if provided
      if (username) {
        const sanitizedUsername = sanitizeHtml(username, { allowedTags: [], allowedAttributes: {} });
        if (!sanitizedUsername.match(/^[a-zA-Z0-9_-]+$/)) {
          return reply.status(400).send({ error: "Invalid username format." });
        }
        // Check if username is already taken by another user
        const usernameCheck = await fastify.db.prepare("SELECT id FROM users WHERE username = ?");
        const existingUser = await usernameCheck.get(username);
        if (existingUser && existingUser.id !== parseInt(id)) {
          return reply.status(400).send({ error: "Username is already taken." });
        }
      }

      // Validate new email if provided
      if (email) {
        const sanitizedEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
        if (!sanitizedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return reply.status(400).send({ error: "Invalid email format." });
        }
        // Check if email is already registered by another user
        const emailCheck = await fastify.db.prepare("SELECT id FROM users WHERE email = ?");
        const existingEmail = await emailCheck.get(email);
        if (existingEmail && existingEmail.id !== parseInt(id)) {
          return reply.status(400).send({ error: "Email is already registered." });
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
        return reply.status(400).send({ error: "No valid fields to update" });
      }

      values.push(id);
      const stmt = await fastify.db.prepare(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`
      );
      await stmt.run(...values);

      // Fetch updated user data
      const updatedUserStmt = await fastify.db.prepare(
        "SELECT id, username, email, avatar, status, wins, losses, matchesPlayed FROM users WHERE id = ?"
      );
      const updatedUser = await updatedUserStmt.get(id);

      reply.send({ message: "User updated", user: updatedUser });
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while updating user", error);
    }
  });

  /**
   * Delete a user
   */
  fastify.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    try {
      const { id } = req.params;

      // console.log(`🔍 Received request to delete user with ID: ${id}`); // Debug log

      if (!id) {
        return reply.status(400).send({ error: "Missing user Id" });
      }

      const stmt = await fastify.db.prepare("DELETE FROM users WHERE id = ?");
      const result = await stmt.run(id);

      // console.log(`✅ Deleted Rows: ${result.changes}`); // Debug log

      if (result.changes === 0) {
        return reply.status(404).send({ error: "User not found" });
      }

      reply.send({ message: "User deleted" });
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while deleting user", error);
    }
  });


  // /**
  //  * Get a specific user's match stats
  //  */
  // fastify.get<{ Params: { id: string } }>("/:id/stats", async (req, reply) => {
  //   try {
  //     const { id } = req.params;
  //     const stmt = await fastify.db.prepare("SELECT wins, losses, matchesPlayed FROM users WHERE id = ?");
  //     stmt.bind(id);
  //     const stats = await stmt.get();

  //     if (!stats) return reply.status(404).send({ error: "User not found" });

  //     reply.send(stats);
  //   } catch (error) {
  //     console.error("❌ Error fetching user stats:", error);
  //     reply.status(500).send({ error: "Internal Server Error" });
  //   }
  // });

  // /**
  //  * Serve uploaded avatars
  //  * This allows users to access their uploaded avatars vis `/avatars/filename`
  //  */
  // fastify.register(fastifyStatic, {
  //   root: AVATAR_DIR,
  //   prefix: "/avatars/",
  //   decorateReply: false, // Ensure it doesn't conflict with other responses
  // });

  // /**
  //  * Upload User Avatar
  //  * - Validates file type (JPEG, PNG, WEBP)
  //  * - Saves avatar in `/uploads/avatars/`
  //  * - Returns the avatar URL
  //  */
  // fastify.post("/avatar", async (req, reply) => {
  //   const data = await req.file();
  //   if (!data) return reply.status(400).send({ error: "No file uploaded" });

  //   // Validate file type (only allow images)
  //   const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  //   if (!allowedMimeTypes.includes(data.mimetype)) {
  //     return reply.status(400).send({ error: "Invalid file type" });
  //   }

  //   // Generate a unique filename
  //   const fileName = `${Date.now()}-${data.filename}`;
  //   const filePath = path.join(AVATAR_DIR, fileName);

  //   // Save the file
  //   await fs.promises.writeFile(filePath, await data.toBuffer());

  //   // Return the public URL of the uploaded avatar
  //   reply.send({ avatarUrl: `/avatars/${fileName}` });
  //   // const avatarUrl = `/avatars/${fileName}`;
  //   // reply.send({ avatarUrl });
  // });

  // /**
  //  * Update User Avatar in Database
  //  */
  // fastify.put<{ Body: { userId: number; avatarUrl: string } }>("/avatar", async (req, reply) => {
  //   const { userId, avatarUrl } = req.body;

  //   if (!userId || !avatarUrl) {
  //     return reply.status(400).send({ error: "Missing userId or avatarUrl" });
  //   }

  //   const stmt = await fastify.db.prepare("UPDATE users SET avatar = ? WHERE id = ?");
  //   await stmt.run(avatarUrl, userId);

  //   reply.send({ message: "Avatar updated successfully", avatarUrl });
  // });

}
