// File: backend/src/routes/matchmakingRoutes.ts:
// Handles matchmaking and pairing players.

import { FastifyInstance } from "fastify";
import { MatchmakingRequest, MatchmakingResponse } from "../schemas/matchmakingSchema.js";

type Player = { id: number; username: string; socket?: any };
let waitingPlayer: Player | null = null;

export async function matchmakingRoutes(fastify: FastifyInstance) {

  fastify.post<{ Body: MatchmakingRequest, Reply: MatchmakingResponse }>("/join", async (req, reply) => {
      const { userId, username } = req.body;

      // If no one is waiting, store player and respond with "waiting"
      if (!waitingPlayer) {
        waitingPlayer = { id: userId, username };
        return reply.send({
          matchId: 0,
          player1: waitingPlayer,
          player2: { id: 0, username: "" },
          status: "waiting" });
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

      // Notify both players
      if (waitingPlayer.socket) {
        waitingPlayer.socket.send(JSON.stringify({ event: "match_found", data: matchData }));
      }

      reply.send(matchData);
      waitingPlayer = null;
    }
  );

}
