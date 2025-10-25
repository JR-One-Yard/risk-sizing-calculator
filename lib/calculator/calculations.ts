/**
 * Core Position Sizing Calculation Engine
 *
 * This module implements the complete risk management calculation logic
 * with volatility-adjusted position sizing for the Risk Sizing Tool v2.
 *
 * Key Features:
 * - Conviction-based risk allocation (Type I/II/III)
 * - YTD P&L scaling (Kelly Criterion inspired)
 * - Hierarchical risk caps (Monthly Stop → Type III → Absolute Max)
 * - Volatility-adjusted position sizing (NEW in v2)
 * - ATR-based stop analysis (NEW in v2)
 * - R-multiple trade management
 *
 * @module lib/calculator/calculations
 */

import type {
  ConvictionType,
  RiskCalculationResult,
  RiskCapWarning,
} from '@/types/calculator';
import { VolatilityClass } from '@/types/volatility';
import type {
  VolatilityAdjustment,
  ATRAnalysis,
} from '@/types/volatility';
import type { Direction } from '@/types/instruments';
import {
  CONVICTION_CONFIGS,
  RISK_CAPS,
  VOLATILITY_MULTIPLIERS,
  ATR_PERCENTILE_RANGES,
} from '@/lib/constants';

/**
 * Calculate base dollar risk with YTD scaling and hierarchical caps
 *
 * Formula:
 * Base Risk = (convictionPct × freeCapital) + (ytdPct × max(0, ytdPnL))
 *
 * Then apply caps in order:
 * 1. Monthly stop portion (if monthly stop provided)
 * 2. Type III hard cap (10% of FC + YTD, only for Type III)
 * 3. Absolute maximum (5% of FC, applies to all)
 *
 * @param params - Risk calculation parameters
 * @returns Calculated risk with warnings for any caps applied
 */
export function calculateRisk(params: {
  freeCapital: number;
  ytdPnL: number;
  conviction: ConvictionType;
  monthlyStopLoss?: number;
}): RiskCalculationResult {
  const { freeCapital, ytdPnL, conviction, monthlyStopLoss } = params;
  const warnings: RiskCapWarning[] = [];

  // Get conviction-specific percentages
  const config = CONVICTION_CONFIGS[conviction];
  const { basePct, ytdPct } = config;

  // Base calculation: basePct * FC + ytdPct * max(0, YTD)
  let calculatedRisk =
    (basePct / 100) * freeCapital +
    (ytdPct / 100) * Math.max(0, ytdPnL);

  const baseRisk = calculatedRisk; // Store for comparison

  // Cap 1: Monthly stop portion (highest priority)
  if (monthlyStopLoss && monthlyStopLoss > 0) {
    const monthlyPortionCap = monthlyStopLoss * RISK_CAPS.MONTHLY_STOP_PORTION;
    if (calculatedRisk > monthlyPortionCap) {
      calculatedRisk = monthlyPortionCap;
      warnings.push({
        type: 'monthly_stop',
        message: `Risk reduced to ${RISK_CAPS.MONTHLY_STOP_PORTION * 100}% of monthly stop loss`,
        originalRisk: baseRisk,
        cappedRisk: calculatedRisk,
      });
    }
  }

  // Cap 2: Type III hard cap (only applies to LOW conviction trades)
  if (conviction === 'III') {
    const typeIIICapBase = freeCapital + Math.max(0, ytdPnL);
    const typeIIICap = typeIIICapBase * RISK_CAPS.TYPE_III_MONTHLY;
    if (calculatedRisk > typeIIICap) {
      calculatedRisk = typeIIICap;
      warnings.push({
        type: 'type_iii_monthly',
        message: `Type III hard cap applied (${RISK_CAPS.TYPE_III_MONTHLY * 100}% of FC + YTD)`,
        originalRisk: baseRisk,
        cappedRisk: calculatedRisk,
      });
    }
  }

  // Cap 3: Absolute maximum (applies to all trades)
  const absoluteMaxCap = freeCapital * RISK_CAPS.MAX_SINGLE_TRADE;
  if (calculatedRisk > absoluteMaxCap) {
    calculatedRisk = absoluteMaxCap;
    warnings.push({
      type: 'max_single_trade',
      message: `Absolute maximum cap applied (${RISK_CAPS.MAX_SINGLE_TRADE * 100}% of FC)`,
      originalRisk: baseRisk,
      cappedRisk: calculatedRisk,
    });
  }

  return {
    baseRisk,
    finalRisk: calculatedRisk,
    warnings,
  };
}

