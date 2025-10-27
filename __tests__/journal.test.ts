/**
 * Trade Journal Tests
 * Comprehensive test suite for the TradeJournal class
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TradeJournal } from '../lib/journal';
import type { TradeJournalEntry } from '../types/journal';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock window.localStorage
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('TradeJournal', () => {
  let journal: TradeJournal;

  beforeEach(() => {
    localStorageMock.clear();
    journal = new TradeJournal();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('CRUD Operations', () => {
    it('should save a trade successfully', () => {
      const trade = {
        status: 'open' as const,
        instrument: 'STOCK' as const,
        symbol: 'AAPL',
        direction: 'long' as const,
        conviction: 'II' as const,
        plannedEntry: 150,
        plannedStop: 145,
        plannedTarget: 160,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 100,
        plannedDollarRisk: 500,
        plannedRiskPercentage: 2,
        thesis: 'Breakout above resistance',
        tags: ['breakout', 'momentum'],
        notes: 'Strong volume',
      };

      const savedTrade = journal.saveTrade(trade);

      expect(savedTrade.id).toBeDefined();
      expect(savedTrade.createdAt).toBeDefined();
      expect(savedTrade.symbol).toBe('AAPL');
      expect(savedTrade.thesis).toBe('Breakout above resistance');
    });

    it('should retrieve a trade by ID', () => {
      const trade = journal.saveTrade({
        status: 'open',
        instrument: 'FUTURES_ES',
        symbol: 'ES',
        direction: 'long',
        conviction: 'I',
        plannedEntry: 5000,
        plannedStop: 4990,
        plannedTarget: 5020,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 1,
        plannedDollarRisk: 1000,
        plannedRiskPercentage: 1,
        thesis: 'Trend following',
        tags: [],
        notes: '',
      });

      const retrieved = journal.getTrade(trade.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(trade.id);
      expect(retrieved?.symbol).toBe('ES');
    });

    it('should update a trade', () => {
      const trade = journal.saveTrade({
        status: 'open',
        instrument: 'STOCK',
        symbol: 'AAPL',
        direction: 'long',
        conviction: 'II',
        plannedEntry: 150,
        plannedStop: 145,
        plannedTarget: 160,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 100,
        plannedDollarRisk: 500,
        plannedRiskPercentage: 2,
        thesis: 'Original thesis',
        tags: [],
        notes: '',
      });

      const updated = journal.updateTrade(trade.id, {
        thesis: 'Updated thesis',
        lessonsLearned: 'Good entry timing',
      });

      expect(updated).toBeDefined();
      expect(updated?.thesis).toBe('Updated thesis');
      expect(updated?.lessonsLearned).toBe('Good entry timing');
      expect(updated?.updatedAt).toBeGreaterThanOrEqual(updated!.createdAt);
    });

    it('should delete a trade', () => {
      const trade = journal.saveTrade({
        status: 'open',
        instrument: 'STOCK',
        symbol: 'AAPL',
        direction: 'long',
        conviction: 'II',
        plannedEntry: 150,
        plannedStop: 145,
        plannedTarget: 160,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 100,
        plannedDollarRisk: 500,
        plannedRiskPercentage: 2,
        thesis: 'Test trade',
        tags: [],
        notes: '',
      });

      const deleted = journal.deleteTrade(trade.id);
      expect(deleted).toBe(true);

      const retrieved = journal.getTrade(trade.id);
      expect(retrieved).toBeNull();
    });

    it('should get all trades', () => {
      journal.saveTrade({
        status: 'open',
        instrument: 'STOCK',
        symbol: 'AAPL',
        direction: 'long',
        conviction: 'I',
        plannedEntry: 150,
        plannedStop: 145,
        plannedTarget: 160,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 100,
        plannedDollarRisk: 500,
        plannedRiskPercentage: 2,
        thesis: 'Trade 1',
        tags: [],
        notes: '',
      });

      journal.saveTrade({
        status: 'open',
        instrument: 'STOCK',
        symbol: 'MSFT',
        direction: 'long',
        conviction: 'II',
        plannedEntry: 300,
        plannedStop: 295,
        plannedTarget: 310,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 50,
        plannedDollarRisk: 250,
        plannedRiskPercentage: 1,
        thesis: 'Trade 2',
        tags: [],
        notes: '',
      });

      const allTrades = journal.getAllTrades();
      expect(allTrades).toHaveLength(2);
    });
  });

  describe('Metrics Calculation', () => {
    beforeEach(() => {
      // Create sample closed trades
      journal.saveTrade({
        status: 'closed',
        instrument: 'STOCK',
        symbol: 'AAPL',
        direction: 'long',
        conviction: 'I',
        plannedEntry: 150,
        plannedStop: 145,
        plannedTarget: 160,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 100,
        plannedDollarRisk: 500,
        plannedRiskPercentage: 2,
        actualExit: 160,
        actualPnL: 1000,
        actualRMultiple: 2.0,
        exitReason: 'target_hit',
        thesis: 'Win trade 1',
        tags: [],
        notes: '',
      });

      journal.saveTrade({
        status: 'closed',
        instrument: 'STOCK',
        symbol: 'MSFT',
        direction: 'long',
        conviction: 'II',
        plannedEntry: 300,
        plannedStop: 295,
        plannedTarget: 310,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 50,
        plannedDollarRisk: 250,
        plannedRiskPercentage: 1,
        actualExit: 295,
        actualPnL: -250,
        actualRMultiple: -1.0,
        exitReason: 'stop_hit',
        thesis: 'Loss trade 1',
        tags: [],
        notes: '',
      });

      journal.saveTrade({
        status: 'closed',
        instrument: 'STOCK',
        symbol: 'GOOGL',
        direction: 'long',
        conviction: 'I',
        plannedEntry: 100,
        plannedStop: 98,
        plannedTarget: 104,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 200,
        plannedDollarRisk: 400,
        plannedRiskPercentage: 1.6,
        actualExit: 104,
        actualPnL: 800,
        actualRMultiple: 2.0,
        exitReason: 'target_hit',
        thesis: 'Win trade 2',
        tags: [],
        notes: '',
      });
    });

    it('should calculate win rate correctly', () => {
      const metrics = journal.calculateMetrics();

      // 2 wins out of 3 trades = 66.67%
      expect(metrics.winRate).toBeCloseTo(0.6667, 2);
    });

    it('should calculate expectancy correctly', () => {
      const metrics = journal.calculateMetrics();

      // Expectancy = (WinRate * AvgWin) - (LossRate * AvgLoss)
      // WinRate = 2/3, AvgWin = 2R
      // LossRate = 1/3, AvgLoss = 1R
      // Expectancy = (0.6667 * 2) - (0.3333 * 1) = 1.0
      expect(metrics.expectancy).toBeGreaterThan(0);
    });

    it('should calculate profit factor correctly', () => {
      const metrics = journal.calculateMetrics();

      // Gross profit = $1800
      // Gross loss = $250
      // Profit factor = 1800 / 250 = 7.2
      expect(metrics.profitFactor).toBeCloseTo(7.2, 1);
    });

    it('should calculate total P&L correctly', () => {
      const metrics = journal.calculateMetrics();

      // Total P&L = $1000 + (-$250) + $800 = $1550
      expect(metrics.totalPnL).toBe(1550);
    });

    it('should count wins and losses correctly', () => {
      const metrics = journal.calculateMetrics();

      expect(metrics.wins).toBe(2);
      expect(metrics.losses).toBe(1);
      expect(metrics.totalTrades).toBe(3);
    });

    it('should calculate average win and loss correctly', () => {
      const metrics = journal.calculateMetrics();

      // Average win = (1000 + 800) / 2 = 900
      expect(metrics.averageWin).toBe(900);

      // Average loss = -250 / 1 = -250 (negative)
      expect(metrics.averageLoss).toBe(-250);
    });

    it('should track largest win and loss', () => {
      const metrics = journal.calculateMetrics();

      expect(metrics.largestWin).toBe(1000);
      expect(metrics.largestLoss).toBe(-250);
    });

    it('should calculate current streak', () => {
      const metrics = journal.calculateMetrics();

      // Last trade was a win, so current streak should be positive
      expect(metrics.currentStreak).toBeGreaterThan(0);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      // Create diverse trades
      journal.saveTrade({
        status: 'open',
        instrument: 'STOCK',
        symbol: 'AAPL',
        direction: 'long',
        conviction: 'I',
        plannedEntry: 150,
        plannedStop: 145,
        plannedTarget: 160,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 100,
        plannedDollarRisk: 500,
        plannedRiskPercentage: 2,
        thesis: 'Open trade',
        tags: ['momentum'],
        notes: '',
      });

      journal.saveTrade({
        status: 'closed',
        instrument: 'FUTURES_ES',
        symbol: 'ES',
        direction: 'short',
        conviction: 'II',
        plannedEntry: 5000,
        plannedStop: 5010,
        plannedTarget: 4980,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 1,
        plannedDollarRisk: 1000,
        plannedRiskPercentage: 2,
        actualExit: 4980,
        actualPnL: 2000,
        actualRMultiple: 2.0,
        exitReason: 'target_hit',
        thesis: 'Closed win',
        tags: ['breakout'],
        notes: '',
      });

      journal.saveTrade({
        status: 'cancelled',
        instrument: 'CRYPTO',
        symbol: 'BTC/USD',
        direction: 'long',
        conviction: 'III',
        plannedEntry: 40000,
        plannedStop: 39500,
        plannedTarget: 41000,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 0.1,
        plannedDollarRisk: 50,
        plannedRiskPercentage: 0.2,
        thesis: 'Cancelled trade',
        tags: [],
        notes: '',
      });
    });

    it('should filter by status', () => {
      const openTrades = journal.getFilteredTrades({ status: 'open' });
      expect(openTrades).toHaveLength(1);
      expect(openTrades[0].status).toBe('open');

      const closedTrades = journal.getFilteredTrades({ status: 'closed' });
      expect(closedTrades).toHaveLength(1);
      expect(closedTrades[0].status).toBe('closed');
    });

    it('should filter by direction', () => {
      const longTrades = journal.getFilteredTrades({ direction: 'long' });
      expect(longTrades).toHaveLength(2);

      const shortTrades = journal.getFilteredTrades({ direction: 'short' });
      expect(shortTrades).toHaveLength(1);
    });

    it('should filter by conviction', () => {
      const type1Trades = journal.getFilteredTrades({ conviction: 'I' });
      expect(type1Trades).toHaveLength(1);

      const type2Trades = journal.getFilteredTrades({ conviction: 'II' });
      expect(type2Trades).toHaveLength(1);
    });

    it('should filter by tags', () => {
      const momentumTrades = journal.getFilteredTrades({ tags: ['momentum'] });
      expect(momentumTrades).toHaveLength(1);
      expect(momentumTrades[0].tags).toContain('momentum');
    });

    it('should filter by R-multiple range', () => {
      const winningTrades = journal.getFilteredTrades({
        status: 'closed',
        minRMultiple: 1.0
      });
      expect(winningTrades).toHaveLength(1);
      expect(winningTrades[0].actualRMultiple).toBeGreaterThan(1);
    });

    it('should search in text fields', () => {
      const breakoutTrades = journal.getFilteredTrades({ searchText: 'breakout' });
      expect(breakoutTrades).toHaveLength(1);
      expect(breakoutTrades[0].tags).toContain('breakout');
    });
  });

  describe('Export Functionality', () => {
    beforeEach(() => {
      journal.saveTrade({
        status: 'closed',
        instrument: 'STOCK',
        symbol: 'AAPL',
        direction: 'long',
        conviction: 'I',
        plannedEntry: 150,
        plannedStop: 145,
        plannedTarget: 160,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 100,
        plannedDollarRisk: 500,
        plannedRiskPercentage: 2,
        actualExit: 160,
        actualPnL: 1000,
        actualRMultiple: 2.0,
        exitReason: 'target_hit',
        thesis: 'Test trade',
        tags: ['test'],
        notes: 'Test notes',
      });
    });

    it('should export to JSON', () => {
      const json = journal.exportTrades({
        format: 'json',
        includeClosed: true
      });
      expect(json).toBeDefined();
      expect(() => JSON.parse(json)).not.toThrow();

      const parsed = JSON.parse(json);
      expect(parsed.trades).toHaveLength(1);
      expect(parsed.metadata).toBeDefined();
    });

    it('should export to CSV', () => {
      const csv = journal.exportTrades({
        format: 'csv',
        includeClosed: true
      });
      expect(csv).toBeDefined();
      expect(csv).toContain('Symbol');
      expect(csv).toContain('AAPL');
      expect(csv).toContain('Direction');
    });

    it('should export to Markdown', () => {
      const markdown = journal.exportTrades({
        format: 'markdown',
        includeClosed: true
      });
      expect(markdown).toBeDefined();
      expect(markdown).toContain('# Trade Journal Export');
      expect(markdown).toContain('AAPL');
      expect(markdown).toContain('Test trade');
    });

    it('should filter trades in export', () => {
      journal.saveTrade({
        status: 'open',
        instrument: 'STOCK',
        symbol: 'MSFT',
        direction: 'long',
        conviction: 'II',
        plannedEntry: 300,
        plannedStop: 295,
        plannedTarget: 310,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 50,
        plannedDollarRisk: 250,
        plannedRiskPercentage: 1,
        thesis: 'Open trade',
        tags: [],
        notes: '',
      });

      const json = journal.exportTrades({
        format: 'json',
        includeClosed: true,
        includeOpen: false,
      });

      const parsed = JSON.parse(json);
      expect(parsed.trades).toHaveLength(1);
      expect(parsed.trades[0].status).toBe('closed');
    });
  });

  describe('Portfolio State', () => {
    beforeEach(() => {
      // Create open positions
      journal.saveTrade({
        status: 'open',
        instrument: 'STOCK',
        symbol: 'AAPL',
        direction: 'long',
        conviction: 'I',
        plannedEntry: 150,
        plannedStop: 145,
        plannedTarget: 160,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 100,
        plannedDollarRisk: 500,
        plannedRiskPercentage: 0.5,
        thesis: 'Position 1',
        tags: [],
        notes: '',
      });

      journal.saveTrade({
        status: 'open',
        instrument: 'FUTURES_ES',
        symbol: 'ES',
        direction: 'long',
        conviction: 'II',
        plannedEntry: 5000,
        plannedStop: 4990,
        plannedTarget: 5020,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 1,
        plannedDollarRisk: 1000,
        plannedRiskPercentage: 1.0,
        thesis: 'Position 2',
        tags: [],
        notes: '',
      });
    });

    it('should calculate total risk exposure', () => {
      const portfolioState = journal.getPortfolioState();

      expect(portfolioState.totalDollarRisk).toBe(1500);
      expect(portfolioState.totalPositions).toBe(2);
    });

    it('should calculate risk percentage', () => {
      const portfolioState = journal.getPortfolioState();

      expect(portfolioState.totalRiskPercentage).toBeCloseTo(1.5, 1);
    });

    it('should group risk by conviction', () => {
      const portfolioState = journal.getPortfolioState();

      expect(portfolioState.riskByConviction['I']).toBe(500);
      expect(portfolioState.riskByConviction['II']).toBe(1000);
    });

    it('should group risk by direction', () => {
      const portfolioState = journal.getPortfolioState();

      expect(portfolioState.riskByDirection['long']).toBe(1500);
      expect(portfolioState.riskByDirection['short']).toBe(0);
    });

    it('should calculate max drawdown scenario', () => {
      const portfolioState = journal.getPortfolioState();

      // Max drawdown = total risk if all stops hit
      expect(portfolioState.maxDrawdownScenario).toBe(1500);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty journal', () => {
      const metrics = journal.calculateMetrics();

      expect(metrics.totalTrades).toBe(0);
      expect(metrics.winRate).toBe(0);
      expect(metrics.expectancy).toBe(0);
    });

    it('should handle trade with no R-multiple', () => {
      journal.saveTrade({
        status: 'open',
        instrument: 'STOCK',
        symbol: 'AAPL',
        direction: 'long',
        conviction: 'I',
        plannedEntry: 150,
        plannedStop: 145,
        plannedTarget: 160,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 100,
        plannedDollarRisk: 500,
        plannedRiskPercentage: 2,
        thesis: 'Open trade',
        tags: [],
        notes: '',
      });

      const metrics = journal.calculateMetrics();
      expect(metrics.closedTrades).toBe(0); // Only closed trades count in metrics
    });

    it('should handle invalid trade ID', () => {
      const retrieved = journal.getTrade('invalid-id');
      expect(retrieved).toBeNull();

      const updated = journal.updateTrade('invalid-id', { thesis: 'New thesis' });
      expect(updated).toBeNull();

      const deleted = journal.deleteTrade('invalid-id');
      expect(deleted).toBe(false);
    });

    it('should preserve fractional position sizes', () => {
      const trade = journal.saveTrade({
        status: 'open',
        instrument: 'FUTURES_NQ',
        symbol: 'NQ',
        direction: 'long',
        conviction: 'I',
        plannedEntry: 15000,
        plannedStop: 14900,
        plannedTarget: 15200,
        plannedTargetRMultiple: 2,
        plannedPositionSize: 0.0065, // Fractional contracts
        plannedDollarRisk: 650,
        plannedRiskPercentage: 0.65,
        thesis: 'Fractional test',
        tags: [],
        notes: '',
      });

      expect(trade.plannedPositionSize).toBe(0.0065);
    });
  });
});
