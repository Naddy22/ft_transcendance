// File: backend/src/schemas/wsSchema.ts
// WebSocket Message Schema (Real-Time Match Updates)
// Ensures structured WebSocket communication for real-time game updates.

import { FromSchema } from 'json-schema-to-ts';


export const wsSchema = {
  "$id": "wsSchema",
  "title": "WebSocketMessage",
  "description": "Schema for WebSocket communication",
  "type": "object",
  "properties": {
    "event": {
      "type": "string",
      "enum": ["matchStart", "matchUpdate", "matchEnd", "playerMove"],
      "description": "Type of WebSocket event"
    },
    "matchId": {
      "type": "integer",
      "description": "ID of the match this event relates to"
    },
    "playerId": {
      "type": "integer",
      "description": "User ID of the player involved"
    },
    "data": {
      "type": "object",
      "description": "Additional event data"
    }
  },
  "required": ["event", "matchId", "playerId", "data"]
} as const;

export type Ws = FromSchema<typeof wsSchema>;
