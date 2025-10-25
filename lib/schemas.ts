/**
 * Zod Validation Schemas
 * Risk Sizing Tool v2 - Fresh Implementation
 *
 * Comprehensive validation for all user inputs, risk policies,
 * and calculator parameters with helpful error messages.
 */

import { z } from 'zod';
import { VolatilityClass } from '@/types/volatility';
import { InstrumentType } from '@/types/instruments';

// ============================================================================
// ENUMS & PRIMITIVES
// ============================================================================

/**
 * Conviction type validation
 * Type I = HIGH, Type II = MEDIUM, Type III = LOW
 */
export const convictionSchema = z.enum(['I', 'II', 'III'], {
  message: 'Must be Type I, II, or III',
});

/**
 * Time horizon validation
 */
export const timeHorizonSchema = z.enum(['day', 'swing', 'position'], {
  message: 'Must be day, swing, or position trade',
});

/**
 * Volatility class validation (NEW in v2)
 */
export const volatilityClassSchema = z.nativeEnum(VolatilityClass, {
  message: 'Must be a valid volatility class (ULTRA_LOW, LOW, MEDIUM, HIGH, ULTRA_HIGH)',
});

/**
 * Direction validation (NEW in v2.1)
 */
export const directionSchema = z.enum(['long', 'short'], {
  message: 'Must be either "long" or "short"',
});

/**
 * Instrument type validation (NEW in v2.1)
 */
export const instrumentTypeSchema = z.nativeEnum(InstrumentType, {
  message: 'Must be a valid instrument type',
});

// ============================================================================
// CUSTOM VALIDATORS
// ============================================================================

/**
 * Positive number validation
 * Must be > 0
 */
export const positiveNumber = (fieldName: string) =>
  z.number().positive({
    message: `${fieldName} must be greater than 0`,
  });

/**
 * Non-negative number validation
 * Can be 0 or positive
 */
export const nonNegativeNumber = (fieldName: string) =>
  z.number().nonnegative({
    message: `${fieldName} cannot be negative`,
  });

/**
 * Optional positive number
 */
export const optionalPositiveNumber = (fieldName: string) =>
  positiveNumber(fieldName).optional();

/**
 * Percentage validation (0-100)
 */
export const percentageSchema = (fieldName: string) =>
  z.number()
    .min(0, { message: `${fieldName} must be at least 0%` })
    .max(100, { message: `${fieldName} cannot exceed 100%` });

// ============================================================================
// CALCULATOR INPUTS SCHEMA
// ============================================================================

/**
 * Complete calculator inputs validation
 * Validates all trade parameters and account information
 */
