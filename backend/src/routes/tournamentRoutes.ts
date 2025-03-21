// File: backend/src/routes/tournamentRoutes.ts
// Handles listing and retrieving tournament details.

import { FastifyInstance } from 'fastify';
import { Tournament, NewTournamentRequest, TournamentUpdateRequest } from "../schemas/tournamentSchema.js";
import { sendError } from "../utils/error.js";

export async function tournamentRoutes(fastify: FastifyInstance) {

  // Get all tournaments
  fastify.get(
    "/",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
    try {
      const stmt = await fastify.db.prepare("SELECT * FROM tournaments");
      const tournaments: Tournament[] = await stmt.all();
      reply.send(tournaments);
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while fetching tournaments", error);
    }
  });

  // Get specific tournament details by tournamentId
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
    try {
      const { id: tournamentId } = req.params;
      const stmt = await fastify.db.prepare("SELECT * FROM tournaments WHERE tournamentId = ?");
      const tournament: Tournament | undefined = await stmt.get(tournamentId);

      if (!tournament) return reply.status(404).send({ error: "Tournament not found" });
      reply.send(tournament);
      
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while fetching tournament", error);
    }
  });

  // Create a tournament
  fastify.post<{ Body: NewTournamentRequest }>(
    "/",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
    try {
      const { name, players } = req.body;
      // Insert tournament with default status 'pending'
      const stmt = await fastify.db.prepare("INSERT INTO tournaments (name, status) VALUES (?, 'pending')");
      const result = await stmt.run(name);
      const tournamentId = result.lastID;

      // For each player, insert a record into tournament_players if applicable
      for (const player of players) {
        const playersStmt = await fastify.db.prepare(
          "INSERT INTO tournament_players (tournamentId, playerId) VALUES (?, ?)"
        );
        await playersStmt.run(tournamentId, player);
      }

      reply.status(201).send({ message: "Tournament created", tournamentId });
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while creating tournament", error);
    }
  });

  // Update tournament status or winner
  fastify.put<{ Params: { id: string }, Body: TournamentUpdateRequest }>(
    "/:id",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
    try {
      const { id: tournamentId } = req.params;
      const { status, winner } = req.body;

      if (!status && !winner) {
        return reply.status(400).send({ error: "Nothing to update" });
      }

      const updates: string[] = [];
      const values: any[] = [];
      if (status) {
        updates.push("status = ?");
        values.push(status);
      }
      if (winner) {
        updates.push("winner = ?");
        values.push(winner);
      }
      values.push(tournamentId);
      const stmt = await fastify.db.prepare(`UPDATE tournaments SET ${updates.join(", ")} WHERE tournamentId = ?`);
      await stmt.run(...values);
      reply.send({ message: "Tournament updated" });
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error while updating tournament", error);
    }
  });

}
