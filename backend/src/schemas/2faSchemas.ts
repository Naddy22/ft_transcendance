// File: backend/src/schemas/2faSchema.ts

import { FromSchema } from 'json-schema-to-ts';

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
