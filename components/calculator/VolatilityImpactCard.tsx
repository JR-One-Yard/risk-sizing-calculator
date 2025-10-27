/**
 * VolatilityImpactCard Component
 * NEW FEATURE: Visual display of volatility-adjusted position sizing
 *
 * Shows users how volatility affects their position size
 */

'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { useRiskSizingStore } from '@/lib/store';
import { VOLATILITY_CONFIGS } from '@/types/volatility';
import { formatPositionSize } from '@/lib/formatters';

export function VolatilityImpactCard() {
  const outputs = useRiskSizingStore((state) => state.outputs);
  const inputs = useRiskSizingStore((state) => state.inputs);
  const volatilityEnabled = useRiskSizingStore(
    (state) => state.policy.volatility.enabled
  );

  // Don't show if no outputs or volatility not enabled
  if (!outputs || !volatilityEnabled) {
    return null;
  }

  // Only show if volatility adjustment was applied (multiplier != 1.0)
  if (outputs.volatilityMultiplier === 1.0) {
    return null;
  }

  const volatilityConfig = VOLATILITY_CONFIGS[inputs.volatilityClass];
  const adjustmentPct = ((outputs.volatilityMultiplier - 1) * 100).toFixed(0);
  const isIncrease = outputs.volatilityMultiplier > 1.0;
  const isDecrease = outputs.volatilityMultiplier < 1.0;

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card variant="elevated" className="border-2 border-brand">
      <CardHeader className="bg-brand-tint">
        <div className="flex items-center justify-between">
          <CardTitle className="text-ink">
            Volatility Impact
          </CardTitle>
          <Badge variant="info" className="bg-brand text-white">
            NEW v2 Feature
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Volatility Class Info */}
        <div className="bg-brand-tint rounded-[10px] p-4 border border-border">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                {volatilityConfig.class.replace('_', ' ')} Volatility
              </h3>
              <p className="text-xs text-ink-muted mt-1">
                {volatilityConfig.description}
              </p>
            </div>
            <Badge variant="neutral" className="ml-2 whitespace-nowrap">
              {volatilityConfig.annualizedRange}
            </Badge>
          </div>
          <div className="mt-3">
            <p className="text-xs text-ink-muted">Example instruments:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {volatilityConfig.examples.map((example, index) => (
                <span
                  key={index}
                  className="text-xs bg-bg px-2 py-0.5 rounded-[10px] border border-border"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Impact Comparison */}
        <div>
          <h3 className="text-sm font-semibold text-ink mb-4">
            Position Size Adjustment
          </h3>

          {/* Base Position */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-ink-muted">Base Position (Standard Risk)</span>
              <span className="text-sm font-mono text-ink">
                {formatPositionSize(outputs.basePositionSize, inputs.instrumentType)}
              </span>
            </div>
            <div className="h-8 bg-border rounded-[10px] flex items-center px-3">
              <div className="flex-1 bg-brand h-4 rounded-[10px]" style={{ width: '100%' }}>
                <span className="text-xs text-white font-semibold px-2">100%</span>
              </div>
            </div>
          </div>

          {/* Arrow Indicator */}
          <div className="flex items-center justify-center my-2">
            <svg
              className={`w-6 h-6 ${
                isDecrease ? 'text-warning' : 'text-success'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v10.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className={`ml-2 text-sm font-semibold ${
              isDecrease ? 'text-warning' : 'text-success'
            }`}>
              {isIncrease ? '+' : ''}{adjustmentPct}% Adjustment
            </span>
          </div>

          {/* Adjusted Position */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-ink">
                Volatility-Adjusted Position
              </span>
              <span className="text-sm font-mono font-bold text-brand">
                {formatPositionSize(outputs.positionSize, inputs.instrumentType)}
              </span>
            </div>
            <div className="h-8 bg-border rounded-[10px] flex items-center px-3">
              <div
                className={`flex-1 h-4 rounded-[10px] ${
                  isDecrease ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${outputs.volatilityMultiplier * 100}%` }}
              >
                <span className="text-xs text-white font-semibold px-2">
                  {outputs.volatilityMultiplier}x
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className={`rounded-[10px] p-4 ${
          isDecrease
            ? 'bg-warning-bg border border-warning-border'
            : 'bg-success-bg border border-border'
        }`}>
          <div className="flex items-start">
            <svg
              className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${
                isDecrease ? 'text-warning' : 'text-success'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className={`text-sm font-semibold ${
                isDecrease ? 'text-warning' : 'text-success'
              }`}>
                {isDecrease ? 'Smaller Position for Higher Volatility' : 'Larger Position for Lower Volatility'}
              </h4>
              <p className="text-sm text-ink mt-1">
                {isDecrease ? (
                  <>
                    Higher volatility instruments have larger price swings. To maintain consistent
                    risk, we <strong>reduce the position size by {Math.abs(Number(adjustmentPct))}%</strong> so that
                    normal volatility doesn't trigger your stop prematurely.
                  </>
                ) : (
                  <>
                    Lower volatility instruments have smaller price swings. You can safely
                    <strong> increase the position size by {adjustmentPct}%</strong> while maintaining
                    the same risk profile, allowing for better capital efficiency.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Multiplier Reference */}
        <div className="border-t border-border pt-4">
          <h4 className="text-xs font-semibold text-ink-muted mb-3">
            Volatility Multiplier Scale
          </h4>
          <div className="space-y-2">
            {Object.entries(VOLATILITY_CONFIGS).map(([key, config]) => {
              const isActive = key === inputs.volatilityClass;
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between text-xs py-1 px-2 rounded-[10px] ${
                    isActive ? 'bg-brand-tint font-semibold' : 'text-ink-muted'
                  }`}
                >
                  <span>{config.class.replace('_', ' ')}</span>
                  <span className={isActive ? 'text-brand' : 'text-ink-muted'}>
                    {config.multiplier}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
