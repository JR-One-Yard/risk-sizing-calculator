/**
 * Export Modal
 * Modal for exporting trade journal data
 */

import { useState } from 'react';
import { Modal, Button, Badge } from '@/components/ui';
import { getJournal } from '@/lib/journal';
import type { ExportFormat, ExportConfig } from '@/types/journal';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('json');
  const [includeOpen, setIncludeOpen] = useState(true);
  const [includeClosed, setIncludeClosed] = useState(true);
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    try {
      const journal = getJournal();

      // Build export config
      const config: ExportConfig = {
        format,
        includeOpen,
        includeClosed,
        includeCancelled,
      };

      // Generate export content
      const content = journal.exportTrades(config);

      // Determine file extension and MIME type
      const extensions: Record<ExportFormat, string> = {
        json: 'json',
        csv: 'csv',
        markdown: 'md',
      };

      const mimeTypes: Record<ExportFormat, string> = {
        json: 'application/json',
        csv: 'text/csv',
        markdown: 'text/markdown',
      };

      const extension = extensions[format];
      const mimeType = mimeTypes[format];
      const filename = `trade-journal-${new Date().toISOString().split('T')[0]}.${extension}`;

      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export trades. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getTradeCount = () => {
    const journal = getJournal();
    const allTrades = journal.getAllTrades();

    let count = 0;
    if (includeOpen) count += allTrades.filter(t => t.status === 'open').length;
    if (includeClosed) count += allTrades.filter(t => t.status === 'closed').length;
    if (includeCancelled) count += allTrades.filter(t => t.status === 'cancelled').length;

    return count;
  };

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Export Complete!">
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
            Export successful!
          </h3>
          <p className="text-sm text-ink-muted">
            Your trade journal has been downloaded
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Trade Journal">
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-semibold text-ink mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setFormat('json')}
              className={`p-4 border-2 rounded-[10px] text-center transition-colors ${
                format === 'json'
                  ? 'border-blue-600 bg-brand-tint'
                  : 'border-border hover:border-border'
              }`}
            >
              <div className="font-semibold text-ink mb-1">JSON</div>
              <div className="text-xs text-ink-muted">
                Structured data for imports
              </div>
            </button>
            <button
              onClick={() => setFormat('csv')}
              className={`p-4 border-2 rounded-[10px] text-center transition-colors ${
                format === 'csv'
                  ? 'border-blue-600 bg-brand-tint'
                  : 'border-border hover:border-border'
              }`}
            >
              <div className="font-semibold text-ink mb-1">CSV</div>
              <div className="text-xs text-ink-muted">
                Excel & spreadsheets
              </div>
            </button>
            <button
              onClick={() => setFormat('markdown')}
              className={`p-4 border-2 rounded-[10px] text-center transition-colors ${
                format === 'markdown'
                  ? 'border-blue-600 bg-brand-tint'
                  : 'border-border hover:border-border'
              }`}
            >
              <div className="font-semibold text-ink mb-1">Markdown</div>
              <div className="text-xs text-ink-muted">
                Human-readable docs
              </div>
            </button>
          </div>
        </div>

        {/* Include Options */}
        <div>
          <label className="block text-sm font-semibold text-ink mb-3">
            Include Trades
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeOpen}
                onChange={(e) => setIncludeOpen(e.target.checked)}
                className="h-4 w-4 text-brand rounded border-border focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-ink">
                Open trades
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeClosed}
                onChange={(e) => setIncludeClosed(e.target.checked)}
                className="h-4 w-4 text-brand rounded border-border focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-ink">
                Closed trades
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeCancelled}
                onChange={(e) => setIncludeCancelled(e.target.checked)}
                className="h-4 w-4 text-brand rounded border-border focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-ink">
                Cancelled trades
              </span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-bg-muted rounded-[10px] p-4 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-muted">
              Trades to export:
            </span>
            <Badge variant="info">
              {getTradeCount()} trades
            </Badge>
          </div>
        </div>

        {/* Format Info */}
        <div className="text-sm text-ink-muted">
          {format === 'json' && (
            <p>
              <strong>JSON:</strong> Best for re-importing data or backup.
              Preserves all data with exact precision.
            </p>
          )}
          {format === 'csv' && (
            <p>
              <strong>CSV:</strong> Opens in Excel, Google Sheets, or any spreadsheet app.
              Great for custom analysis and pivot tables.
            </p>
          )}
          {format === 'markdown' && (
            <p>
              <strong>Markdown:</strong> Human-readable format perfect for documentation.
              View in GitHub, Obsidian, or any text editor.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting || getTradeCount() === 0}
            loading={isExporting}
          >
            Export {getTradeCount()} Trades
          </Button>
        </div>
      </div>
    </Modal>
  );
}
