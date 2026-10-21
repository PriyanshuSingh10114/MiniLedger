import { describe, it, expect } from 'vitest';
import { rupeesToPaise, paiseToRupees, formatPaiseToINR } from '@miniledger/shared';

describe('Financial / Money calculations', () => {
  it('correctly converts numeric Rupees to integer Paise without floating point drift', () => {
    expect(rupeesToPaise(1)).toBe(100);
    expect(rupeesToPaise(100)).toBe(10000);
    expect(rupeesToPaise(1250.5)).toBe(125050);
    expect(rupeesToPaise(99.99)).toBe(9999);
  });

  it('correctly converts string Rupees to integer Paise without floating point drift', () => {
    expect(rupeesToPaise('1.00')).toBe(100);
    expect(rupeesToPaise('1250.50')).toBe(125050);
    expect(rupeesToPaise('5000')).toBe(500000);
    expect(rupeesToPaise('10000000')).toBe(1000000000); // 1 crore
  });

  it('rejects invalid, negative, zero, amounts below ₹1, or amounts with >2 decimal places', () => {
    expect(() => rupeesToPaise(0)).toThrow();
    expect(() => rupeesToPaise(0.5)).toThrow(); // below ₹1 minimum
    expect(() => rupeesToPaise('0.01')).toThrow();
    expect(() => rupeesToPaise(-50)).toThrow();
    expect(() => rupeesToPaise('10.999')).toThrow();
    expect(() => rupeesToPaise('abc')).toThrow();
    expect(() => rupeesToPaise('10.5.5')).toThrow();
    expect(() => rupeesToPaise('')).toThrow();
  });

  it('correctly converts Paise back to Rupees', () => {
    expect(paiseToRupees(100)).toBe(1);
    expect(paiseToRupees(125050)).toBe(1250.5);
    expect(paiseToRupees(0)).toBe(0);
  });

  it('formats Paise to Indian Rupee strings', () => {
    const formatted = formatPaiseToINR(125050);
    expect(formatted).toContain('1,250.50');
    expect(formatted).toContain('₹');
  });
});
