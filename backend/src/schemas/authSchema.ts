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
    },
    "twoFactorCode": {
      "type": ["string", "null"],
      "pattern": "^[0-9]{6}$",
      "description": "2FA code (if 2FA is enabled)",
      "nullable": true
    }
  },
  "required": ["identifier", "password"],
  "additionalProperties": false
} as const;

export type LoginRequest = FromSchema<typeof loginSchema>;
export type LogoutRequest = { id: number };

// 

// 2FA Setup Schema
export const setup2FASchema = {
  "$id": "setup2FASchema",
  "title": "Setup 2FA",
  "description": "Schema for enabling two-factor authentication",
  "type": "object",
  "properties": {
    "userId": { "type": "integer" }
  },
  "required": ["userId"],
  "additionalProperties": false
} as const;

export type Setup2FARequest = FromSchema<typeof setup2FASchema>;

// 2FA Verification Schema
export const verify2FASchema = {
  "$id": "verify2FASchema",
  "title": "Verify 2FA",
  "description": "Schema for verifying a 2FA code",
  "type": "object",
  "properties": {
    "userId": { "type": "integer" },
    "token": { "type": "string", "pattern": "^[0-9]{6}$" }
  },
  "required": ["userId", "token"],
  "additionalProperties": false
} as const;

export type Verify2FARequest = FromSchema<typeof verify2FASchema>;

// 2FA Disable Schema
export const disable2FASchema = {
  "$id": "disable2FASchema",
  "title": "Disable 2FA",
  "description": "Schema for disabling two-factor authentication",
  "type": "object",
  "properties": {
    "userId": { "type": "integer" }
  },
  "required": ["userId"],
  "additionalProperties": false
} as const;

export type Disable2FARequest = FromSchema<typeof disable2FASchema>;

// Schema for sending the code by email (optional?):
export const send2FACodeSchema = {
  "$id": "send2FACodeSchema",
  "type": "object",
  "properties": {
    "userId": { "type": "integer" },
    "email": { "type": "string", "format": "email" }
  },
  "required": ["userId", "email"],
  "additionalProperties": false
} as const;

export type Send2FACodeRequest = FromSchema<typeof send2FACodeSchema>;
