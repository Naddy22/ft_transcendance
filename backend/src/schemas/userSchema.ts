// File: backend/src/schemas/userSchema.ts
// User Schema (Registration, Authentication, Profile)
// Covers user authentication, friends list, status updates, and match history.
 
import { FromSchema } from 'json-schema-to-ts';

export const userSchema = {
  "$id": 'userSchema',
  "title": "User",
  "description": "Schema for user registration and profile information",
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "description": "Unique user ID"
    },
    "username": {
      "type": "string",
      "minLength": 3,
      "maxLength": 30,
      "pattern": "^[a-zA-Z0-9_-]+$",
      "description": "Unique username (letters, numbers, underscore, hyphen)"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "User email address"
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "description": "Hashed password (only stored internally"
    },
    "avatar": {
      "type": ["string", "null"],
      "format": "uri",
      "description": "User avatar image URL (null if not set)"
    },
    "friends": {
      "type": "array",
      "items": { "type": "integer" },
      "description": "List of user IDs representing friends"
    },
    "status": {
      "type": "string",
      "enum": ["online", "offline", "in-game"],
      "description": "User's online status"
    },
	"wins": {
		"type": "integer",
		"minimum": 0,
		"description": "Total matches won"
	},
	"losses": {
		"type": "integer",
		"minimum": 0,
		"description": "Total matches lost"
	},
	"matchesPlayed": {
		"type": "integer",
		"minimum": 0,
		"description": "Total matches played"
	}
  },
  "required": ["username", "email", "password"]
} as const;

export type User = FromSchema<typeof userSchema>;
export type PublicUser = Omit<User, "password">;
export type RegisterRequest = Pick<User, "username" | "email" | "password">;
export type UpdateUserRequest = Partial<Pick<User, "username" | "email" | "avatar" | "status">>;
export type LogoutRequest = Pick<User, "id">;

// Login Schema
export const loginSchema = {
	"$id": "loginSchema",
	"title": "User Login",
	"description": "Schema for user login",
	"type": "object",
	"properties": {
		"email": {
			"type": "string",
			"format": "email"
		},
		"password": {
			"type": "string",
			"minLength": 8
		}
	},
	"required": ["email", "password"]
} as const;

export type LoginRequest = FromSchema<typeof loginSchema>;
