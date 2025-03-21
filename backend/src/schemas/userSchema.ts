// File: backend/src/schemas/userSchema.ts

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
      "enum": ["online", "offline", "in-game", "anonymized"],
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
    },
    "isTwoFactorEnabled": {
      "type": "boolean",
      "default": false
    },
    "twoFactorSecret": {
      "type": ["string", "null"],
      "nullable": true
    }
  },
  "required": ["username", "email", "password"],
  "additionalProperties": false
} as const;

export type User = FromSchema<typeof userSchema>;
// export type PublicUser = Omit<User, "password">;
export type PublicUser = Omit<User, "password" | "twoFactorSecret">;
export type UpdateUserRequest = Partial<Pick<User, "username" | "email" | "avatar" | "status">>;
