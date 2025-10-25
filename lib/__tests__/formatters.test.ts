/**
 * Tests for Formatting Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  getPositionPrecision,
  formatPositionSize,
  formatDollarAmount,
  formatPercentage,
  formatPrice,
  formatPositionSummary,
  formatRMultiple,
  isFractionalPosition,
} from '../formatters';
import { InstrumentType } from '@/types/instruments';

describe('getPositionPrecision', () => {
  it('should use 6 decimals for very small positions', () => {
    expect(getPositionPrecision(InstrumentType.FUTURES_INDEX, 0.000654)).toBe(6);
    expect(getPositionPrecision(InstrumentType.STOCK, 0.0032)).toBe(6);
  });

  it('should use 4 decimals for small fractional positions between 0.01 and 1', () => {
    expect(getPositionPrecision(InstrumentType.FUTURES_INDEX, 0.25)).toBe(4);
    expect(getPositionPrecision(InstrumentType.STOCK, 0.5)).toBe(4);
  });

  it('should use 2 decimals for stocks', () => {
    expect(getPositionPrecision(InstrumentType.STOCK, 125.5)).toBe(2);
    expect(getPositionPrecision(InstrumentType.ETF, 50.75)).toBe(2);
  });

  it('should use 4 decimals for futures', () => {
    expect(getPositionPrecision(InstrumentType.FUTURES_INDEX, 2.5)).toBe(4);
    expect(getPositionPrecision(InstrumentType.FUTURES_COMMODITY, 10.25)).toBe(4);
  });

  it('should use 6 decimals for forex', () => {
    expect(getPositionPrecision(InstrumentType.FOREX, 1.5)).toBe(6);
  });
});

describe('formatPositionSize', () => {
  it('should format stock positions with 2 decimals', () => {
    expect(formatPositionSize(125.5, InstrumentType.STOCK)).toBe('125.50 shares');
    expect(formatPositionSize(1, InstrumentType.STOCK)).toBe('1.00 share');
  });

  it('should format fractional futures contracts', () => {
    expect(formatPositionSize(0.0065, InstrumentType.FUTURES_INDEX)).toBe('0.006500 contracts');
    expect(formatPositionSize(2.5, InstrumentType.FUTURES_INDEX)).toBe('2.5000 contracts');
  });

  it('should format very small positions with high precision', () => {
    expect(formatPositionSize(0.000654, InstrumentType.FUTURES_COMMODITY)).toBe('0.000654 contracts');
  });

  it('should handle singular vs plural unit labels', () => {
    expect(formatPositionSize(1, InstrumentType.STOCK)).toContain('share');
    expect(formatPositionSize(2, InstrumentType.STOCK)).toContain('shares');
    expect(formatPositionSize(0.5, InstrumentType.STOCK)).toContain('shares');
  });
});

describe('formatDollarAmount', () => {
  it('should format dollar amounts with commas and cents', () => {
    expect(formatDollarAmount(3000)).toBe('$3,000.00');
    expect(formatDollarAmount(1234567.89)).toBe('$1,234,567.89');
  });

  it('should handle negative amounts', () => {
    expect(formatDollarAmount(-500.50)).toBe('-$500.50');
  });

  it('should optionally hide cents', () => {
    expect(formatDollarAmount(3000, false)).toBe('$3,000');
    expect(formatDollarAmount(1234.56, false)).toBe('$1,235');
  });

  it('should handle zero', () => {
    expect(formatDollarAmount(0)).toBe('$0.00');
    expect(formatDollarAmount(0, false)).toBe('$0');
  });
});

describe('formatPercentage', () => {
  it('should format percentages with default 2 decimal places', () => {
    expect(formatPercentage(5.25)).toBe('5.25%');
    expect(formatPercentage(10)).toBe('10.00%');
  });

  it('should respect custom precision', () => {
    expect(formatPercentage(5.123456, 4)).toBe('5.1235%');
    expect(formatPercentage(10, 0)).toBe('10%');
  });
});

describe('formatPrice', () => {
  it('should format small prices with 4 decimals', () => {
    expect(formatPrice(0.5432)).toBe('0.5432');
    expect(formatPrice(0.99)).toBe('0.9900');
  });

  it('should format medium prices with 2 decimals', () => {
    expect(formatPrice(25.50)).toBe('25.50');
    expect(formatPrice(99.99)).toBe('99.99');
  });

  it('should format large prices with commas and 2 decimals', () => {
    expect(formatPrice(1234.56)).toBe('1,234.56');
    expect(formatPrice(25360)).toBe('25,360.00');
  });
});

describe('formatPositionSummary', () => {
  it('should create dollar-centric summary for stocks', () => {
    const result = formatPositionSummary(500, 125.5, InstrumentType.STOCK);
    expect(result).toBe('$500.00 = 125.50 shares');
  });

  it('should create dollar-centric summary for fractional futures', () => {
    const result = formatPositionSummary(3000, 0.0065, InstrumentType.FUTURES_INDEX);
    expect(result).toBe('$3,000.00 = 0.006500 contracts');
  });

  it('should handle large dollar amounts', () => {
    const result = formatPositionSummary(457200, 1, InstrumentType.FUTURES_INDEX);
    expect(result).toBe('$457,200.00 = 1.0000 contract');
  });
});

describe('formatRMultiple', () => {
  it('should format R-multiples with 1 decimal place', () => {
    expect(formatRMultiple(0.5)).toBe('0.5R');
    expect(formatRMultiple(1)).toBe('1.0R');
    expect(formatRMultiple(2.5)).toBe('2.5R');
  });
});

describe('isFractionalPosition', () => {
  it('should identify whole number positions', () => {
    expect(isFractionalPosition(1)).toBe(false);
    expect(isFractionalPosition(100)).toBe(false);
    expect(isFractionalPosition(0)).toBe(false);
  });

  it('should identify fractional positions', () => {
    expect(isFractionalPosition(0.0065)).toBe(true);
    expect(isFractionalPosition(125.5)).toBe(true);
    expect(isFractionalPosition(2.5)).toBe(true);
  });

  it('should handle floating point precision issues', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in JavaScript
    const result = 0.1 + 0.2; // Not exactly 0.3
    expect(isFractionalPosition(result)).toBe(true);
  });

  it('should respect custom tolerance', () => {
    expect(isFractionalPosition(1.00001, 0.001)).toBe(false);
    expect(isFractionalPosition(1.00001, 0.000001)).toBe(true);
  });
});
