/** Defines authentication routes.
 * - Routes now only handle HTTP method definitions.
 * - The logic is delegated to controllers.
 */

import { FastifyInstance } from "fastify";
import { registerHandler, loginHandler, profileHandler } from "../controllers/authController.js";

/**
 * Registers authentication routes.
 * 
 * @param app - Fastify instance to register routes on
 */
export default async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", registerHandler);	// Handles user registration
  app.post("/auth/login", loginHandler);		// Handles user login
  app.get("/auth/me", profileHandler);			// Retrieves authenticated user profile
}