export const calculatorInputsSchema = z
  .object({
    // Account Information
    freeCapital: positiveNumber('Free Capital')
      .min(100, { message: 'Free Capital must be at least $100' })
      .max(1_000_000_000, { message: 'Free Capital exceeds maximum ($1B)' }),

    ytdPnL: z
      .number()
      .min(-1_000_000_000, { message: 'YTD P&L exceeds minimum (-$1B)' })
      .max(1_000_000_000, { message: 'YTD P&L exceeds maximum ($1B)' }),

    // Trade Setup
    conviction: convictionSchema,
    volatilityClass: volatilityClassSchema,
    timeHorizon: timeHorizonSchema,

    // Trade Direction & Instrument (NEW in v2.1)
    direction: directionSchema,
    instrumentType: instrumentTypeSchema,

    // Price Levels
    entryPrice: positiveNumber('Entry Price')
      .max(1_000_000, { message: 'Entry Price exceeds maximum ($1M)' }),

    stopLoss: positiveNumber('Stop Loss')
      .max(1_000_000, { message: 'Stop Loss exceeds maximum ($1M)' }),

    takeProfitTarget: optionalPositiveNumber('Take Profit Target'),

    // Advanced Options
    customATR: optionalPositiveNumber('ATR'),

    slippage: nonNegativeNumber('Slippage')
      .max(100, { message: 'Slippage seems unreasonably high (>$100)' }),

    instrumentMultiplier: positiveNumber('Instrument Multiplier')
      .min(0.01, { message: 'Instrument Multiplier too small' })
      .max(10000, { message: 'Instrument Multiplier too large' }),

    // Monthly Risk Tracking
    monthlyStopLoss: optionalPositiveNumber('Monthly Stop Loss'),

    daysIntoMonth: z
      .number()
      .int({ message: 'Days must be a whole number' })
      .min(1, { message: 'Days must be at least 1' })
      .max(31, { message: 'Days cannot exceed 31' })
      .optional(),
  })
  // Cross-field validations
  .refine(
    (data) => {
      // Entry and stop must be different
      return data.entryPrice !== data.stopLoss;
    },
    {
      message: 'Entry Price and Stop Loss cannot be the same',
      path: ['stopLoss'],
    }
  )
  .refine(
    (data) => {
      // Direction-aware validation: Stop must be on correct side of entry
      if (data.direction === 'long') {
        // For long positions, stop must be below entry
        return data.stopLoss < data.entryPrice;
      } else {
        // For short positions, stop must be above entry
        return data.stopLoss > data.entryPrice;
      }
    },
    {
      message: 'Stop Loss must be below Entry for long positions, above Entry for short positions',
      path: ['stopLoss'],
    }
  )
  .refine(
    (data) => {
      // If take profit is set, it should be on the correct side of entry based on direction
      if (!data.takeProfitTarget) return true;

      if (data.direction === 'long') {
        // For long positions, take profit must be above entry
        return data.takeProfitTarget > data.entryPrice;
      } else {
        // For short positions, take profit must be below entry
        return data.takeProfitTarget < data.entryPrice;
      }
    },
    {
      message: 'Take Profit must be above Entry for long positions, below Entry for short positions',
      path: ['takeProfitTarget'],
    }
  )
  .refine(
    (data) => {
      // Monthly stop loss should be reasonable relative to free capital
      if (!data.monthlyStopLoss) return true;
      return data.monthlyStopLoss <= data.freeCapital * 0.5; // Max 50% of FC
    },
    {
      message: 'Monthly Stop Loss exceeds 50% of Free Capital (seems high)',
      path: ['monthlyStopLoss'],
    }
  );

// Export the inferred type
export type ValidatedCalculatorInputs = z.infer<typeof calculatorInputsSchema>;

// ============================================================================
// RISK POLICY SCHEMA
// ============================================================================

/**
 * Conviction type policy settings
 */
export const convictionPolicySchema = z.object({
  basePctOfFC: percentageSchema('Base % of FC'),
  ytdPct: percentageSchema('YTD %'),
  hardCapPctOfFreePlusYTD: percentageSchema('Hard Cap %').optional(),
});

/**
 * Risk caps configuration
 */
export const riskCapsSchema = z.object({
  maxSingleTradePct: percentageSchema('Max Single Trade %')
    .min(1, { message: 'Max Single Trade must be at least 1%' })
    .max(20, { message: 'Max Single Trade exceeds 20% (very risky)' }),

  monthlyStopCapPct: percentageSchema('Monthly Stop Cap %')
    .min(10, { message: 'Monthly Stop Cap should be at least 10%' })
    .max(50, { message: 'Monthly Stop Cap exceeds 50% (risky)' }),
});

/**
 * Volatility policy settings (NEW in v2)
 */
export const volatilityPolicySchema = z.object({
  enabled: z.boolean(),

  multipliers: z.object({
    ULTRA_LOW: z.number().min(1, 'Multiplier too low').max(3, 'Multiplier too high'),
    LOW: z.number().min(1, 'Multiplier too low').max(3, 'Multiplier too high'),
    MEDIUM: z.number().min(0.5, 'Multiplier too low').max(1.5, 'Multiplier too high'),
    HIGH: z.number().min(0.3, 'Multiplier too low').max(1, 'Multiplier too high'),
    ULTRA_HIGH: z.number().min(0.1, 'Multiplier too low').max(0.5, 'Multiplier too high'),
  }),

  atrEnabled: z.boolean(),
  atrPeriod: z
    .number()
    .int({ message: 'ATR Period must be a whole number' })
    .min(5, { message: 'ATR Period should be at least 5' })
    .max(50, { message: 'ATR Period should not exceed 50' }),
});

/**
 * R-Multiple trade management settings
 */
