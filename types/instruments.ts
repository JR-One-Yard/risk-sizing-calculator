/**
 * Instrument Type Definitions
 * Risk Sizing Tool v2 - Multi-Instrument Support
 */

// ============================================================================
// TRADE DIRECTION
// ============================================================================

/**
 * Trade direction
 * - LONG: Buy to profit from price increases
 * - SHORT: Sell to profit from price decreases
 */
export type Direction = 'long' | 'short';

// ============================================================================
// INSTRUMENT TYPES
// ============================================================================

/**
 * Supported instrument types for position sizing
 */
export enum InstrumentType {
  STOCK = 'STOCK',
  FUTURES_INDEX = 'FUTURES_INDEX',
  FUTURES_COMMODITY = 'FUTURES_COMMODITY',
  FOREX = 'FOREX',
  CRYPTO = 'CRYPTO',
  OPTIONS = 'OPTIONS',
  ETF = 'ETF',
  INDEX_FUND = 'INDEX_FUND',
}

// ============================================================================
// INSTRUMENT CONFIGURATION
// ============================================================================

/**
 * Configuration for an instrument type
 */
export interface InstrumentConfig {
  type: InstrumentType;
  label: string;
  description: string;
  defaultMultiplier: number;
  multiplierRange: {
    min: number;
    max: number;
  };
  unitLabel: {
    singular: string;
    plural: string;
  };
  priceLabel: string;
  supportsShort: boolean;
  requiresMargin: boolean;
  typicalVolatility: string; // Description of typical volatility
  examples: string[];
}

// ============================================================================
// INSTRUMENT PRESETS
// ============================================================================

/**
 * Predefined instrument presets for quick setup
 */
export interface InstrumentPreset {
  id: string;
  name: string;
  symbol: string;
  instrumentType: InstrumentType;
  multiplier: number;
  exampleEntry: number;
  description: string;
}

// ============================================================================
// INSTRUMENT CONFIGURATIONS
// ============================================================================

export const INSTRUMENT_CONFIGS: Record<InstrumentType, InstrumentConfig> = {
  [InstrumentType.STOCK]: {
    type: InstrumentType.STOCK,
    label: 'Stock',
    description: 'Individual company stocks',
    defaultMultiplier: 1,
    multiplierRange: { min: 1, max: 1 },
    unitLabel: { singular: 'share', plural: 'shares' },
    priceLabel: 'Entry Price',
    supportsShort: true,
    requiresMargin: false, // Long positions don't require margin
    typicalVolatility: 'Low to High (depends on company)',
    examples: ['AAPL', 'MSFT', 'GOOGL', 'TSLA'],
  },

  [InstrumentType.FUTURES_INDEX]: {
    type: InstrumentType.FUTURES_INDEX,
    label: 'Futures - Index',
    description: 'Index futures (ES, NQ, YM)',
    defaultMultiplier: 50,
    multiplierRange: { min: 5, max: 250 },
    unitLabel: { singular: 'contract', plural: 'contracts' },
    priceLabel: 'Entry Level',
    supportsShort: true,
    requiresMargin: true,
    typicalVolatility: 'Medium',
    examples: ['ES', 'NQ', 'YM', 'RTY'],
  },

  [InstrumentType.FUTURES_COMMODITY]: {
    type: InstrumentType.FUTURES_COMMODITY,
    label: 'Futures - Commodity',
    description: 'Commodity futures (CL, GC, SI)',
    defaultMultiplier: 1000,
    multiplierRange: { min: 10, max: 5000 },
    unitLabel: { singular: 'contract', plural: 'contracts' },
    priceLabel: 'Entry Price',
    supportsShort: true,
    requiresMargin: true,
    typicalVolatility: 'Medium to High',
    examples: ['CL', 'GC', 'SI', 'NG'],
  },

  [InstrumentType.FOREX]: {
    type: InstrumentType.FOREX,
    label: 'Forex',
    description: 'Foreign exchange currency pairs',
    defaultMultiplier: 100000, // Standard lot
    multiplierRange: { min: 1000, max: 100000 },
    unitLabel: { singular: 'lot', plural: 'lots' },
    priceLabel: 'Entry Rate',
    supportsShort: true,
    requiresMargin: true,
    typicalVolatility: 'Low to Medium',
    examples: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
  },

  [InstrumentType.CRYPTO]: {
    type: InstrumentType.CRYPTO,
    label: 'Cryptocurrency',
    description: 'Digital currencies',
    defaultMultiplier: 1,
    multiplierRange: { min: 1, max: 1 },
    unitLabel: { singular: 'coin', plural: 'coins' },
    priceLabel: 'Entry Price',
    supportsShort: true, // Depends on exchange
    requiresMargin: false,
    typicalVolatility: 'Very High',
    examples: ['BTC', 'ETH', 'SOL'],
  },

  [InstrumentType.OPTIONS]: {
    type: InstrumentType.OPTIONS,
    label: 'Options',
    description: 'Stock options contracts',
    defaultMultiplier: 100,
    multiplierRange: { min: 100, max: 100 },
    unitLabel: { singular: 'contract', plural: 'contracts' },
    priceLabel: 'Premium Price',
    supportsShort: true,
    requiresMargin: true, // Selling options requires margin
    typicalVolatility: 'High',
    examples: ['AAPL 200C', 'SPY 500P'],
  },

  [InstrumentType.ETF]: {
    type: InstrumentType.ETF,
    label: 'ETF',
    description: 'Exchange-traded funds',
    defaultMultiplier: 1,
    multiplierRange: { min: 1, max: 1 },
    unitLabel: { singular: 'share', plural: 'shares' },
    priceLabel: 'Entry Price',
    supportsShort: true,
    requiresMargin: false,
    typicalVolatility: 'Low to Medium',
    examples: ['SPY', 'QQQ', 'IWM'],
  },

  [InstrumentType.INDEX_FUND]: {
    type: InstrumentType.INDEX_FUND,
    label: 'Index Fund',
    description: 'Mutual fund tracking an index',
    defaultMultiplier: 1,
    multiplierRange: { min: 1, max: 1 },
    unitLabel: { singular: 'share', plural: 'shares' },
    priceLabel: 'Entry Price',
    supportsShort: false, // Most index funds cannot be shorted
    requiresMargin: false,
    typicalVolatility: 'Low',
    examples: ['VFIAX', 'VTSAX'],
  },
};

