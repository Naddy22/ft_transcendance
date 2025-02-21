import prisma from "../prisma/prisma";

export class GameService {
    static async startGame(player1Id: string, player2Id: string) {
        return await prisma.match.create({
            data: {
                player1Id,
                player2Id,
                createdAt: new Date(),
            },
        });
    }

    static async endGame(matchId: string, winnerId: string) {
        return await prisma.match.update({
            where: { id: matchId },
            data: { winnerId },
        });
    }

    static async getLeaderboard() {
        return await prisma.user.findMany({
            orderBy: { matchesAsPlayer1: { _count: "desc" } },
            take: 10,
            select: { id: true, username: true },
        });
    }
}
