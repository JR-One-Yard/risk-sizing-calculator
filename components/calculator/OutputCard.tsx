/**
 * OutputCard Component
 * Displays calculation results and trade metrics
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { useRiskSizingStore } from '@/lib/store';
import { exportTradePlan } from '@/lib/export';
import { CalculationBreakdownModal } from './CalculationBreakdownModal';
import { SaveTradeModal } from '@/components/journal/SaveTradeModal';
import { formatPositionSize } from '@/lib/formatters';

export function OutputCard() {
  const outputs = useRiskSizingStore((state) => state.outputs);
  const inputs = useRiskSizingStore((state) => state.inputs);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isSaveTradeOpen, setIsSaveTradeOpen] = useState(false);

  // Stabilize inputs and outputs references for modal props
  // Pass the entire object but only re-create when actual values change
  // This prevents modal re-renders from parent component re-renders
  const stableInputs = useMemo(() => inputs, [
    inputs.freeCapital,
    inputs.ytdPnL,
    inputs.conviction,
    inputs.direction,
    inputs.entryPrice,
    inputs.instrumentType,
    inputs.stopLoss,
    inputs.timeHorizon,
    inputs.volatilityClass,
    inputs.slippage,
    inputs.instrumentMultiplier,
  ]);

  const stableOutputs = useMemo(() => outputs!, [
    outputs?.positionSize,
    outputs?.positionValue,
    outputs?.dollarRisk,
    outputs?.riskPercentage,
    outputs?.takeProfitPrice,
    outputs?.takeProfitValue,
    outputs?.rMultiple?.current,
    outputs?.rMultiple?.target,
    outputs?.rMultiple?.breakeven,
  ]);

  // Stabilize callback functions
  const handleCloseSaveModal = useCallback(() => {
    setIsSaveTradeOpen(false);
  }, []);

  const handleExport = () => {
    exportTradePlan(inputs, outputs);
  };

  if (!outputs) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-ink-muted">
            <svg
              className="mx-auto h-12 w-12 text-ink-muted mb-4"
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
            <p className="text-sm">
              Enter your trade parameters to see position sizing results
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 0) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  return (
    <>
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Results</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsSaveTradeOpen(true)}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="hidden sm:inline">Save to Journal</span>
                <span className="sm:hidden">Save</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBreakdownOpen(true)}
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
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="hidden sm:inline">Details</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Primary Results */}
          <div className="bg-brand-tint border border-border rounded-[10px] p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-ink-muted">Position Size</span>
                <span className="text-2xl font-bold text-brand">
                  {formatPositionSize(outputs.positionSize, inputs.instrumentType)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">Position Value</span>
                <span className="font-semibold text-ink">
                  {formatCurrency(outputs.positionValue)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">Dollar Risk (1R)</span>
                <span className="font-semibold text-error">
                  {formatCurrency(outputs.dollarRisk)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">Risk Percentage</span>
                <span className="font-semibold text-ink">
                  {outputs.riskPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Take Profit */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">
              Take Profit Target
            </h3>
            <div className="bg-success-bg border border-border rounded-[10px] p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-ink-muted">Target Price (2R)</span>
                  <span className="text-lg font-bold text-success">
                    {formatCurrency(outputs.takeProfitPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink-muted">Target Profit</span>
                  <span className="font-semibold text-success">
                    {formatCurrency(outputs.takeProfitValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* R-Multiple Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">
              R-Multiple Targets
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                <span className="text-ink-muted">Breakeven</span>
                <span className="font-mono text-ink">{outputs.rMultiple.breakeven.toFixed(2)}R</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                <span className="text-ink-muted">Current (Entry)</span>
                <span className="font-mono text-ink">{outputs.rMultiple.current.toFixed(2)}R</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-border">
                <span className="text-ink-muted">Target</span>
                <span className="font-mono font-bold text-success">
                  {outputs.rMultiple.target.toFixed(2)}R
                </span>
              </div>
            </div>
          </div>

          {/* Volatility Adjustment */}
          {outputs.volatilityMultiplier !== 1.0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink mb-3">
                Volatility Adjustment
              </h3>
              <div className="bg-brand-tint border border-border rounded-[10px] p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">Multiplier Applied</span>
                  <Badge variant="info">
                    {outputs.volatilityMultiplier}x
                  </Badge>
                </div>
                <p className="text-xs text-ink-muted mt-2">
                  Position size adjusted for instrument volatility
                </p>
              </div>
            </div>
          )}

          {/* Caps Applied */}
          {outputs.appliedCaps.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink mb-3">
                Risk Caps Applied
              </h3>
              <div className="space-y-2">
                {outputs.appliedCaps.map((cap, index) => (
                  <div
                    key={index}
                    className="bg-warning-bg border border-warning-border rounded-[10px] p-3"
                  >
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 text-warning mt-0.5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-ink">{cap}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {outputs.alerts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink mb-3">
                Alerts
              </h3>
              <div className="space-y-2">
                {outputs.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`rounded-[10px] p-3 ${
                      alert.level === 'danger'
                        ? 'bg-error-bg border border-error-border'
                        : alert.level === 'warning'
                        ? 'bg-warning-bg border border-warning-border'
                        : 'bg-brand-tint border border-border'
                    }`}
                  >
                    <div className="flex items-start">
                      <Badge
                        variant={
                          alert.level === 'danger'
                            ? 'error'
                            : alert.level === 'warning'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                        className="mt-0.5 mr-2"
                      >
                        {alert.type}
                      </Badge>
                      <p className="text-sm text-ink">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Calculation Breakdown Modal */}
    <CalculationBreakdownModal
      isOpen={isBreakdownOpen}
      onClose={() => setIsBreakdownOpen(false)}
    />

    {/* Save Trade Modal */}
    <SaveTradeModal
      isOpen={isSaveTradeOpen}
      onClose={handleCloseSaveModal}
      inputs={stableInputs}
      outputs={stableOutputs}
    />
    </>
  );
}
