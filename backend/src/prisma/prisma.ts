/** Centralized Prisma client.
 * - Manages the database connection.
 * - Prevents multiple connections being opened and closed.
 * - Makes Prisma accessible everywhere in the app.
 */

import { PrismaClient } from "@prisma/client";

console.log("📂 DATABASE_URL:", process.env.DATABASE_URL);

const prisma = new PrismaClient();

// async function connectPrisma() {
//   try {
//     await prisma.$connect();
//     console.log("✅ Prisma connected");
//   } catch (error) {
//     console.error("❌ Prisma connection failed:", error);
//     process.exit(1); // Stop the app if Prisma is broken
//   }
// }

// connectPrisma();

export default prisma;


/*
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate dev

# Start the backend server
npm run dev
*/
