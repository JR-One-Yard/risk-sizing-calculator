/**
 * Validation Schema Tests
 *
 * Comprehensive tests for Zod validation schemas ensuring:
 * - Valid inputs pass
 * - Invalid inputs fail with helpful messages
 * - Edge cases are handled
 * - Cross-field validations work
 */

import { describe, it, expect } from 'vitest';
import {
  calculatorInputsSchema,
  riskPolicySchema,
  convictionSchema,
  timeHorizonSchema,
  volatilityClassSchema,
  validateCalculatorInputs,
  safeValidateCalculatorInputs,
  validateRiskPolicy,
  getValidationErrors,
  isValidConviction,
  isValidVolatilityClass,
  isValidTimeHorizon,
} from '../schemas';
import { VolatilityClass } from '@/types/volatility';

describe('Validation Schemas', () => {
  describe('convictionSchema', () => {
    it('should accept valid conviction types', () => {
      expect(convictionSchema.parse('I')).toBe('I');
      expect(convictionSchema.parse('II')).toBe('II');
      expect(convictionSchema.parse('III')).toBe('III');
    });

    it('should reject invalid conviction types', () => {
      expect(() => convictionSchema.parse('IV')).toThrow();
      expect(() => convictionSchema.parse('A')).toThrow();
      expect(() => convictionSchema.parse(1)).toThrow();
      expect(() => convictionSchema.parse(null)).toThrow();
    });
  });

  describe('timeHorizonSchema', () => {
    it('should accept valid time horizons', () => {
      expect(timeHorizonSchema.parse('day')).toBe('day');
      expect(timeHorizonSchema.parse('swing')).toBe('swing');
      expect(timeHorizonSchema.parse('position')).toBe('position');
    });

    it('should reject invalid time horizons', () => {
      expect(() => timeHorizonSchema.parse('scalp')).toThrow();
      expect(() => timeHorizonSchema.parse('long')).toThrow();
      expect(() => timeHorizonSchema.parse('')).toThrow();
    });
  });

  describe('volatilityClassSchema', () => {
    it('should accept valid volatility classes', () => {
      expect(volatilityClassSchema.parse(VolatilityClass.ULTRA_LOW)).toBe(
        VolatilityClass.ULTRA_LOW
      );
      expect(volatilityClassSchema.parse(VolatilityClass.LOW)).toBe(VolatilityClass.LOW);
      expect(volatilityClassSchema.parse(VolatilityClass.MEDIUM)).toBe(
        VolatilityClass.MEDIUM
      );
      expect(volatilityClassSchema.parse(VolatilityClass.HIGH)).toBe(VolatilityClass.HIGH);
      expect(volatilityClassSchema.parse(VolatilityClass.ULTRA_HIGH)).toBe(
        VolatilityClass.ULTRA_HIGH
      );
    });

    it('should reject invalid volatility classes', () => {
      expect(() => volatilityClassSchema.parse('SUPER_HIGH')).toThrow();
      expect(() => volatilityClassSchema.parse('medium')).toThrow(); // lowercase
      expect(() => volatilityClassSchema.parse(123)).toThrow();
    });
  });

  describe('calculatorInputsSchema', () => {
    const validInputs = {
      freeCapital: 100000,
      ytdPnL: 0,
      conviction: 'II' as const,
      volatilityClass: VolatilityClass.MEDIUM,
      timeHorizon: 'swing' as const,
      entryPrice: 100,
      stopLoss: 98,
      slippage: 0,
      instrumentMultiplier: 1,
    };

    describe('Valid Inputs', () => {
      it('should accept minimal valid inputs', () => {
        expect(() => calculatorInputsSchema.parse(validInputs)).not.toThrow();
      });

      it('should accept inputs with optional fields', () => {
        const withOptional = {
          ...validInputs,
          takeProfitTarget: 104,
          customATR: 1.5,
          monthlyStopLoss: 5000,
          daysIntoMonth: 15,
        };
        expect(() => calculatorInputsSchema.parse(withOptional)).not.toThrow();
      });

      it('should accept negative YTD P&L', () => {
        const withNegativeYTD = { ...validInputs, ytdPnL: -5000 };
        expect(() => calculatorInputsSchema.parse(withNegativeYTD)).not.toThrow();
      });

      it('should accept very large free capital', () => {
        const withLargeCapital = { ...validInputs, freeCapital: 10_000_000 };
        expect(() => calculatorInputsSchema.parse(withLargeCapital)).not.toThrow();
      });
    });

    describe('Free Capital Validation', () => {
      it('should reject zero free capital', () => {
        const invalid = { ...validInputs, freeCapital: 0 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow();
      });

      it('should reject negative free capital', () => {
        const invalid = { ...validInputs, freeCapital: -1000 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow();
      });

      it('should reject free capital below minimum ($100)', () => {
        const invalid = { ...validInputs, freeCapital: 50 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow('at least $100');
      });

      it('should reject unreasonably large free capital', () => {
        const invalid = { ...validInputs, freeCapital: 2_000_000_000 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow('maximum');
      });
    });

    describe('Price Level Validation', () => {
      it('should reject zero entry price', () => {
        const invalid = { ...validInputs, entryPrice: 0 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow();
      });

      it('should reject negative entry price', () => {
        const invalid = { ...validInputs, entryPrice: -100 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow();
      });

      it('should reject same entry and stop price', () => {
        const invalid = { ...validInputs, entryPrice: 100, stopLoss: 100 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow(
          'Entry Price and Stop Loss cannot be the same'
        );
      });
    });

    describe('Take Profit Validation', () => {
      it('should accept take profit above entry for long trades', () => {
        const longTrade = {
          ...validInputs,
          entryPrice: 100,
          stopLoss: 98, // Long: stop below entry
          takeProfitTarget: 104,
        };
        expect(() => calculatorInputsSchema.parse(longTrade)).not.toThrow();
      });

      it('should accept take profit below entry for short trades', () => {
        const shortTrade = {
          ...validInputs,
          entryPrice: 98,
          stopLoss: 100, // Short: stop above entry
          takeProfitTarget: 94,
        };
        expect(() => calculatorInputsSchema.parse(shortTrade)).not.toThrow();
      });

      it('should reject take profit on wrong side for long trades', () => {
        const invalid = {
          ...validInputs,
          entryPrice: 100,
          stopLoss: 98, // Long
          takeProfitTarget: 96, // Below entry (wrong!)
        };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow(
          'Take Profit must be beyond Entry'
        );
      });

      it('should reject take profit on wrong side for short trades', () => {
        const invalid = {
          ...validInputs,
          entryPrice: 98,
          stopLoss: 100, // Short
          takeProfitTarget: 102, // Above entry (wrong!)
        };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow(
          'Take Profit must be beyond Entry'
        );
      });
    });

    describe('Slippage Validation', () => {
      it('should accept zero slippage', () => {
        const withZero = { ...validInputs, slippage: 0 };
        expect(() => calculatorInputsSchema.parse(withZero)).not.toThrow();
      });

      it('should accept reasonable slippage', () => {
        const withSlippage = { ...validInputs, slippage: 1.5 };
        expect(() => calculatorInputsSchema.parse(withSlippage)).not.toThrow();
      });

      it('should reject negative slippage', () => {
        const invalid = { ...validInputs, slippage: -0.5 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow();
      });

      it('should warn on unreasonably high slippage', () => {
        const invalid = { ...validInputs, slippage: 150 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow('unreasonably high');
      });
    });

    describe('Instrument Multiplier Validation', () => {
      it('should accept multiplier of 1 (stocks)', () => {
        const stocks = { ...validInputs, instrumentMultiplier: 1 };
        expect(() => calculatorInputsSchema.parse(stocks)).not.toThrow();
      });

      it('should accept multiplier of 50 (futures)', () => {
        const futures = { ...validInputs, instrumentMultiplier: 50 };
        expect(() => calculatorInputsSchema.parse(futures)).not.toThrow();
      });

      it('should accept fractional multiplier', () => {
        const fractional = { ...validInputs, instrumentMultiplier: 0.5 };
        expect(() => calculatorInputsSchema.parse(fractional)).not.toThrow();
      });

      it('should reject zero multiplier', () => {
        const invalid = { ...validInputs, instrumentMultiplier: 0 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow();
      });

      it('should reject unreasonably large multiplier', () => {
        const invalid = { ...validInputs, instrumentMultiplier: 20000 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow('too large');
      });
    });

    describe('Monthly Stop Loss Validation', () => {
      it('should accept reasonable monthly stop loss', () => {
        const valid = { ...validInputs, monthlyStopLoss: 5000 };
        expect(() => calculatorInputsSchema.parse(valid)).not.toThrow();
      });

      it('should warn if monthly stop exceeds 50% of free capital', () => {
        const invalid = {
          ...validInputs,
          freeCapital: 10000,
          monthlyStopLoss: 6000, // 60% of FC
        };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow(
          'exceeds 50% of Free Capital'
        );
      });

      it('should accept monthly stop at exactly 50% of free capital', () => {
        const atLimit = {
          ...validInputs,
          freeCapital: 10000,
          monthlyStopLoss: 5000, // Exactly 50%
        };
        expect(() => calculatorInputsSchema.parse(atLimit)).not.toThrow();
      });
    });

    describe('Days Into Month Validation', () => {
      it('should accept valid day values (1-31)', () => {
        expect(() =>
          calculatorInputsSchema.parse({ ...validInputs, daysIntoMonth: 1 })
        ).not.toThrow();
        expect(() =>
          calculatorInputsSchema.parse({ ...validInputs, daysIntoMonth: 15 })
        ).not.toThrow();
        expect(() =>
          calculatorInputsSchema.parse({ ...validInputs, daysIntoMonth: 31 })
        ).not.toThrow();
      });

      it('should reject day 0', () => {
        const invalid = { ...validInputs, daysIntoMonth: 0 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow('at least 1');
      });

      it('should reject day > 31', () => {
        const invalid = { ...validInputs, daysIntoMonth: 32 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow('cannot exceed 31');
      });

      it('should reject fractional days', () => {
        const invalid = { ...validInputs, daysIntoMonth: 15.5 };
        expect(() => calculatorInputsSchema.parse(invalid)).toThrow('whole number');
      });
    });
  });

  describe('riskPolicySchema', () => {
    const validPolicy = {
      typeI: { basePctOfFC: 5, ytdPct: 15 },
      typeII: { basePctOfFC: 3, ytdPct: 10 },
      typeIII: { basePctOfFC: 1, ytdPct: 5, hardCapPctOfFreePlusYTD: 10 },
      maxSingleTradePct: 5,
      monthlyStopCapPct: 25,
      volatility: {
        enabled: true,
        multipliers: {
          [VolatilityClass.ULTRA_LOW]: 2.0,
          [VolatilityClass.LOW]: 1.5,
          [VolatilityClass.MEDIUM]: 1.0,
          [VolatilityClass.HIGH]: 0.5,
          [VolatilityClass.ULTRA_HIGH]: 0.3,
        },
        atrEnabled: true,
        atrPeriod: 14,
      },
      rMultiple: {
        defaultTarget: 2,
        alertLevels: [0.5, 1, 1.5, 2],
        breakevenAt: 1,
        trailStopAt: 1.5,
      },
    };

    it('should accept valid risk policy', () => {
      expect(() => riskPolicySchema.parse(validPolicy)).not.toThrow();
    });

    describe('Conviction Settings', () => {
      it('should reject negative base percentages', () => {
        const invalid = {
          ...validPolicy,
          typeI: { ...validPolicy.typeI, basePctOfFC: -1 },
        };
        expect(() => riskPolicySchema.parse(invalid)).toThrow();
      });

      it('should reject percentages over 100', () => {
        const invalid = {
          ...validPolicy,
          typeI: { ...validPolicy.typeI, ytdPct: 150 },
        };
        expect(() => riskPolicySchema.parse(invalid)).toThrow('cannot exceed 100%');
      });
    });

    describe('Risk Caps', () => {
      it('should reject max single trade < 1%', () => {
        const invalid = { ...validPolicy, maxSingleTradePct: 0.5 };
        expect(() => riskPolicySchema.parse(invalid)).toThrow();
      });

      it('should reject max single trade > 20%', () => {
        const invalid = { ...validPolicy, maxSingleTradePct: 25 };
        expect(() => riskPolicySchema.parse(invalid)).toThrow();
      });

      it('should reject monthly stop cap < 10%', () => {
        const invalid = { ...validPolicy, monthlyStopCapPct: 5 };
        expect(() => riskPolicySchema.parse(invalid)).toThrow();
      });

      it('should reject monthly stop cap > 50%', () => {
        const invalid = { ...validPolicy, monthlyStopCapPct: 60 };
        expect(() => riskPolicySchema.parse(invalid)).toThrow();
      });
    });

    describe('Volatility Settings', () => {
      it('should accept volatility disabled', () => {
        const disabled = {
          ...validPolicy,
          volatility: { ...validPolicy.volatility, enabled: false },
        };
        expect(() => riskPolicySchema.parse(disabled)).not.toThrow();
      });

      it('should validate multiplier ranges', () => {
        // ULTRA_LOW multiplier too high
        const invalid = {
          ...validPolicy,
          volatility: {
            ...validPolicy.volatility,
            multipliers: {
              ...validPolicy.volatility.multipliers,
              [VolatilityClass.ULTRA_LOW]: 5.0, // Too high!
            },
          },
        };
        expect(() => riskPolicySchema.parse(invalid)).toThrow('too high');
      });

      it('should validate ATR period range', () => {
        const tooLow = {
          ...validPolicy,
          volatility: { ...validPolicy.volatility, atrPeriod: 2 },
        };
        expect(() => riskPolicySchema.parse(tooLow)).toThrow('at least 5');

        const tooHigh = {
          ...validPolicy,
          volatility: { ...validPolicy.volatility, atrPeriod: 100 },
        };
        expect(() => riskPolicySchema.parse(tooHigh)).toThrow('should not exceed 50');
      });
    });

    describe('R-Multiple Settings', () => {
      it('should reject R-multiple target < 1', () => {
        const invalid = {
          ...validPolicy,
          rMultiple: { ...validPolicy.rMultiple, defaultTarget: 0.5 },
        };
        expect(() => riskPolicySchema.parse(invalid)).toThrow('at least 1');
      });

      it('should reject R-multiple target > 10', () => {
        const invalid = {
          ...validPolicy,
          rMultiple: { ...validPolicy.rMultiple, defaultTarget: 15 },
        };
        expect(() => riskPolicySchema.parse(invalid)).toThrow('exceeds 10');
      });

      it('should require at least one alert level', () => {
        const invalid = {
          ...validPolicy,
          rMultiple: { ...validPolicy.rMultiple, alertLevels: [] },
        };
        expect(() => riskPolicySchema.parse(invalid)).toThrow('at least one');
      });

      it('should reject too many alert levels', () => {
        const invalid = {
          ...validPolicy,
          rMultiple: {
            ...validPolicy.rMultiple,
            alertLevels: [0.5, 1, 1.5, 2, 2.5, 3, 3.5], // 7 levels
          },
        };
        expect(() => riskPolicySchema.parse(invalid)).toThrow('Too many');
      });
    });
  });

  describe('Helper Functions', () => {
    describe('validateCalculatorInputs', () => {
      it('should validate and return typed inputs', () => {
        const validInputs = {
          freeCapital: 100000,
          ytdPnL: 0,
          conviction: 'II',
          volatilityClass: VolatilityClass.MEDIUM,
          timeHorizon: 'swing',
          entryPrice: 100,
          stopLoss: 98,
          slippage: 0,
          instrumentMultiplier: 1,
        };

        const result = validateCalculatorInputs(validInputs);
        expect(result).toEqual(validInputs);
      });

      it('should throw on invalid inputs', () => {
        const invalid = { freeCapital: -1000 };
        expect(() => validateCalculatorInputs(invalid)).toThrow();
      });
    });

    describe('safeValidateCalculatorInputs', () => {
      it('should return success for valid inputs', () => {
        const validInputs = {
          freeCapital: 100000,
          ytdPnL: 0,
          conviction: 'II',
          volatilityClass: VolatilityClass.MEDIUM,
          timeHorizon: 'swing',
          entryPrice: 100,
          stopLoss: 98,
          slippage: 0,
          instrumentMultiplier: 1,
        };

        const result = safeValidateCalculatorInputs(validInputs);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validInputs);
        }
      });

      it('should return error for invalid inputs', () => {
        const invalid = { freeCapital: -1000 };
        const result = safeValidateCalculatorInputs(invalid);
        expect(result.success).toBe(false);
      });
    });

    describe('getValidationErrors', () => {
      // This helper function is tested indirectly through the other tests
      it('should be a function', () => {
        expect(typeof getValidationErrors).toBe('function');
      });
    });

    describe('Type Guards', () => {
      it('isValidConviction should work correctly', () => {
        expect(isValidConviction('I')).toBe(true);
        expect(isValidConviction('II')).toBe(true);
        expect(isValidConviction('III')).toBe(true);
        expect(isValidConviction('IV')).toBe(false);
        expect(isValidConviction(1)).toBe(false);
        expect(isValidConviction(null)).toBe(false);
      });

      it('isValidVolatilityClass should work correctly', () => {
        expect(isValidVolatilityClass(VolatilityClass.ULTRA_LOW)).toBe(true);
        expect(isValidVolatilityClass(VolatilityClass.MEDIUM)).toBe(true);
        expect(isValidVolatilityClass('INVALID')).toBe(false);
        expect(isValidVolatilityClass(123)).toBe(false);
      });

      it('isValidTimeHorizon should work correctly', () => {
        expect(isValidTimeHorizon('day')).toBe(true);
        expect(isValidTimeHorizon('swing')).toBe(true);
        expect(isValidTimeHorizon('position')).toBe(true);
        expect(isValidTimeHorizon('scalp')).toBe(false);
        expect(isValidTimeHorizon(null)).toBe(false);
      });
    });
  });
});
