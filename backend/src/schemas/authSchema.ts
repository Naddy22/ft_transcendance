// File: backend/src/schemas/authSchema.ts

import { FromSchema } from 'json-schema-to-ts';

// Register Schema
export const registerSchema = {
  "$id": "registerSchema",
  "title": "User Registration",
  "description": "Schema for user registration",
  "type": "object",
  "properties": {
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
      "description": "User password"
    }
  },
  "required": ["username", "email", "password"],
  "additionalProperties": false
} as const;

export type RegisterRequest = FromSchema<typeof registerSchema>;

// Login Schema
export const loginSchema = {
  "$id": "loginSchema",
  "title": "User Login",
  "description": "Schema for user login",
  "type": "object",
  "properties": {
    "identifier": {
      "oneOf": [
        {
          "type": "string",
          "minLength": 3,
          "maxLength": 30,
          "pattern": "^[a-zA-Z0-9_-]+$",
          "description": "Username (letters, numbers, underscore, hyphen)"
        },
        {
          "type": "string",
          "format": "email",
          "description": "Email address"
        }
      ]
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "description": "User password"
    }
  },
  "required": ["identifier", "password"],
  "additionalProperties": false
} as const;

export type LoginRequest = FromSchema<typeof loginSchema>;
export type LogoutRequest = { id: number };
