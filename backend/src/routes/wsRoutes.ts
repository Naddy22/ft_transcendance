// File: backend/src/routes/wsRoutes.ts

import { FastifyInstance } from 'fastify';
export async function websocketRoutes(fastify: FastifyInstance) {
  fastify.get("/game", { websocket: true }, (connection, req) => {
    connection.socket.on("message", (message) => {
      console.log("Received: ", message.toString());
      connection.socket.send("Pong response");
    });
  });
}
