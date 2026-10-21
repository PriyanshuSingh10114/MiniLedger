import { describe, it, expect } from 'vitest';
import { phoneNumberSchema, createLoanSchema, verifyOtpSchema } from '@miniledger/shared';

describe('Mobile Form Validation Schemas', () => {
  describe('Phone Number Validation', () => {
    it('normalizes 10-digit Indian numbers to E.164 +91 prefix', () => {
      const parsed = phoneNumberSchema.parse('9876543210');
      expect(parsed).toBe('+919876543210');
    });

    it('accepts numbers already having +91 prefix', () => {
      const parsed = phoneNumberSchema.parse('+919876543210');
      expect(parsed).toBe('+919876543210');
    });

    it('rejects letters and short invalid numbers', () => {
      expect(() => phoneNumberSchema.parse('12345')).toThrow();
      expect(() => phoneNumberSchema.parse('abcdefghij')).toThrow();
    });
  });

  describe('OTP Validation', () => {
    it('accepts exact 6 digit strings', () => {
      expect(() =>
        verifyOtpSchema.parse({ phoneNumber: '9876543210', otp: '123456' }),
      ).not.toThrow();
    });

    it('rejects non-numeric or wrong length OTPs', () => {
      expect(() => verifyOtpSchema.parse({ phoneNumber: '9876543210', otp: '12345' })).toThrow();
      expect(() => verifyOtpSchema.parse({ phoneNumber: '9876543210', otp: '1234567' })).toThrow();
      expect(() => verifyOtpSchema.parse({ phoneNumber: '9876543210', otp: 'abcdef' })).toThrow();
    });
  });

  describe('Create Loan Form Validation', () => {
    it('validates correct loan input', () => {
      const valid = createLoanSchema.parse({
        friendName: 'Rohan Sharma',
        amount: '2500.50',
        dueDate: '2026-11-15',
        note: 'Dinner share',
      });
      expect(valid.friendName).toBe('Rohan Sharma');
      expect(valid.amount).toBe('2500.50');
    });

    it('rejects empty friend name, zero or negative amounts, and invalid dates', () => {
      expect(() =>
        createLoanSchema.parse({
          friendName: '',
          amount: '100',
          dueDate: '2026-11-15',
        }),
      ).toThrow();

      expect(() =>
        createLoanSchema.parse({
          friendName: 'Test',
          amount: '-50',
          dueDate: '2026-11-15',
        }),
      ).toThrow();

      expect(() =>
        createLoanSchema.parse({
          friendName: 'Test',
          amount: '50.123', // 3 decimals
          dueDate: '2026-11-15',
        }),
      ).toThrow();

      expect(() =>
        createLoanSchema.parse({
          friendName: 'Test',
          amount: '500',
          dueDate: 'invalid-date',
        }),
      ).toThrow();
    });
  });
});
