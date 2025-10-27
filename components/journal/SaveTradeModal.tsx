/**
 * Save Trade Modal - DIAGNOSTIC VERSION
 * Modal for saving a calculated trade to the journal
 * WITH MOUNT/UNMOUNT/RENDER DIAGNOSTICS
 */

import { useState, useCallback, useEffect } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { getJournal } from '@/lib/journal';
import type { CalculatorInputs, CalculationOutputs } from '@/lib/store';
import type { TradeJournalEntry } from '@/types/journal';

interface SaveTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: CalculatorInputs;
  outputs: CalculationOutputs;
}

export function SaveTradeModal({ isOpen, onClose, inputs, outputs }: SaveTradeModalProps) {
  const [thesis, setThesis] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [timeHorizon, setTimeHorizon] = useState<'day' | 'swing' | 'position'>(inputs.timeHorizon);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ===== DIAGNOSTIC LOGGING START =====
  // Log every render with current state
  console.log('🔄 SAVE MODAL RENDER:', {
    isOpen,
    state: { thesis, tags, notes, timeHorizon },
    isSaving,
    showSuccess,
    timestamp: new Date().toISOString()
  });

  // Log mount and unmount
  useEffect(() => {
    console.log('🔵 SAVE MODAL MOUNTED:', {
      isOpen,
      timestamp: new Date().toISOString()
    });

    return () => {
      console.log('🔴 SAVE MODAL UNMOUNTED:', {
        timestamp: new Date().toISOString()
      });
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  // Log when modal opens/closes
  useEffect(() => {
    console.log('🚪 SAVE MODAL isOpen CHANGED:', {
      isOpen,
      timestamp: new Date().toISOString()
    });
  }, [isOpen]);

  // Log state changes
  useEffect(() => {
    console.log('📝 SAVE MODAL STATE CHANGED:', {
      thesis,
      tags,
      notes,
      timeHorizon,
      timestamp: new Date().toISOString()
    });
  }, [thesis, tags, notes, timeHorizon]);
  // ===== DIAGNOSTIC LOGGING END =====

  // Stable onChange handlers to prevent input focus loss in React 19
  const handleThesisChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('✏️ SAVE MODAL thesis onChange called:', e.target.value);
    setThesis(e.target.value);
  }, []);

  const handleTagsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('✏️ SAVE MODAL tags onChange called:', e.target.value);
    setTags(e.target.value);
  }, []);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('✏️ SAVE MODAL notes onChange called:', e.target.value);
    setNotes(e.target.value);
  }, []);

  const handleTimeHorizonChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('✏️ SAVE MODAL timeHorizon onChange called:', e.target.value);
    setTimeHorizon(e.target.value as 'day' | 'swing' | 'position');
  }, []);

  const handleSave = () => {
    console.log('💾 SAVE MODAL handleSave called');
    setIsSaving(true);

    try {
      const journal = getJournal();

      // Parse tags from comma-separated string
      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Get symbol from instrument type (default placeholder)
      const symbolMap: Record<string, string> = {
        STOCK: 'STOCK',
        FUTURES_ES: 'ES',
        FUTURES_NQ: 'NQ',
        FUTURES_YM: 'YM',
        FUTURES_RTY: 'RTY',
        FUTURES_CL: 'CL',
        FUTURES_GC: 'GC',
        FUTURES_SI: 'SI',
        FOREX: 'EUR/USD',
        CRYPTO: 'BTC/USD',
        OPTIONS: 'OPTIONS',
        ETF: 'ETF',
        COMMODITY: 'COMMODITY',
        BOND: 'BOND',
      };

      const symbol = symbolMap[inputs.instrumentType] || inputs.instrumentType;

      // Create trade entry
      const tradeData: Omit<TradeJournalEntry, 'id' | 'createdAt' | 'updatedAt'> = {
        // Metadata
        status: 'open',

        // Planned Setup (from calculator)
        instrument: inputs.instrumentType,
        symbol,
        direction: inputs.direction,
        conviction: inputs.conviction,
        volatilityClass: inputs.volatilityClass,

        // Price levels (planned)
        plannedEntry: inputs.entryPrice,
        plannedStop: inputs.stopLoss,
        plannedTarget: outputs.takeProfitPrice,
        plannedTargetRMultiple: outputs.rMultiple.target,

        // Position sizing (planned)
        plannedPositionSize: outputs.positionSize,
        plannedDollarRisk: outputs.dollarRisk,
        plannedRiskPercentage: outputs.riskPercentage,

        // Trade Management Notes
        thesis,
        tags: tagArray,
        notes,
        timeHorizon,
      };

      // Save to journal
      const savedTrade = journal.saveTrade(tradeData);
      console.log('✅ SAVE MODAL trade saved:', savedTrade.id);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('❌ SAVE MODAL error saving trade:', error);
      alert('Failed to save trade. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = useCallback(() => {
    console.log('❌ SAVE MODAL handleClose called');
    setThesis('');
    setTags('');
    setNotes('');
    setTimeHorizon(inputs.timeHorizon);
    setShowSuccess(false);
    onClose();
  }, [inputs.timeHorizon, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={showSuccess ? "Trade Saved!" : "Save Trade to Journal"}
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
            Trade saved to journal!
          </h3>
          <p className="text-sm text-ink-muted">
            View your trade in the Journal page
          </p>
        </div>
      ) : (
        <div className="space-y-4">
        {/* Trade Summary */}
        <div className="bg-bg-muted rounded-[10px] p-4 border border-border">
          <h4 className="text-sm font-semibold text-ink mb-2">Trade Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">Instrument:</span>
              <span className="font-semibold">{inputs.instrumentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Direction:</span>
              <span className="font-semibold capitalize">{inputs.direction}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Conviction:</span>
              <span className="font-semibold">Type {inputs.conviction}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Entry:</span>
              <span className="font-semibold">
                ${inputs.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Stop:</span>
              <span className="font-semibold">
                ${inputs.stopLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Position Size:</span>
              <span className="font-semibold">
                {outputs.positionSize.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Dollar Risk:</span>
              <span className="font-semibold text-error">
                ${outputs.dollarRisk.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Thesis */}
        <div>
          <label htmlFor="thesis" className="block text-sm font-semibold text-ink mb-1">
            Trade Thesis <span className="text-red-500">*</span>
          </label>
          <textarea
            id="thesis"
            value={thesis}
            onChange={handleThesisChange}
            placeholder="Why are you taking this trade? What's your edge?"
            className="w-full px-3 py-2 border border-border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            required
          />
          <p className="text-xs text-ink-muted mt-1">
            Example: "Breakout above key resistance at $150, strong volume, bullish sector"
          </p>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-semibold text-ink mb-1">
            Tags
          </label>
          <Input
            id="tags"
            type="text"
            value={tags}
            onChange={handleTagsChange}
            placeholder="breakout, momentum, earnings"
          />
          <p className="text-xs text-ink-muted mt-1">
            Comma-separated tags for filtering (e.g., "breakout, momentum")
          </p>
        </div>

        {/* Time Horizon */}
        <div>
          <label htmlFor="timeHorizon" className="block text-sm font-semibold text-ink mb-1">
            Time Horizon
          </label>
          <select
            id="timeHorizon"
            value={timeHorizon}
            onChange={handleTimeHorizonChange}
            className="w-full px-3 py-2 border border-border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">Day Trade</option>
            <option value="swing">Swing Trade</option>
            <option value="position">Position Trade</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-ink mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={handleNotesChange}
            placeholder="Any additional observations or context..."
            className="w-full px-3 py-2 border border-border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!thesis.trim() || isSaving}
            loading={isSaving}
          >
            Save to Journal
          </Button>
        </div>
        </div>
      )}
    </Modal>
  );
}