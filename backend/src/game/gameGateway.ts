/**
 * WebSockets for Multiplayer
 * - Handles real-time WebSocket connections
 * - Sends paddle & ball movements to all players
 * - Disconnects players when they leave
 */

import { FastifyInstance } from "fastify";
import WebSocket from "ws";
import { GameState } from "./gameState.js";

/**
 * Sets up the WebSocket connection for the game.
 */
export function setupGameWebSocket(fastify: FastifyInstance) {
    fastify.get("/ws/game", { websocket: true }, (connection, req) => {
        console.log("New WebSocket connection");

		const { gameId } = req.query as { gameId: string };

        // Create or fetch game session
        if (!GameState.games.has(gameId)) {
            GameState.createGame(gameId);
        }

        let game = GameState.games.get(gameId);
		if (!game) {
			console.error(`Game with ID ${gameId} not found.`);
            connection.close();
            return;
		}

        if (game.players.length < 2) {
            game.players.push(connection);
        } else {
            connection.close();
            return;
        }

        // Handle incoming messages (paddle movement, score updates)
        connection.on("message", (message: string) => {
			try {
				let data = JSON.parse(message);

				if (data.type == "paddleMove") {
					game.players.forEach(player => player.send(JSON.stringify(data)));
				}

				if (data.type === "ballUpdate") {
					GameState.updateBallPosition(gameId, data);
					game.players.forEach(player => player.send(JSON.stringify(game.ball)));
				}
			} catch (error) {
				console.error("Error parsing WebSocket message:", error);
			}
        });

        connection.on("close", () => {
            console.log("Player disconnected");
            game.players = game.players.filter(p => p !== connection);
            if (game.players.length === 0) {
                GameState.deleteGame(gameId);
            }
        });
    });
}
