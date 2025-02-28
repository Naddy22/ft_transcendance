// File: backend/src/routes/userRoutes.ts

import { FastifyInstance } from 'fastify';
import fastifyStatic from "@fastify/static";
import { userSchema, PublicUser } from "../schemas/userSchema.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Fix `__dirname` in ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Avatar storage setup
const AVATAR_DIR = path.join(__dirname, "../../uploads/avatars");
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

export async function userRoutes(fastify: FastifyInstance) {

  /**
   * Serve uploaded avatars
   * This allows users to access their uploaded avatars vis `/avatars/filename`
   */
  fastify.register(fastifyStatic, {
    root: AVATAR_DIR,
    prefix: "/avatars/",
    decorateReply: false, // Ensure it doesn't conflict with other responses
  });

  // // If the issue persists, try setting the prefix at the global level
  // fastify.register(fastifyStatic, {
  //   root: path.join(__dirname, "../../uploads"),
  //   prefix: "/users",
  //   decorateReply: false
  // });

  /**
   * Upload User Avatar
   * - Validates file type (JPEG, PNG, WEBP)
   * - Saves avatar in `/uploads/avatars/`
   * - Returns the avatar URL
   */
  fastify.post("/avatar", async (req, reply) => {
    const data = await req.file();
    if (!data) return reply.status(400).send({ error: "No file uploaded" });

    // Validate file type (only allow images)
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(data.mimetype)) {
      return reply.status(400).send({ error: "Invalid file type" });
    }

    // Generate a unique filename
    const fileName = `${Date.now()}-${data.filename}`;
    const filePath = path.join(AVATAR_DIR, fileName);

    // Save the file
    await fs.promises.writeFile(filePath, await data.toBuffer());

    // Return the public URL of the uploaded avatar
    reply.send({ avatarUrl: `/avatars/${fileName}` });
    // const avatarUrl = `/avatars/${fileName}`;
    // reply.send({ avatarUrl });
  });

  /**
   * Update User Avatar in Database
   */
  fastify.put<{ Body: { userId: number; avatarUrl: string } }>("/avatar", async (req, reply) => {
    const { userId, avatarUrl } = req.body;

    if (!userId || !avatarUrl) {
      return reply.status(400).send({ error: "Missing userId or avatarUrl" });
    }

    const stmt = await fastify.db.prepare("UPDATE users SET avatar = ? WHERE id = ?");
    await stmt.run(avatarUrl, userId);

    reply.send({ message: "Avatar updated successfully", avatarUrl });
  });

  /**
   * Get all users (Excludes passwords)
   */
  fastify.get("/", async (req, reply) => {
    try {
      const stmt = await fastify.db.prepare("SELECT id, username, email, avatar, status FROM users");
      const users: PublicUser[] = await stmt.all();

      reply.send(users);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  /**
   * Get a specific user's profile (Excludes password)
   */
  fastify.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    try {
      const { id } = req.params;
      const stmt = await fastify.db.prepare("SELECT id, username, email, avatar, status FROM users WHERE id = ?");
      stmt.bind(id);
      const user = await stmt.get() as PublicUser | undefined;

      if (!user) return reply.status(404).send({ error: "User not found" });

      reply.send(user);
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  /**
   * Get a specific user's match stats
   */
  fastify.get<{ Params: { id: string } }>("/:id/stats", async (req, reply) => {
    try {
      const { id } = req.params;
      const stmt = await fastify.db.prepare("SELECT wins, losses, matchesPlayed FROM users WHERE id = ?");
      stmt.bind(id);
      const stats = await stmt.get();

      if (!stats) return reply.status(404).send({ error: "User not found" });

      reply.send(stats);
    } catch (error) {
      console.error("❌ Error fetching user stats:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

}
