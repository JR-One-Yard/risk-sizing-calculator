/**
 * Trade List Item Component
 * Displays a single trade with expand/collapse details
 */

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge, Button } from '@/components/ui';
import { UpdateTradeModal } from './UpdateTradeModal';
import type { TradeJournalEntry } from '@/types/journal';

interface TradeListItemProps {
  trade: TradeJournalEntry;
  onUpdate: () => void;
}

export function TradeListItem({ trade, onUpdate }: TradeListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Stabilize trade object reference to prevent modal re-renders
  // Only update when trade.id changes (indicates a different trade)
  // CRITICAL: Do NOT include trade.updatedAt in deps - it changes during typing!
  const stableTrade = useMemo(() => trade, [trade.id]);

  // Stabilize callbacks
  const handleCloseModal = useCallback(() => {
    setIsUpdateModalOpen(false);
  }, []);

  const handleUpdate = useCallback(() => {
    onUpdate();
  }, [onUpdate]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPosition = (size: number, instrument: string) => {
    // Determine precision based on instrument type
    const isFractional = size < 1;
    const decimals = isFractional ? 4 : 2;

    return size.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatRMultiple = (r: number | undefined) => {
    if (r === undefined) return 'N/A';
    const sign = r >= 0 ? '+' : '';
    return `${sign}${r.toFixed(2)}R`;
  };

  const formatPnL = (pnl: number | undefined) => {
    if (pnl === undefined) return 'N/A';
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}$${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getStatusBadge = () => {
    if (trade.status === 'open') {
      return <Badge variant="info">Open</Badge>;
    } else if (trade.status === 'cancelled') {
      return <Badge variant="neutral">Cancelled</Badge>;
    } else {
      // Closed trade - show win/loss
      if (trade.actualRMultiple && trade.actualRMultiple > 0.1) {
        return <Badge variant="success">Win</Badge>;
      } else if (trade.actualRMultiple && trade.actualRMultiple < -0.1) {
        return <Badge variant="error">Loss</Badge>;
      } else {
        return <Badge variant="neutral">Breakeven</Badge>;
      }
    }
  };

  const getDirectionIcon = () => {
    if (trade.direction === 'long') {
      return (
        <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3l7 7-1.5 1.5L11 7v10H9V7l-4.5 4.5L3 10l7-7z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-error" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 17l-7-7 1.5-1.5L9 13V3h2v10l4.5-4.5L17 10l-7 7z" />
        </svg>
      );
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Main Row */}
        <div className="flex items-center justify-between">
          {/* Left: Trade Info */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Direction Icon */}
            <div className="flex-shrink-0">
              {getDirectionIcon()}
            </div>

            {/* Symbol & Date */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-ink">
                  {trade.symbol}
                </span>
                <span className="text-sm text-ink-muted">
                  {trade.instrument}
                </span>
                <Badge variant="neutral" className="text-xs">
                  Type {trade.conviction}
                </Badge>
              </div>
              <div className="text-sm text-ink-muted mt-1">
                {formatDate(trade.createdAt)}
              </div>
            </div>

            {/* Entry & Position */}
            <div className="hidden md:block">
              <div className="text-sm text-ink-muted">Entry</div>
              <div className="font-semibold text-ink">
                {formatPrice(trade.actualEntry || trade.plannedEntry)}
              </div>
            </div>

            <div className="hidden md:block">
              <div className="text-sm text-ink-muted">Size</div>
              <div className="font-semibold text-ink">
                {formatPosition(trade.actualPositionSize || trade.plannedPositionSize, trade.instrument)}
              </div>
            </div>
          </div>

          {/* Right: Results & Actions */}
          <div className="flex items-center space-x-4">
            {/* R-Multiple & P&L */}
            {trade.status === 'closed' && (
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  trade.actualRMultiple && trade.actualRMultiple >= 0 ? 'text-success' : 'text-error'
                }`}>
                  {formatRMultiple(trade.actualRMultiple)}
                </div>
                <div className={`text-sm ${
                  trade.actualPnL && trade.actualPnL >= 0 ? 'text-success' : 'text-error'
                }`}>
                  {formatPnL(trade.actualPnL)}
                </div>
              </div>
            )}

            {trade.status === 'open' && (
              <div className="text-right">
                <div className="text-sm text-ink-muted">Risk</div>
                <div className="font-semibold text-ink">
                  ${trade.plannedDollarRisk.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
            )}

            {/* Status Badge */}
            {getStatusBadge()}

            {/* Expand Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Planned Setup */}
              <div>
                <h4 className="text-sm font-semibold text-ink mb-2">Planned Setup</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Entry:</span>
                    <span className="font-semibold">{formatPrice(trade.plannedEntry)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Stop:</span>
                    <span className="font-semibold">{formatPrice(trade.plannedStop)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Target:</span>
                    <span className="font-semibold">{formatPrice(trade.plannedTarget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Position Size:</span>
                    <span className="font-semibold">
                      {formatPosition(trade.plannedPositionSize, trade.instrument)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Dollar Risk:</span>
                    <span className="font-semibold">
                      ${trade.plannedDollarRisk.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Actual Outcome */}
              <div>
                <h4 className="text-sm font-semibold text-ink mb-2">Actual Outcome</h4>
                {trade.status === 'closed' ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Exit:</span>
                      <span className="font-semibold">{formatPrice(trade.actualExit!)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Exit Date:</span>
                      <span className="font-semibold">{formatDate(trade.actualExitTime!)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">R-Multiple:</span>
                      <span className={`font-semibold ${
                        trade.actualRMultiple! >= 0 ? 'text-success' : 'text-error'
                      }`}>
                        {formatRMultiple(trade.actualRMultiple)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">P&L:</span>
                      <span className={`font-semibold ${
                        trade.actualPnL! >= 0 ? 'text-success' : 'text-error'
                      }`}>
                        {formatPnL(trade.actualPnL)}
                      </span>
                    </div>
                    {trade.exitReason && (
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Exit Reason:</span>
                        <span className="font-semibold">{trade.exitReason.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">Trade is still {trade.status}</p>
                )}
              </div>
            </div>

            {/* Thesis */}
            {trade.thesis && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-ink mb-1">Thesis</h4>
                <p className="text-sm text-ink-muted">{trade.thesis}</p>
              </div>
            )}

            {/* Tags */}
            {trade.tags && trade.tags.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-ink mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {trade.tags.map((tag, i) => (
                    <Badge key={i} variant="neutral" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Lessons Learned */}
            {trade.lessonsLearned && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-ink mb-1">Lessons Learned</h4>
                <p className="text-sm text-ink-muted">{trade.lessonsLearned}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsUpdateModalOpen(true)}
              >
                {trade.status === 'open' ? 'Close Trade' : 'Update'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Update Trade Modal */}
      <UpdateTradeModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseModal}
        trade={stableTrade}
        onUpdate={handleUpdate}
      />
    </Card>
  );
}
