export const LOAN_STATUS = {
  OUTSTANDING: 'OUTSTANDING',
  REPAID: 'REPAID',
} as const;

export type LoanStatus = (typeof LOAN_STATUS)[keyof typeof LOAN_STATUS];

export const FINANCIAL_LIMITS = {
  MIN_AMOUNT_PAISE: 100, // ₹1.00
  MAX_AMOUNT_PAISE: 1_000_000_000, // ₹10,000,000 (₹1 Crore)
  MIN_AMOUNT_RUPEES: 1,
  MAX_AMOUNT_RUPEES: 10_000_000,
} as const;

export const AUTH_CONSTANTS = {
  OTP_LENGTH: 6,
  OTP_EXPIRY_SECONDS: 300, // 5 minutes
  OTP_MAX_ATTEMPTS: 5,
  OTP_RESEND_COOLDOWN_SECONDS: 60, // 1 minute
  ACCESS_TOKEN_EXPIRY_SECONDS: 900, // 15 minutes
  REFRESH_TOKEN_EXPIRY_DAYS: 30, // 30 days
} as const;

// E.164 phone regex (e.g. +919876543210)
export const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

// Standard Indian mobile phone regex with country code (defaults to +91)
export const INDIA_PHONE_REGEX = /^\+91[6-9]\d{9}$/;
