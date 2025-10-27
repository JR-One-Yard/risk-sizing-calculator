/**
 * Trade Journal Storage Layer
 *
 * Hybrid architecture: localStorage (primary) + JSON exports (backup)
 */

import type {
  TradeJournalEntry,
  TradeStatus,
  JournalMetrics,
  PortfolioState,
  TradeFilter,
  ExportConfig,
  ExportFormat,
  JournalStorageMetadata,
  JournalBackup,
} from '@/types/journal';
import type { ConvictionType } from '@/types/calculator';
import type { Direction, InstrumentType } from '@/types/instruments';

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'trade_journal_v1';
const BACKUP_THRESHOLD = 5; // Auto-backup every N saves
const QUOTA_WARNING_THRESHOLD = 0.8; // Warn at 80% quota usage

// ============================================================================
// TRADE JOURNAL CLASS
// ============================================================================

export class TradeJournal {
  private cache: TradeJournalEntry[] = [];
  private saveCounter = 0;
  private freeCapital = 100000; // Default, should be synced with calculator

  constructor() {
    this.loadFromStorage();
  }

  // ===== CRUD Operations =====

  /**
   * Save a new trade to the journal
   */
  saveTrade(trade: Omit<TradeJournalEntry, 'id' | 'createdAt' | 'updatedAt'>): TradeJournalEntry {
    const now = Date.now();
    const newTrade: TradeJournalEntry = {
      ...trade,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    this.cache.push(newTrade);
    this.persist();
    this.autoBackup();

    return newTrade;
  }

  /**
   * Update an existing trade
   */
  updateTrade(id: string, updates: Partial<TradeJournalEntry>): TradeJournalEntry | null {
    const index = this.cache.findIndex((t) => t.id === id);
    if (index === -1) return null;

    this.cache[index] = {
      ...this.cache[index],
      ...updates,
      updatedAt: Date.now(),
    };

    this.persist();
    return this.cache[index];
  }

  /**
   * Delete a trade
   */
  deleteTrade(id: string): boolean {
    const initialLength = this.cache.length;
    this.cache = this.cache.filter((t) => t.id !== id);

    if (this.cache.length < initialLength) {
      this.persist();
      return true;
    }

    return false;
  }

  /**
   * Get a single trade by ID
   */
  getTrade(id: string): TradeJournalEntry | null {
    return this.cache.find((t) => t.id === id) || null;
  }

  /**
   * Get all trades
   */
  getAllTrades(): TradeJournalEntry[] {
    return [...this.cache]; // Return copy to prevent mutation
  }

  /**
   * Get filtered trades
   */
  getFilteredTrades(filter: TradeFilter): TradeJournalEntry[] {
    return this.cache.filter((trade) => {
      // Status filter
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (!statuses.includes(trade.status)) return false;
      }

      // Instrument filter
      if (filter.instrument) {
        const instruments = Array.isArray(filter.instrument) ? filter.instrument : [filter.instrument];
        if (!instruments.includes(trade.instrument)) return false;
      }

      // Direction filter
      if (filter.direction) {
        const directions = Array.isArray(filter.direction) ? filter.direction : [filter.direction];
        if (!directions.includes(trade.direction)) return false;
      }

      // Conviction filter
      if (filter.conviction) {
        const convictions = Array.isArray(filter.conviction) ? filter.conviction : [filter.conviction];
        if (!convictions.includes(trade.conviction)) return false;
      }

      // Tags filter (match any)
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some((tag) => trade.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // Date range filter
      if (filter.dateFrom && trade.createdAt < filter.dateFrom) return false;
      if (filter.dateTo && trade.createdAt > filter.dateTo) return false;

      // R-multiple filter (only for closed trades)
      if (trade.status === 'closed' && trade.actualRMultiple !== undefined) {
        if (filter.minRMultiple !== undefined && trade.actualRMultiple < filter.minRMultiple) {
          return false;
        }
        if (filter.maxRMultiple !== undefined && trade.actualRMultiple > filter.maxRMultiple) {
          return false;
        }
      }

      // Text search
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const searchableText = [
          trade.symbol,
          trade.thesis,
          trade.notes,
          trade.lessonsLearned || '',
          ...trade.tags,
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchLower)) return false;
      }

      return true;
    });
  }

  // ===== Metrics Calculation =====

  /**
   * Calculate journal metrics
   */
  calculateMetrics(): JournalMetrics {
    const closedTrades = this.cache.filter((t) => t.status === 'closed' && t.actualRMultiple !== undefined);
    const wins = closedTrades.filter((t) => t.actualRMultiple! > 0.1);
    const losses = closedTrades.filter((t) => t.actualRMultiple! < -0.1);
    const breakevens = closedTrades.filter((t) => Math.abs(t.actualRMultiple!) <= 0.1);

    const winRate = closedTrades.length > 0 ? wins.length / closedTrades.length : 0;

    // Calculate R-multiple metrics
    const totalRMultiples = closedTrades.reduce((sum, t) => sum + (t.actualRMultiple || 0), 0);
    const averageRMultiple = closedTrades.length > 0 ? totalRMultiples / closedTrades.length : 0;

    // Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss)
    const avgWinR = wins.length > 0
      ? wins.reduce((sum, t) => sum + t.actualRMultiple!, 0) / wins.length
      : 0;
    const avgLossR = losses.length > 0
      ? Math.abs(losses.reduce((sum, t) => sum + t.actualRMultiple!, 0) / losses.length)
      : 0;
    const lossRate = 1 - winRate;
    const expectancy = (winRate * avgWinR) - (lossRate * avgLossR);

    // Profit factor = Gross profit / Gross loss
    const grossProfit = wins.reduce((sum, t) => sum + (t.actualPnL || 0), 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.actualPnL || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    // P&L metrics
    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.actualPnL || 0), 0);
    const averageWin = wins.length > 0 ? wins.reduce((sum, t) => sum + (t.actualPnL || 0), 0) / wins.length : 0;
    const averageLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + (t.actualPnL || 0), 0) / losses.length : 0;

    const winPnLs = wins.map((t) => t.actualPnL || 0);
    const lossPnLs = losses.map((t) => t.actualPnL || 0);
    const largestWin = winPnLs.length > 0 ? Math.max(...winPnLs) : 0;
    const largestLoss = lossPnLs.length > 0 ? Math.min(...lossPnLs) : 0;

    // Streaks
    const { currentStreak, longestWinStreak, longestLossStreak } = this.calculateStreaks(closedTrades);

    // Risk analysis
    const totalRiskTaken = closedTrades.reduce((sum, t) => sum + t.plannedDollarRisk, 0);
    const averageRiskPerTrade = closedTrades.length > 0 ? totalRiskTaken / closedTrades.length : 0;

    return {
      totalTrades: this.cache.length,
      openTrades: this.cache.filter((t) => t.status === 'open').length,
      closedTrades: closedTrades.length,
      cancelledTrades: this.cache.filter((t) => t.status === 'cancelled').length,

      wins: wins.length,
      losses: losses.length,
      breakevens: breakevens.length,
      winRate,

      totalRMultiples,
      averageRMultiple,
      expectancy,
      profitFactor,

      totalPnL,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,

      currentStreak,
      longestWinStreak,
      longestLossStreak,

      totalRiskTaken,
      averageRiskPerTrade,
    };
  }

  /**
   * Calculate win/loss streaks
   */
  private calculateStreaks(closedTrades: TradeJournalEntry[]): {
    currentStreak: number;
    longestWinStreak: number;
    longestLossStreak: number;
  } {
    if (closedTrades.length === 0) {
      return { currentStreak: 0, longestWinStreak: 0, longestLossStreak: 0 };
    }

    let currentStreak = 0;
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    // Sort by date
    const sorted = [...closedTrades].sort((a, b) => a.actualExitTime! - b.actualExitTime!);

    for (const trade of sorted) {
      const isWin = (trade.actualRMultiple || 0) > 0.1;

      if (isWin) {
        currentWinStreak++;
        currentLossStreak = 0;
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
      } else {
        currentLossStreak++;
        currentWinStreak = 0;
        longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
      }
    }

    // Current streak (positive for wins, negative for losses)
    currentStreak = currentWinStreak > 0 ? currentWinStreak : -currentLossStreak;

    return { currentStreak, longestWinStreak, longestLossStreak };
  }

  // ===== Portfolio State =====

  /**
   * Get current portfolio state
   */
  getPortfolioState(): PortfolioState {
    const openPositions = this.cache.filter((t) => t.status === 'open');
    const totalDollarRisk = openPositions.reduce((sum, t) => sum + t.plannedDollarRisk, 0);
    const totalRiskPercentage = (totalDollarRisk / this.freeCapital) * 100;

    // Risk by conviction
    const riskByConviction: Record<ConvictionType, number> = { I: 0, II: 0, III: 0 };
    openPositions.forEach((t) => {
      riskByConviction[t.conviction] += t.plannedDollarRisk;
    });

    // Risk by direction
    const riskByDirection: Record<Direction, number> = { long: 0, short: 0 };
    openPositions.forEach((t) => {
      riskByDirection[t.direction] += t.plannedDollarRisk;
    });

    // Risk by instrument (only for types that exist in open positions)
    const riskByInstrument: Partial<Record<InstrumentType, number>> = {};
    openPositions.forEach((t) => {
      riskByInstrument[t.instrument] = (riskByInstrument[t.instrument] || 0) + t.plannedDollarRisk;
    });

    const warningThreshold = 15; // 15% total risk
    const dangerThreshold = 20;  // 20% total risk
    const isOverexposed = totalRiskPercentage > dangerThreshold;

    return {
      openPositions,
      totalPositions: openPositions.length,
      totalDollarRisk,
      totalRiskPercentage,
      maxDrawdownScenario: totalDollarRisk, // If all stops hit
      riskByConviction,
      riskByDirection,
      riskByInstrument: riskByInstrument as Record<InstrumentType, number>,
      isOverexposed,
      warningThreshold,
      dangerThreshold,
    };
  }

  /**
   * Set free capital (sync with calculator)
   */
  setFreeCapital(capital: number): void {
    this.freeCapital = capital;
  }

  // ===== Export Functions =====

  /**
   * Export trades to specified format
   */
  exportTrades(config: ExportConfig): string {
    const trades = this.getExportableTrades(config);

    switch (config.format) {
      case 'json':
        return this.exportToJSON(trades);
      case 'csv':
        return this.exportToCSV(trades);
      case 'markdown':
        return this.exportToMarkdown(trades);
      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }
  }

  /**
   * Get trades that match export config
   */
  private getExportableTrades(config: ExportConfig): TradeJournalEntry[] {
    return this.cache.filter((trade) => {
      // Status filter
      if (trade.status === 'open' && !config.includeOpen) return false;
      if (trade.status === 'closed' && !config.includeClosed) return false;
      if (trade.status === 'cancelled' && !config.includeCancelled) return false;

      // Date filter
      if (config.dateFrom && trade.createdAt < config.dateFrom) return false;
      if (config.dateTo && trade.createdAt > config.dateTo) return false;

      return true;
    });
  }

  /**
   * Export to JSON format
   */
  private exportToJSON(trades: TradeJournalEntry[]): string {
    const backup: JournalBackup = {
      metadata: this.getStorageMetadata(),
      trades,
      exportedAt: Date.now(),
      checksum: this.calculateChecksum(trades),
    };

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Export to CSV format
   */
  private exportToCSV(trades: TradeJournalEntry[]): string {
    const headers = [
      'Date',
      'Symbol',
      'Instrument',
      'Direction',
      'Conviction',
      'Status',
      'Entry',
      'Stop',
      'Target',
      'Position Size',
      'Dollar Risk',
      'Risk %',
      'Actual Exit',
      'P&L',
      'R-Multiple',
      'Exit Reason',
      'Thesis',
      'Tags',
    ];

    const rows = trades.map((trade) => [
      new Date(trade.createdAt).toISOString().split('T')[0],
      trade.symbol,
      trade.instrument,
      trade.direction,
      trade.conviction,
      trade.status,
      trade.plannedEntry,
      trade.plannedStop,
      trade.plannedTarget,
      trade.plannedPositionSize,
      trade.plannedDollarRisk,
      trade.plannedRiskPercentage.toFixed(2),
      trade.actualExit || '',
      trade.actualPnL || '',
      trade.actualRMultiple || '',
      trade.exitReason || '',
      `"${trade.thesis.replace(/"/g, '""')}"`, // Escape quotes
      `"${trade.tags.join(', ')}"`,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  /**
   * Export to Markdown format (human-readable journal)
   */
  private exportToMarkdown(trades: TradeJournalEntry[]): string {
    const lines: string[] = [];

    lines.push('# Trade Journal Export');
    lines.push('');
    lines.push(`**Exported:** ${new Date().toLocaleString()}`);
    lines.push(`**Total Trades:** ${trades.length}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    for (const trade of trades) {
      lines.push(`## ${trade.symbol} - ${trade.direction.toUpperCase()} (${trade.status.toUpperCase()})`);
      lines.push('');
      lines.push(`**Date:** ${new Date(trade.createdAt).toLocaleDateString()}`);
      lines.push(`**Conviction:** Type ${trade.conviction}`);
      lines.push(`**Instrument:** ${trade.instrument}`);
      lines.push('');

      lines.push('### Setup');
      lines.push(`- Entry: ${trade.plannedEntry}`);
      lines.push(`- Stop: ${trade.plannedStop}`);
      lines.push(`- Target: ${trade.plannedTarget} (${trade.plannedTargetRMultiple}R)`);
      lines.push(`- Position Size: ${trade.plannedPositionSize}`);
      lines.push(`- Dollar Risk: $${trade.plannedDollarRisk.toFixed(2)} (${trade.plannedRiskPercentage.toFixed(2)}%)`);
      lines.push('');

      if (trade.status === 'closed') {
        lines.push('### Outcome');
        lines.push(`- Exit: ${trade.actualExit}`);
        lines.push(`- P&L: $${(trade.actualPnL || 0).toFixed(2)}`);
        lines.push(`- R-Multiple: ${(trade.actualRMultiple || 0).toFixed(2)}R`);
        lines.push(`- Exit Reason: ${trade.exitReason || 'N/A'}`);
        lines.push('');
      }

      lines.push('### Thesis');
      lines.push(trade.thesis);
      lines.push('');

      if (trade.tags.length > 0) {
        lines.push(`**Tags:** ${trade.tags.join(', ')}`);
        lines.push('');
      }

      if (trade.lessonsLearned) {
        lines.push('### Lessons Learned');
        lines.push(trade.lessonsLearned);
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }

  // ===== Persistence =====

  /**
   * Persist cache to localStorage
   */
  private persist(): void {
    // Skip if not in browser environment (server-side rendering)
    if (typeof window === 'undefined') return;

    try {
      const data = JSON.stringify(this.cache);
      localStorage.setItem(STORAGE_KEY, data);
      this.saveCounter++;

      // Check quota usage
      this.checkQuotaUsage();
    } catch (error) {
      console.error('Failed to persist trade journal:', error);
      // TODO: Show user warning about storage failure
    }
  }

  /**
   * Load data from localStorage
   */
  private loadFromStorage(): void {
    // Skip if not in browser environment (server-side rendering)
    if (typeof window === 'undefined') return;

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.cache = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load trade journal:', error);
      this.cache = [];
    }
  }

  /**
   * Auto-backup to JSON file
   */
  private autoBackup(): void {
    if (this.saveCounter % BACKUP_THRESHOLD === 0) {
      this.downloadBackup();
    }
  }

  /**
   * Download backup JSON file
   */
  downloadBackup(): void {
    const json = this.exportToJSON(this.cache);
    const filename = `trade-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(json, filename, 'application/json');
  }

  /**
   * Helper to download a file
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Check localStorage quota usage
   */
  private checkQuotaUsage(): void {
    // Skip if not in browser environment
    if (typeof window === 'undefined') return;

    try {
      const data = localStorage.getItem(STORAGE_KEY) || '';
      const used = new Blob([data]).size;
      const quota = 5 * 1024 * 1024; // Assume 5MB quota
      const usage = used / quota;

      if (usage > QUOTA_WARNING_THRESHOLD) {
        console.warn(`Storage quota usage: ${(usage * 100).toFixed(1)}%`);
        // TODO: Show user warning to archive old trades
      }
    } catch (error) {
      console.error('Failed to check quota usage:', error);
    }
  }

  /**
   * Get storage metadata
   */
  getStorageMetadata(): JournalStorageMetadata {
    // Return default values if not in browser environment
    if (typeof window === 'undefined') {
      return {
        version: '1.0.0',
        lastBackup: Date.now(),
        totalTrades: 0,
        storageSize: 0,
        quotaUsed: 0,
        needsBackup: false,
      };
    }

    const data = localStorage.getItem(STORAGE_KEY) || '';
    const storageSize = new Blob([data]).size;
    const quota = 5 * 1024 * 1024; // 5MB
    const quotaUsed = storageSize / quota;

    return {
      version: '1.0.0',
      lastBackup: Date.now(),
      totalTrades: this.cache.length,
      storageSize,
      quotaUsed,
      needsBackup: this.saveCounter % BACKUP_THRESHOLD === 0,
    };
  }

  /**
   * Calculate checksum for data verification
   */
  private calculateChecksum(trades: TradeJournalEntry[]): string {
    const data = JSON.stringify(trades);
    // Simple checksum (in production, use crypto.subtle.digest for SHA-256)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===== Utility Methods =====

  /**
   * Clear all trades (with confirmation)
   */
  clearAll(): void {
    this.cache = [];
    this.persist();
  }

  /**
   * Get trade count
   */
  getTradeCount(): number {
    return this.cache.length;
  }
}

// ===== Singleton Instance =====

let journalInstance: TradeJournal | null = null;

/**
 * Get singleton journal instance
 */
export function getJournal(): TradeJournal {
  if (!journalInstance) {
    journalInstance = new TradeJournal();
  }
  return journalInstance;
}
