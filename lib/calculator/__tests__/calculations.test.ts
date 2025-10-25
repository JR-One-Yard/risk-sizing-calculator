/**
 * Unit Tests for Risk Sizing Calculation Engine
 *
 * Test Coverage:
 * - All conviction types (I/II/III)
 * - All risk cap scenarios
 * - Volatility multipliers (all 5 classes)
 * - ATR analysis
 * - Edge cases (zero values, negative YTD, etc.)
 *
 * Target: 90%+ code coverage
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRisk,
  calculatePerUnitRisk,
  calculatePositionSize,
  applyVolatilityAdjustment,
  calculateTP,
  calculateAlerts,
  analyzeATR,
  classifyVolatilityFromATR,
  calculate,
} from '../calculations';
import type { ConvictionType } from '@/types/calculator';
import type { VolatilityClass } from '@/types/volatility';

describe('calculateRisk', () => {
  describe('Base Risk Calculation', () => {
    it('should calculate Type I (HIGH) conviction risk correctly', () => {
      const result = calculateRisk({
        freeCapital: 100000,
        ytdPnL: 0,
        conviction: 'I',
      });

      // Type I: 5% base + 15% YTD (but YTD is 0)
      expect(result.baseRisk).toBe(5000); // 5% of 100k
      expect(result.finalRisk).toBe(5000);
      expect(result.warnings).toHaveLength(0);
    });

    it('should calculate Type II (MEDIUM) conviction risk correctly', () => {
      const result = calculateRisk({
        freeCapital: 100000,
        ytdPnL: 0,
        conviction: 'II',
      });

      // Type II: 3% base + 10% YTD (but YTD is 0)
      expect(result.baseRisk).toBe(3000); // 3% of 100k
      expect(result.finalRisk).toBe(3000);
      expect(result.warnings).toHaveLength(0);
    });

    it('should calculate Type III (LOW) conviction risk correctly', () => {
      const result = calculateRisk({
        freeCapital: 100000,
        ytdPnL: 0,
        conviction: 'III',
      });

      // Type III: 1% base + 5% YTD (but YTD is 0)
      expect(result.baseRisk).toBe(1000); // 1% of 100k
      expect(result.finalRisk).toBe(1000);
      expect(result.warnings).toHaveLength(0);
    });

    it('should apply YTD boost for positive YTD P&L', () => {
      const result = calculateRisk({
        freeCapital: 100000,
        ytdPnL: 20000, // +$20k YTD
        conviction: 'I', // 5% base + 15% YTD
      });

      // Base: 5% * 100k = 5000
      // YTD boost: 15% * 20k = 3000
      // Uncapped total: 8000
      // BUT absolute cap: 5% * 100k = 5000
      expect(result.baseRisk).toBe(8000);
      expect(result.finalRisk).toBe(5000); // Capped to absolute max
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('max_single_trade');
    });

    it('should ignore negative YTD P&L', () => {
      const result = calculateRisk({
        freeCapital: 100000,
        ytdPnL: -10000, // -$10k YTD (losing year)
        conviction: 'I',
      });

      // YTD is negative, so only use base
      expect(result.baseRisk).toBe(5000); // 5% of 100k
      expect(result.finalRisk).toBe(5000);
    });
  });

  describe('Risk Caps - Hierarchical Application', () => {
    it('should apply monthly stop cap (highest priority)', () => {
      const result = calculateRisk({
        freeCapital: 100000,
        ytdPnL: 50000, // Big YTD win
        conviction: 'I', // 5% + 15%
        monthlyStopLoss: 5000, // $5k monthly stop
      });

      // Uncapped: 5% * 100k + 15% * 50k = 5000 + 7500 = 12,500
      // Monthly cap: 25% * 5000 = 1,250
      expect(result.baseRisk).toBe(12500);
      expect(result.finalRisk).toBe(1250); // Capped!
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('monthly_stop');
    });

    it('should apply Type III hard cap (10% of FC + YTD)', () => {
      const result = calculateRisk({
        freeCapital: 50000,
        ytdPnL: 20000,
        conviction: 'III', // 1% + 5%
      });

      // Uncapped: 1% * 50k + 5% * 20k = 500 + 1000 = 1,500
      // Type III cap: 10% * (50k + 20k) = 7,000
      // This shouldn't trigger because 1,500 < 7,000
      expect(result.finalRisk).toBe(1500);
      expect(result.warnings).toHaveLength(0);
    });

    it('should trigger Type III cap with large YTD boost', () => {
      const result = calculateRisk({
        freeCapital: 10000,
        ytdPnL: 200000, // Massive YTD
        conviction: 'III', // 1% + 5%
      });

      // Uncapped: 1% * 10k + 5% * 200k = 100 + 10,000 = 10,100
      // Type III cap: 10% * (10k + 200k) = 21,000 (wouldn't trigger)
      // BUT absolute cap: 5% * 10k = 500 ← TRIGGERS
      expect(result.baseRisk).toBe(10100);
      expect(result.finalRisk).toBe(500); // Capped to absolute max
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('max_single_trade');
    });

    it('should apply absolute maximum cap (5% of FC)', () => {
      const result = calculateRisk({
        freeCapital: 50000,
        ytdPnL: 100000, // Huge YTD
        conviction: 'I', // 5% + 15%
      });

      // Uncapped: 5% * 50k + 15% * 100k = 2,500 + 15,000 = 17,500
      // Absolute cap: 5% * 50k = 2,500
      expect(result.baseRisk).toBe(17500);
      expect(result.finalRisk).toBe(2500); // Capped to 5% of FC
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('max_single_trade');
    });

    it('should apply all caps in correct hierarchy', () => {
      const result = calculateRisk({
        freeCapital: 100000,
        ytdPnL: 100000,
        conviction: 'III',
        monthlyStopLoss: 3000,
      });

      // Uncapped: 1% * 100k + 5% * 100k = 1,000 + 5,000 = 6,000
      // Monthly cap: 25% * 3000 = 750 ← APPLIED FIRST
      // Type III cap: 10% * 200k = 20,000 (doesn't matter, already capped)
      // Absolute cap: 5% * 100k = 5,000 (doesn't matter, already capped)
      expect(result.finalRisk).toBe(750);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('monthly_stop');
    });
  });
});

describe('calculatePerUnitRisk', () => {
  it('should calculate basic per-unit risk', () => {
    const perUnitRisk = calculatePerUnitRisk(100, 98, 0, 1);
    expect(perUnitRisk).toBe(2); // $100 - $98 = $2
  });

  it('should handle short positions', () => {
    const perUnitRisk = calculatePerUnitRisk(98, 100, 0, 1);
    expect(perUnitRisk).toBe(2); // |$98 - $100| = $2
  });

  it('should include slippage buffer', () => {
    const perUnitRisk = calculatePerUnitRisk(100, 98, 0.5, 1);
    expect(perUnitRisk).toBe(2.5); // $2 + $0.50 slippage
  });

  it('should apply instrument multiplier (futures)', () => {
    const perUnitRisk = calculatePerUnitRisk(4000, 3990, 0, 50);
    expect(perUnitRisk).toBe(500); // $10 * 50 multiplier
  });

  it('should combine slippage and multiplier', () => {
    const perUnitRisk = calculatePerUnitRisk(100, 98, 1, 100);
    expect(perUnitRisk).toBe(300); // ($2 + $1) * 100
  });
});

describe('calculatePositionSize', () => {
  it('should calculate position size correctly', () => {
    const positionSize = calculatePositionSize(5000, 2);
    expect(positionSize).toBe(2500); // $5000 / $2 = 2500 shares
  });

  it('should floor position size to avoid over-risking', () => {
    const positionSize = calculatePositionSize(5000, 3);
    expect(positionSize).toBe(1666); // floor(5000 / 3) = 1666
  });

  it('should return 0 for zero perUnitRisk', () => {
    const positionSize = calculatePositionSize(5000, 0);
    expect(positionSize).toBe(0);
  });

  it('should return 0 for negative perUnitRisk', () => {
    const positionSize = calculatePositionSize(5000, -2);
    expect(positionSize).toBe(0);
  });
});

describe('applyVolatilityAdjustment', () => {
  const BASE_POSITION = 1000;

  it('should apply ULTRA_LOW multiplier (2.0x)', () => {
    const result = applyVolatilityAdjustment(BASE_POSITION, 'ULTRA_LOW');
    expect(result.multiplier).toBe(2.0);
    expect(result.adjustedPositionSize).toBe(2000); // 1000 * 2.0
    expect(result.adjustment).toBe(1000); // +1000 shares
    expect(result.adjustmentPct).toBe(100); // +100%
  });

  it('should apply LOW multiplier (1.5x)', () => {
    const result = applyVolatilityAdjustment(BASE_POSITION, 'LOW');
    expect(result.multiplier).toBe(1.5);
    expect(result.adjustedPositionSize).toBe(1500); // 1000 * 1.5
    expect(result.adjustment).toBe(500);
    expect(result.adjustmentPct).toBe(50);
  });

  it('should apply MEDIUM multiplier (1.0x - no change)', () => {
    const result = applyVolatilityAdjustment(BASE_POSITION, 'MEDIUM');
    expect(result.multiplier).toBe(1.0);
    expect(result.adjustedPositionSize).toBe(1000); // 1000 * 1.0
    expect(result.adjustment).toBe(0);
    expect(result.adjustmentPct).toBe(0);
  });

  it('should apply HIGH multiplier (0.5x)', () => {
    const result = applyVolatilityAdjustment(BASE_POSITION, 'HIGH');
    expect(result.multiplier).toBe(0.5);
    expect(result.adjustedPositionSize).toBe(500); // 1000 * 0.5
    expect(result.adjustment).toBe(-500); // -500 shares
    expect(result.adjustmentPct).toBe(-50); // -50%
  });

  it('should apply ULTRA_HIGH multiplier (0.3x)', () => {
    const result = applyVolatilityAdjustment(BASE_POSITION, 'ULTRA_HIGH');
    expect(result.multiplier).toBe(0.3);
    expect(result.adjustedPositionSize).toBe(300); // floor(1000 * 0.3)
    expect(result.adjustment).toBe(-700);
    expect(result.adjustmentPct).toBe(-70);
  });

  it('should floor adjusted position size', () => {
    const result = applyVolatilityAdjustment(1001, 'ULTRA_HIGH');
    expect(result.adjustedPositionSize).toBe(300); // floor(1001 * 0.3) = floor(300.3)
  });
});

describe('calculateTP', () => {
  it('should calculate TP for long position with 2:1 R:R', () => {
    const tp = calculateTP(100, 98, 2);
    // Risk: $100 - $98 = $2
    // Reward: $2 * 2 = $4
    // TP: $100 + $4 = $104
    expect(tp).toBe(104);
  });

  it('should calculate TP for short position with 2:1 R:R', () => {
    const tp = calculateTP(98, 100, 2);
    // Risk: |$98 - $100| = $2
    // Reward: $2 * 2 = $4
    // TP: $98 - $4 = $94
    expect(tp).toBe(94);
  });

  it('should handle 3:1 R:R ratio', () => {
    const tp = calculateTP(50, 48, 3);
    // Risk: $2, Reward: $6
    // TP: $50 + $6 = $56
    expect(tp).toBe(56);
  });

  it('should handle 1:1 R:R ratio', () => {
    const tp = calculateTP(100, 95, 1);
    // Risk: $5, Reward: $5
    // TP: $100 + $5 = $105
    expect(tp).toBe(105);
  });
});

describe('calculateAlerts', () => {
  it('should generate correct R-multiple alerts for long position', () => {
    const alerts = calculateAlerts(100, 98, [0.5, 1, 1.5, 2]);

    // Risk: $2 per R
    expect(alerts).toHaveLength(4);
    expect(alerts[0]).toEqual({ label: '0.5R', rMultiple: 0.5, triggerPrice: 101 }); // $100 + $1
    expect(alerts[1]).toEqual({ label: '1R', rMultiple: 1, triggerPrice: 102 }); // $100 + $2
    expect(alerts[2]).toEqual({ label: '1.5R', rMultiple: 1.5, triggerPrice: 103 }); // $100 + $3
    expect(alerts[3]).toEqual({ label: '2R', rMultiple: 2, triggerPrice: 104 }); // $100 + $4
  });

  it('should generate correct R-multiple alerts for short position', () => {
    const alerts = calculateAlerts(98, 100, [0.5, 1, 2]);

    // Risk: $2 per R
    expect(alerts).toHaveLength(3);
    expect(alerts[0]).toEqual({ label: '0.5R', rMultiple: 0.5, triggerPrice: 97 }); // $98 - $1
    expect(alerts[1]).toEqual({ label: '1R', rMultiple: 1, triggerPrice: 96 }); // $98 - $2
    expect(alerts[2]).toEqual({ label: '2R', rMultiple: 2, triggerPrice: 94 }); // $98 - $4
  });

  it('should handle custom R-multiples', () => {
    const alerts = calculateAlerts(100, 95, [0.25, 0.75, 1.25]);

    // Risk: $5 per R
    expect(alerts).toHaveLength(3);
    expect(alerts[0]).toEqual({ label: '0.25R', rMultiple: 0.25, triggerPrice: 101.25 });
    expect(alerts[1]).toEqual({ label: '0.75R', rMultiple: 0.75, triggerPrice: 103.75 });
    expect(alerts[2]).toEqual({ label: '1.25R', rMultiple: 1.25, triggerPrice: 106.25 });
  });
});

describe('analyzeATR', () => {
  it('should analyze appropriate stop distance', () => {
    const result = analyzeATR(100, 98, 1); // Stop = 2 ATR (appropriate)

    expect(result.atr).toBe(1);
    expect(result.atrPeriod).toBe(14); // Default
    expect(result.atrPct).toBe(1); // 1% ATR
    expect(result.stopDistance).toBe(2);
    expect(result.stopInATR).toBe(2); // 2 ATR stop
    expect(result.severity).toBe('info');
    expect(result.recommendation).toContain('appropriate');
  });

  it('should warn about tight stops', () => {
    const result = analyzeATR(100, 99.5, 1); // Stop = 0.5 ATR (too tight)

    expect(result.stopInATR).toBe(0.5);
    expect(result.severity).toBe('warning');
    expect(result.recommendation).toContain('tight');
    expect(result.recommendation).toContain('premature exit');
  });

  it('should warn about wide stops', () => {
    const result = analyzeATR(100, 95, 1); // Stop = 5 ATR (too wide)

    expect(result.stopInATR).toBe(5);
    expect(result.severity).toBe('warning');
    expect(result.recommendation).toContain('wide');
  });

  it('should calculate suggested stop price for long', () => {
    const result = analyzeATR(100, 98, 1);

    expect(result.suggestedMultiplier).toBe(2.0);
    expect(result.suggestedStopDistance).toBe(2); // 2 * 1 ATR
    expect(result.suggestedStopPrice).toBe(98); // $100 - $2
  });

  it('should calculate suggested stop price for short', () => {
    const result = analyzeATR(98, 100, 1);

    expect(result.suggestedStopPrice).toBe(100); // $98 + $2
  });

  it('should handle custom ATR period', () => {
    const result = analyzeATR(100, 98, 1, 20);
    expect(result.atrPeriod).toBe(20);
  });
});

describe('classifyVolatilityFromATR', () => {
  it('should classify ULTRA_LOW volatility', () => {
    const result = classifyVolatilityFromATR(0.40, 100);
    // 0.40 / 100 = 0.4% (< 0.5%)
    expect(result).toBe('ULTRA_LOW');
  });

  it('should classify LOW volatility', () => {
    const result = classifyVolatilityFromATR(1.0, 100);
    // 1.0 / 100 = 1.0% (0.5% - 1.5%)
    expect(result).toBe('LOW');
  });

  it('should classify MEDIUM volatility', () => {
    const result = classifyVolatilityFromATR(2.5, 100);
    // 2.5 / 100 = 2.5% (1.5% - 3.0%)
    expect(result).toBe('MEDIUM');
  });

  it('should classify HIGH volatility', () => {
    const result = classifyVolatilityFromATR(5.0, 100);
    // 5.0 / 100 = 5.0% (3.0% - 6.0%)
    expect(result).toBe('HIGH');
  });

  it('should classify ULTRA_HIGH volatility', () => {
    const result = classifyVolatilityFromATR(8.0, 100);
    // 8.0 / 100 = 8.0% (> 6.0%)
    expect(result).toBe('ULTRA_HIGH');
  });

  it('should handle real-world examples', () => {
    // EUR/USD: ATR ~0.5, Price ~1.08
    expect(classifyVolatilityFromATR(0.005, 1.08)).toBe('ULTRA_LOW');

    // AAPL: ATR ~$2.50, Price ~$175
    expect(classifyVolatilityFromATR(2.50, 175)).toBe('LOW');

    // BTC: ATR ~$2000, Price ~$45000
    expect(classifyVolatilityFromATR(2000, 45000)).toBe('HIGH');
  });
});

describe('calculate (Main Orchestrator)', () => {
  it('should perform complete calculation without volatility', () => {
    const result = calculate({
      freeCapital: 100000,
      ytdPnL: 0,
      entry: 100,
      stop: 98,
      conviction: 'II',
      slippage: 0,
      multiplier: 1,
      rrTarget: 2,
    });

    // Expected: 3% of 100k = $3000 risk, $2 per share = 1500 shares
    expect(result.riskCalculation.finalRisk).toBe(3000);
    expect(result.perUnitRisk).toBe(2);
    expect(result.basePositionSize).toBe(1500);
    expect(result.finalPositionSize).toBe(1500); // No volatility adjustment
    expect(result.volatilityAdjustment).toBeNull();
    expect(result.takeProfitPrice).toBe(104);
    expect(result.alerts).toHaveLength(4);
    expect(result.isLong).toBe(true);
  });

  it('should apply volatility adjustment when provided', () => {
    const result = calculate({
      freeCapital: 100000,
      ytdPnL: 0,
      entry: 100,
      stop: 98,
      conviction: 'II',
      volatilityClass: 'HIGH', // 0.5x multiplier
    });

    // Base: 1500 shares
    // Volatility adjusted: 1500 * 0.5 = 750 shares
    expect(result.basePositionSize).toBe(1500);
    expect(result.finalPositionSize).toBe(750);
    expect(result.volatilityAdjustment).not.toBeNull();
    expect(result.volatilityAdjustment?.multiplier).toBe(0.5);
  });

  it('should include ATR analysis when ATR provided', () => {
    const result = calculate({
      freeCapital: 100000,
      ytdPnL: 0,
      entry: 100,
      stop: 98,
      conviction: 'II',
      atr: 1,
      atrPeriod: 14,
    });

    expect(result.atrAnalysis).not.toBeNull();
    expect(result.atrAnalysis?.atr).toBe(1);
    expect(result.atrAnalysis?.stopInATR).toBe(2);
  });

  it('should handle short positions', () => {
    const result = calculate({
      freeCapital: 100000,
      ytdPnL: 0,
      entry: 98,
      stop: 100,
      conviction: 'I',
    });

    expect(result.isLong).toBe(false);
    expect(result.takeProfitPrice).toBe(94); // $98 - (2 * 2) = $94
  });

  it('should apply all features together', () => {
    const result = calculate({
      freeCapital: 100000,
      ytdPnL: 20000,
      entry: 50,
      stop: 48,
      conviction: 'I',
      slippage: 0.5,
      multiplier: 1,
      rrTarget: 3,
      monthlyStopLoss: 5000,
      volatilityClass: 'LOW', // 1.5x
      atr: 1,
      atrPeriod: 14,
    });

    // Should have risk calculation with cap warnings
    expect(result.riskCalculation).toBeDefined();
    expect(result.riskCalculation.warnings.length).toBeGreaterThan(0);

    // Should have volatility adjustment
    expect(result.volatilityAdjustment).not.toBeNull();
    expect(result.volatilityAdjustment?.multiplier).toBe(1.5);

    // Should have ATR analysis
    expect(result.atrAnalysis).not.toBeNull();

    // Should have all trade management data
    expect(result.takeProfitPrice).toBeDefined();
    expect(result.alerts).toHaveLength(4);
  });
});
