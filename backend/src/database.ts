// File: backend/src/database.ts

import { FastifyInstance } from 'fastify';

/**
 * Ensures the database is set up before the server starts.
 * Creates required tables if they don't exist.
 */
export async function setupDatabase(fastify: FastifyInstance) {

  const db = fastify.db;

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
  	  matchesPlayed INTEGER DEFAULT 0,
      twoFactorSecret TEXT,
      isTwoFactorEnabled INTEGER DEFAULT 0
  	);
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS friends (
      userId INTEGER NOT NULL,
      friendId INTEGER NOT NULL,
      PRIMARY KEY (userId, friendId),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (friendId) REFERENCES users(id) ON DELETE CASCADE
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
      matchType TEXT CHECK(matchType IN ('1vs1', 'vs AI', 'Tournament')) DEFAULT '1vs1',
	    tournamentId INTEGER,
	    FOREIGN KEY (player1) REFERENCES users(id),
	    FOREIGN KEY (player2) REFERENCES users(id),
	    FOREIGN KEY (tournamentId) REFERENCES tournaments(tournamentId)
	  );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS match_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      result TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `)

  // Reset all non-anonymized users to "offline" on server restart
  await db.exec(`
    UPDATE users
    SET status = 'offline'
    WHERE status <> 'anonymized'
  `);
}

// console.log("🛠️ Reset all users to offline on server startup.");
// console.log("✅ Database setup complete.");
