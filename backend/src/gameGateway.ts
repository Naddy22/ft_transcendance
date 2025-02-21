import { FastifyInstance } from "fastify";
import WebSocket from "ws";

const activeGames = new Map<string, { players: WebSocket[], ball: any }>();

export function setupGameWebSocket(fastify: FastifyInstance) {
    fastify.get('/ws/game', { websocket: true }, (connection, req) => {
        console.log("New WebSocket connection");

        let gameId = req.query.gameId as string;

        if (!activeGames.has(gameId)) {
            activeGames.set(gameId, { players: [], ball: { x: 450, y: 300, dx: 4, dy: 0 } });
        }

        let game = activeGames.get(gameId);
        if (game!.players.length < 2) {
            game!.players.push(connection.socket);
        } else {
            connection.socket.close();
            return;
        }

        connection.socket.on("message", (message) => {
            let data = JSON.parse(message.toString());

            // Handle paddle movement from players
            if (data.type === "paddleMove") {
                game!.players.forEach(player => player.send(JSON.stringify(data)));
            }

            // Broadcast game state to all clients
            game!.players.forEach(player => player.send(JSON.stringify(game!.ball)));
        });

        connection.socket.on("close", () => {
            console.log("Player disconnected");
            game!.players = game!.players.filter(p => p !== connection.socket);
            if (game!.players.length === 0) {
                activeGames.delete(gameId);
            }
        });
    });
}
