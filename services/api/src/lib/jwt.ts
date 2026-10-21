import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtUserPayload {
  sub: string; // userId (UUID)
  phoneNumber: string;
}

/**
 * Signs a short-lived access token.
 */
export function signAccessToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
    algorithm: 'HS256',
    issuer: 'miniledger-api',
  });
}

/**
 * Verifies an access token and returns the decoded payload.
 * @throws Error if token is invalid or expired.
 */
export function verifyAccessToken(token: string): JwtUserPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: ['HS256'],
    issuer: 'miniledger-api',
  });
  return decoded as JwtUserPayload;
}
