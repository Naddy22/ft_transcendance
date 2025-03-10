// File: backend/src/schemas/matchmakingSchema.ts

import { FromSchema } from "json-schema-to-ts";

export const matchmakingRequestSchema = {
  "$id": "matchmakingRequestSchema",
  "title": "MatchmakingRequest",
  "type": "object",
  "properties": {
    "userId": {
		"type": "integer",
		"description": "ID of the player joining matchmaking"
	},
    "username": {
		"type": "string",
		"minLength": 3,
		"description": "Username of the player"
	}
  },
  "required": ["userId", "username"],
  "additionalProperties": false
} as const;

export type MatchmakingRequest = FromSchema<typeof matchmakingRequestSchema>;

export const matchmakingResponseSchema = {
  "$id": "matchmakingResponseSchema",
  "title": "MatchmakingResponse",
  "type": "object",
  "properties": {
    "matchId": {
		"type": "integer",
		"description": "Unique ID of the match"
	},
    "player1": {
      "type": "object",
      "properties": {
        "id": {
			"type": "integer"
		},
        "username": {
			"type": "string"
		}
      },
      "required": ["id", "username"],
      "additionalProperties": false
    },
    "player2": {
      "type": "object",
      "properties": {
        "id": {
			"type": "integer"
		},
        "username": {
			"type": "string"
		}
      },
      "required": ["id", "username"],
      "additionalProperties": false
    },
    "status": {
		"type": "string",
		"enum": ["waiting", "started"],
		"description": "Current match status"
	}
  },
  "required": ["matchId", "player1", "player2", "status"],
  "additionalProperties": false
} as const;

export type MatchmakingResponse = FromSchema<typeof matchmakingResponseSchema>;
