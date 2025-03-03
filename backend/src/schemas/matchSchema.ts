// File: backend/src/schemas/matchSchema.ts
// Match Schema (1v1 and Tournament Matches)
// Tracks match results, scores, start and end times, and tournament integration.

import { FromSchema } from 'json-schema-to-ts';

export const matchSchema = {
  "$id": "matchSchema",
  "title": "Match",
  "description": "Schema for a Pong match",
  "type": "object",
  "properties": {
    "matchId": {
      "type": "integer",
      "description": "Unique match identifier"
    },
    "player1": {
      "type": "integer",
      "description": "User ID of the first player"
    },
    "player2": {
      "type": "integer",
      "description": "User ID of the second player"
    },
    "winner": {
      "type": ["integer", "null"],
      "description": "User ID of the winner (null if unfinished)"
    },
    "score": {
      "type": "object",
      "properties": {
        "player1": { "type": "integer", "minimum": 0 },
        "player2": { "type": "integer", "minimum": 0 }
      },
      "description": "Match scores"
    },
    "startTime": {
      "type": "string",
      "format": "date-time",
      "description": "Match start timestamp"
    },
    "endTime": {
      "type": ["string", "null"],
      "format": "date-time",
      "description": "Match end timestamp"
    },
    "tournamentId": {
      "type": ["integer", "null"],
      "description": "If part of a tournament, reference the tournament ID"
    }
  },
  "required": ["matchId", "player1", "player2", "score", "startTime"]
} as const;

export type Match = FromSchema<typeof matchSchema>;
