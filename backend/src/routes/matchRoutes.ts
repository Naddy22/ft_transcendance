// File: backend/src/routes/matchRoutes.ts
// Handles match history and specific match retrieval.

import { FastifyInstance } from 'fastify';
import {
  Match,
  MatchHistoryEntry,
  NewMatchRequest,
  MatchUpdateRequest
} from "../schemas/matchSchema.js";
import { sendError } from "../utils/error.js";

export async function matchRoutes(fastify: FastifyInstance) {

  /**
   * Get all past matches
   */
  fastify.get(
    "/",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const stmt = await fastify.db.prepare(`
          SELECT *
          FROM matches
        `);
        const matches: Match[] = await stmt.all();
        reply.send(matches);
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error while fetching match history", error);
      }
    }
  );

  /**
   * Get details of a specific match
   */
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    async (req, reply) => {
      try {
        const { id: matchId } = req.params;
        const stmt = await fastify.db.prepare(`
          SELECT *
          FROM matches
          WHERE matchId = ?
        `);
        stmt.bind(matchId);
        const match: Match | undefined = await stmt.get();

        if (!match) {
          return reply.status(404).send({
            error: "Match not found"
          });
        }
        reply.send(match);

      } catch (error) {
        return sendError(reply, 500, "Internal Server Error while fetching match", error);
      }
    }
  );

  /**
   * Create a new match
   */
  fastify.post<{ Body: NewMatchRequest }>(
    "/",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const { player1, player2, score, startTime, tournamentId, matchType } = req.body;

        if (!["1vs1", "vs AI", "Tournament"].includes(matchType)) {
          return reply.status(400).send({
            error: "Invalid match type"
          });
        }

        const stmt = await fastify.db.prepare(`
          INSERT INTO matches (player1, player2, score_player1, score_player2, startTime, tournamentId, matchType) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const result = await stmt.run(player1, player2, score.player1, score.player2, startTime, tournamentId, matchType);

        reply.status(201).send({
          message: "Match created",
          matchId: result.lastID
        });
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error while creating match", error);
      }
    }
  );


  /**
   * Update match results
   */
  fastify.put<{ Params: { id: string }, Body: MatchUpdateRequest }>(
    "/:id",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const { id: matchId } = req.params;
        const { winner, score, endTime } = req.body;

        if (!winner && !score && !endTime) {
          return reply.status(400).send({
            error: "Nothing to update"
          });
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
        const stmt = await fastify.db.prepare(`
          UPDATE matches
          SET ${updates.join(", ")}
          WHERE matchId = ?
        `);
        await stmt.run(...values);
        reply.send({
          message: "Match updated"
        });
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error while updating match", error);
      }
    }
  );

  /**
   * Get match history for a given user
   * (only type, result, and date)
   */
  fastify.get<{ Params: { userId: string } }>(
    "/history/:userId",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const { userId } = req.params;

        const stmt = await fastify.db.prepare(`
          SELECT matchId, player1, player2, winner, score_player1, score_player2, startTime, matchType
          FROM matches WHERE player1 = ? OR player2 = ?
          ORDER BY startTime DESC
        `);
        const matches: MatchHistoryEntry[] = await stmt.all(userId, userId);

        const formattedHistory = matches.map(match => {
          const isWinner = match.winner === parseInt(userId);
          return {
            date: new Date(match.startTime).toLocaleString(),
            type: match.matchType === "Tournament" ? "⚔️ Tournoi" : match.matchType === "vs AI" ? "⚔️ vs IA" : "⚔️ 1vs1",
            result: isWinner ? "✅ Victoire" : "❌ Défaite"
          };
        });

        reply.send(formattedHistory);
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error while fetching match history", error);
      }
    }
  );

  // Submit match result
  fastify.post<{ Body: { matchId: number; winner: number; scorePlayer1?: number; scorePlayer2?: number } }>(
    "/result",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const { matchId, winner, scorePlayer1, scorePlayer2 } = req.body;
        if (!matchId || !winner) {
          return reply.status(400).send({
            error: "matchId and winner are required"
          });
        }
        const stmt = await fastify.db.prepare(`
          SELECT *
          FROM matches
          WHERE matchId = ?
        `);
        const match = await stmt.get(matchId);
        if (!match) return reply.status(404).send({
          error: "Match not found"
        });
        const now = new Date().toISOString();
        const updateMatchStmt = await fastify.db.prepare(`
          UPDATE matches
          SET winner = ?, score_player1 = ?, score_player2 = ?, endTime = ?
          WHERE matchId = ?
        `);
        await updateMatchStmt.run(winner, scorePlayer1 ?? 0, scorePlayer2 ?? 0, now, matchId);
        reply.send({
          message: "Match result updated successfully"
        });
      } catch (error) {
        return sendError(reply, 500, "Internal Server Error while updating match result", error);
      }
    }
  );
}
