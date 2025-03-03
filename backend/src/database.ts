// File: backend/src/database.ts

import { FastifyInstance } from 'fastify';

/**
 * Ensures the database is set up before the server starts.
 * Creates required tables if they don't exist.
 */
export async function setupDatabase(fastify: FastifyInstance) {
  // if (!fastify.db) {
  //   throw new Error("SQLite database is not available in Fastify instance.");
  // }

  const db = fastify.db;
  // console.log("🔍 Fastify database instance:", fastify.db); // debug

  await db.exec(`
	CREATE TABLE IF NOT EXISTS users (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  username TEXT UNIQUE NOT NULL,
	  email TEXT UNIQUE NOT NULL,
	  password TEXT NOT NULL,
	  avatar TEXT,
	  status TEXT DEFAULT 'offline',
	  wins INTEGER DEFAULT 0,
	  losses INTEGER DEFAULT 0,
	  matchesPlayed INTEGER DEFAULT 0
	);
  `);

  await db.exec(`
	CREATE TABLE IF NOT EXISTS matches (
	  matchId INTEGER PRIMARY KEY AUTOINCREMENT,
	  player1 INTEGER NOT NULL,
	  player2 INTEGER NOT NULL,
	  winner INTEGER,
	  score_player1 INTEGER DEFAULT 0,
	  score_player2 INTEGER DEFAULT 0,
	  startTime TEXT NOT NULL,
	  endTime TEXT,
	  tournamentId INTEGER,
	  FOREIGN KEY (player1) REFERENCES users(id),
	  FOREIGN KEY (player2) REFERENCES users(id),
	  FOREIGN KEY (tournamentId) REFERENCES tournaments(tournamentId)
	);
  `);

  await db.exec(`
	CREATE TABLE IF NOT EXISTS tournaments (
	  tournamentId INTEGER PRIMARY KEY AUTOINCREMENT,
	  name TEXT NOT NULL,
	  status TEXT DEFAULT 'pending',
	  winner INTEGER,
	  FOREIGN KEY (winner) REFERENCES users(id)
	);
  `);

  // Reset all users to "offline" on server restart
  await db.exec("UPDATE users SET status = 'offline'");
  // console.log("🛠️ Reset all users to offline on server startup.");

  // console.log("✅ Database setup complete.");
}

// Now the database is ready before any API calls are made.
// Fastify will create tables if they don’t exist yet.