/**
 * Calculate risk per unit (per share/contract)
 *
 * Includes:
 * - Entry to stop distance
 * - Slippage buffer
 * - Instrument multiplier (for futures/options)
 *
 * @param entry - Entry price
 * @param stop - Stop loss price
 * @param slippage - Slippage buffer in price units (default 0)
 * @param multiplier - Instrument multiplier (default 1 for stocks)
 * @returns Dollar risk per unit
 */
export function calculatePerUnitRisk(
  entry: number,
  stop: number,
  slippage = 0,
  multiplier = 1
): number {
  return (Math.abs(entry - stop) + slippage) * multiplier;
}

/**
 * Calculate position size in units (shares/contracts)
 *
 * SUPPORTS FRACTIONAL POSITIONS: Returns exact fractional size to maintain
 * precise dollar risk. Examples:
 * - 0.0065 contracts of NQ futures = exactly $3,000 risk
 * - 125.5 shares of AAPL = exactly $500 risk
 *
 * @param dollarRisk - Total dollar risk allocated to this trade
 * @param perUnitRisk - Risk per unit (from calculatePerUnitRisk)
 * @returns Position size with fractional precision (NOT floored)
 */
export function calculatePositionSize(
  dollarRisk: number,
  perUnitRisk: number
): number {
  if (perUnitRisk <= 0) return 0;
  // Return exact fractional size - no Math.floor()
  // This allows fractional contracts/shares for precise dollar risk
  return dollarRisk / perUnitRisk;
}

/**
 * Apply volatility adjustment to position size
 *
 * Core Principle: Higher volatility = Smaller position for same dollar risk
 *
 * Multipliers:
 * - Ultra-Low (FX majors, Treasuries): 2.0x (double position size)
 * - Low (Blue-chips): 1.5x
 * - Medium (S&P 500 baseline): 1.0x (no adjustment)
 * - High (Small-caps, BTC): 0.5x (half position size)
 * - Ultra-High (Penny stocks, meme coins): 0.3x (30% position size)
 *
 * @param basePositionSize - Position size before volatility adjustment
 * @param volatilityClass - Volatility classification
 * @returns Adjusted position size and multiplier info (supports fractional)
 */
export function applyVolatilityAdjustment(
  basePositionSize: number,
  volatilityClass: VolatilityClass
): VolatilityAdjustment {
  const multiplier = VOLATILITY_MULTIPLIERS[volatilityClass];
  // Keep exact fractional precision - no Math.floor()
  const adjustedSize = basePositionSize * multiplier;

  return {
    basePositionSize,
    volatilityClass,
    multiplier,
    adjustedPositionSize: adjustedSize,
    adjustment: adjustedSize - basePositionSize,
    adjustmentPct: ((adjustedSize - basePositionSize) / basePositionSize) * 100,
  };
}

/**
 * Calculate take profit price based on R:R target
 *
 * R:R Ratio = Risk : Reward
 * If entry-to-stop distance is 1R (risk), then:
 * - 2:1 R:R means TP is 2R away from entry
 *
 * @param entry - Entry price
 * @param stop - Stop loss price
 * @param direction - Trade direction ('long' or 'short')
 * @param rrTarget - Risk:Reward ratio (e.g., 2 for 2:1, 3 for 3:1)
 * @returns Take profit price
 */
export function calculateTP(
  entry: number,
  stop: number,
  direction: Direction,
  rrTarget: number
): number {
  const riskDistance = Math.abs(entry - stop);

  return direction === 'long'
    ? entry + rrTarget * riskDistance
    : entry - rrTarget * riskDistance;
}

