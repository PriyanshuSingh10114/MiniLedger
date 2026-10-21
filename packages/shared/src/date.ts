import { LOAN_STATUS, LoanStatus } from './constants.js';

export const BUSINESS_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns today's date in YYYY-MM-DD format according to the business timezone.
 */
export function getTodayDateString(timezone = BUSINESS_TIMEZONE): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Normalizes any Date or ISO date string to a YYYY-MM-DD string.
 */
export function toISODateString(date: Date | string): string {
  if (typeof date === 'string') {
    // If already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    date = new Date(date);
  }
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Determines whether a loan is overdue based on its due date, status, and outstanding amount.
 * A loan is overdue if:
 * 1. Status is OUTSTANDING (or has remaining balance > 0)
 * 2. Due date (in YYYY-MM-DD) is strictly before today's date in the business timezone.
 */
export function calculateIsOverdue(
  dueDate: Date | string,
  status: LoanStatus,
  referenceDateString = getTodayDateString(),
): boolean {
  if (status === LOAN_STATUS.REPAID) {
    return false;
  }

  const dueStr =
    typeof dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)
      ? dueDate
      : toISODateString(dueDate);

  return dueStr < referenceDateString;
}

/**
 * Formats a YYYY-MM-DD or ISO string into a human-readable Indian date format (e.g. "24 Oct 2026").
 */
export function formatDateForDisplay(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: BUSINESS_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
