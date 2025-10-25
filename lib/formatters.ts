/**
 * Formatting Utilities for Position Sizing Display
 *
 * Handles formatting of fractional positions with appropriate precision
 * and dollar-centric display preferences.
 */

import { InstrumentType, getUnitLabel } from '@/types/instruments';

/**
 * Get appropriate decimal precision for position size based on instrument type
 *
 * @param instrumentType - Type of instrument being traded
 * @param positionSize - Position size to determine precision
 * @returns Number of decimal places to display
 */
export function getPositionPrecision(
  instrumentType: InstrumentType,
  positionSize: number
): number {
  // For very small fractional positions (< 0.01), use higher precision
  if (Math.abs(positionSize) < 0.01 && positionSize !== 0) {
    return 6; // e.g., 0.000654 contracts
  }

  // For small fractional positions (< 1), use 4 decimal places
  if (Math.abs(positionSize) < 1 && positionSize !== 0) {
    return 4; // e.g., 0.0065 contracts
  }

  // Standard precision by instrument type
  switch (instrumentType) {
    case InstrumentType.STOCK:
    case InstrumentType.ETF:
    case InstrumentType.INDEX_FUND:
    case InstrumentType.CRYPTO:
      return 2; // e.g., 125.50 shares, 0.15 BTC

    case InstrumentType.FUTURES_INDEX:
    case InstrumentType.FUTURES_COMMODITY:
      return 4; // e.g., 2.5000 contracts

    case InstrumentType.FOREX:
      return 6; // e.g., 0.123456 lots (micro lots)

    case InstrumentType.OPTIONS:
      return 2; // e.g., 3.50 contracts

    default:
      return 4;
  }
}

/**
 * Format position size with appropriate precision and unit label
 *
 * @param positionSize - Position size (can be fractional)
 * @param instrumentType - Type of instrument
 * @returns Formatted string like "0.0065 contracts" or "125.50 shares"
 */
export function formatPositionSize(
  positionSize: number,
  instrumentType: InstrumentType
): string {
  const precision = getPositionPrecision(instrumentType, positionSize);
  const formatted = positionSize.toFixed(precision);
  const unitLabel = getUnitLabel(instrumentType, positionSize);

  return `${formatted} ${unitLabel}`;
}

/**
 * Format dollar amount with commas and 2 decimal places
 *
 * @param amount - Dollar amount
 * @param showCents - Whether to show cents (default true)
 * @returns Formatted string like "$3,000.00" or "$3,000"
 */
export function formatDollarAmount(
  amount: number,
  showCents: boolean = true
): string {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });

  const sign = amount < 0 ? '-' : '';
  return `${sign}$${formatted}`;
}

/**
 * Format percentage with specified precision
 *
 * @param value - Percentage value (e.g., 5.25 for 5.25%)
 * @param precision - Number of decimal places (default 2)
 * @returns Formatted string like "5.25%"
 */
export function formatPercentage(
  value: number,
  precision: number = 2
): string {
  return `${value.toFixed(precision)}%`;
}

/**
 * Format price with appropriate precision based on value
 *
 * @param price - Price value
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  // For prices under $1, show more precision
  if (Math.abs(price) < 1) {
    return price.toFixed(4);
  }

  // For prices under $100, show 2 decimals
  if (Math.abs(price) < 100) {
    return price.toFixed(2);
  }

  // For larger prices, show 2 decimals with commas
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Create dollar-centric position summary
 * Emphasizes dollar risk over unit count
 *
 * @param dollarRisk - Dollar amount at risk
 * @param positionSize - Number of units/contracts
 * @param instrumentType - Type of instrument
 * @returns Formatted summary string
 */
export function formatPositionSummary(
  dollarRisk: number,
  positionSize: number,
  instrumentType: InstrumentType
): string {
  const dollarFormatted = formatDollarAmount(dollarRisk);
  const positionFormatted = formatPositionSize(positionSize, instrumentType);

  return `${dollarFormatted} = ${positionFormatted}`;
}

/**
 * Format R-multiple value
 *
 * @param rMultiple - R-multiple value (e.g., 1.5 for 1.5R)
 * @returns Formatted string like "1.5R"
 */
export function formatRMultiple(rMultiple: number): string {
  return `${rMultiple.toFixed(1)}R`;
}

/**
 * Determine if position is fractional (not a whole number)
 *
 * @param positionSize - Position size
 * @param tolerance - Tolerance for floating point comparison (default 0.0001)
 * @returns True if position is fractional
 */
export function isFractionalPosition(
  positionSize: number,
  tolerance: number = 0.0001
): boolean {
  return Math.abs(positionSize - Math.round(positionSize)) > tolerance;
}
