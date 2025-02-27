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
      "description": "Hashed password"
    },
    "avatar": {
      "type": "string",
      "format": "uri",
      "description": "User avatar image URL"
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
    "stats": {
      "type": "object",
      "properties": {
        "wins": { "type": "integer", "minimum": 0 },
        "losses": { "type": "integer", "minimum": 0 },
        "matchesPlayed": { "type": "integer", "minimum": 0 }
      },
      "description": "User match statistics"
    }
  },
  "required": ["username", "email", "password"]
} as const;

export const userResponseSchema = {
	"$id": "userResponseSchema",
	"title": "User Response",
	"description": "Schema for user data in responses (excludes password)",
	"type": "object",
	"properties": {
	  "id": { "type": "integer" },
	  "username": { "type": "string" },
	  "email": { "type": "string" },
	  "avatar": { "type": "string", "format": "uri" },
	  "status": { "type": "string", "enum": ["online", "offline", "in-game"] },
	  "stats": {
		"type": "object",
		"properties": {
		  "wins": { "type": "integer", "minimum": 0 },
		  "losses": { "type": "integer", "minimum": 0 },
		  "matchesPlayed": { "type": "integer", "minimum": 0 }
		}
	  }
	},
	"required": ["id", "username", "email"]
  } as const;

  export const loginSchema = {
	"$id": "loginSchema",
	"title": "User Login",
	"description": "Schema for user login",
	"type": "object",
	"properties": {
	  "email": { "type": "string", "format": "email" },
	  "password": { "type": "string", "minLength": 8 }
	},
	"required": ["email", "password"]
  } as const;

export type User = FromSchema<typeof userSchema>;
export type UserResponse = FromSchema<typeof userResponseSchema>;
export type LoginRequest = FromSchema<typeof loginSchema>;
