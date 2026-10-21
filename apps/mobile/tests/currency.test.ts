import { describe, it, expect } from 'vitest';
import { formatPaiseToINR, rupeesToPaise, paiseToRupees } from '@miniledger/shared';

describe('Mobile Currency Utilities', () => {
  it('formats zero paise correctly', () => {
    expect(formatPaiseToINR(0)).toContain('0');
  });

  it('formats thousands and lakhs correctly with Indian comma grouping', () => {
    const formatted = formatPaiseToINR(125050); // ₹1,250.50
    expect(formatted).toContain('1,250.50');

    const formattedLakh = formatPaiseToINR(50000000); // ₹5,00,000.00
    expect(formattedLakh).toContain('5,00,000');
  });

  it('correctly handles conversions between input strings and backend integer paise', () => {
    const rawInput = '4500.50';
    const paise = rupeesToPaise(rawInput);
    expect(paise).toBe(450050);
    expect(paiseToRupees(paise)).toBe(4500.5);
  });
});
