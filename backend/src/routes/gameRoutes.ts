/**
 * - Start a match (POST /game/start)
 * - End a match (POST /game/end)
 * - Get top players (GET /leaderboard)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { GameService } from "../services/gameService.js";

// Define expected request body types
interface MatchStartRequest {
    player1Id: string;
    player2Id: string;
}

interface MatchEndRequest {
    matchId: string;
    winnerId: string;
}

/**
 * Registers game-related routes.
 */
export async function gameRoutes(fastify: FastifyInstance) {
	// Start a new match
	fastify.post("/game/start", async (request: FastifyRequest<{ Body: MatchStartRequest }>, reply: FastifyReply) => {
        const { player1Id, player2Id } = request.body;

		if (!player1Id || !player2Id) {
            return reply.status(400).send({ error: "Both player1Id and player2Id are required." });
        }

        const game = await GameService.startGame(player1Id, player2Id);
        return reply.send(game);
    });

	// End a match
	fastify.post("/game/end", async (request: FastifyRequest<{ Body: MatchEndRequest }>, reply: FastifyReply) => {
        const { matchId, winnerId } = request.body;

		if (!matchId || !winnerId) {
            return reply.status(400).send({ error: "Both matchId and winnerId are required." });
        }

        const updatedGame = await GameService.endGame(matchId, winnerId);
        return reply.send(updatedGame);
    });

	// Get leaderboard
	fastify.get("/leaderboard", async (request: FastifyRequest, reply: FastifyReply) => {
        const leaderboard = await GameService.getLeaderboard();
        return reply.send(leaderboard);
    });
}
