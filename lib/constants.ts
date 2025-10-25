/**
 * Constants and Default Values
 * Risk Sizing Tool v2 - Fresh Implementation
 */

import { RiskPolicy, ConvictionConfig, CalculatorInputs } from '@/types/calculator';
import { VolatilityClass } from '@/types/volatility';
import { InstrumentType } from '@/types/instruments';

// ============================================================================
// CONVICTION CONFIGURATIONS (CORRECT FROM DAY ONE!)
// ============================================================================

/**
 * IMPORTANT: These are correctly labeled!
 * Type I = HIGH Conviction (5% base) - Best setups
 * Type II = MEDIUM Conviction (3% base) - Standard trades
 * Type III = LOW Conviction (1% base) - Testing/uncertain
 */
export const CONVICTION_CONFIGS: Record<string, ConvictionConfig> = {
  'I': {
    type: 'I',
    label: 'Type I - High Conviction',
    basePct: 5,
    ytdPct: 15,
    description: 'Best setups with strong confluence. Maximum risk allowed.'
  },
  'II': {
    type: 'II',
    label: 'Type II - Medium Conviction',
    basePct: 3,
    ytdPct: 10,
    description: 'Solid standard trades with good setup quality.'
  },
  'III': {
    type: 'III',
    label: 'Type III - Low Conviction',
    basePct: 1,
    ytdPct: 5,
    description: 'Testing strategies or uncertain setups. Conservative risk.'
  }
};

// ============================================================================
// DEFAULT RISK POLICY
// ============================================================================

export const DEFAULT_RISK_POLICY: RiskPolicy = {
  // Conviction Levels
  typeI: {
    basePctOfFC: 5,
    ytdPct: 15,
    // No hard cap for Type I (highest conviction)
  },
  typeII: {
    basePctOfFC: 3,
    ytdPct: 10,
  },
  typeIII: {
    basePctOfFC: 1,
    ytdPct: 5,
    hardCapPctOfFreePlusYTD: 10,  // Special cap for low conviction
  },

  // Global Risk Caps
  maxSingleTradePct: 5,  // Max 5% of Free Capital per trade
  monthlyStopCapPct: 25,  // Can't use more than 25% of monthly stop budget

  // R-Multiple Settings
  defaultRMultipleTarget: 2,  // 2:1 risk/reward ratio
  rMultipleAlerts: [0.5, 1, 1.5, 2],  // Alert levels
};

// ============================================================================
// DEFAULT CALCULATOR INPUTS
// ============================================================================

export const DEFAULT_INPUTS: CalculatorInputs = {
  // Account
  freeCapital: 100000,
  ytdPnL: 0,

  // Trade Setup
  conviction: 'II',  // Default to Medium Conviction
  volatilityClass: VolatilityClass.MEDIUM,  // Default to Medium Volatility
  timeHorizon: 'swing',

  // Trade Direction & Instrument (NEW in v2.1)
  direction: 'long',  // Default to long positions
  instrumentType: InstrumentType.STOCK,  // Default to stocks

  // Price Levels
  entryPrice: 0,
  stopLoss: 0,

  // Advanced Options
  slippage: 0,
  instrumentMultiplier: 1,
};

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const TIME_HORIZON_OPTIONS = [
  { value: 'day', label: 'Day Trade', description: 'Intraday positions' },
  { value: 'swing', label: 'Swing Trade', description: '2-10 days typical' },
  { value: 'position', label: 'Position Trade', description: 'Weeks to months' },
] as const;

// ============================================================================
// RISK CAPS
// ============================================================================

/**
 * Hierarchical risk caps applied in this order:
 * 1. Monthly stop portion (highest priority)
 * 2. Type III hard cap (only for LOW conviction)
 * 3. Absolute maximum (final safety net)
 */
export const RISK_CAPS = {
  /** Maximum risk per trade as % of Free Capital (5%) */
  MAX_SINGLE_TRADE: 0.05,

  /** Type III monthly hard cap as % of (FC + positive YTD) (10%) */
  TYPE_III_MONTHLY: 0.10,

  /** Max portion of monthly stop loss budget per trade (25%) */
  MONTHLY_STOP_PORTION: 0.25,
} as const;

// ============================================================================
// VOLATILITY MULTIPLIERS
// ============================================================================

/**
 * Position size multipliers based on volatility classification
 * Core Principle: Higher volatility = Smaller position for same dollar risk
 *
 * Medium (S&P 500 baseline) = 1.0x (no adjustment)
 * Lower volatility instruments can have larger positions (more predictable stops)
 * Higher volatility instruments need smaller positions (wider stops required)
 */
export const VOLATILITY_MULTIPLIERS: Record<VolatilityClass, number> = {
  [VolatilityClass.ULTRA_LOW]: 2.0,   // 2x position size (FX majors, Treasuries)
  [VolatilityClass.LOW]: 1.5,         // 1.5x position size (Blue-chips)
  [VolatilityClass.MEDIUM]: 1.0,      // Baseline (S&P 500 stocks)
  [VolatilityClass.HIGH]: 0.5,        // 0.5x position size (Small-caps, BTC)
  [VolatilityClass.ULTRA_HIGH]: 0.3,  // 0.3x position size (Penny stocks, meme coins)
};

/**
 * ATR percentage thresholds for auto-classification
 * ATR as % of price determines volatility class
 */
export const ATR_PERCENTILE_RANGES = {
  ULTRA_LOW: 0.5,  // < 0.5% daily ATR
  LOW: 1.5,        // 0.5% - 1.5% daily ATR
  MEDIUM: 3.0,     // 1.5% - 3.0% daily ATR
  HIGH: 6.0,       // 3.0% - 6.0% daily ATR
  // ULTRA_HIGH: > 6.0% daily ATR
} as const;

// ============================================================================
// CALCULATION CONSTANTS
// ============================================================================

export const TRADING_DAYS_PER_YEAR = 252;
export const MIN_POSITION_SIZE = 1;  // Minimum shares/contracts
export const MAX_POSITION_PERCENTAGE = 100;  // Can't risk more than 100% of capital

// ============================================================================
// FORMATTING CONSTANTS
// ============================================================================

export const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const PERCENTAGE_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

export const NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
}

export function formatPercentage(value: number): string {
  return PERCENTAGE_FORMATTER.format(value / 100);
}

export function formatNumber(value: number): string {
  return NUMBER_FORMATTER.format(value);
}

/**
 * Get conviction config by type
 */
export function getConvictionConfig(type: 'I' | 'II' | 'III'): ConvictionConfig {
  return CONVICTION_CONFIGS[type];
}

/**
 * Get conviction label (for display)
 */
export function getConvictionLabel(type: 'I' | 'II' | 'III'): string {
  return CONVICTION_CONFIGS[type].label;
}
