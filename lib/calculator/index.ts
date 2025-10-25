/**
 * Risk Sizing Calculator - Core Calculation Engine
 *
 * This module exports all calculation functions for position sizing
 * with volatility-adjusted risk management.
 *
 * @module lib/calculator
 */

export {
  // Core calculation functions
  calculateRisk,
  calculatePerUnitRisk,
  calculatePositionSize,
  calculateTP,
  calculateAlerts,

  // Volatility features (NEW in v2)
  applyVolatilityAdjustment,
  analyzeATR,
  classifyVolatilityFromATR,

  // Main orchestrator
  calculate,
} from './calculations';
