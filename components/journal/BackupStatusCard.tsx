/**
 * Backup Status Card
 * Displays backup status and provides manual backup option
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { getJournal } from '@/lib/journal';
import type { JournalStorageMetadata } from '@/types/journal';

export function BackupStatusCard() {
  const [metadata, setMetadata] = useState<JournalStorageMetadata | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    const journal = getJournal();
    const data = journal.getStorageMetadata();
    setMetadata(data);
  }, []);

  const handleManualBackup = () => {
    setIsBackingUp(true);
    try {
      const journal = getJournal();
      journal.downloadBackup();

      // Show success message
      setTimeout(() => {
        alert('Backup downloaded successfully!');
        setIsBackingUp(false);

        // Refresh metadata
        const data = journal.getStorageMetadata();
        setMetadata(data);
      }, 500);
    } catch (error) {
      console.error('Backup error:', error);
      alert('Failed to create backup. Please try again.');
      setIsBackingUp(false);
    }
  };

  if (!metadata) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStorageColor = () => {
    if (metadata.quotaUsed < 0.5) return 'text-success';
    if (metadata.quotaUsed < 0.8) return 'text-warning';
    return 'text-error';
  };

  const getStorageBgColor = () => {
    if (metadata.quotaUsed < 0.5) return 'bg-success-bg';
    if (metadata.quotaUsed < 0.8) return 'bg-warning-bg';
    return 'bg-error-bg';
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-ink-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
            <span className="text-sm font-semibold text-ink">
              Backup & Storage
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManualBackup}
            disabled={isBackingUp}
            loading={isBackingUp}
            className="flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
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
            <span>Backup Now</span>
          </Button>
        </div>

        <div className="space-y-3 text-sm">
          {/* Storage Usage */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-ink-muted">Storage Usage</span>
              <span className={`font-semibold ${getStorageColor()}`}>
                {(metadata.quotaUsed * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getStorageBgColor()}`}
                style={{ width: `${Math.min(metadata.quotaUsed * 100, 100)}%` }}
              />
            </div>
            <div className="text-xs text-ink-muted mt-1">
              {formatBytes(metadata.storageSize)} of ~5 MB used
            </div>
          </div>

          {/* Trades Count */}
          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Total Trades</span>
            <Badge variant="neutral">{metadata.totalTrades}</Badge>
          </div>

          {/* Last Backup */}
          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Last Backup</span>
            <span className="text-ink">
              {formatDate(metadata.lastBackup)}
            </span>
          </div>

          {/* Auto-Backup Status */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-bg0 rounded-full animate-pulse" />
              <span className="text-xs text-ink-muted">
                Auto-backup enabled (every 5 saves)
              </span>
            </div>
          </div>

          {/* Storage Warning */}
          {metadata.quotaUsed > 0.8 && (
            <div className="bg-warning-bg border border-warning-border rounded-[10px] p-3 mt-2">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-warning mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-xs">
                  <p className="font-semibold text-yellow-800 mb-1">
                    Storage running low
                  </p>
                  <p className="text-yellow-700">
                    Consider exporting old trades and archiving them to free up space.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
