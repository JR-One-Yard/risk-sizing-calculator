/**
 * Trade Journal Type Definitions
 *
 * Data models for tracking trade plans and actual outcomes
 */

import type { ConvictionType } from './calculator';
import type { InstrumentType, Direction } from './instruments';
import type { VolatilityClass } from './volatility';

// ============================================================================
// TRADE STATUS
// ============================================================================

/**
 * Trade lifecycle status
 */
export type TradeStatus = 'open' | 'closed' | 'cancelled';

/**
 * Exit reason categories
 */
export type ExitReason =
  | 'target_hit'      // Hit take profit target
  | 'stop_hit'        // Hit stop loss
  | 'manual_exit'     // Manual decision to exit
  | 'trailing_stop'   // Trailed stop triggered
  | 'time_stop'       // Time-based exit
  | 'fundamental'     // Fundamental change (news, etc)
  | 'other';          // Other reason

// ============================================================================
// TRADE JOURNAL ENTRY
// ============================================================================

/**
 * Complete trade journal entry
 * Captures both the planned setup and actual execution/outcome
 */
export interface TradeJournalEntry {
  // ===== Metadata =====
  id: string;                       // UUID
  createdAt: number;                // Unix timestamp (milliseconds)
  updatedAt: number;                // Unix timestamp (milliseconds)
  status: TradeStatus;

  // ===== Planned Setup (from calculator) =====
  instrument: InstrumentType;
  symbol: string;                   // e.g., "NQ", "AAPL", "BTC/USD"
  direction: Direction;
  conviction: ConvictionType;
  volatilityClass?: VolatilityClass;

  // Price levels (planned)
  plannedEntry: number;
  plannedStop: number;
  plannedTarget: number;
  plannedTargetRMultiple: number;   // Default 2.0

  // Position sizing (planned)
  plannedPositionSize: number;      // Supports fractional (0.0065 contracts)
  plannedDollarRisk: number;        // 1R in dollars
  plannedRiskPercentage: number;    // % of capital

  // ===== Actual Execution =====
  actualEntry?: number;             // Actual fill price
  actualEntryTime?: number;         // Unix timestamp
  actualPositionSize?: number;      // Actual size traded

  // ===== Actual Outcome (for closed trades) =====
  actualExit?: number;              // Actual exit price
  actualExitTime?: number;          // Unix timestamp
  exitReason?: ExitReason;
  exitReasonNotes?: string;         // Free text explanation

  // Calculated results
  actualPnL?: number;               // Dollar profit/loss
  actualRMultiple?: number;         // R-multiple achieved
  actualRiskPercentage?: number;    // Actual % of capital risked

  // ===== Trade Management Notes =====
  thesis: string;                   // Why this trade?
  tags: string[];                   // ["earnings", "breakout", "momentum"]
  notes: string;                    // General notes
  lessonsLearned?: string;          // Post-trade reflection
  screenshotUrl?: string;           // Optional chart screenshot

  // ===== Metadata =====
  timeHorizon?: 'day' | 'swing' | 'position';
  marketConditions?: string;        // "Bullish", "Range-bound", etc.
}

// ============================================================================
// JOURNAL METRICS
// ============================================================================

/**
 * Calculated metrics from trade history
 */
export interface JournalMetrics {
  // Basic stats
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  cancelledTrades: number;

  // Win/Loss breakdown
  wins: number;
  losses: number;
  breakevens: number;              // Trades between -0.1R and +0.1R
  winRate: number;                 // wins / (wins + losses)

  // R-Multiple analysis
  totalRMultiples: number;         // Sum of all R-multiples
  averageRMultiple: number;        // Mean R-multiple
  expectancy: number;              // Expected value per trade
  profitFactor: number;            // Gross profit / gross loss

  // P&L analysis
  totalPnL: number;                // Sum of all P&L
  averageWin: number;              // Average $ win
  averageLoss: number;             // Average $ loss
  largestWin: number;              // Best trade ($)
  largestLoss: number;             // Worst trade ($)

  // Streaks
  currentStreak: number;           // Current win/loss streak (+ for wins, - for losses)
  longestWinStreak: number;
  longestLossStreak: number;

  // Risk analysis
  totalRiskTaken: number;          // Sum of all dollar risk
  averageRiskPerTrade: number;
}

// ============================================================================
// TRADE FILTERS
// ============================================================================

/**
 * Filter options for trade journal queries
 */
export interface TradeFilter {
  status?: TradeStatus | TradeStatus[];
  instrument?: InstrumentType | InstrumentType[];
  direction?: Direction | Direction[];
  conviction?: ConvictionType | ConvictionType[];
  tags?: string[];                  // Match any tag
  dateFrom?: number;                // Unix timestamp
  dateTo?: number;                  // Unix timestamp
  minRMultiple?: number;
  maxRMultiple?: number;
  searchText?: string;              // Search in thesis, notes, lessons
}

// ============================================================================
// PORTFOLIO STATE
// ============================================================================

/**
 * Current portfolio risk exposure
 */
export interface PortfolioState {
  // Open positions
  openPositions: TradeJournalEntry[];
  totalPositions: number;

  // Risk exposure
  totalDollarRisk: number;          // Sum of all open position risks
  totalRiskPercentage: number;      // % of capital at risk
  maxDrawdownScenario: number;      // If all stops hit at once

  // Breakdown by dimension
  riskByConviction: Record<ConvictionType, number>;
  riskByDirection: Record<Direction, number>;
  riskByInstrument: Record<InstrumentType, number>;

  // Portfolio health
  isOverexposed: boolean;           // Exceeds risk limits
  warningThreshold: number;         // % threshold for warning
  dangerThreshold: number;          // % threshold for danger
}

// ============================================================================
// JOURNAL EXPORT
// ============================================================================

/**
 * Export format options
 */
export type ExportFormat = 'json' | 'csv' | 'markdown';

/**
 * Export configuration
 */
export interface ExportConfig {
  format: ExportFormat;
  includeOpen?: boolean;            // Include open trades
  includeClosed?: boolean;          // Include closed trades
  includeCancelled?: boolean;       // Include cancelled trades
  dateFrom?: number;                // Filter by date
  dateTo?: number;
  filename?: string;                // Custom filename
}

// ============================================================================
// STORAGE METADATA
// ============================================================================

/**
 * Metadata about the journal storage
 */
export interface JournalStorageMetadata {
  version: string;                  // Schema version (e.g., "1.0.0")
  lastBackup: number;               // Unix timestamp
  totalTrades: number;
  storageSize: number;              // Bytes used in localStorage
  quotaUsed: number;                // % of quota used
  needsBackup: boolean;
}

// ============================================================================
// BACKUP DATA
// ============================================================================

/**
 * Complete backup data structure
 */
export interface JournalBackup {
  metadata: JournalStorageMetadata;
  trades: TradeJournalEntry[];
  exportedAt: number;               // Unix timestamp
  checksum: string;                 // SHA-256 hash for verification
}
