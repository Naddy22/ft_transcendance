// File: backend/src/routes/wsRoutes.ts
// Handles WebSocket connections for live match updates.

import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';

export async function websocketRoutes(fastify: FastifyInstance) {

  fastify.get("/game", { websocket: true }, (connection: WebSocket, req) => {
    connection.on("message", (message: string) => {
      console.log("📨 Received:", message);
      connection.send("Pong response");
    });
  });

  fastify.get("/matchmaking", { websocket: true }, (connection: WebSocket, req) => {
    connection.on("message", (message: string) => {
      const data = JSON.parse(message);
      if (data.event === "join_matchmaking") {
        connection.send(JSON.stringify({ event: "waiting_for_opponent" }));
      }
    });
  });

}
