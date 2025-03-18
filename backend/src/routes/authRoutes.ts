// File: database/src/routes/authRoutes.ts
// Handles authentication endpoints like login and registration.

import { FastifyInstance } from 'fastify';
import dotenv from "dotenv";
import sanitizeHtml from 'sanitize-html';
import bcrypt from 'bcrypt';
import { RegisterRequest, LoginRequest, LogoutRequest } from '../schemas/authSchema.js';
import { User } from "../schemas/userSchema.js";
import { sendError } from "../utils/error.js";

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

export async function authRoutes(fastify: FastifyInstance) {

  // User registration route
  fastify.post<{ Body: RegisterRequest }>("/register", async (req, reply) => {
    try {
      const { username, email, password } = req.body;

      // Validate required fields with specific messages
      if (!username) return reply.status(400).send({ error: "Username is required" });
      if (!email) return reply.status(400).send({ error: "Email is required" });
      if (!password) return reply.status(400).send({ error: "Password is required" });

      if (password.length < 8) {
        return reply.status(400).send({ error: "Password must be at least 8 characters long." });
      }

      // 🛡 Sanitize user input to prevent XSS
      const sanitizedUsername = sanitizeHtml(username, { allowedTags: [], allowedAttributes: {} });
      const sanitizedEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });

      // 🛡 Ensure sanitized username is still valid
      if (!sanitizedUsername.match(/^[a-zA-Z0-9_-]{3,30}$/)) {
        return reply.status(400).send({ error: "Invalid username format (3-30 alphanumeric characters, _ or - allowed)." });
      }

      // 🛡 Check email format
      if (!sanitizedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return reply.status(400).send({ error: "Invalid email format" });
      }

      // 🔍 Check if username or email already exists (case-insensitive for email)
      const stmtCheck = await fastify.db.prepare("SELECT id, username, email FROM users WHERE username = ? OR LOWER(email) = LOWER(?)");
      const existingUser = await stmtCheck.all(sanitizedUsername, sanitizedEmail); // `all()` returns an array

      if (existingUser.length > 0) {
        // Check separately for email and username
        const isUsernameTaken = existingUser.some(user => user.username === sanitizedUsername);
        const isEmailTaken = existingUser.some(user => user.email === sanitizedEmail);

        if (isUsernameTaken) {
          return reply.status(400).send({ error: "Username is already taken." });
        }
        if (isEmailTaken) {
          return reply.status(400).send({ error: "Email is already registered." });
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
      // console.error("❌ Error during registration:", error);
      // reply.status(500).send({ error: "Internal Server Error" });
      return sendError(reply, 500, "Internal Server Error during registration", error);
    }
  });

  // User login route
  fastify.post<{ Body: LoginRequest }>("/login", async (req, reply) => {
    try {
      const { identifier, password } = req.body;

      // Validate required fields
      if (!identifier) return reply.status(400).send({ error: "Username or email is required" });
      if (!password) return reply.status(400).send({ error: "Password is required" });

      // 🔍 Search for user by either username or email
      const stmt = await fastify.db.prepare("SELECT * FROM users WHERE username = ? OR email = ?");
      const user = await stmt.get(identifier, identifier) as User | undefined;

      if (!user) return reply.status(401).send({ error: "Invalid username or email" });

      // 🔒 Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return reply.status(401).send({ error: "Invalid password" });

      // Set avatar to default and user status to "online"
      const updateStmt = await fastify.db.prepare("UPDATE users SET status = ? WHERE id = ?");
      await updateStmt.run("online", user.id);

      // Exclude password field from response
      const { password: _, ...safeUser } = user;

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
      // return sendError(reply, 500, "Internal Server Error during logout", error);
    }
  });

}
