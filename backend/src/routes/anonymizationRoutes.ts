// File: backend/src/routes/anonymizationRoutes.ts

import { FastifyInstance } from 'fastify';
import { sendError } from "../utils/error.js";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Resolve __dirname and paths correctly in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function anonymizationRoutes(fastify: FastifyInstance) {

  // Directories
  // const DEFAULT_AVATAR_DIR = path.join(__dirname, "../../img/avatars");
  const AVATAR_UPLOAD_DIR = path.join(__dirname, "../../uploads/avatars");

  // Define URL constants
  const DEFAULT_AVATAR_URL = "/avatars/default/default_cat.webp";
  const ANONYMOUS_AVATAR_URL = "/avatars/default/anonymous_cat.webp";

  // GDPR Anonymization Endpoint
  fastify.put<{ Params: { id: string } }>(
    '/:id/anonymize',
    // { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const { id } = req.params;

        // Retrieve the current user record
        const userStmt = await fastify.db.prepare(`
          SELECT *
          FROM users
          WHERE id = ?
        `);
        const user = await userStmt.get(id);
        if (!user) {
          return reply.status(404).send({
            error: "User not found"
          });
        }

        // If the user has a custom avatar (not the default), delete it from uploads
        if (user.avatar && user.avatar !== DEFAULT_AVATAR_URL) {
          const filePath = path.join(AVATAR_UPLOAD_DIR, path.basename(user.avatar));
          try {
            await fs.promises.unlink(filePath);
            fastify.log.info(`Deleted avatar file: ${filePath}`);
          } catch (unlinkError) {
            fastify.log.error("Error deleting avatar file", unlinkError);
          }
        }

        // Build anonymized data with unique username.
        // const anonymizedSuffix = `_${user.id}`;
        const anonymizedSuffix = `_${Date.now()}`;
        const anonymizedData = {
          username: `anonymous${anonymizedSuffix}`,
          email: `anonymous${anonymizedSuffix}@cat.pong`,
          avatar: ANONYMOUS_AVATAR_URL,
          status: "anonymized"
        };

        // Update the user record with anonymized values
        const updateStmt = await fastify.db.prepare(`
          UPDATE users
          SET username = ?, email = ?, avatar = ?, status = ?
          WHERE id = ?
        `);
        await updateStmt.run(
          anonymizedData.username,
          anonymizedData.email,
          anonymizedData.avatar,
          anonymizedData.status,
          id
        );

        reply.send({
          message: "User data anonymized successfully"
        });
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error during anonymization", error);
      }
    }
  );
}
