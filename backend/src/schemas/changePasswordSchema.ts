// File: backend/src/schemas/changePasswordSchema.ts

import { FromSchema } from 'json-schema-to-ts';

export const changePasswordSchema = {
  "$id": "changePasswordSchema",
  "title": "Change Password",
  "description": "Schema for changing user password",
  "type": "object",
  "properties": {
    "oldPassword": {
      "type": "string",
      "minLength": 8,
      "description": "User's current password"
    },
    "newPassword": {
      "type": "string",
      "minLength": 8,
      "description": "User's new password"
    }
  },
  "required": ["oldPassword", "newPassword"]
} as const;

export type ChangePasswordRequest = FromSchema<typeof changePasswordSchema>;
