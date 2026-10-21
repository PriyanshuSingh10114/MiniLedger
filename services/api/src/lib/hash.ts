import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Generates a cryptographically secure 6-digit numeric OTP string (e.g. "492817").
 */
export function generateSecureOtp(): string {
  const code = crypto.randomInt(100000, 1000000);
  return code.toString();
}

/**
 * Generates a high-entropy random string (64 hex characters / 256 bits).
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashes an OTP string securely using bcrypt.
 */
export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, BCRYPT_SALT_ROUNDS);
}

/**
 * Verifies an OTP against a stored bcrypt hash.
 */
export async function verifyOtpHash(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

/**
 * Deterministically and securely hashes a refresh token using SHA-256 for fast indexed lookups.
 * Since the raw token has 256 bits of entropy, SHA-256 is secure against brute-force.
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
