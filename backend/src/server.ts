// /** 
//  * Responsible for running the server.
//  * - Starts the Fastify app by calling `app.listen()`.
//  */

// import app from "./app.js"

// /**
//  * Starts the Fastify server
//  */
// const start = async () => {
//   try {
//     await app.listen({ port: 3000, host: "0.0.0.0" });
//     console.log(`✅ Server running on http://localhost:3000`);
//   } catch (err) {
//     app.log.error("❌ Failed to start server:", err);
//     process.exit(1);
//   }
// };

// start();

/**
 * Responsible for running the server.
 * - Starts the Fastify app by calling `app.listen()`.
 */

import app from "./app.js";
import { PrismaClient } from "@prisma/client";

/**
 * Starts the Fastify server
 */
const start = async () => {
  try {
    const prisma = new PrismaClient();
    
    console.log("📂 DATABASE_URL:", process.env.DATABASE_URL);

    console.log("🔄 Connecting to Prisma...");
    await prisma.$connect();
    console.log("✅ Prisma connected successfully!");

    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log(`🚀 Server running on http://localhost:3000`);
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();
