/**
 * Journal Statistics Card
 * Displays key performance metrics
 */

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { getJournal } from '@/lib/journal';
import type { TradeJournalEntry } from '@/types/journal';

interface JournalStatsCardProps {
  trades: TradeJournalEntry[];
}

export function JournalStatsCard({ trades }: JournalStatsCardProps) {
  const metrics = useMemo(() => {
    const journal = getJournal();
    return journal.calculateMetrics();
  }, [trades]);

  const formatPct = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatR = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}R`;
  const formatDollar = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Trades */}
          <div>
            <div className="text-sm text-ink-muted mb-1">Total Trades</div>
            <div className="text-2xl font-bold text-ink">
              {metrics.totalTrades}
            </div>
            <div className="text-xs text-ink-muted mt-1">
              {metrics.openTrades} open
            </div>
          </div>

          {/* Win Rate */}
          <div>
            <div className="text-sm text-ink-muted mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-ink">
              {formatPct(metrics.winRate)}
            </div>
            <div className="text-xs text-ink-muted mt-1">
              {metrics.wins}W / {metrics.losses}L
            </div>
          </div>

          {/* Expectancy */}
          <div>
            <div className="text-sm text-ink-muted mb-1">Expectancy</div>
            <div className={`text-2xl font-bold ${
              metrics.expectancy >= 0 ? 'text-success' : 'text-error'
            }`}>
              {formatR(metrics.expectancy)}
            </div>
            <div className="text-xs text-ink-muted mt-1">
              per trade
            </div>
          </div>

          {/* Profit Factor */}
          <div>
            <div className="text-sm text-ink-muted mb-1">Profit Factor</div>
            <div className={`text-2xl font-bold ${
              metrics.profitFactor >= 1.5 ? 'text-success' :
              metrics.profitFactor >= 1.0 ? 'text-warning' : 'text-error'
            }`}>
              {metrics.profitFactor.toFixed(2)}
            </div>
            <div className="text-xs text-ink-muted mt-1">
              {metrics.profitFactor >= 1.5 ? 'Excellent' :
               metrics.profitFactor >= 1.0 ? 'Positive' : 'Negative'}
            </div>
          </div>

          {/* Total P&L */}
          <div>
            <div className="text-sm text-ink-muted mb-1">Total P&L</div>
            <div className={`text-2xl font-bold ${
              metrics.totalPnL >= 0 ? 'text-success' : 'text-error'
            }`}>
              {formatDollar(metrics.totalPnL)}
            </div>
            <div className="text-xs text-ink-muted mt-1">
              {formatR(metrics.totalRMultiples)}
            </div>
          </div>

          {/* Current Streak */}
          <div>
            <div className="text-sm text-ink-muted mb-1">Streak</div>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${
                metrics.currentStreak > 0 ? 'text-success' :
                metrics.currentStreak < 0 ? 'text-error' : 'text-ink-muted'
              }`}>
                {Math.abs(metrics.currentStreak)}
              </div>
              <Badge variant={
                metrics.currentStreak > 0 ? 'success' :
                metrics.currentStreak < 0 ? 'error' : 'neutral'
              }>
                {metrics.currentStreak > 0 ? 'Win' :
                 metrics.currentStreak < 0 ? 'Loss' : 'None'}
              </Badge>
            </div>
            <div className="text-xs text-ink-muted mt-1">
              Best: {metrics.longestWinStreak}W
            </div>
          </div>
        </div>

        {/* No Trades Message */}
        {metrics.totalTrades === 0 && (
          <div className="text-center py-8">
            <p className="text-ink-muted mb-4">No trades yet</p>
            <p className="text-sm text-ink-muted">
              Calculate a trade and click "Save to Journal" to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
