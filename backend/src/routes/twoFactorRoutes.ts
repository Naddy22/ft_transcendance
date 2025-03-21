// File: backend/src/routes/twoFactorRoutes.ts

import { FastifyInstance } from 'fastify';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

import {
  Setup2FARequest,
  Verify2FARequest,
  Disable2FARequest,
} from "../schemas/authSchema.js";

export async function twoFactorRoutes(fastify: FastifyInstance) {

  /**
   * Generate and return a 2FA secret for a user
   */
  fastify.post<{ Body: Setup2FARequest }>(
    '/setup-2fa',
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
    const { userId } = req.body;

    // Generate a new secret for the user
    const secret = speakeasy.generateSecret({ name: `CatPong (${userId})` });

    // Save secret in the database
    const stmt = await fastify.db.prepare(`
      UPDATE users SET twoFactorSecret = ?, isTwoFactorEnabled = 1 
      WHERE id = ?
    `);
    await stmt.run(secret.base32, userId);

    // Generate QR code for scanning
    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url!);

    reply.send({
      message: "2FA Setup Successful",
      secret: secret.base32,
      qrCode: qrCodeDataURL
    });
  });

  /**
   * Verify 2FA code during login
   */
  fastify.post<{ Body: Verify2FARequest }>(
    '/verify-2fa',
    // { preValidation: [fastify.authenticate] }, // tocheck: remain public if only part of login flow, protect if used for managin post-login settings..
    async (req, reply) => {
    const { userId, token } = req.body;

    // Fetch user's 2FA secret
    const stmt = await fastify.db.prepare(`
      SELECT twoFactorSecret FROM users WHERE id = ?
    `);
    const user = await stmt.get(userId);

    if (!user || !user.twoFactorSecret) {
      return reply.status(400).send({
        error: "2FA not enabled"
      });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token
    });

    if (!verified) {
      return reply.status(400).send({
        error: "Invalid 2FA code"
      });
    }

    // Generate and return a JWT token upon successful verification
    const jwtToken = fastify.jwt.sign({ id: userId });

    reply.send({ message: "2FA Verification Successful", token: jwtToken });
  });

  /**
   * Disable 2FA for a user
   */
  fastify.post<{ Body: Disable2FARequest }>(
    '/disable-2fa',
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
    const { userId } = req.body;

    const stmt = await fastify.db.prepare(`
      UPDATE users SET twoFactorSecret = NULL, isTwoFactorEnabled = 0 
      WHERE id = ?
    `);
    await stmt.run(userId);

    reply.send({
      message: "2FA Disabled Successfully"
    });
  });

}
