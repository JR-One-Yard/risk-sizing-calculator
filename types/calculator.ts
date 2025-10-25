/**
 * Core Calculator Type Definitions
 * Risk Sizing Tool v2 - Fresh Implementation
 */

import { VolatilityClass } from './volatility';

// ============================================================================
// CONVICTION TYPES (CORRECTLY LABELED FROM DAY ONE)
// ============================================================================

/**
 * Conviction levels for position sizing
 * IMPORTANT: These are correctly labeled!
 * - Type I = HIGH Conviction = 5% base risk (best setups, strong confluence)
 * - Type II = MEDIUM Conviction = 3% base risk (solid standard trades)
 * - Type III = LOW Conviction = 1% base risk (testing strategies, uncertain)
 */
export type ConvictionType = 'I' | 'II' | 'III';

export interface ConvictionConfig {
  type: ConvictionType;
  label: string;  // e.g., "Type I - High Conviction"
  basePct: number;  // Base risk percentage (5%, 3%, or 1%)
  ytdPct: number;   // YTD scaling percentage (15%, 10%, or 5%)
  description: string;
}

// ============================================================================
// RISK CALCULATION TYPES
// ============================================================================

export interface RiskCapWarning {
  type: 'monthly_stop' | 'type_iii_monthly' | 'max_single_trade';
  message: string;
  originalRisk: number;
  cappedRisk: number;
}

export interface RiskCalculationResult {
  baseRisk: number;
  finalRisk: number;
  warnings: RiskCapWarning[];
}

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface CalculatorInputs {
  // Account Information
  freeCapital: number;
  ytdPnL: number;

  // Trade Setup
  conviction: ConvictionType;
  volatilityClass: VolatilityClass;
  timeHorizon: TimeHorizon;

  // Price Levels
  entryPrice: number;
  stopLoss: number;
  takeProfitTarget?: number;  // Optional, can be calculated

  // Advanced Options
  customATR?: number;  // Optional manual ATR input
  slippage: number;  // Default 0
  instrumentMultiplier: number;  // Default 1 (for futures/options)

  // Monthly Risk Tracking (Optional)
  monthlyStopLoss?: number;
  daysIntoMonth?: number;
}

export type TimeHorizon = 'day' | 'swing' | 'position';

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export interface CalculationResult {
  // Core Results
  dollarRisk: number;
  riskPercentage: number;
  positionSize: number;  // Number of shares/contracts
  positionValue: number;  // Dollar value of position

  // Take Profit
  takeProfitPrice: number;
  takeProfitValue: number;

  // R-Multiple Analysis
  rMultiple: {
    current: number;
    target: number;  // Usually 2R
    breakeven: number;
  };

  // Applied Adjustments
  volatilityMultiplier: number;
  appliedCaps: string[];  // List of caps that were triggered

  // Alerts
  alerts: RiskAlert[];

  // Breakdown (for educational display)
  breakdown: CalculationBreakdown;
}

export interface CalculationBreakdown {
  step1_BaseRisk: {
    convictionPct: number;
    amount: number;
  };
  step2_YTDScaling: {
    ytdBonus: number;
    amount: number;
  };
  step3_VolatilityAdjustment: {
    multiplier: number;
    amount: number;
  };
  step4_RiskCaps: {
    beforeCaps: number;
    afterCaps: number;
    capsApplied: string[];
  };
  step5_FinalPosition: {
    riskPerShare: number;
    shares: number;
    positionValue: number;
  };
}

export interface RiskAlert {
  level: 'info' | 'warning' | 'danger';
  message: string;
  type: AlertType;
}

export type AlertType =
  | 'HIGH_RISK'
  | 'CAP_APPLIED'
  | 'MONTHLY_STOP_WARNING'
  | 'VOLATILITY_WARNING'
  | 'R_MULTIPLE_TARGET';

// ============================================================================
// POLICY / SETTINGS TYPES
// ============================================================================

export interface RiskPolicy {
  // Conviction Configurations
  typeI: ConvictionLevelPolicy;    // HIGH conviction
  typeII: ConvictionLevelPolicy;   // MEDIUM conviction
  typeIII: ConvictionLevelPolicy;  // LOW conviction

  // Global Risk Caps
  maxSingleTradePct: number;  // Default 5% of Free Capital
  monthlyStopCapPct: number;  // Default 25% of monthly stop

  // R-Multiple Settings
  defaultRMultipleTarget: number;  // Default 2 (risk/reward ratio)
  rMultipleAlerts: number[];  // Default [0.5, 1, 1.5, 2]
}

export interface ConvictionLevelPolicy {
  basePctOfFC: number;  // Base risk as % of Free Capital
  ytdPct: number;  // YTD scaling percentage
  hardCapPctOfFreePlusYTD?: number;  // Special cap for Type III
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: keyof CalculatorInputs;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