// ============================================================================
// INSTRUMENT PRESETS
// ============================================================================

export const INSTRUMENT_PRESETS: InstrumentPreset[] = [
  // Futures - Index
  {
    id: 'es',
    name: 'E-mini S&P 500',
    symbol: 'ES',
    instrumentType: InstrumentType.FUTURES_INDEX,
    multiplier: 50,
    exampleEntry: 6050,
    description: 'S&P 500 E-mini futures ($50 per point)',
  },
  {
    id: 'nq',
    name: 'E-mini Nasdaq 100',
    symbol: 'NQ',
    instrumentType: InstrumentType.FUTURES_INDEX,
    multiplier: 20,
    exampleEntry: 25360,
    description: 'Nasdaq 100 E-mini futures ($20 per point)',
  },
  {
    id: 'ym',
    name: 'E-mini Dow',
    symbol: 'YM',
    instrumentType: InstrumentType.FUTURES_INDEX,
    multiplier: 5,
    exampleEntry: 45000,
    description: 'Dow Jones E-mini futures ($5 per point)',
  },
  {
    id: 'rty',
    name: 'E-mini Russell 2000',
    symbol: 'RTY',
    instrumentType: InstrumentType.FUTURES_INDEX,
    multiplier: 50,
    exampleEntry: 2100,
    description: 'Russell 2000 E-mini futures ($50 per point)',
  },

  // Futures - Commodities
  {
    id: 'cl',
    name: 'Crude Oil',
    symbol: 'CL',
    instrumentType: InstrumentType.FUTURES_COMMODITY,
    multiplier: 1000,
    exampleEntry: 61.0,
    description: 'WTI Crude Oil futures (1,000 barrels)',
  },
  {
    id: 'gc',
    name: 'Gold',
    symbol: 'GC',
    instrumentType: InstrumentType.FUTURES_COMMODITY,
    multiplier: 100,
    exampleEntry: 2350.0,
    description: 'Gold futures (100 troy ounces)',
  },
  {
    id: 'si',
    name: 'Silver',
    symbol: 'SI',
    instrumentType: InstrumentType.FUTURES_COMMODITY,
    multiplier: 5000,
    exampleEntry: 27.5,
    description: 'Silver futures (5,000 troy ounces)',
  },
  {
    id: 'ng',
    name: 'Natural Gas',
    symbol: 'NG',
    instrumentType: InstrumentType.FUTURES_COMMODITY,
    multiplier: 10000,
    exampleEntry: 2.85,
    description: 'Natural Gas futures (10,000 MMBtu)',
  },

  // Forex
  {
    id: 'eurusd',
    name: 'EUR/USD',
    symbol: 'EUR/USD',
    instrumentType: InstrumentType.FOREX,
    multiplier: 100000, // Standard lot
    exampleEntry: 1.0825,
    description: 'Euro vs US Dollar (standard lot)',
  },
  {
    id: 'gbpusd',
    name: 'GBP/USD',
    symbol: 'GBP/USD',
    instrumentType: InstrumentType.FOREX,
    multiplier: 100000,
    exampleEntry: 1.2650,
    description: 'British Pound vs US Dollar (standard lot)',
  },
  {
    id: 'usdjpy',
    name: 'USD/JPY',
    symbol: 'USD/JPY',
    instrumentType: InstrumentType.FOREX,
    multiplier: 100000,
    exampleEntry: 148.50,
    description: 'US Dollar vs Japanese Yen (standard lot)',
  },

  // Crypto
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC/USD',
    instrumentType: InstrumentType.CRYPTO,
    multiplier: 1,
    exampleEntry: 68000,
    description: 'Bitcoin vs US Dollar',
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH/USD',
    instrumentType: InstrumentType.CRYPTO,
    multiplier: 1,
    exampleEntry: 3800,
    description: 'Ethereum vs US Dollar',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get instrument configuration by type
 */
export function getInstrumentConfig(type: InstrumentType): InstrumentConfig {
  return INSTRUMENT_CONFIGS[type];
}

/**
 * Get presets for a specific instrument type
 */
export function getPresetsByType(type: InstrumentType): InstrumentPreset[] {
  return INSTRUMENT_PRESETS.filter((preset) => preset.instrumentType === type);
}

/**
 * Get unit label based on quantity
 */
export function getUnitLabel(type: InstrumentType, quantity: number): string {
  const config = getInstrumentConfig(type);
  return Math.abs(quantity) === 1
    ? config.unitLabel.singular
    : config.unitLabel.plural;
}

/**
 * Check if instrument supports short positions
 */
export function supportsShortSelling(type: InstrumentType): boolean {
  return getInstrumentConfig(type).supportsShort;
}

/**
 * Check if instrument requires margin
 */
export function requiresMargin(type: InstrumentType): boolean {
  return getInstrumentConfig(type).requiresMargin;
}
