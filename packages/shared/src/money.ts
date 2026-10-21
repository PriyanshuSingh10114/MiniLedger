import { FINANCIAL_LIMITS } from './constants.js';

/**
 * Safely converts Rupee amount (string or number) to integer Paise without floating point drift.
 * @throws Error if amount is invalid, negative, has >2 decimal places, or exceeds limits.
 */
export function rupeesToPaise(amount: number | string): number {
  if (typeof amount === 'number') {
    if (!Number.isFinite(amount)) {
      throw new Error('Amount must be a finite number');
    }
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    // Convert to fixed 2-decimal string to avoid floating point precision issues
    amount = amount.toString();
  }

  const trimmed = amount.trim();
  if (!trimmed) {
    throw new Error('Amount cannot be empty');
  }

  // Must match optional digits followed by optional 1-2 decimal places
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error('Amount must be a positive number with at most 2 decimal places');
  }

  const parts = trimmed.split('.');
  const wholePart = BigInt(parts[0]);
  let fractionPart = 0n;

  if (parts.length === 2) {
    const fractionStr = parts[1].padEnd(2, '0');
    fractionPart = BigInt(fractionStr);
  }

  const totalPaise = wholePart * 100n + fractionPart;

  if (totalPaise > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Amount exceeds maximum safe integer');
  }

  const paiseNum = Number(totalPaise);

  if (paiseNum < FINANCIAL_LIMITS.MIN_AMOUNT_PAISE) {
    throw new Error(`Amount must be at least ₹${FINANCIAL_LIMITS.MIN_AMOUNT_RUPEES}`);
  }

  if (paiseNum > FINANCIAL_LIMITS.MAX_AMOUNT_PAISE) {
    throw new Error(
      `Amount cannot exceed ₹${FINANCIAL_LIMITS.MAX_AMOUNT_RUPEES.toLocaleString('en-IN')}`,
    );
  }

  return paiseNum;
}

/**
 * Converts integer Paise to Rupees as a number.
 */
export function paiseToRupees(paise: number): number {
  if (!Number.isInteger(paise) || paise < 0) {
    throw new Error('Paise must be a non-negative integer');
  }
  return paise / 100;
}

/**
 * Formats integer Paise to formatted Indian Rupee string (e.g., ₹1,250.50 or ₹1,250)
 */
export function formatPaiseToINR(paise: number, includeDecimals = false): string {
  if (!Number.isInteger(paise)) {
    paise = Math.round(paise);
  }

  const rupees = paise / 100;
  const hasDecimals = paise % 100 !== 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals || hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}
