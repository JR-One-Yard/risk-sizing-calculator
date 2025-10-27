/**
 * CalculationBreakdownModal Component
 * Shows step-by-step breakdown of position sizing calculations
 */

'use client';

import { Modal, Badge } from '@/components/ui';
import { useRiskSizingStore } from '@/lib/store';
import { CONVICTION_CONFIGS } from '@/lib/constants';
import { formatPositionSize, getPositionPrecision } from '@/lib/formatters';
import { getUnitLabel } from '@/types/instruments';

interface CalculationBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalculationBreakdownModal({ isOpen, onClose }: CalculationBreakdownModalProps) {
  const inputs = useRiskSizingStore((state) => state.inputs);
  const outputs = useRiskSizingStore((state) => state.outputs);

  if (!outputs) {
    return null;
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

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Get conviction configuration
  const convictionConfig = CONVICTION_CONFIGS[inputs.conviction];

  // Calculate intermediate values for breakdown
  const riskPerShare = Math.abs(inputs.entryPrice - inputs.stopLoss);
  const baseRiskPct = convictionConfig.basePct;
  const ytdRiskPct = convictionConfig.ytdPct;
  const baseRiskAmount = (baseRiskPct / 100) * inputs.freeCapital;
  const ytdBonus = (ytdRiskPct / 100) * Math.max(0, inputs.ytdPnL);
  const totalRiskBeforeCaps = baseRiskAmount + ytdBonus;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-ink mb-2">
          Calculation Breakdown
        </h2>
        <p className="text-sm text-ink-muted mb-6">
          Step-by-step explanation of how your position size was calculated
        </p>

        <div className="space-y-6">
          {/* ============================================ */}
          {/* STEP 1: BASE RISK CALCULATION */}
          {/* ============================================ */}
          <div className="border border-border rounded-[10px] p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink">
                Step 1: Base Risk Calculation
              </h3>
              <Badge variant="info">Conviction-Based</Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-brand-tint rounded-[10px] p-3">
                <p className="text-ink mb-2">
                  <strong>Conviction Level:</strong> {convictionConfig.label}
                </p>
                <p className="text-ink-muted text-xs">
                  {convictionConfig.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-ink-muted">Base Risk %</p>
                  <p className="font-mono font-semibold">{formatPercent(baseRiskPct)}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Free Capital</p>
                  <p className="font-mono font-semibold">{formatCurrency(inputs.freeCapital)}</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-ink-muted">Base Risk Amount</p>
                <p className="text-lg font-bold text-brand">
                  {formatCurrency(baseRiskAmount)}
                </p>
                <p className="text-xs text-ink-muted mt-1">
                  = {formatPercent(baseRiskPct)} × {formatCurrency(inputs.freeCapital)}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* STEP 2: YTD P&L SCALING */}
          {/* ============================================ */}
          <div className="border border-border rounded-[10px] p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink">
                Step 2: YTD P&L Scaling
              </h3>
              <Badge variant={inputs.ytdPnL > 0 ? 'success' : 'neutral'}>
                Kelly Criterion
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-ink-muted">YTD P&L</p>
                  <p className={`font-mono font-semibold ${inputs.ytdPnL >= 0 ? 'text-success' : 'text-error'}`}>
                    {formatCurrency(inputs.ytdPnL)}
                  </p>
                </div>
                <div>
                  <p className="text-ink-muted">YTD Scaling %</p>
                  <p className="font-mono font-semibold">{formatPercent(ytdRiskPct)}</p>
                </div>
              </div>

              <div className="bg-success-bg rounded-[10px] p-3">
                <p className="text-ink mb-1">
                  <strong>YTD Bonus:</strong> {formatCurrency(ytdBonus)}
                </p>
                <p className="text-xs text-ink-muted">
                  {inputs.ytdPnL > 0
                    ? `Winning trades increase position sizing (${formatPercent(ytdRiskPct)} of YTD gains)`
                    : 'No bonus when YTD is negative (preserves capital)'}
                </p>
              </div>

              <div className="pt-2 border-t">
                <p className="text-ink-muted">Total Risk (Before Caps)</p>
                <p className="text-lg font-bold text-brand">
                  {formatCurrency(totalRiskBeforeCaps)}
                </p>
                <p className="text-xs text-ink-muted mt-1">
                  = {formatCurrency(baseRiskAmount)} + {formatCurrency(ytdBonus)}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* STEP 3: RISK CAPS */}
          {/* ============================================ */}
          <div className="border border-border rounded-[10px] p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink">
                Step 3: Risk Caps Applied
              </h3>
              <Badge variant={outputs.appliedCaps.length > 0 ? 'warning' : 'success'}>
                {outputs.appliedCaps.length > 0 ? 'Caps Applied' : 'No Caps'}
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              {outputs.appliedCaps.length > 0 ? (
                <>
                  {outputs.appliedCaps.map((cap, index) => (
                    <div key={index} className="bg-warning-bg border border-warning-border rounded p-3">
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
                        <p className="text-ink">{cap}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <p className="text-ink-muted">Final Dollar Risk</p>
                    <p className="text-lg font-bold text-error">
                      {formatCurrency(outputs.dollarRisk)}
                    </p>
                    <p className="text-xs text-ink-muted mt-1">
                      Reduced from {formatCurrency(totalRiskBeforeCaps)} for safety
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-success-bg rounded p-3">
                  <p className="text-ink">
                    ✓ No risk caps triggered. Your calculated risk is within all safety limits.
                  </p>
                  <div className="mt-3 pt-3 border-t border-success-border">
                    <p className="text-ink-muted">Final Dollar Risk</p>
                    <p className="text-lg font-bold text-success">
                      {formatCurrency(outputs.dollarRisk)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* STEP 4: POSITION SIZE CALCULATION */}
          {/* ============================================ */}
          <div className="border border-border rounded-[10px] p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink">
                Step 4: Position Size Calculation
              </h3>
              <Badge variant="info">Per-Share Risk</Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-brand-tint rounded p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-ink-muted">Entry Price</p>
                    <p className="font-mono font-semibold">{formatCurrency(inputs.entryPrice)}</p>
                  </div>
                  <div>
                    <p className="text-ink-muted">Stop Loss</p>
                    <p className="font-mono font-semibold">{formatCurrency(inputs.stopLoss)}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-ink-muted">Risk per Share</p>
                  <p className="font-mono font-semibold text-error">
                    {formatCurrency(riskPerShare)}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-ink-muted">Base Position Size</p>
                <p className="text-lg font-bold text-brand">
                  {formatPositionSize(outputs.basePositionSize, inputs.instrumentType)}
                </p>
                <p className="text-xs text-ink-muted mt-1">
                  = {formatCurrency(outputs.dollarRisk)} ÷ {formatCurrency(riskPerShare)}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* STEP 5: VOLATILITY ADJUSTMENT */}
          {/* ============================================ */}
          {outputs.volatilityMultiplier !== 1.0 && (
            <div className="border border-border rounded-[10px] p-5 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-ink">
                  Step 5: Volatility Adjustment
                </h3>
                <Badge variant="warning">NEW v2 Feature</Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="bg-warning-bg rounded p-3">
                  <p className="text-ink mb-2">
                    <strong>Volatility Class:</strong> {inputs.volatilityClass}
                  </p>
                  <p className="text-ink-muted text-xs">
                    {outputs.volatilityMultiplier > 1
                      ? 'Lower volatility allows larger position size'
                      : 'Higher volatility requires smaller position size for safety'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-ink-muted">Multiplier</p>
                    <p className="font-mono font-semibold">{outputs.volatilityMultiplier.toFixed(2)}x</p>
                  </div>
                  <div>
                    <p className="text-ink-muted">Adjustment</p>
                    <p className={`font-mono font-semibold ${outputs.volatilityAdjustment && outputs.volatilityAdjustment > 0 ? 'text-success' : 'text-error'}`}>
                      {outputs.volatilityAdjustment
                        ? (outputs.volatilityAdjustment > 0 ? '+' : '') +
                          outputs.volatilityAdjustment.toFixed(getPositionPrecision(inputs.instrumentType, outputs.volatilityAdjustment)) +
                          ' ' + getUnitLabel(inputs.instrumentType, outputs.volatilityAdjustment)
                        : '0'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-ink-muted">Volatility-Adjusted Position</p>
                  <p className="text-lg font-bold text-ink">
                    {formatPositionSize(outputs.positionSize, inputs.instrumentType)}
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    = {formatPositionSize(outputs.basePositionSize, inputs.instrumentType)} × {outputs.volatilityMultiplier.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* FINAL SUMMARY */}
          {/* ============================================ */}
          <div className="border-2 border-focus rounded-[10px] p-5 bg-brand-tint">
            <h3 className="text-lg font-semibold text-brand mb-4">
              Final Position Summary
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-ink-muted">Position Size</p>
                <p className="text-2xl font-bold text-brand">
                  {formatPositionSize(outputs.positionSize, inputs.instrumentType)}
                </p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Position Value</p>
                <p className="text-2xl font-bold text-brand">
                  {formatCurrency(outputs.positionValue)}
                </p>
                <p className="text-xs text-ink-muted">total investment</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Dollar Risk (1R)</p>
                <p className="text-xl font-bold text-error">
                  {formatCurrency(outputs.dollarRisk)}
                </p>
                <p className="text-xs text-ink-muted">{formatPercent(outputs.riskPercentage)} of capital</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Potential Profit (2R)</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrency(outputs.takeProfitValue)}
                </p>
                <p className="text-xs text-ink-muted">at {formatCurrency(outputs.takeProfitPrice)}</p>
              </div>
            </div>
          </div>

          {/* Educational Note */}
          <div className="bg-bg-muted rounded-[10px] p-4 border border-border">
            <p className="text-xs text-ink-muted leading-relaxed">
              <strong>Note:</strong> This breakdown shows the complete calculation process from conviction level
              to final position size. Each step builds on the previous one, with safety caps applied to protect
              your capital. The volatility adjustment (new in v2) ensures position sizes are appropriate for
              the instrument's price movement characteristics.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand text-white rounded-[10px] hover:bg-brand transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
