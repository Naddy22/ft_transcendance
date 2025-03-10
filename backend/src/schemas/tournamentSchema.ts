// File: backend/src/schemas/tournamentSchema.ts
// Tournament Schema
// Defines tournament structure, players, matches, and progression.

import { FromSchema } from 'json-schema-to-ts';

export const tournamentSchema = {
  "$id": "tournamentSchema",
  "title": "Tournament",
  "description": "Schema for a Pong tournament",
  "type": "object",
  "properties": {
    "tournamentId": {
      "type": "integer",
      "description": "Unique tournament ID"
    },
    "name": {
      "type": "string",
      "minLength": 3,
      "description": "Tournament name"
    },
    "players": {
      "type": "array",
      "items": { "type": "integer" },
      "description": "List of user IDs participating"
    },
    "matches": {
      "type": "array",
      "items": { "type" : "integer" },
      "description": "List of matches in the tournament"
    },
    "winner": {
      "type": ["integer", "null"],
      "description": "User ID of the tournament winner"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "in-progress", "completed"],
      "description": "Current tournament status"
    }
  },
  "required": ["tournamentId", "name", "players", "matches", "status"],
  "additionalProperties": false
} as const;

export type Tournament = FromSchema<typeof tournamentSchema>;
export type PublicTournament = Omit<Tournament, "matches">;
export type NewTournamentRequest = Pick<Tournament, "name" | "players">;
export type TournamentUpdateRequest = Partial<Pick<Tournament, "status" | "winner">>;
