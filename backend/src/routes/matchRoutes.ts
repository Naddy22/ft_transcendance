// File: backend/src/routes/matchRoutes.ts
// Handles match history and specific match retrieval.

import { FastifyInstance } from 'fastify';
import { Match, NewMatchRequest, MatchUpdateRequest } from "../schemas/matchSchema.js";
import { sendError } from "../utils/error.js";

export async function matchRoutes(fastify: FastifyInstance) {

  // Get all past matches
  fastify.get("/", async (req, reply) => {
    try {
      const stmt = await fastify.db.prepare("SELECT * FROM matches");
      const matches: Match[] = await stmt.all();
      reply.send(matches);
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while fetching match history", error);
    }
  });

  // Get details of a specific match
  fastify.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    try {
      const { id: matchId } = req.params;
      const stmt = await fastify.db.prepare("SELECT * FROM matches WHERE matchId = ?");
      stmt.bind(matchId);
      const match: Match | undefined = await stmt.get();

      if (!match) {
        return reply.status(404).send({ error: "Match not found" });
      }
      reply.send(match);

    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while fetching match", error);
    }
  });

  // Create a new match
  fastify.post<{ Body: NewMatchRequest }>("/", async (req, reply) => {
    try {
      const { player1, player2, score, startTime, tournamentId } = req.body;
      const stmt = await fastify.db.prepare(`
        INSERT INTO matches (player1, player2, score_player1, score_player2, startTime, tournamentId) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = await stmt.run(player1, player2, score.player1, score.player2, startTime, tournamentId);
      reply.status(201).send({ message: "Match created", matchId: result.lastID });
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while creating match", error);
    }
  });

  // Update match results
  fastify.put<{ Params: { id: string }, Body: MatchUpdateRequest }>("/:id", async (req, reply) => {
    try {
      const { id: matchId } = req.params;
      const { winner, score, endTime } = req.body;

      if (!winner && !score && !endTime) {
        return reply.status(400).send({ error: "Nothing to update" });
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (winner) {
        updates.push("winner = ?");
        values.push(winner);
      }
      if (score) {
        updates.push("score_player1 = ?, score_player2 = ?");
        values.push(score.player1, score.player2);
      }
      if (endTime) {
        updates.push("endTime = ?");
        values.push(endTime);
      }

      values.push(matchId);
      const stmt = await fastify.db.prepare(`UPDATE matches SET ${updates.join(", ")} WHERE matchId = ?`);
      await stmt.run(...values);
      reply.send({ message: "Match updated" });
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while updating match", error);
    }
  });

  // POST /matches/result
  // Endpoint to submit match results and update user stats accordingly
  fastify.post<{ Body: { matchId: number; winner: number; scorePlayer1?: number; scorePlayer2?: number } }>("/result", async (req, reply) => {
    try {
      const { matchId, winner, scorePlayer1, scorePlayer2 } = req.body;

      // Validate input
      if (!matchId || !winner) {
        return reply.status(400).send({ error: "matchId and winner are required" });
      }

      // Retrieve the existing match record
      const stmt = await fastify.db.prepare("SELECT * FROM matches WHERE matchId = ?");
      const match = await stmt.get(matchId);
      if (!match) return reply.status(404).send({ error: "Match not found" });

      // Update the match record with the result and set endTime
      const now = new Date().toISOString();
      const updateMatchStmt = await fastify.db.prepare(
        "UPDATE matches SET winner = ?, score_player1 = ?, score_player2 = ?, endTime = ? WHERE matchId = ?"
      );
      await updateMatchStmt.run(winner, scorePlayer1 ?? 0, scorePlayer2 ?? 0, now, matchId);

      // Update both players' matchesPlayed count
      const updateMatchesPlayedStmt = await fastify.db.prepare("UPDATE users SET matchesPlayed = matchesPlayed + 1 WHERE id = ?");
      await updateMatchesPlayedStmt.run(match.player1);
      await updateMatchesPlayedStmt.run(match.player2);

      // Determine the losing player
      let loser;
      if (winner === match.player1) {
        loser = match.player2;
      } else if (winner === match.player2) {
        loser = match.player1;
      } else {
        return reply.status(400).send({ error: "Winner does not match any player in the match" });
      }

      // Increment wins for the winner and losses for the loser
      const updateWinsStmt = await fastify.db.prepare("UPDATE users SET wins = wins + 1 WHERE id = ?");
      await updateWinsStmt.run(winner);

      const updateLossesStmt = await fastify.db.prepare("UPDATE users SET losses = losses + 1 WHERE id = ?");
      await updateLossesStmt.run(loser);

      reply.send({ message: "Match result updated successfully" });
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while updating match result", error);
    }
  });

}
