/** Centralized Prisma client.
 * - Manages the database connection.
 * - Prevents multiple connections being opened and closed.
 * - Makes Prisma accessible everywhere in the app.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// const prisma = new PrismaClient({
// 	datasourceUrl: "file:../../database/data.db"
// });

export default prisma;
