// File: backend/src/routes/avatarRoutes.ts

/* TOCHECK:
- image deletion ?
- path for default, what happens if not found
*/

import { FastifyInstance } from "fastify";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import sharp from "sharp";
import fastifyStatic from '@fastify/static';

import { sendError } from "../utils/error.js";

// Resolve __dirname and paths correctly in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function avatarRoutes(fastify: FastifyInstance) {

  // Define where to store avatars
  const AVATAR_DIR = path.join(__dirname, "../../uploads/avatars");
  if (!fs.existsSync(AVATAR_DIR)) {
    fs.mkdirSync(AVATAR_DIR, { recursive: true });
  }

  // Set the default avatar URL (make sure the default file exists in AVATAR_DIR)
  const DEFAULT_AVATAR_URL = "/avatars/default.png";

  // Serve the avatar directory statically
  await fastify.register(fastifyStatic, {
    root: AVATAR_DIR,
    prefix: "/avatars/",
    decorateReply: false,
  });

  // Endpoint: Upload an avatar
  // (This uses multipart/form-data; do not manually set Content-Type header on the client)
  fastify.post("/avatar", async (req, reply) => {
    try {
      const data = await req.file();
      if (!data) {
        return reply.status(400).send({ error: "No file uploaded" });
      }

      // Validate file type
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedMimeTypes.includes(data.mimetype)) {
        return reply.status(400).send({ error: "Invalid file type. Allowed types: JPEG, PNG, WEBP" });
      }

      // Generate a unique filename
      const fileName = `${Date.now()}-${data.filename}`;
      const filePath = path.join(AVATAR_DIR, fileName);

      // Resize image to a maximum of 256x256 pixels (maintaining aspect ratio)
      const buffer = await data.toBuffer();
      const resizedBuffer = await sharp(buffer)
        .resize({ width: 256, height: 256, fit: "inside" })
        .toBuffer();

      // Save the file
      await fs.promises.writeFile(filePath, resizedBuffer);

      // Return the public URL for the uploaded avatar
      const avatarUrl = `/avatars/${fileName}`;
      reply.send({ message: "Avatar uploaded successfully", avatarUrl });
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error during avatar upload", error);
    }
  });

  // Endpoint: Update the user's avatar reference in the database
  fastify.put<{ Body: { userId: number; avatarUrl: string } }>("/avatar", async (req, reply) => {
    try {
      const { userId, avatarUrl } = req.body;
      if (!userId || !avatarUrl) {
        return reply.status(400).send({ error: "Missing userId or avatarUrl" });
      }
      const stmt = await fastify.db.prepare("UPDATE users SET avatar = ? WHERE id = ?");
      await stmt.run(avatarUrl, userId);
      reply.send({ message: "Avatar updated successfully", avatarUrl });
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error during avatar update", error);
    }
  });

  // Endpoint: Remove avatar (reset to default)
  fastify.delete<{ Body: { userId: number } }>("/avatar", async (req, reply) => {
    try {
      const { userId } = req.body;
      if (!userId) return reply.status(400).send({ error: "Missing userId" });

      // Get current avatar from database
      const stmt = await fastify.db.prepare("SELECT avatar FROM users WHERE id = ?");
      const user = await stmt.get(userId);
      if (!user) return reply.status(404).send({ error: "User not found" });

      // If an avatar exists and it's not the default, attempt to delete the file
      if (user.avatar && user.avatar !== DEFAULT_AVATAR_URL) {
        const filePath = path.join(AVATAR_DIR, path.basename(user.avatar));
        fs.unlink(filePath, (err) => {
          if (err) fastify.log.error("Error deleting avatar file", err);
        });
      }

      // Update the user record to revert to the default avatar
      const updateStmt = await fastify.db.prepare("UPDATE users SET avatar = ? WHERE id = ?");
      await updateStmt.run(DEFAULT_AVATAR_URL, userId);
      reply.send({ message: "Avatar removed; reverted to default", avatarUrl: DEFAULT_AVATAR_URL });
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error during avatar removal", error);
    }
  });

}
