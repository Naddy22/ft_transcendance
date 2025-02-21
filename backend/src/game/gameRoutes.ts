import { FastifyInstance } from "fastify";
import { GameService } from "../game/gameService";

export async function gameRoutes(fastify: FastifyInstance) {
    fastify.post("/game/start", async (request, reply) => {
        const { player1Id, player2Id } = request.body as { player1Id: string, player2Id: string };
        const game = await GameService.startGame(player1Id, player2Id);
        return reply.send(game);
    });

    fastify.post("/game/end", async (request, reply) => {
        const { matchId, winnerId } = request.body as { matchId: string, winnerId: string };
        const updatedGame = await GameService.endGame(matchId, winnerId);
        return reply.send(updatedGame);
    });

    fastify.get("/leaderboard", async (request, reply) => {
        const leaderboard = await GameService.getLeaderboard();
        return reply.send(leaderboard);
    });
}
