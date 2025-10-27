/**
 * Update Trade Modal - DIAGNOSTIC VERSION
 * Modal for closing trades and recording actual outcomes
 * WITH MOUNT/UNMOUNT/RENDER DIAGNOSTICS
 */

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { getJournal } from '@/lib/journal';
import type { TradeJournalEntry, ExitReason } from '@/types/journal';

interface UpdateTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: TradeJournalEntry;
  onUpdate: () => void;
}

export function UpdateTradeModal({ isOpen, onClose, trade, onUpdate }: UpdateTradeModalProps) {
  const [actualExit, setActualExit] = useState('');
  const [exitReason, setExitReason] = useState<ExitReason>('target_hit');
  const [exitReasonNotes, setExitReasonNotes] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState(trade.lessonsLearned || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ===== DIAGNOSTIC LOGGING START =====
  // Log every render with current state
  console.log('🔄 UPDATE MODAL RENDER:', {
    isOpen,
    tradeId: trade?.id,
    state: { actualExit, exitReason, exitReasonNotes, lessonsLearned },
    isSaving,
    showSuccess,
    timestamp: new Date().toISOString()
  });

  // Log mount and unmount
  useEffect(() => {
    console.log('🔵 UPDATE MODAL MOUNTED:', {
      isOpen,
      tradeId: trade?.id,
      timestamp: new Date().toISOString()
    });

    return () => {
      console.log('🔴 UPDATE MODAL UNMOUNTED:', {
        timestamp: new Date().toISOString()
      });
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  // Log when modal opens/closes
  useEffect(() => {
    console.log('🚪 UPDATE MODAL isOpen CHANGED:', {
      isOpen,
      tradeId: trade?.id,
      timestamp: new Date().toISOString()
    });
  }, [isOpen, trade?.id]);

  // Log state changes
  useEffect(() => {
    console.log('📝 UPDATE MODAL STATE CHANGED:', {
      actualExit,
      exitReason,
      exitReasonNotes,
      lessonsLearned,
      timestamp: new Date().toISOString()
    });
  }, [actualExit, exitReason, exitReasonNotes, lessonsLearned]);

  // Log when trade prop changes
  useEffect(() => {
    console.log('🔄 UPDATE MODAL trade prop CHANGED:', {
      tradeId: trade?.id,
      tradeStatus: trade?.status,
      timestamp: new Date().toISOString()
    });
  }, [trade?.id, trade?.status]);
  // ===== DIAGNOSTIC LOGGING END =====

  // Stable onChange handlers to prevent input focus loss in React 19
  const handleActualExitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('✏️ UPDATE MODAL actualExit onChange called:', e.target.value);
    setActualExit(e.target.value);
  }, []);

  const handleExitReasonChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('✏️ UPDATE MODAL exitReason onChange called:', e.target.value);
    setExitReason(e.target.value as ExitReason);
  }, []);

  const handleExitReasonNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('✏️ UPDATE MODAL exitReasonNotes onChange called:', e.target.value);
    setExitReasonNotes(e.target.value);
  }, []);

  const handleLessonsLearnedChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('✏️ UPDATE MODAL lessonsLearned onChange called:', e.target.value);
    setLessonsLearned(e.target.value);
  }, []);

  // Define handleClose BEFORE other functions that use it (to avoid hoisting issues)
  const handleClose = useCallback(() => {
    console.log('❌ UPDATE MODAL handleClose called');
    setActualExit('');
    setExitReason('target_hit');
    setExitReasonNotes('');
    setShowSuccess(false);
    onClose();
  }, [onClose]);

  // Reset form when trade changes
  useEffect(() => {
    console.log('🔄 UPDATE MODAL resetting form due to trade change');
    if (trade) {
      setActualExit(trade.actualExit?.toString() || '');
      setLessonsLearned(trade.lessonsLearned || '');
    }
  }, [trade]);

  const calculateOutcome = (exitPrice: number) => {
    const actualEntry = trade.actualEntry || trade.plannedEntry;
    const actualSize = trade.actualPositionSize || trade.plannedPositionSize;

    // Calculate P&L
    let actualPnL: number;
    if (trade.direction === 'long') {
      actualPnL = (exitPrice - actualEntry) * actualSize;
    } else {
      actualPnL = (actualEntry - exitPrice) * actualSize;
    }

    // Calculate R-multiple
    // R-multiple = Actual P&L / Dollar Risk
    const actualRMultiple = actualPnL / trade.plannedDollarRisk;

    return { actualPnL, actualRMultiple };
  };

  const handleCloseTrade = useCallback(() => {
    console.log('💾 UPDATE MODAL handleCloseTrade called');
    const exitPrice = parseFloat(actualExit);
    if (isNaN(exitPrice) || exitPrice <= 0) {
      alert('Please enter a valid exit price');
      return;
    }

    setIsSaving(true);

    try {
      const journal = getJournal();
      const { actualPnL, actualRMultiple } = calculateOutcome(exitPrice);

      // Update trade with actual outcome
      journal.updateTrade(trade.id, {
        status: 'closed',
        actualExit: exitPrice,
        actualExitTime: Date.now(),
        actualPnL,
        actualRMultiple,
        exitReason,
        exitReasonNotes: exitReasonNotes.trim() || undefined,
        lessonsLearned: lessonsLearned.trim() || undefined,
      });

      console.log('✅ UPDATE MODAL trade closed:', trade.id);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onUpdate();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('❌ UPDATE MODAL error closing trade:', error);
      alert('Failed to close trade. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [actualExit, exitReason, exitReasonNotes, lessonsLearned, trade.id, onUpdate, handleClose]);

  const handleUpdateLessons = useCallback(() => {
    console.log('💾 UPDATE MODAL handleUpdateLessons called');
    setIsSaving(true);

    try {
      const journal = getJournal();
      journal.updateTrade(trade.id, {
        lessonsLearned: lessonsLearned.trim() || undefined,
      });

      console.log('✅ UPDATE MODAL lessons updated:', trade.id);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onUpdate();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('❌ UPDATE MODAL error updating trade:', error);
      alert('Failed to update trade. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [lessonsLearned, trade.id, onUpdate, handleClose]);

  // Calculate preview if exit price is entered
  const preview = actualExit && !isNaN(parseFloat(actualExit))
    ? calculateOutcome(parseFloat(actualExit))
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={showSuccess ? "Trade Updated!" : (trade.status === 'open' ? 'Close Trade' : 'Update Trade')}
    >
      {showSuccess ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-16 w-16 text-success mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-ink mb-2">
            {trade.status === 'open' ? 'Trade closed successfully!' : 'Trade updated!'}
          </h3>
          <p className="text-sm text-ink-muted">
            Changes have been saved to your journal
          </p>
        </div>
      ) : (
        <div className="space-y-4">
        {/* Trade Summary */}
        <div className="bg-bg-muted rounded-[10px] p-4 border border-border">
          <h4 className="text-sm font-semibold text-ink mb-2">Trade Details</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">Symbol:</span>
              <span className="font-semibold">{trade.symbol} {trade.direction.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Entry:</span>
              <span className="font-semibold">
                ${(trade.actualEntry || trade.plannedEntry).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Stop:</span>
              <span className="font-semibold">
                ${trade.plannedStop.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Dollar Risk:</span>
              <span className="font-semibold text-error">
                ${trade.plannedDollarRisk.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Close Trade Section (only for open trades) */}
        {trade.status === 'open' && (
          <>
            {/* Exit Price */}
            <div>
              <label htmlFor="exitPrice" className="block text-sm font-semibold text-ink mb-1">
                Exit Price <span className="text-red-500">*</span>
              </label>
              <Input
                id="exitPrice"
                type="number"
                step="0.01"
                value={actualExit}
                onChange={handleActualExitChange}
                placeholder="Enter exit price"
                required
              />
            </div>

            {/* Preview Results */}
            {preview && (
              <div className={`rounded-[10px] p-4 border ${
                preview.actualPnL >= 0 ? 'bg-success-bg border-success-border' : 'bg-error-bg border-error-border'
              }`}>
                <h4 className="text-sm font-semibold text-ink mb-2">Projected Outcome</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">P&L:</span>
                    <span className={`font-bold text-lg ${
                      preview.actualPnL >= 0 ? 'text-success' : 'text-error'
                    }`}>
                      {preview.actualPnL >= 0 ? '+' : ''}${Math.abs(preview.actualPnL).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">R-Multiple:</span>
                    <span className={`font-bold text-lg ${
                      preview.actualRMultiple >= 0 ? 'text-success' : 'text-error'
                    }`}>
                      {preview.actualRMultiple >= 0 ? '+' : ''}{preview.actualRMultiple.toFixed(2)}R
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Exit Reason */}
            <div>
              <label htmlFor="exitReason" className="block text-sm font-semibold text-ink mb-1">
                Exit Reason <span className="text-red-500">*</span>
              </label>
              <select
                id="exitReason"
                value={exitReason}
                onChange={handleExitReasonChange}
                className="w-full px-3 py-2 border border-border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="target_hit">Hit Take Profit Target</option>
                <option value="stop_hit">Hit Stop Loss</option>
                <option value="trailing_stop">Trailing Stop Triggered</option>
                <option value="manual_exit">Manual Exit</option>
                <option value="time_stop">Time-Based Exit</option>
                <option value="fundamental">Fundamental Change</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Exit Reason Notes */}
            <div>
              <label htmlFor="exitReasonNotes" className="block text-sm font-semibold text-ink mb-1">
                Exit Notes
              </label>
              <textarea
                id="exitReasonNotes"
                value={exitReasonNotes}
                onChange={handleExitReasonNotesChange}
                placeholder="Any additional details about the exit..."
                className="w-full px-3 py-2 border border-border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            </div>
          </>
        )}

        {/* Lessons Learned */}
        <div>
          <label htmlFor="lessonsLearned" className="block text-sm font-semibold text-ink mb-1">
            Lessons Learned
          </label>
          <textarea
            id="lessonsLearned"
            value={lessonsLearned}
            onChange={handleLessonsLearnedChange}
            placeholder="What did you learn from this trade?"
            className="w-full px-3 py-2 border border-border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <p className="text-xs text-ink-muted mt-1">
            Reflect on what went well, what didn't, and how to improve next time
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          {trade.status === 'open' ? (
            <Button
              variant="primary"
              onClick={handleCloseTrade}
              disabled={!actualExit || isSaving}
              loading={isSaving}
            >
              Close Trade
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleUpdateLessons}
              disabled={isSaving}
              loading={isSaving}
            >
              Update
            </Button>
          )}
        </div>
        </div>
      )}
    </Modal>
  );
}