/**
 * Trade List Component
 * Displays a list of trades with details
 */

import { Card, CardContent } from '@/components/ui/Card';
import { TradeListItem } from './TradeListItem';
import type { TradeJournalEntry } from '@/types/journal';

interface TradeListProps {
  trades: TradeJournalEntry[];
  onTradeUpdate: () => void;
}

export function TradeList({ trades, onTradeUpdate }: TradeListProps) {
  if (trades.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-ink-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-ink">No trades found</h3>
            <p className="mt-1 text-sm text-ink-muted">
              Try adjusting your filters or add a new trade from the calculator
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort trades by date (most recent first)
  const sortedTrades = [...trades].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-3">
      {sortedTrades.map((trade) => (
        <TradeListItem key={trade.id} trade={trade} onUpdate={onTradeUpdate} />
      ))}
    </div>
  );
}