/**
 * Generate R-multiple alert levels for trade management
 *
 * R-multiples help track trade progress in risk-adjusted terms.
 * Example: If risking $500 (1R), then:
 * - 0.5R = +$250 profit
 * - 1R = +$500 profit (breakeven move)
 * - 2R = +$1,000 profit
 *
 * @param entry - Entry price
 * @param stop - Stop loss price
 * @param direction - Trade direction ('long' or 'short')
 * @param multiples - Array of R-multiples (e.g., [0.5, 1, 1.5, 2])
 * @returns Array of alert objects with labels and trigger prices
 */
export function calculateAlerts(
  entry: number,
  stop: number,
  direction: Direction,
  multiples: number[]
): Array<{ label: string; triggerPrice: number; rMultiple: number }> {
  const riskDistance = Math.abs(entry - stop);

  return multiples.map((multiple) => ({
    label: `${multiple}R`,
    rMultiple: multiple,
    triggerPrice: direction === 'long'
      ? entry + multiple * riskDistance
      : entry - multiple * riskDistance,
  }));
}

/**
 * Analyze ATR vs user's stop distance
 *
 * ATR (Average True Range) is a volatility indicator that measures
 * typical price movement over a period. Comparing the user's stop
 * distance to ATR helps determine if:
 * - Stop is too tight (< 0.7x typical move) → Risk premature exit
 * - Stop is too wide (> 1.3x typical move) → Consider smaller size
 * - Stop is appropriate (0.7x - 1.3x) → Good balance
 *
 * @param entry - Entry price
 * @param stop - Stop loss price
 * @param direction - Trade direction ('long' or 'short')
 * @param atr - Average True Range value
 * @param atrPeriod - ATR period used (14 is standard)
 * @returns ATR analysis with recommendations
 */
export function analyzeATR(
  entry: number,
  stop: number,
  direction: Direction,
  atr: number,
  atrPeriod = 14
): ATRAnalysis {
  const stopDistance = Math.abs(entry - stop);
  const stopInATR = stopDistance / atr;
  const atrPct = (atr / entry) * 100;

  // Determine appropriate ATR multiplier range
  // Day traders: 1-2 ATR
  // Swing traders: 2-3 ATR
  // Position traders: 3-5 ATR
  const suggestedMultiplier = 2.0; // Default for swing trading
  const suggestedStopDistance = atr * suggestedMultiplier;
  const suggestedStopPrice = direction === 'long'
    ? entry - suggestedStopDistance
    : entry + suggestedStopDistance;

  // Generate recommendation
  let recommendation: string;
  let severity: 'info' | 'warning' | 'error';

  if (stopInATR < 0.7 * suggestedMultiplier) {
    recommendation = `Your stop is tight (${stopInATR.toFixed(2)} ATR). Risk of premature exit from normal noise.`;
    severity = 'warning';
  } else if (stopInATR > 1.3 * suggestedMultiplier) {
    recommendation = `Your stop is wide (${stopInATR.toFixed(2)} ATR). Consider tighter stop or smaller position size.`;
    severity = 'warning';
  } else {
    recommendation = `Your stop distance (${stopInATR.toFixed(2)} ATR) is appropriate for this volatility level.`;
    severity = 'info';
  }

  return {
    atr,
    atrPeriod,
    atrPct,
    stopDistance,
    stopInATR,
    suggestedMultiplier,
    suggestedStopDistance,
    suggestedStopPrice,
    recommendation,
    severity,
  };
}

/**
 * Classify volatility based on ATR percentage
 *
 * Uses ATR as % of price to automatically classify instrument volatility.
 * This provides objective, data-driven volatility classification.
 *
 * @param atr - Average True Range value
 * @param price - Current price
 * @returns Volatility classification
 */
