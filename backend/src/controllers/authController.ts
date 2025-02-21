/** Handles authentication logic (register, login, profile).
 * - Controllers handle HTTP requests, making route files cleaner.
 * - Services handle business logic, making it reusable.
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { registerUser, findUserByEmail } from "../services/authService.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import bcrypt from "bcrypt";

/**
 * Handles user registration
 * 
 * @param request - Fastify request containing `email`, `password`, and `username`
 * @param reply - Fastify reply object
 * @returns JSON response with user data and JWT token
 */
export async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
	// Extract user input from request body
    const { email, password, username } = request.body as { email: string; password: string; username: string };

	// Validate required fields
    if (!email || !password || !username) {
      return reply.status(400).send({ error: "Email, username, and password are required" });
    }

	// Register user (handled by authService.ts)
    const user = await registerUser(email, password, username);

	// Generate JWT token
    const token = generateToken(user.id, user.email);

    return reply.status(201).send({ message: "User registered successfully", user, token });

  } catch (error) {
    console.error("❌ Error in /auth/register:", error);

	// Ensure error is properly typed before accessing `.message`
	const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return reply.status(500).send({ error: errorMessage });
  }
}

/**
 * Handles user login
 * 
 * @param request - Fastify request containing 'email' and 'password'
 * @param reply - Fastify reply object
 * @returns JSON response with JWT token if login is successful
 */
export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password } = request.body as { email: string; password: string };

	// Validate required fields
    if (!email || !password) {
      return reply.status(400).send({ error: "Email and password are required" });
    }

	// Fetch user from database
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

	// Generate JWT token
    const token = generateToken(user.id, user.email);

    return reply.status(200).send({ message: "Login successful", user, token });

  } catch (error) {
    console.error("❌ Error in /auth/login:", error);
	const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return reply.status(500).send({ error: errorMessage });
  }
}

/**
 * Handles retrieving the authenticated user's profile
 * 
 * @param request - Fastify request containing authorization header with JWT token
 * @param reply - Fastify reply object
 * @returns JSON response with user data
 */
export async function profileHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
	// Extract the authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: "Unauthorized: No token provided" });
    }

	// Extract and verify JWT token
    const token = authHeader.split(" ")[1];
    const decoded: any = verifyToken(token);

	// Find user by email (decoded from token)
    const user = await findUserByEmail(decoded.email);
    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    return reply.status(200).send({ user });
  } catch (error) {
    console.error("❌ Error in /auth/me:", error);
	const errorMessage = error instanceof Error ? error.message : "Unauthorized: Invalid token";
    return reply.status(401).send({ error: errorMessage });
  }
}
