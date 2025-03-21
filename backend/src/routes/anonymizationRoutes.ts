// File: backend/src/routes/anonymizationRoutes.ts

import { FastifyInstance } from "fastify";
import { sendError } from "../utils/error.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Resolve __dirname and paths correctly in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function anonymizationRoutes(fastify: FastifyInstance) {

  // Directories
  const DEFAULT_AVATAR_DIR = path.join(__dirname, "../../img/avatars");
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
        const userStmt = await fastify.db.prepare("SELECT * FROM users WHERE id = ?");
        const user = await userStmt.get(id);
        if (!user) {
          return reply.status(404).send({ error: "User not found" });
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

        // Build anonymized data. Using the user ID to ensure uniqueness.
        const anonymizedData = {
          // username: `anonymous_${id}`,
          username: "anonymous",
          // email: `anonymous_${id}@example.com`,
          email: "anonymous@cat.pong",
          // avatar: null,
          avatar: ANONYMOUS_AVATAR_URL,
          status: "anonymized"
        };

        // Update the user record with anonymized values
        const updateStmt = await fastify.db.prepare(
          `UPDATE users SET username = ?, email = ?, avatar = ?, status = ? WHERE id = ?`
        );
        await updateStmt.run(
          anonymizedData.username,
          anonymizedData.email,
          anonymizedData.avatar,
          anonymizedData.status,
          id
        );

        // Optionally, cascade changes or remove related PII from associated tables.
        // Delete friend relationships?

        reply.send({ message: "User data anonymized successfully" });
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error during anonymization", error);
      }
    }
  );

}

/*
User Communication:
Make sure the UI clearly warns the user that once they choose to anonymize their account,
the process is permanent and they will no longer be able to log in with the original credentials.

Data Export:
You might also consider offering a data export option before anonymization,
so the user can download their data if needed.
*/

/*
UI section for “Privacy Settings” menu) where users can:

- View their current stored data.
- Request a data export (download as JSON).
- Trigger anonymization.
- Request account deletion with clear warnings about what data will be removed.

Documentation and User Communication:

Clearly document these features in your privacy policy and in the UI,
so users understand what happens when they request anonymization or deletion.

*/
