import { z } from 'zod';
import { PHONE_REGEX, LOAN_STATUS, FINANCIAL_LIMITS } from './constants.js';

export const phoneNumberSchema = z
  .string()
  .trim()
  .transform((val) => {
    // If entered without country code (10 digits), assume India +91
    if (/^\d{10}$/.test(val)) {
      return `+91${val}`;
    }
    // If entered with 0 prefix
    if (/^0\d{10}$/.test(val)) {
      return `+91${val.slice(1)}`;
    }
    return val;
  })
  .refine((val) => PHONE_REGEX.test(val), {
    message: 'Invalid phone number format. Must be a valid E.164 number (e.g., +919876543210)',
  });

export const requestOtpSchema = z.object({
  phoneNumber: phoneNumberSchema,
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  phoneNumber: phoneNumberSchema,
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const createLoanSchema = z.object({
  friendName: z
    .string()
    .trim()
    .min(1, 'Friend name is required')
    .max(100, 'Friend name cannot exceed 100 characters'),
  // Accepts amount in rupees as string or positive number, or explicit amountPaise
  amount: z
    .union([z.number(), z.string()])
    .refine((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return Number.isFinite(num) && num > 0;
    }, 'Amount must be a positive number')
    .refine((val) => {
      if (typeof val === 'string') {
        return /^\d+(\.\d{1,2})?$/.test(val.trim());
      }
      return true;
    }, 'Amount can have at most 2 decimal places'),
  dueDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
    .refine((val) => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, 'Invalid due date'),
  note: z.string().trim().max(500, 'Note cannot exceed 500 characters').optional(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;

export const repayLoanSchema = z.object({
  idempotencyKey: z.string().uuid().optional(),
});

export type RepayLoanInput = z.infer<typeof repayLoanSchema>;

export const loanQuerySchema = z.object({
  status: z.enum(['OUTSTANDING', 'REPAID', 'ALL']).optional().default('ALL'),
  isOverdue: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => (typeof val === 'string' ? val === 'true' : val))
    .optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['dueDate', 'createdAt', 'amount']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z
    .union([z.number(), z.string()])
    .transform((val) => Math.max(1, typeof val === 'string' ? parseInt(val, 10) || 1 : val))
    .optional()
    .default(1),
  limit: z
    .union([z.number(), z.string()])
    .transform((val) =>
      Math.min(100, Math.max(1, typeof val === 'string' ? parseInt(val, 10) || 10 : val)),
    )
    .optional()
    .default(10),
});

export type LoanQueryParams = z.infer<typeof loanQuerySchema>;
