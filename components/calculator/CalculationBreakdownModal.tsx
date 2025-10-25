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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Calculation Breakdown
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Step-by-step explanation of how your position size was calculated
        </p>

        <div className="space-y-6">
          {/* ============================================ */}
          {/* STEP 1: BASE RISK CALCULATION */}
          {/* ============================================ */}
          <div className="border border-gray-200 rounded-lg p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Step 1: Base Risk Calculation
              </h3>
              <Badge variant="info">Conviction-Based</Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-blue-50 rounded p-3">
                <p className="text-gray-700 mb-2">
                  <strong>Conviction Level:</strong> {convictionConfig.label}
                </p>
                <p className="text-gray-600 text-xs">
                  {convictionConfig.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-600">Base Risk %</p>
                  <p className="font-mono font-semibold">{formatPercent(baseRiskPct)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Free Capital</p>
                  <p className="font-mono font-semibold">{formatCurrency(inputs.freeCapital)}</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-gray-600">Base Risk Amount</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(baseRiskAmount)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  = {formatPercent(baseRiskPct)} × {formatCurrency(inputs.freeCapital)}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* STEP 2: YTD P&L SCALING */}
          {/* ============================================ */}
          <div className="border border-gray-200 rounded-lg p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Step 2: YTD P&L Scaling
              </h3>
              <Badge variant={inputs.ytdPnL > 0 ? 'success' : 'neutral'}>
                Kelly Criterion
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-600">YTD P&L</p>
                  <p className={`font-mono font-semibold ${inputs.ytdPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(inputs.ytdPnL)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">YTD Scaling %</p>
                  <p className="font-mono font-semibold">{formatPercent(ytdRiskPct)}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded p-3">
                <p className="text-gray-700 mb-1">
                  <strong>YTD Bonus:</strong> {formatCurrency(ytdBonus)}
                </p>
                <p className="text-xs text-gray-600">
                  {inputs.ytdPnL > 0
                    ? `Winning trades increase position sizing (${formatPercent(ytdRiskPct)} of YTD gains)`
                    : 'No bonus when YTD is negative (preserves capital)'}
                </p>
              </div>

              <div className="pt-2 border-t">
                <p className="text-gray-600">Total Risk (Before Caps)</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(totalRiskBeforeCaps)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  = {formatCurrency(baseRiskAmount)} + {formatCurrency(ytdBonus)}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* STEP 3: RISK CAPS */}
          {/* ============================================ */}
          <div className="border border-gray-200 rounded-lg p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
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
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <div className="flex items-start">
                        <svg
                          className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-gray-700">{cap}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <p className="text-gray-600">Final Dollar Risk</p>
                    <p className="text-lg font-bold text-red-700">
                      {formatCurrency(outputs.dollarRisk)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Reduced from {formatCurrency(totalRiskBeforeCaps)} for safety
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-green-50 rounded p-3">
                  <p className="text-gray-700">
                    ✓ No risk caps triggered. Your calculated risk is within all safety limits.
                  </p>
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-gray-600">Final Dollar Risk</p>
                    <p className="text-lg font-bold text-green-700">
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
          <div className="border border-gray-200 rounded-lg p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Step 4: Position Size Calculation
              </h3>
              <Badge variant="info">Per-Share Risk</Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-purple-50 rounded p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-600">Entry Price</p>
                    <p className="font-mono font-semibold">{formatCurrency(inputs.entryPrice)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Stop Loss</p>
                    <p className="font-mono font-semibold">{formatCurrency(inputs.stopLoss)}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-purple-200">
                  <p className="text-gray-600">Risk per Share</p>
                  <p className="font-mono font-semibold text-red-700">
                    {formatCurrency(riskPerShare)}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-gray-600">Base Position Size</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatPositionSize(outputs.basePositionSize, inputs.instrumentType)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  = {formatCurrency(outputs.dollarRisk)} ÷ {formatCurrency(riskPerShare)}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* STEP 5: VOLATILITY ADJUSTMENT */}
          {/* ============================================ */}
          {outputs.volatilityMultiplier !== 1.0 && (
            <div className="border border-gray-200 rounded-lg p-5 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Step 5: Volatility Adjustment
                </h3>
                <Badge variant="warning">NEW v2 Feature</Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="bg-amber-50 rounded p-3">
                  <p className="text-gray-700 mb-2">
                    <strong>Volatility Class:</strong> {inputs.volatilityClass}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {outputs.volatilityMultiplier > 1
                      ? 'Lower volatility allows larger position size'
                      : 'Higher volatility requires smaller position size for safety'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-600">Multiplier</p>
                    <p className="font-mono font-semibold">{outputs.volatilityMultiplier.toFixed(2)}x</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Adjustment</p>
                    <p className={`font-mono font-semibold ${outputs.volatilityAdjustment && outputs.volatilityAdjustment > 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {outputs.volatilityAdjustment
                        ? (outputs.volatilityAdjustment > 0 ? '+' : '') +
                          outputs.volatilityAdjustment.toFixed(getPositionPrecision(inputs.instrumentType, outputs.volatilityAdjustment)) +
                          ' ' + getUnitLabel(inputs.instrumentType, outputs.volatilityAdjustment)
                        : '0'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-gray-600">Volatility-Adjusted Position</p>
                  <p className="text-lg font-bold text-purple-900">
                    {formatPositionSize(outputs.positionSize, inputs.instrumentType)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    = {formatPositionSize(outputs.basePositionSize, inputs.instrumentType)} × {outputs.volatilityMultiplier.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* FINAL SUMMARY */}
          {/* ============================================ */}
          <div className="border-2 border-blue-500 rounded-lg p-5 bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Final Position Summary
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Position Size</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatPositionSize(outputs.positionSize, inputs.instrumentType)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Position Value</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(outputs.positionValue)}
                </p>
                <p className="text-xs text-gray-500">total investment</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dollar Risk (1R)</p>
                <p className="text-xl font-bold text-red-700">
                  {formatCurrency(outputs.dollarRisk)}
                </p>
                <p className="text-xs text-gray-500">{formatPercent(outputs.riskPercentage)} of capital</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Potential Profit (2R)</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(outputs.takeProfitValue)}
                </p>
                <p className="text-xs text-gray-500">at {formatCurrency(outputs.takeProfitPrice)}</p>
              </div>
            </div>
          </div>

          {/* Educational Note */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 leading-relaxed">
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
