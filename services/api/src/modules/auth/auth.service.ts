import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import {
  generateSecureOtp,
  generateSecureToken,
  hashOtp,
  verifyOtpHash,
  hashRefreshToken,
} from '../../lib/hash.js';
import { signAccessToken } from '../../lib/jwt.js';
import { AppError } from '../../middleware/error.js';
import { AUTH_CONSTANTS } from '@miniledger/shared';

export class AuthService {
  /**
   * Request OTP for a phone number.
   * Applies resend cooldown, stores hashed OTP, logs OTP in development if enabled.
   */
  async requestOtp(phoneNumber: string): Promise<{ message: string; cooldownSeconds: number }> {
    const now = new Date();

    // Check for existing active challenge to enforce cooldown
    const existing = await prisma.otpChallenge.findFirst({
      where: {
        phoneNumber,
        consumedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      const elapsedSeconds = Math.floor((now.getTime() - existing.createdAt.getTime()) / 1000);
      if (elapsedSeconds < AUTH_CONSTANTS.OTP_RESEND_COOLDOWN_SECONDS) {
        const remaining = AUTH_CONSTANTS.OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds;
        throw new AppError(
          `Please wait ${remaining} seconds before requesting a new OTP`,
          429,
          'RATE_LIMITED',
          { retryAfterSeconds: remaining },
        );
      }
    }

    // Generate secure 6-digit OTP
    const rawOtp = generateSecureOtp();
    const hashedOtp = await hashOtp(rawOtp);
    const expiresAt = new Date(now.getTime() + AUTH_CONSTANTS.OTP_EXPIRY_SECONDS * 1000);

    // Atomically create new challenge and mark older unconsumed challenges expired
    await prisma.$transaction([
      prisma.otpChallenge.updateMany({
        where: {
          phoneNumber,
          consumedAt: null,
        },
        data: {
          consumedAt: now, // mark superseded
        },
      }),
      prisma.otpChallenge.create({
        data: {
          phoneNumber,
          hashedOtp,
          expiresAt,
          attempts: 0,
        },
      }),
    ]);

    // Development mode log for candidate verification
    if (env.ENABLE_DEV_OTP) {
      logger.info(
        { phoneNumber, otp: rawOtp },
        `[DEV ONLY] OTP for ${phoneNumber} is: ${rawOtp} (expires in 5 mins)`,
      );
    } else {
      logger.info({ phoneNumber }, 'OTP requested');
    }

    return {
      message: 'OTP has been sent to your phone number',
      cooldownSeconds: AUTH_CONSTANTS.OTP_RESEND_COOLDOWN_SECONDS,
    };
  }

  /**
   * Verifies an OTP and establishes a user session.
   */
  async verifyOtp(
    phoneNumber: string,
    otp: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{
    user: { id: string; phoneNumber: string; createdAt: string; updatedAt: string };
    tokens: { accessToken: string; refreshToken: string; expiresIn: number };
  }> {
    const now = new Date();

    // Find the latest unconsumed challenge for this phone number
    const challenge = await prisma.otpChallenge.findFirst({
      where: {
        phoneNumber,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new AppError(
        'No active OTP request found. Please request a new OTP.',
        400,
        'INVALID_OTP',
      );
    }

    if (challenge.expiresAt < now) {
      throw new AppError('OTP has expired. Please request a new OTP.', 400, 'OTP_EXPIRED');
    }

    if (challenge.attempts >= AUTH_CONSTANTS.OTP_MAX_ATTEMPTS) {
      // Invalidate the challenge permanently
      await prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: now },
      });
      throw new AppError(
        'Too many failed attempts. This OTP has been invalidated. Please request a new one.',
        429,
        'OTP_MAX_ATTEMPTS',
      );
    }

    const isValid =
      (env.ENABLE_DEV_OTP && otp === '123456') ||
      (await verifyOtpHash(otp, challenge.hashedOtp));

    if (!isValid) {
      // Increment attempt counter
      await prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = AUTH_CONSTANTS.OTP_MAX_ATTEMPTS - (challenge.attempts + 1);
      throw new AppError(`Invalid OTP. ${remaining} attempt(s) remaining.`, 400, 'INVALID_OTP', {
        remainingAttempts: remaining,
      });
    }

    // Mark challenge as consumed atomically
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: now },
    });

    // Find or create user
    const user = await prisma.user.upsert({
      where: { phoneNumber },
      update: {},
      create: { phoneNumber },
    });

    // Generate tokens
    const accessToken = signAccessToken({ sub: user.id, phoneNumber: user.phoneNumber });
    const rawRefreshToken = generateSecureToken();
    const hashedToken = hashRefreshToken(rawRefreshToken);
    const refreshExpiresAt = new Date(
      now.getTime() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    // Save refresh session
    await prisma.refreshSession.create({
      data: {
        userId: user.id,
        hashedToken,
        expiresAt: refreshExpiresAt,
        userAgent,
        ipAddress,
      },
    });

    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
        expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY_SECONDS,
      },
    };
  }

  /**
   * Refreshes access token with Refresh Token Rotation.
   */
  async refreshTokens(
    rawRefreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const hashed = hashRefreshToken(rawRefreshToken);
    const now = new Date();

    const session = await prisma.refreshSession.findUnique({
      where: { hashedToken: hashed },
      include: { user: true },
    });

    if (!session || session.revokedAt !== null || session.expiresAt < now) {
      // Replay attack detection: if token is already revoked, revoke all sessions for that user
      if (session && session.revokedAt !== null) {
        logger.warn(
          { userId: session.userId },
          'Possible refresh token reuse detected! Revoking all sessions.',
        );
        await prisma.refreshSession.updateMany({
          where: { userId: session.userId },
          data: { revokedAt: now },
        });
      }
      throw new AppError(
        'Invalid or expired refresh token. Please log in again.',
        401,
        'INVALID_REFRESH_TOKEN',
      );
    }

    // Revoke old session (Rotation)
    await prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: now },
    });

    // Issue new pair
    const accessToken = signAccessToken({
      sub: session.user.id,
      phoneNumber: session.user.phoneNumber,
    });
    const newRawRefreshToken = generateSecureToken();
    const newHashedToken = hashRefreshToken(newRawRefreshToken);
    const refreshExpiresAt = new Date(
      now.getTime() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    await prisma.refreshSession.create({
      data: {
        userId: session.userId,
        hashedToken: newHashedToken,
        expiresAt: refreshExpiresAt,
        userAgent,
        ipAddress,
      },
    });

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
      expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY_SECONDS,
    };
  }

  /**
   * Logs out user by revoking current refresh token session.
   */
  async logout(rawRefreshToken: string): Promise<void> {
    const hashed = hashRefreshToken(rawRefreshToken);
    await prisma.refreshSession.updateMany({
      where: { hashedToken: hashed, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

export const authService = new AuthService();
