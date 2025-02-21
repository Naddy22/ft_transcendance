/** Handles Prisma queries and database operations.
 * - Keeps business logic separate from routing.
 * - Can be reused in different parts of the app.
 */

import bcrypt from "bcrypt";
import prisma from "../prisma/prisma.js"; // Import centralized Prisma client

/**
 * Registers a new user in the database.
 * 
 * @param email - The user's email
 * @param password - The user's password (plaintext)
 * @param username - The user's chosen username
 * @returns The created user object
 * @throws Error if the email is already in use
 */
export async function registerUser(email: string, password: string, username: string) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email is already in use");

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user in the database
  return await prisma.user.create({
    data: { email, password: hashedPassword, username },
  });
}

/**
 * Finds a user by email.
 * 
 * @param email - The email of the user to find
 * @returns The user object if found, otherwise `null`
 */
export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({ where: { email } });
}


// 
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// module.exports = async function (fastify, opts) {
//     const db = new (require('sqlite3').verbose()).Database(process.env.DB_PATH);

//     fastify.post('/register', async (req, reply) => {
//         const { username, password } = req.body;
//         if (!username || !password) {
//             return reply.status(400).send({ error: 'Missing fields' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
//             if (err) return reply.status(500).send({ error: err.message });
//             reply.send({ message: 'User registered' });
//         });
//     });

//     fastify.post('/login', async (req, reply) => {
//         const { username, password } = req.body;
//         db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
//             if (err || !user) return reply.status(401).send({ error: 'Invalid credentials' });

//             const validPassword = await bcrypt.compare(password, user.password);
//             if (!validPassword) return reply.status(401).send({ error: 'Invalid credentials' });

//             const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//             reply.send({ token });
//         });
//     });
// };
