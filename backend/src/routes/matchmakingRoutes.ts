// File: backend/src/routes/matchmakingRoutes.ts:
// Handles matchmaking and pairing players.

import { FastifyInstance } from "fastify";
import { MatchmakingRequest, MatchmakingResponse } from "../schemas/matchmakingSchema.js";
import { sendError } from "../utils/error.js";

type Player = { id: number; username: string; socket?: any };
let waitingPlayer: Player | null = null;

export async function matchmakingRoutes(fastify: FastifyInstance) {

  fastify.post<{ Body: MatchmakingRequest, Reply: MatchmakingResponse }>(
    "/join",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
    try {
      const { userId, username } = req.body;
      // if (!userId || !username) {
      //   return reply.status(400).send({ error: "User ID and username are required" });
      // }

      // If no one is waiting, store player and respond with "waiting"
      if (!waitingPlayer) {
        waitingPlayer = { id: userId, username };
        return reply.send({
          matchId: 0,
          player1: waitingPlayer,
          player2: { id: 0, username: "" },
          status: "waiting"
        });
      }

      // Match found, create match entry
      const matchId = Date.now();
      const matchStmt = await fastify.db.prepare(
        "INSERT INTO matches (matchId, player1, player2, startTime) VALUES (?, ?, ?, ?)"
      );
      await matchStmt.run(matchId, waitingPlayer.id, userId, new Date().toISOString());

      const matchData: MatchmakingResponse = {
        matchId,
        player1: waitingPlayer,
        player2: { id: userId, username },
        status: "started",
      };

      // If the waiting player has an associated socket, notify them
      if (waitingPlayer.socket) {
        waitingPlayer.socket.send(JSON.stringify({ event: "match_found", data: matchData }));
      }

      reply.send(matchData);
      waitingPlayer = null;
    } catch (error) {
      return sendError(reply, 500, "Internal Server Error during matchmaking", error);
    }
  });
}
