// File: database/src/routes/authRoutes.ts
// Handles authentication endpoints like login and registration.

import { FastifyInstance } from 'fastify';
import { User, PublicUser, RegisterRequest, LoginRequest, LogoutRequest } from "../schemas/userSchema.js";
import bcrypt from 'bcrypt';
import sanitizeHtml from 'sanitize-html';

export async function authRoutes(fastify: FastifyInstance) {

  // User registration route
  fastify.post<{ Body: RegisterRequest }>("/register", async (req, reply) => {
    try {
      // Extract user input
      const { username, email, password } = req.body;

      // Validate required fields
      if (!username || !email || !password ) {
        return reply.status(400).send({ error: "Username, email and password are required" });
      }

      // 🔍 Check if username or email already exists
      const stmtCheck = await fastify.db.prepare("SELECT id, username, email FROM users WHERE email = ? OR username = ?");
      const existingUser = await stmtCheck.all(email, username); // `all()` returns an array

      if (existingUser.length > 0) {
        const isEmailTaken = existingUser.some(user => user.email === email);
        const isUsernameTaken = existingUser.some(user => user.username === username);

        if (isEmailTaken) {
          return reply.status(400).send({ error: "Email is already registered." });
        }
        if (isUsernameTaken) {
          return reply.status(400).send({ error: "Username is already taken." });
        }
      }

      // 🔒 Sanitize user input to prevent XSS
      const sanitizedUsername = sanitizeHtml(username);
      const sanitizedEmail = sanitizeHtml(email);

      // 🔐 Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10); // **use env for salt

      // 💾 Store user in the database
      const stmt = await fastify.db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
      await stmt.run(sanitizedUsername, sanitizedEmail, hashedPassword);

      // Retrieve the last inserted user ID
      const stmtId = await fastify.db.prepare("SELECT last_insert_rowid() as id");
      const row = await stmtId.get();
      const insertedUserId = row?.id ?? null;

      // // Retrieve the last inserted user ID
      // const stmtId = await fastify.db.prepare("SELECT last_insert_rowid() as id");
      // const rows = await stmtId.all();
      // const insertedUserId = rows.length > 0 ? rows[0].id : null;

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

      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return reply.status(400).send({ error: "Email and password are required" });
      }

      // 🔍 Check if user exists
      const stmt = await fastify.db.prepare("SELECT * FROM users WHERE email = ?");
      const user = await stmt.get(email);

      if (!user) return reply.status(401).send({ error: "Invalid email" });

      // 🔒 Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return reply.status(401).send({ error: "Invalid password" });

      // Set user status to "online"
      const updateStmt = await fastify.db.prepare("UPDATE users SET status = ? WHERE id = ?");
      await updateStmt.run("online", user.id);

      // Use `publicUser` to exclude the password field
      // const { password: _, ...safeUser }: PublicUser = user;
      // const { password: _, ...safeUser }: PublicUser = { ...user, status: "online" };
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
