// File: backend/src/routes/changePasswordRoutes.ts

import { FastifyInstance } from 'fastify';
import { ChangePasswordRequest } from '../schemas/changePasswordSchema.js';
import dotenv from "dotenv";
import sanitizeHtml from 'sanitize-html';
import bcrypt from "bcrypt";
import { sendError } from '../utils/error.js';

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

export async function changePasswordRoutes(fastify: FastifyInstance) {

  // Change User Password
  fastify.put<{ Params: { id: string }; Body: ChangePasswordRequest }>(
    "/:id/password",
    async (req, reply) => {

      try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        if (!id) return reply.status(400).send({ error: "Missing user ID" });
        if (!oldPassword) return reply.status(400).send({ error: "Old password is required" });
        if (!newPassword) return reply.status(400).send({ error: "New password is required" });

        if (newPassword.length < 8) {
          return reply.status(400).send({ error: "New password must be at least 8 characters long." });
        }

        // 🔍 Check if user exists
        // Fetch the user record including the password hash
        const userStmt = await fastify.db.prepare("SELECT password FROM users WHERE id = ?");
        const user = await userStmt.get(id);
        if (!user) return reply.status(404).send({ error: "User not found" });

        // 🔒 Verify old password
        // Verify that the provided old password matches the stored hash
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
          return reply.status(400).send({ error: "Old password is incorrect." });
        }

        // 🔐 Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // ✅ Update password in the database
        const updateStmt = await fastify.db.prepare("UPDATE users SET password = ? WHERE id = ?");
        await updateStmt.run(hashedPassword, id);

        reply.send({ message: "Password updated successfully." });
      } catch (error) {
        return sendError(reply, 500, "❌ Error updating password", error);
      }
    }
  );

}