export const rMultipleSettingsSchema = z.object({
  defaultTarget: z
    .number()
    .min(1, { message: 'R-Multiple Target must be at least 1' })
    .max(10, { message: 'R-Multiple Target exceeds 10 (very ambitious)' }),

  alertLevels: z
    .array(z.number().positive())
    .min(1, { message: 'Must have at least one alert level' })
    .max(6, { message: 'Too many alert levels (max 6)' }),

  breakevenAt: z
    .number()
    .min(0.5, { message: 'Breakeven should be at least 0.5R' })
    .max(3, { message: 'Breakeven at >3R is too conservative' }),

  trailStopAt: z
    .number()
    .min(0.5, { message: 'Trail stop should start at least 0.5R' })
    .max(5, { message: 'Trail stop starting point too high' }),
});

/**
 * Complete risk policy validation
 */
export const riskPolicySchema = z.object({
  // Conviction Levels
  typeI: convictionPolicySchema,
  typeII: convictionPolicySchema,
  typeIII: convictionPolicySchema,

  // Risk Caps
  maxSingleTradePct: percentageSchema('Max Single Trade %')
    .min(1)
    .max(20),
  monthlyStopCapPct: percentageSchema('Monthly Stop Cap %')
    .min(10)
    .max(50),

  // Volatility Settings (NEW in v2)
  volatility: volatilityPolicySchema,

  // R-Multiple Settings
  rMultiple: rMultipleSettingsSchema,
});

export type ValidatedRiskPolicy = z.infer<typeof riskPolicySchema>;

// ============================================================================
// OUTPUT VALIDATION (for consistency checks)
// ============================================================================

/**
 * Validation for calculation outputs
 * Ensures results are within reasonable bounds
 */
export const calculationResultSchema = z.object({
  dollarRisk: nonNegativeNumber('Dollar Risk'),
  riskPercentage: percentageSchema('Risk Percentage'),
  positionSize: nonNegativeNumber('Position Size').int(),
  positionValue: nonNegativeNumber('Position Value'),
  takeProfitPrice: positiveNumber('Take Profit Price'),
  volatilityMultiplier: z.number().min(0.1).max(3),
  appliedCaps: z.array(z.string()),
});

// ============================================================================
// PARTIAL SCHEMAS (for form updates)
// ============================================================================

/**
 * Partial calculator inputs for incremental form updates
 */
export const partialCalculatorInputsSchema = calculatorInputsSchema.partial();

/**
 * Partial risk policy for incremental policy updates
 */
export const partialRiskPolicySchema = riskPolicySchema.partial();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate calculator inputs and return typed result
 */
export function validateCalculatorInputs(data: unknown): ValidatedCalculatorInputs {
  return calculatorInputsSchema.parse(data);
}

/**
 * Safely validate calculator inputs, returning errors if invalid
 */
export function safeValidateCalculatorInputs(data: unknown) {
  return calculatorInputsSchema.safeParse(data);
}

/**
 * Validate risk policy and return typed result
 */
export function validateRiskPolicy(data: unknown): ValidatedRiskPolicy {
  return riskPolicySchema.parse(data);
}

/**
 * Safely validate risk policy, returning errors if invalid
 */
export function safeValidateRiskPolicy(data: unknown) {
  return riskPolicySchema.safeParse(data);
}

/**
 * Get human-readable error messages from Zod validation
 */
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return errors;
}

/**
 * Check if a value is a valid conviction type
 */
export function isValidConviction(value: unknown): value is 'I' | 'II' | 'III' {
  return convictionSchema.safeParse(value).success;
}

/**
 * Check if a value is a valid volatility class
 */
export function isValidVolatilityClass(value: unknown): value is VolatilityClass {
  return volatilityClassSchema.safeParse(value).success;
}

/**
 * Check if a value is a valid time horizon
 */
export function isValidTimeHorizon(value: unknown): value is 'day' | 'swing' | 'position' {
  return timeHorizonSchema.safeParse(value).success;
}

/**
 * Check if a value is a valid direction
 */
export function isValidDirection(value: unknown): value is 'long' | 'short' {
  return directionSchema.safeParse(value).success;
}

/**
 * Check if a value is a valid instrument type
 */
export function isValidInstrumentType(value: unknown): value is InstrumentType {
  return instrumentTypeSchema.safeParse(value).success;
}
