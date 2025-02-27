// File: backend/src/routes/userRoutes.ts

import bcrypt from "bcrypt";
import { FastifyInstance, FastifySchema } from 'fastify';
// import { userSchema, User } from '../schemas/userSchema.js';
import { userSchema, userResponseSchema, loginSchema, User, LoginRequest } from "../schemas/userSchema.js";

export async function userRoutes(fastify: FastifyInstance) {

	// Register Route
	fastify.post<{ Body: User }>("/register", {
		schema: { body: userSchema, response: { 201: userResponseSchema } }
	}, async (req, reply) => {
		try {
			const { username, email, password } = req.body;

			// Hash password
			const saltRounds = 10;
			const hashedPassword = await bcrypt.hash(password, saltRounds);

			// Store user in database
			const stmt = fastify.sqlite.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
			const result = stmt.run(username, email, hashedPassword);

			reply.status(201).send({ id: result.lastInsertRowid, username, email });
		} catch (error) {
			console.error("Error during registration:", error);
			reply.status(500).send({ error: "Internal Server Error" });
		}
	});

	// Login Route
	fastify.post<{ Body: LoginRequest }>("/login", {
		schema: { body: loginSchema }
	},	async (req, reply) => {
		try {
		  const { email, password } = req.body;
	
		  // 🔍 Check if user exists
		  const user = fastify.sqlite.prepare("SELECT * FROM users WHERE email = ?").get(email);
		  if (!user)
			return reply.status(401).send({ error: "User not found" });
	
		  // 🔒 Compare hashed password
		  const passwordMatch = await bcrypt.compare(password, user.password);
		  if (!passwordMatch)
			return reply.status(401).send({ error: "Invalid credentials" });
	
		  reply.send({ message: "Login successful", userId: user.id });
		} catch (error) {
		  console.error("Error during login:", error);
		  reply.status(500).send({ error: "Internal Server Error" });
		}
	});
	
	  // List Users Route (EXCLUDES PASSWORDS)
	  fastify.get("/list", {
		schema: { response: { 200: { type: "array", items: userResponseSchema } } }
	  }, async (req, reply) => {
		try {
		  const users = fastify.sqlite.prepare("SELECT id, username, email FROM users").all();
		  reply.send(users);
		} catch (error) {
		  console.error("Error fetching users:", error);
		  reply.status(500).send({ error: "Internal Server Error" });
		}
	});
}