export function classifyVolatilityFromATR(
  atr: number,
  price: number
): VolatilityClass {
  const atrPct = (atr / price) * 100;

  if (atrPct < ATR_PERCENTILE_RANGES.ULTRA_LOW) return VolatilityClass.ULTRA_LOW;
  if (atrPct < ATR_PERCENTILE_RANGES.LOW) return VolatilityClass.LOW;
  if (atrPct < ATR_PERCENTILE_RANGES.MEDIUM) return VolatilityClass.MEDIUM;
  if (atrPct < ATR_PERCENTILE_RANGES.HIGH) return VolatilityClass.HIGH;
  return VolatilityClass.ULTRA_HIGH;
}

/**
 * Main calculation orchestrator
 *
 * This function coordinates all the calculation steps in the correct order:
 * 1. Calculate base dollar risk (with caps)
 * 2. Calculate per-unit risk
 * 3. Calculate base position size
 * 4. Apply volatility adjustment (if enabled)
 * 5. Calculate take profit
 * 6. Generate R-multiple alerts
 * 7. Analyze ATR (if provided)
 *
 * @param inputs - All trade inputs
 * @returns Complete calculation results
 */
export function calculate(inputs: {
  // Capital & P&L
  freeCapital: number;
  ytdPnL: number;

  // Trade Parameters
  entry: number;
  stop: number;
  conviction: ConvictionType;
  direction: Direction; // NEW in v2.1

  // Optional Parameters
  slippage?: number;
  multiplier?: number;
  rrTarget?: number;
  monthlyStopLoss?: number;

  // Volatility (NEW in v2)
  volatilityClass?: VolatilityClass;
  atr?: number;
  atrPeriod?: number;
}) {
  // Step 1: Calculate base dollar risk with caps
  const riskCalc = calculateRisk({
    freeCapital: inputs.freeCapital,
    ytdPnL: inputs.ytdPnL,
    conviction: inputs.conviction,
    monthlyStopLoss: inputs.monthlyStopLoss,
  });

  // Step 2: Calculate per-unit risk
  const perUnitRisk = calculatePerUnitRisk(
    inputs.entry,
    inputs.stop,
    inputs.slippage ?? 0,
    inputs.multiplier ?? 1
  );

  // Step 3: Calculate base position size (no volatility adjustment yet)
  const basePositionSize = calculatePositionSize(riskCalc.finalRisk, perUnitRisk);

  // Step 4: Apply volatility adjustment (if volatility class provided)
  let volatilityAdjustment: VolatilityAdjustment | null = null;
  let finalPositionSize = basePositionSize;

  if (inputs.volatilityClass) {
    volatilityAdjustment = applyVolatilityAdjustment(
      basePositionSize,
      inputs.volatilityClass
    );
    finalPositionSize = volatilityAdjustment.adjustedPositionSize;
  }

  // Step 5: Calculate take profit
  const takeProfitPrice = calculateTP(
    inputs.entry,
    inputs.stop,
    inputs.direction,
    inputs.rrTarget ?? 2
  );

  // Step 6: Generate R-multiple alerts
  const alerts = calculateAlerts(
    inputs.entry,
    inputs.stop,
    inputs.direction,
    [0.5, 1, 1.5, 2]
  );

  // Step 7: Analyze ATR (if provided)
  let atrAnalysis: ATRAnalysis | null = null;
  if (inputs.atr) {
    atrAnalysis = analyzeATR(
      inputs.entry,
      inputs.stop,
      inputs.direction,
      inputs.atr,
      inputs.atrPeriod
    );
  }

  // Calculate actual dollar risk with final position size
  const actualDollarRisk = finalPositionSize * perUnitRisk;

  return {
    // Risk calculation
    riskCalculation: riskCalc,
    perUnitRisk,

    // Position sizing
    basePositionSize,
    finalPositionSize,
    volatilityAdjustment,

    // Dollar amounts
    dollarRisk: actualDollarRisk,

    // Trade management
    takeProfitPrice,
    alerts,

    // Volatility analysis
    atrAnalysis,

    // Trade direction (explicit, not inferred)
    isLong: inputs.direction === 'long',
  };
}
