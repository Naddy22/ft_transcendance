// File: backend/src/utils/jwt.ts

/** Manages JWT token generation & verification.
 * - Avoids repeating JWT logic in multiple places.
 * - Can be easily modified (e.g., changing expiration time, signing algorithm).
 */

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * Generates a JWT token for a user.
 * 
 * @param userId - The ID of the user
 * @param email - The email of the user
 * @returns The signed JWT token
 */
export function generateToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, SECRET, { expiresIn: "1h" });
}

/**
 * Verifies and decodes a JWT token.
 * 
 * @param token - The JWT token to verify
 * @returns The decoded token payload if valid
 * @throws Error if the token is invalid
 */
export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}
