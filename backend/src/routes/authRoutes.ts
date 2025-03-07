// File: database/src/routes/authRoutes.ts
// Handles authentication endpoints like login and registration.

import { FastifyInstance } from 'fastify';
import dotenv from "dotenv";
import sanitizeHtml from 'sanitize-html';
import bcrypt from 'bcrypt';
import {
  PublicUser, RegisterRequest, LoginRequest, LogoutRequest
} from "../schemas/userSchema.js";

dotenv.config();

// console.log("BCRYPT_SALT_ROUNDS:", process.env.BCRYPT_SALT_ROUNDS); // debug
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);
// console.log("SALT_ROUNDS:", SALT_ROUNDS); // debug

export async function authRoutes(fastify: FastifyInstance) {

  // User registration route
  fastify.post<{ Body: RegisterRequest }>("/register", async (req, reply) => {
    try {
      // Extract user input
      const { username, email, password } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return reply.status(400).send({ error: "Username, email and password are required" });
      }

      // 🛡 Sanitize user input to prevent XSS
      const sanitizedUsername = sanitizeHtml(username, { allowedTags: [], allowedAttributes: {} });
      const sanitizedEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });

      // 🛡 Check email format
      if (!sanitizedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return reply.status(400).send({ error: "Invalid email format" });
      }

      // 🛡 Ensure sanitized username is still valid
      if (!sanitizedUsername.match(/^[a-zA-Z0-9_-]{3,30}$/)) {
        return reply.status(400).send({ error: "Invalid username format (3-30 alphanumeric characters, _ or - allowed)." });
      }

      // 🔍 Check if username or email already exists (case-insensitive for email)
      const stmtCheck = await fastify.db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR username = ?");
      const existingUser = await stmtCheck.all(sanitizedEmail, sanitizedUsername); // `all()` returns an array

      if (existingUser.length > 0) {
        const isEmailTaken = existingUser.some(user => user.email === sanitizedEmail);
        const isUsernameTaken = existingUser.some(user => user.username === sanitizedUsername);

        if (isEmailTaken) {
          return reply.status(400).send({ error: "Email is already registered." });
        }
        if (isUsernameTaken) {
          return reply.status(400).send({ error: "Username is already taken." });
        }
      }

      // 🔐 Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // 💾 Store user in the database
      const stmt = await fastify.db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
      await stmt.run(sanitizedUsername, sanitizedEmail, hashedPassword);

      // Retrieve the last inserted user ID
      const stmtId = await fastify.db.prepare("SELECT last_insert_rowid() as id");
      const row = await stmtId.get();
      const insertedUserId = row?.id ?? null;

      // Respond with the user data (excluding password)
      reply.status(201).send({ id: insertedUserId, username: sanitizedUsername, email: sanitizedEmail });

    } catch (error) {
      console.error("❌ Error during registration:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  // User login route
  fastify.post<{ Body: LoginRequest }>("/login", async (req, reply) => {
    try {

      const { identifier, password } = req.body;

      // Validate required fields
      if (!identifier || !password) {
        return reply.status(400).send({ error: "Username/Email and password are required" });
      }

      // 🔍 Search for user by either email or username
      const stmt = await fastify.db.prepare("SELECT * FROM users WHERE email = ? OR username = ?");
      const user = await stmt.get(identifier, identifier);

      if (!user) return reply.status(401).send({ error: "Invalid username or email" });

      // 🔒 Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return reply.status(401).send({ error: "Invalid password" });

      // Set user status to "online"
      const updateStmt = await fastify.db.prepare("UPDATE users SET status = ? WHERE id = ?");
      await updateStmt.run("online", user.id);

      // Exclude password field from response
      const { password: _, ...safeUser } = user as PublicUser;

      reply.send({ message: "✅ Login successful", user: safeUser });
    } catch (error) {
      console.error("❌ Error during login:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  // User logout route
  fastify.post<{ Body: LogoutRequest }>("/logout", async (req, reply) => {
    try {
      const { id } = req.body;

      if (!id) return reply.status(400).send({ error: "Missing user ID" });

      // Set user status to "offline"
      const stmt = await fastify.db.prepare("UPDATE users SET status = ? WHERE id = ?");
      const user = await stmt.run("offline", id);

      reply.send({ message: "👋 User logged out successfully" });
    } catch (error) {
      console.error("❌ Error during logout:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

}
