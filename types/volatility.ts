/**
 * Volatility Type Definitions
 * Risk Sizing Tool v2 - Fresh Implementation
 */

// ============================================================================
// VOLATILITY CLASSIFICATION
// ============================================================================

/**
 * Volatility classes for position size adjustment
 * Based on annualized volatility or ATR analysis
 */
export enum VolatilityClass {
  ULTRA_LOW = 'ULTRA_LOW',    // <20% annualized (Major FX pairs, Treasuries)
  LOW = 'LOW',                // 20-40% annualized (Blue-chip stocks)
  MEDIUM = 'MEDIUM',          // 40-60% annualized (S&P 500 stocks) - Baseline
  HIGH = 'HIGH',              // 60-100% annualized (Small-caps, Crypto)
  ULTRA_HIGH = 'ULTRA_HIGH'   // >100% annualized (Penny stocks, Meme coins)
}

/**
 * Position size multipliers for each volatility class
 * Higher volatility = Smaller position (lower multiplier)
 * Lower volatility = Larger position (higher multiplier)
 */
export const VOLATILITY_MULTIPLIERS: Record<VolatilityClass, number> = {
  [VolatilityClass.ULTRA_LOW]: 2.0,   // 2x position size
  [VolatilityClass.LOW]: 1.5,         // 1.5x position size
  [VolatilityClass.MEDIUM]: 1.0,      // Baseline (no adjustment)
  [VolatilityClass.HIGH]: 0.5,        // 0.5x position size (half)
  [VolatilityClass.ULTRA_HIGH]: 0.3,  // 0.3x position size (30%)
};

// ============================================================================
// VOLATILITY CONFIGURATION
// ============================================================================

export interface VolatilityConfig {
  class: VolatilityClass;
  multiplier: number;
  annualizedRange: string;
  description: string;
  examples: string[];  // Example instruments in this class
  atrRange?: {
    min: number;  // Minimum ATR percentage
    max: number;  // Maximum ATR percentage
  };
}

// ============================================================================
// VOLATILITY ADJUSTMENT RESULTS
// ============================================================================

export interface VolatilityAdjustment {
  basePositionSize: number;
  volatilityClass: VolatilityClass;
  multiplier: number;
  adjustedPositionSize: number;
  adjustment: number; // Difference (adjusted - base)
  adjustmentPct: number; // Percentage change
}

export interface ATRAnalysis {
  atr: number;
  atrPeriod: number;
  atrPct: number; // ATR as % of price
  stopDistance: number;
  stopInATR: number; // Stop distance in ATR terms
  suggestedMultiplier: number;
  suggestedStopDistance: number;
  suggestedStopPrice: number;
  recommendation: string;
  severity: 'info' | 'warning' | 'error';
}

// ============================================================================
// VOLATILITY CONFIGURATION DATA
// ============================================================================

/**
 * Complete configuration for all volatility classes
 * Used for UI display and user education
 */
export const VOLATILITY_CONFIGS: Record<VolatilityClass, VolatilityConfig> = {
  [VolatilityClass.ULTRA_LOW]: {
    class: VolatilityClass.ULTRA_LOW,
    multiplier: 2.0,
    annualizedRange: '<20%',
    description: 'Very stable instruments with minimal price swings',
    examples: ['EUR/USD', 'USD/JPY', '10Y Treasury', 'Utilities ETF'],
    atrRange: { min: 0, max: 1.3 }
  },
  [VolatilityClass.LOW]: {
    class: VolatilityClass.LOW,
    multiplier: 1.5,
    annualizedRange: '20-40%',
    description: 'Stable large-cap stocks and major indices',
    examples: ['AAPL', 'MSFT', 'JNJ', 'PG', 'SPY'],
    atrRange: { min: 1.3, max: 2.5 }
  },
  [VolatilityClass.MEDIUM]: {
    class: VolatilityClass.MEDIUM,
    multiplier: 1.0,
    annualizedRange: '40-60%',
    description: 'Standard volatility - baseline for calculations',
    examples: ['Most S&P 500 stocks', 'QQQ', 'Growth stocks'],
    atrRange: { min: 2.5, max: 3.8 }
  },
  [VolatilityClass.HIGH]: {
    class: VolatilityClass.HIGH,
    multiplier: 0.5,
    annualizedRange: '60-100%',
    description: 'Volatile instruments requiring reduced position size',
    examples: ['Small-cap stocks', 'BTC/USD', 'High-beta tech', 'Emerging markets'],
    atrRange: { min: 3.8, max: 6.3 }
  },
  [VolatilityClass.ULTRA_HIGH]: {
    class: VolatilityClass.ULTRA_HIGH,
    multiplier: 0.3,
    annualizedRange: '>100%',
    description: 'Extremely volatile - use small positions only',
    examples: ['Penny stocks', 'Meme coins', 'Options', '3x leveraged ETFs'],
    atrRange: { min: 6.3, max: Infinity }
  }
};

// ============================================================================
// ATR CALCULATION TYPES
// ============================================================================

export interface ATRData {
  value: number;  // ATR value (absolute)
  percentage: number;  // ATR as % of price
  period: number;  // Period used (typically 14)
  annualized: number;  // Annualized volatility estimate
}

export interface VolatilityAnalysis {
  currentClass: VolatilityClass;
  atr: ATRData;
  recommendation: string;
  warnings: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate volatility class from ATR percentage
 */
export function getVolatilityClassFromATR(atrPercent: number): VolatilityClass {
  if (atrPercent < 1.3) return VolatilityClass.ULTRA_LOW;
  if (atrPercent < 2.5) return VolatilityClass.LOW;
  if (atrPercent < 3.8) return VolatilityClass.MEDIUM;
  if (atrPercent < 6.3) return VolatilityClass.HIGH;
  return VolatilityClass.ULTRA_HIGH;
}

/**
 * Calculate annualized volatility from daily ATR
 */
export function calculateAnnualizedVolatility(
  atr: number,
  price: number
): number {
  const atrPercent = (atr / price) * 100;
  // Annualize assuming 252 trading days
  return atrPercent * Math.sqrt(252);
}

/**
 * Get multiplier for a volatility class
 */
export function getVolatilityMultiplier(volatilityClass: VolatilityClass): number {
  return VOLATILITY_MULTIPLIERS[volatilityClass];
}
