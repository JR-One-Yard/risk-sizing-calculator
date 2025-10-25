/**
 * InputCard Component
 * Main input form for trade parameters
 */

'use client';

import { Card, CardHeader, CardTitle, CardContent, Input, Select, ButtonGroup, InfoTooltip } from '@/components/ui';
import { useRiskSizingStore } from '@/lib/store';
import { VolatilityClass } from '@/types/volatility';
import type { ConvictionType } from '@/types/calculator';
import { TOOLTIPS } from '@/lib/content';
import type { ButtonGroupOption } from '@/components/ui';

export function InputCard() {
  const inputs = useRiskSizingStore((state) => state.inputs);
  const updateInputs = useRiskSizingStore((state) => state.updateInputs);

  // Conviction options
  const convictionOptions = [
    { value: 'I', label: 'Type I - High Conviction (5%)' },
    { value: 'II', label: 'Type II - Medium Conviction (3%)' },
    { value: 'III', label: 'Type III - Low Conviction (1%)' },
  ];

  // Time horizon options
  const timeHorizonOptions = [
    { value: 'day', label: 'Day Trade' },
    { value: 'swing', label: 'Swing Trade' },
    { value: 'position', label: 'Position Trade' },
  ];

  // Volatility options with traffic light colors
  const volatilityOptions: ButtonGroupOption[] = [
    {
      value: VolatilityClass.ULTRA_LOW,
      label: 'Ultra Low',
      shortLabel: 'Ultra Low',
      description: '<20%',
      color: 'blue'
    },
    {
      value: VolatilityClass.LOW,
      label: 'Low',
      shortLabel: 'Low',
      description: '20-30%',
      color: 'green'
    },
    {
      value: VolatilityClass.MEDIUM,
      label: 'Medium',
      shortLabel: 'Medium',
      description: '30-50%',
      color: 'yellow'
    },
    {
      value: VolatilityClass.HIGH,
      label: 'High',
      shortLabel: 'High',
      description: '50-80%',
      color: 'orange'
    },
    {
      value: VolatilityClass.ULTRA_HIGH,
      label: 'Ultra High',
      shortLabel: 'Ultra High',
      description: '>80%',
      color: 'red'
    },
  ];

  const handleNumberChange = (field: keyof typeof inputs, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateInputs({ [field]: numValue });
    } else if (value === '' || value === '-') {
      updateInputs({ [field]: 0 });
    }
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Trade Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Account Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Account Information
            </h3>
            <div className="space-y-4">
              <Input
                label="Free Capital"
                type="number"
                value={inputs.freeCapital}
                onChange={(e) => handleNumberChange('freeCapital', e.target.value)}
                placeholder="100000"
                tooltip={TOOLTIPS.freeCapital}
                helperText="Total capital available for trading"
              />
              <Input
                label="YTD P&L"
                type="number"
                value={inputs.ytdPnL}
                onChange={(e) => handleNumberChange('ytdPnL', e.target.value)}
                placeholder="0"
                tooltip={TOOLTIPS.ytdPnL}
                helperText="Year-to-date profit/loss (can be negative)"
              />
            </div>
          </div>

          {/* Trade Setup */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Trade Setup
            </h3>
            <div className="space-y-4">
              <Select
                label="Conviction Level"
                value={inputs.conviction}
                onChange={(e) => updateInputs({ conviction: e.target.value as ConvictionType })}
                options={convictionOptions}
                tooltip={TOOLTIPS.conviction}
                helperText="Higher conviction = larger position size"
              />
              <ButtonGroup
                label="Volatility Class"
                value={inputs.volatilityClass}
                onChange={(value) => updateInputs({ volatilityClass: value as VolatilityClass })}
                options={volatilityOptions}
                tooltip={TOOLTIPS.volatilityClass}
                helperText="Higher volatility = smaller position size"
                fullWidth
              />
              <Select
                label="Time Horizon"
                value={inputs.timeHorizon}
                onChange={(e) => updateInputs({ timeHorizon: e.target.value as 'day' | 'swing' | 'position' })}
                options={timeHorizonOptions}
                tooltip={TOOLTIPS.timeHorizon}
                helperText="Expected trade duration"
              />
            </div>
          </div>

          {/* Price Levels */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Price Levels
            </h3>
            <div className="space-y-4">
              <Input
                label="Entry Price"
                type="number"
                value={inputs.entryPrice}
                onChange={(e) => handleNumberChange('entryPrice', e.target.value)}
                placeholder="100.00"
                step="0.01"
                tooltip={TOOLTIPS.entryPrice}
              />
              <Input
                label="Stop Loss"
                type="number"
                value={inputs.stopLoss}
                onChange={(e) => handleNumberChange('stopLoss', e.target.value)}
                placeholder="95.00"
                step="0.01"
                tooltip={TOOLTIPS.stopLoss}
                helperText="Exit price if trade goes against you"
              />
            </div>
          </div>

          {/* Advanced Options */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-3 list-none flex items-center">
              <svg
                className="w-4 h-4 mr-2 transition-transform group-open:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Advanced Options
            </summary>
            <div className="space-y-4 mt-3">
              <Input
                label="Slippage Buffer"
                type="number"
                value={inputs.slippage}
                onChange={(e) => handleNumberChange('slippage', e.target.value)}
                placeholder="0"
                step="0.01"
                tooltip={TOOLTIPS.slippage}
                helperText="Additional price buffer for execution (in price units)"
              />
              <Input
                label="Instrument Multiplier"
                type="number"
                value={inputs.instrumentMultiplier}
                onChange={(e) => handleNumberChange('instrumentMultiplier', e.target.value)}
                placeholder="1"
                step="1"
                tooltip={TOOLTIPS.instrumentMultiplier}
                helperText="Contract multiplier (1 for stocks, varies for futures/options)"
              />
              <Input
                label="Custom ATR"
                type="number"
                value={inputs.customATR || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateInputs({ customATR: val ? parseFloat(val) : undefined });
                }}
                placeholder="Optional"
                step="0.01"
                tooltip={TOOLTIPS.customATR}
                helperText="Average True Range for volatility analysis"
              />
              <Input
                label="Monthly Stop Loss"
                type="number"
                value={inputs.monthlyStopLoss || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateInputs({ monthlyStopLoss: val ? parseFloat(val) : undefined });
                }}
                placeholder="Optional"
                tooltip={TOOLTIPS.monthlyStopLoss}
                helperText="Monthly loss limit for risk cap calculations"
              />
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
