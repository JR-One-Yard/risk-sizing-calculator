/**
 * Trade Filter Tabs
 * Filter trades by status and outcome
 */

import { ButtonGroup } from '@/components/ui';
import type { TradeJournalEntry, TradeStatus } from '@/types/journal';

interface TradeFilterProps {
  activeFilter: 'all' | TradeStatus;
  onFilterChange: (filter: 'all' | TradeStatus) => void;
  trades: TradeJournalEntry[];
}

export function TradeFilter({ activeFilter, onFilterChange, trades }: TradeFilterProps) {
  // Count trades by status
  const counts = {
    all: trades.length,
    open: trades.filter((t) => t.status === 'open').length,
    closed: trades.filter((t) => t.status === 'closed').length,
    cancelled: trades.filter((t) => t.status === 'cancelled').length,
    wins: trades.filter((t) => t.status === 'closed' && t.actualRMultiple && t.actualRMultiple > 0.1).length,
    losses: trades.filter((t) => t.status === 'closed' && t.actualRMultiple && t.actualRMultiple < -0.1).length,
  };

  const filters: Array<{
    id: 'all' | TradeStatus | 'wins' | 'losses';
    label: string;
    count: number;
    variant?: 'default' | 'success' | 'error' | 'info';
  }> = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'open', label: 'Open', count: counts.open, variant: 'info' },
    { id: 'closed', label: 'Closed', count: counts.closed },
    { id: 'wins', label: 'Wins', count: counts.wins, variant: 'success' },
    { id: 'losses', label: 'Losses', count: counts.losses, variant: 'error' },
  ];

  const handleFilterClick = (filterId: string) => {
    // Map custom filters to trade status
    if (filterId === 'all') {
      onFilterChange('all');
    } else if (filterId === 'wins' || filterId === 'losses') {
      // For wins/losses, we'll filter closed trades in the parent
      // For now, just show all closed trades
      onFilterChange('closed');
    } else {
      onFilterChange(filterId as TradeStatus);
    }
  };

  return (
    <div className="bg-white rounded-[10px] border border-border shadow-sm p-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterClick(filter.id)}
            className={`px-4 py-2 rounded-[10px] text-sm font-semibold transition-colors ${
              activeFilter === filter.id ||
              (activeFilter === 'closed' && (filter.id === 'wins' || filter.id === 'losses'))
                ? 'bg-brand text-white'
                : 'bg-brand-tint text-ink hover:bg-border'
            }`}
          >
            {filter.label}
            <span className={`ml-2 ${
              activeFilter === filter.id ||
              (activeFilter === 'closed' && (filter.id === 'wins' || filter.id === 'losses'))
                ? 'text-blue-100'
                : 'text-ink-muted'
            }`}>
              ({filter.count})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
