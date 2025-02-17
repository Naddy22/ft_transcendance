
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "supersecretkey";

interface RegisterRequestBody {
  email: string;
  password: string;
  username: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * Registers user authentication routes.
 */
export default async function userRoutes(app: FastifyInstance) {
  /**
   * ✅ User Registration Route
   */
  app.post(
    "/auth/register",
    async (request: FastifyRequest<{ Body: RegisterRequestBody }>, reply: FastifyReply) => {
      try {
        const { email, password, username } = request.body;

        if (!email || !password || !username) {
          return reply.status(400).send({ error: "Email, username, and password are required" });
        }

        // ✅ Ensure database is available
        await prisma.$connect();

        // ✅ Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          return reply.status(409).send({ error: "Email is already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create user
        const user = await prisma.user.create({
          data: { email, password: hashedPassword, username },
        });

        // ✅ Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, {
          expiresIn: "1h",
        });

        return reply.status(201).send({ message: "User registered successfully", user, token });
      } catch (error: any) {
        console.error("❌ Error in /auth/register:", error);

        if (error.code === "P2002") {
          return reply.status(409).send({ error: "Email or username already taken" });
        }

        return reply.status(500).send({ error: "Internal server error" });
      } finally {
        await prisma.$disconnect();
      }
    }
  );

  /**
   * ✅ User Login Route
   */
  app.post(
    "/auth/login",
    async (request: FastifyRequest<{ Body: LoginRequestBody }>, reply: FastifyReply) => {
      try {
        const { email, password } = request.body;

        if (!email || !password) {
          return reply.status(400).send({ error: "Email and password are required" });
        }

        // ✅ Ensure database is available
        await prisma.$connect();

        // ✅ Check if user exists
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return reply.status(401).send({ error: "Invalid email or password" });
        }

        // ✅ Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return reply.status(401).send({ error: "Invalid email or password" });
        }

        // ✅ Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, {
          expiresIn: "1h",
        });

        return reply.status(200).send({ message: "Login successful", user, token });
      } catch (error) {
        console.error("❌ Error in /auth/login:", error);
        return reply.status(500).send({ error: "Internal server error" });
      } finally {
        await prisma.$disconnect();
      }
    }
  );

  /**
   * ✅ User Profile Route (Protected)
   */
  app.get("/auth/me", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return reply.status(401).send({ error: "Unauthorized: No token provided" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return reply.status(401).send({ error: "Unauthorized: Invalid token format" });
      }

      const decoded: any = jwt.verify(token, SECRET);

      // ✅ Ensure database is available
      await prisma.$connect();

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      return reply.status(200).send({ user });
    } catch (error) {
      console.error("❌ Error in /auth/me:", error);
      return reply.status(401).send({ error: "Unauthorized: Invalid token" });
    } finally {
      await prisma.$disconnect();
    }
  });

  /**
   * ✅ Global Error Handler
   */
  app.setErrorHandler((error, request, reply) => {
    console.error("❌ Fastify Error:", error);
    reply.status(500).send({ error: "Internal server error" });
  });
}
