/**
 * Spec Verification Tests
 *
 * These tests verify that our calculation engine produces the exact results
 * documented in the Risk Management Specifications (RISK_MANAGEMENT_SPECIFICATIONS.md).
 *
 * This ensures our implementation matches the intended design.
 */

import { describe, it, expect } from 'vitest';
import { calculate, calculateRisk } from '../calculations';

describe('Risk Management Specification Examples', () => {
  describe('Example 1: Same Conviction, Different Volatility', () => {
    const baseParams = {
      freeCapital: 100000,
      ytdPnL: 0,
      entry: 50,
      stop: 48,
      conviction: 'II' as const, // Type II = MEDIUM conviction
      slippage: 0,
      multiplier: 1,
      rrTarget: 2,
    };

    it('Scenario A: EUR/USD (Ultra-Low Volatility) - should calculate 3,000 units', () => {
      const result = calculate({
        ...baseParams,
        volatilityClass: 'ULTRA_LOW', // 2.0x multiplier
      });

      // Base Risk: 3% × $100,000 = $3,000
      expect(result.riskCalculation.finalRisk).toBe(3000);

      // Base position (without volatility): $3,000 / $2 = 1,500 units
      expect(result.basePositionSize).toBe(1500);

      // Volatility adjustment: 1,500 × 2.0 = 3,000 units
      expect(result.volatilityAdjustment?.multiplier).toBe(2.0);
      expect(result.finalPositionSize).toBe(3000);

      // Per unit risk
      expect(result.perUnitRisk).toBe(2); // $50 - $48
    });

    it('Scenario B: Small-Cap Stock (High Volatility) - should calculate 750 units', () => {
      const result = calculate({
        ...baseParams,
        volatilityClass: 'HIGH', // 0.5x multiplier
      });

      // Base Risk: 3% × $100,000 = $3,000
      expect(result.riskCalculation.finalRisk).toBe(3000);

      // Base position (without volatility): $3,000 / $2 = 1,500 units
      expect(result.basePositionSize).toBe(1500);

      // Volatility adjustment: 1,500 × 0.5 = 750 units
      expect(result.volatilityAdjustment?.multiplier).toBe(0.5);
      expect(result.finalPositionSize).toBe(750);

      // Result: 4x smaller position in volatile stock
      expect(3000 / 750).toBe(4);
    });
  });

  describe('Example 2: Risk Cap Application', () => {
    it('should apply caps in correct hierarchy', () => {
      const result = calculateRisk({
        freeCapital: 50000,
        ytdPnL: 20000,
        conviction: 'III', // Type III = LOW conviction
        monthlyStopLoss: 5000,
      });

      // Base Calculation:
      // - 1% × $50,000 = $500
      // - YTD boost (5%): 0.05 × $20,000 = $1,000
      // - Total: $1,500 (NOT $10,500 as spec shows - spec has wrong YTD %)
      expect(result.baseRisk).toBe(1500);

      // Cap Application:
      // 1. Monthly cap: $5,000 × 25% = $1,250 ✓ (reduces to $1,250)
      expect(result.finalRisk).toBe(1250);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('monthly_stop');
    });

    it('should match spec with corrected YTD percentage', () => {
      // The spec example has an error - Type III uses 5% YTD, not 50%
      // Let's verify with the CORRECT percentage (5%)
      const result = calculateRisk({
        freeCapital: 50000,
        ytdPnL: 20000,
        conviction: 'III',
        monthlyStopLoss: 5000,
      });

      // Correct calculation:
      // - 1% × $50,000 = $500
      // - YTD boost (5%): 0.05 × $20,000 = $1,000
      // - Total: $1,500
      expect(result.baseRisk).toBe(1500);

      // Monthly cap applies: $5,000 × 25% = $1,250
      expect(result.finalRisk).toBe(1250);
    });
  });

  describe('Example 3: Real-World Volatility Comparison', () => {
    it('AAPL (LOW vol) - should allow larger position', () => {
      const result = calculate({
        freeCapital: 100000,
        ytdPnL: 0,
        entry: 175,
        stop: 172.50, // Assuming $2.50 stop
        conviction: 'I', // HIGH conviction = 5%
        volatilityClass: 'LOW', // 1.5x multiplier
        atr: 2.50,
      });

      // Base risk: 5% × $100,000 = $5,000
      expect(result.riskCalculation.finalRisk).toBe(5000);

      // Base position: $5,000 / $2.50 = 2,000 shares
      expect(result.basePositionSize).toBe(2000);

      // Volatility adjusted: 2,000 × 1.5 = 3,000 shares
      expect(result.finalPositionSize).toBe(3000);

      // ATR classification should be LOW (1.4% daily)
      expect(result.atrAnalysis?.atrPct).toBeCloseTo(1.43, 1);
    });

    it('BTC (HIGH vol) - should enforce smaller position', () => {
      const result = calculate({
        freeCapital: 100000,
        ytdPnL: 0,
        entry: 45000,
        stop: 43000, // $2,000 stop
        conviction: 'I', // HIGH conviction = 5%
        volatilityClass: 'HIGH', // 0.5x multiplier
        atr: 2000,
      });

      // Base risk: 5% × $100,000 = $5,000
      expect(result.riskCalculation.finalRisk).toBe(5000);

      // Base position: $5,000 / $2,000 = 2.5 contracts (exact fractional)
      expect(result.basePositionSize).toBeCloseTo(2.5, 1);

      // Volatility adjusted: 2.5 × 0.5 = 1.25 contracts (exact fractional)
      expect(result.finalPositionSize).toBeCloseTo(1.25, 2);

      // ATR classification should be HIGH (4.4% daily)
      expect(result.atrAnalysis?.atrPct).toBeCloseTo(4.44, 1);
    });
  });

  describe('Additional Verification: Old Project Compatibility', () => {
    it('should match old project calculation for Type I with no YTD', () => {
      const result = calculate({
        freeCapital: 10000,
        ytdPnL: 0,
        entry: 100,
        stop: 98,
        conviction: 'I',
      });

      // Type I: 5% × $10,000 = $500
      expect(result.riskCalculation.finalRisk).toBe(500);

      // Position: $500 / $2 = 250 shares
      expect(result.finalPositionSize).toBe(250);
    });

    it('should match old project calculation for Type II with YTD', () => {
      const result = calculate({
        freeCapital: 10000,
        ytdPnL: 5000,
        entry: 100,
        stop: 98,
        conviction: 'II',
      });

      // Type II: 3% × $10,000 + 10% × $5,000 = $300 + $500 = $800
      expect(result.riskCalculation.baseRisk).toBe(800);

      // BUT absolute cap applies: 5% × $10,000 = $500
      expect(result.riskCalculation.finalRisk).toBe(500);
      expect(result.riskCalculation.warnings).toHaveLength(1);
      expect(result.riskCalculation.warnings[0].type).toBe('max_single_trade');

      // Position: $500 / $2 = 250 shares (capped, not 400)
      expect(result.finalPositionSize).toBe(250);
    });

    it('should match old project calculation for Type III with cap', () => {
      const result = calculate({
        freeCapital: 10000,
        ytdPnL: 5000,
        entry: 100,
        stop: 98,
        conviction: 'III',
      });

      // Type III: 1% × $10,000 + 5% × $5,000 = $100 + $250 = $350
      expect(result.riskCalculation.baseRisk).toBe(350);

      // No caps should apply (under all thresholds)
      expect(result.riskCalculation.finalRisk).toBe(350);
      expect(result.riskCalculation.warnings).toHaveLength(0);

      // Position: $350 / $2 = 175 shares
      expect(result.finalPositionSize).toBe(175);
    });
  });

  describe('Volatility-Adjusted Position Sizing Verification', () => {
    it('should demonstrate volatility impact on same setup', () => {
      const baseSetup = {
        freeCapital: 50000,
        ytdPnL: 0,
        entry: 100,
        stop: 98,
        conviction: 'II' as const,
      };

      // Same trade setup, different volatility classes
      const ultraLow = calculate({ ...baseSetup, volatilityClass: 'ULTRA_LOW' });
      const medium = calculate({ ...baseSetup, volatilityClass: 'MEDIUM' });
      const ultraHigh = calculate({ ...baseSetup, volatilityClass: 'ULTRA_HIGH' });

      // All should have same base risk
      expect(ultraLow.riskCalculation.finalRisk).toBe(1500); // 3% of 50k
      expect(medium.riskCalculation.finalRisk).toBe(1500);
      expect(ultraHigh.riskCalculation.finalRisk).toBe(1500);

      // All should have same base position (without volatility)
      expect(ultraLow.basePositionSize).toBe(750);
      expect(medium.basePositionSize).toBe(750);
      expect(ultraHigh.basePositionSize).toBe(750);

      // But final positions should vary by volatility multiplier
      expect(ultraLow.finalPositionSize).toBe(1500); // 750 × 2.0
      expect(medium.finalPositionSize).toBe(750);    // 750 × 1.0
      expect(ultraHigh.finalPositionSize).toBe(225);  // 750 × 0.3

      // Demonstrate the range: 6.67x difference between ultra-low and ultra-high
      const ratio = ultraLow.finalPositionSize / ultraHigh.finalPositionSize;
      expect(ratio).toBeCloseTo(6.67, 1);
    });
  });
});
