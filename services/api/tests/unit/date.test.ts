import { describe, it, expect } from 'vitest';
import {
  calculateIsOverdue,
  getTodayDateString,
  toISODateString,
  LOAN_STATUS,
} from '@miniledger/shared';

describe('Date & Overdue Calculations', () => {
  it('identifies overdue loans when due date is strictly before reference date and status is OUTSTANDING', () => {
    const today = '2026-10-21';
    const pastDueDate = '2026-10-20';
    const futureDueDate = '2026-10-22';

    expect(calculateIsOverdue(pastDueDate, LOAN_STATUS.OUTSTANDING, today)).toBe(true);
    expect(calculateIsOverdue(futureDueDate, LOAN_STATUS.OUTSTANDING, today)).toBe(false);
    expect(calculateIsOverdue(today, LOAN_STATUS.OUTSTANDING, today)).toBe(false); // Due today is not overdue yet
  });

  it('never marks a REPAID loan as overdue even if due date was in past', () => {
    const today = '2026-10-21';
    const pastDueDate = '2026-01-01';

    expect(calculateIsOverdue(pastDueDate, LOAN_STATUS.REPAID, today)).toBe(false);
  });

  it('normalizes Dates to YYYY-MM-DD correctly', () => {
    const d = new Date('2026-12-25T14:30:00.000Z');
    expect(toISODateString(d)).toBe('2026-12-25');
    expect(toISODateString('2026-05-10')).toBe('2026-05-10');
  });

  it('returns valid today date string for business timezone', () => {
    const today = getTodayDateString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
