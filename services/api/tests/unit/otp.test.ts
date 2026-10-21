import { describe, it, expect } from 'vitest';
import {
  generateSecureOtp,
  generateSecureToken,
  hashOtp,
  verifyOtpHash,
  hashRefreshToken,
} from '../../src/lib/hash.js';

describe('OTP & Cryptographic Security', () => {
  it('generates a 6-digit numeric OTP with cryptographical entropy', () => {
    for (let i = 0; i < 20; i++) {
      const otp = generateSecureOtp();
      expect(otp).toHaveLength(6);
      expect(Number(otp)).toBeGreaterThanOrEqual(100000);
      expect(Number(otp)).toBeLessThan(1000000);
    }
  });

  it('securely hashes and verifies OTP using bcrypt', async () => {
    const rawOtp = '482910';
    const hash = await hashOtp(rawOtp);

    expect(hash).not.toBe(rawOtp);
    expect(await verifyOtpHash(rawOtp, hash)).toBe(true);
    expect(await verifyOtpHash('123456', hash)).toBe(false);
  });

  it('generates unique high-entropy tokens and SHA-256 hashes', () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();

    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(64);

    const hash1 = hashRefreshToken(token1);
    const hash2 = hashRefreshToken(token2);
    expect(hash1).not.toBe(hash2);
    expect(hashRefreshToken(token1)).toBe(hash1); // Deterministic
  });
});
