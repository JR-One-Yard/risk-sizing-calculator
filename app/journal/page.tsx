/**
 * Trade Journal Page
 * View and manage trade history with metrics
 */

'use client';

import { useState, useEffect } from 'react';
import { JournalStatsCard } from '@/components/journal/JournalStatsCard';
import { BackupStatusCard } from '@/components/journal/BackupStatusCard';
import { TradeList } from '@/components/journal/TradeList';
import { TradeFilter } from '@/components/journal/TradeFilter';
import { ExportModal } from '@/components/journal/ExportModal';
import { Button } from '@/components/ui';
import { getJournal } from '@/lib/journal';
import type { TradeJournalEntry, TradeStatus } from '@/types/journal';
import Link from 'next/link';

export default function JournalPage() {
  const [trades, setTrades] = useState<TradeJournalEntry[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<TradeJournalEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | TradeStatus>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load trades on mount
  useEffect(() => {
    const journal = getJournal();
    const allTrades = journal.getAllTrades();
    setTrades(allTrades);
    setFilteredTrades(allTrades);
  }, []);

  // Filter trades when filter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredTrades(trades);
    } else {
      setFilteredTrades(trades.filter((t) => t.status === activeFilter));
    }
  }, [activeFilter, trades]);

  // Refresh trades from storage
  const refreshTrades = () => {
    const journal = getJournal();
    const allTrades = journal.getAllTrades();
    setTrades(allTrades);
  };

  return (
    <main className="min-h-screen bg-bg-muted py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-ink">
                Trade Journal
              </h1>
              <p className="text-base sm:text-lg text-ink-muted mt-2">
                Track your trades and analyze performance
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="hidden xs:inline">Calculator</span>
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="flex items-center space-x-2"
                onClick={() => setIsExportModalOpen(true)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span className="hidden xs:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-6">
          <JournalStatsCard trades={trades} />
        </div>

        {/* Backup Status */}
        <div className="mb-6">
          <BackupStatusCard />
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <TradeFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            trades={trades}
          />
        </div>

        {/* Trade List */}
        <TradeList trades={filteredTrades} onTradeUpdate={refreshTrades} />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </main>
  );
}
