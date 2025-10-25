/**
 * Constants and Default Values
 * Risk Sizing Tool v2 - Fresh Implementation
 */

import { RiskPolicy, ConvictionConfig, CalculatorInputs } from '@/types/calculator';
import { VolatilityClass } from '@/types/volatility';

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
