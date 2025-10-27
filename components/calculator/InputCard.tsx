/**
 * InputCard Component
 * Main input form for trade parameters
 */

'use client';

import { Card, CardHeader, CardTitle, CardContent, Input, Select, ButtonGroup, InfoTooltip } from '@/components/ui';
import { useRiskSizingStore } from '@/lib/store';
import { VolatilityClass } from '@/types/volatility';
import type { ConvictionType } from '@/types/calculator';
import type { Direction } from '@/types/instruments';
import {
  InstrumentType,
  INSTRUMENT_CONFIGS,
  INSTRUMENT_PRESETS,
  getInstrumentConfig,
  getPresetsByType,
} from '@/types/instruments';
import { TOOLTIPS } from '@/lib/content';
import type { ButtonGroupOption } from '@/components/ui';
import { useState, useEffect } from 'react';

export function InputCard() {
  const inputs = useRiskSizingStore((state) => state.inputs);
  const updateInputs = useRiskSizingStore((state) => state.updateInputs);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [stopLossError, setStopLossError] = useState<string | undefined>(undefined);

  // Get current instrument configuration
  const instrumentConfig = getInstrumentConfig(inputs.instrumentType);

  // Get presets for current instrument type
  const availablePresets = getPresetsByType(inputs.instrumentType);

  // Instrument type options
  const instrumentTypeOptions = Object.values(InstrumentType).map((type) => {
    const config = INSTRUMENT_CONFIGS[type];
    return {
      value: type,
      label: config.label,
    };
  });

  // Preset options for dropdown
  const presetOptions = [
    { value: '', label: 'Custom Setup' },
    ...availablePresets.map((preset) => ({
      value: preset.id,
      label: `${preset.symbol} - ${preset.name}`,
    })),
  ];

  // Handle preset selection
  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);

    if (!presetId) return; // Custom setup selected

    const preset = INSTRUMENT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      updateInputs({
        instrumentType: preset.instrumentType,
        instrumentMultiplier: preset.multiplier,
        entryPrice: preset.exampleEntry,
      });
    }
  };

  // Handle instrument type change
  const handleInstrumentTypeChange = (type: InstrumentType) => {
    const config = getInstrumentConfig(type);
    updateInputs({
      instrumentType: type,
      instrumentMultiplier: config.defaultMultiplier,
    });
    setSelectedPreset(''); // Reset preset when type changes
  };

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

  // Direction options (NEW in v2.1)
  const directionOptions: ButtonGroupOption[] = [
    {
      value: 'long',
      label: 'LONG',
      shortLabel: 'LONG ↗',
      description: 'Buy to profit from price increase',
      color: 'green'
    },
    {
      value: 'short',
      label: 'SHORT',
      shortLabel: 'SHORT ↘',
      description: 'Sell to profit from price decrease',
      color: 'gray'
    },
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

  // Validate direction vs stop placement
  // Run validation in useEffect to ensure it uses latest state
  useEffect(() => {
    const validateStopLoss = (): string | undefined => {
      if (!inputs.entryPrice || !inputs.stopLoss) return undefined;
      if (inputs.entryPrice === inputs.stopLoss) {
        return 'Stop Loss cannot equal Entry Price';
      }

      if (inputs.direction === 'long') {
        if (inputs.stopLoss >= inputs.entryPrice) {
          return 'For LONG: Stop must be below entry. Try selecting SHORT direction instead.';
        }
      } else {
        // short
        if (inputs.stopLoss <= inputs.entryPrice) {
          return 'For SHORT: Stop must be above entry. Try selecting LONG direction instead.';
        }
      }

      return undefined;
    };

    setStopLossError(validateStopLoss());
  }, [inputs.direction, inputs.entryPrice, inputs.stopLoss]);

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Trade Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Account Information */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">
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
            <h3 className="text-sm font-semibold text-ink mb-3">
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

          {/* Trade Direction (NEW in v2.1) */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">
              Trade Direction
            </h3>
            <ButtonGroup
              label="Direction"
              value={inputs.direction}
              onChange={(value) => updateInputs({ direction: value as Direction })}
              options={directionOptions}
              tooltip="Select whether you're buying (long) or selling (short)"
              helperText={
                inputs.direction === 'long'
                  ? 'Long: Stop must be below entry, profit above entry'
                  : 'Short: Stop must be above entry, profit below entry'
              }
              fullWidth
              size="lg"
            />

            {/* Validation Error Banner */}
            {stopLossError && (
              <div className="mt-4 p-4 bg-error-bg border border-error-border rounded-[10px]">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-error mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-error mb-1">Invalid Stop Loss</h4>
                    <p className="text-sm text-error">{stopLossError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instrument Selection (NEW in v2.1) */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">
              Instrument Type
            </h3>
            <div className="space-y-4">
              <Select
                label="Instrument Type"
                value={inputs.instrumentType}
                onChange={(e) => handleInstrumentTypeChange(e.target.value as InstrumentType)}
                options={instrumentTypeOptions}
                tooltip="Select the type of instrument you're trading"
                helperText={instrumentConfig.description}
              />
              {availablePresets.length > 0 && (
                <Select
                  label="Quick Preset"
                  value={selectedPreset}
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  options={presetOptions}
                  tooltip="Select a preset instrument to auto-fill multiplier and example entry"
                  helperText={selectedPreset ? `Multiplier: ${inputs.instrumentMultiplier}x` : 'Or configure manually below'}
                />
              )}
            </div>
          </div>

          {/* Price Levels */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">
              Price Levels
            </h3>
            <div className="space-y-4">
              <Input
                label={instrumentConfig.priceLabel}
                type="number"
                value={inputs.entryPrice}
                onChange={(e) => handleNumberChange('entryPrice', e.target.value)}
                placeholder={
                  inputs.instrumentType === InstrumentType.STOCK
                    ? '100.00'
                    : inputs.instrumentType === InstrumentType.FUTURES_INDEX
                    ? '6050.00'
                    : inputs.instrumentType === InstrumentType.FUTURES_COMMODITY
                    ? '61.00'
                    : '100.00'
                }
                step="0.01"
                tooltip={TOOLTIPS.entryPrice}
                helperText={
                  inputs.instrumentType !== InstrumentType.STOCK
                    ? `Point/level value (not dollar price)`
                    : undefined
                }
              />
              <Input
                label="Stop Loss"
                type="number"
                value={inputs.stopLoss}
                onChange={(e) => handleNumberChange('stopLoss', e.target.value)}
                placeholder={
                  inputs.instrumentType === InstrumentType.STOCK
                    ? '95.00'
                    : inputs.instrumentType === InstrumentType.FUTURES_INDEX
                    ? '6040.00'
                    : inputs.instrumentType === InstrumentType.FUTURES_COMMODITY
                    ? '60.00'
                    : '95.00'
                }
                step="0.01"
                tooltip={TOOLTIPS.stopLoss}
                error={stopLossError}
                helperText={stopLossError ? undefined : "Exit price if trade goes against you"}
              />
            </div>
          </div>

          {/* Advanced Options */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-ink mb-3 list-none flex items-center">
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
                placeholder={instrumentConfig.defaultMultiplier.toString()}
                step="1"
                tooltip={TOOLTIPS.instrumentMultiplier}
                helperText={`${instrumentConfig.label}: ${instrumentConfig.defaultMultiplier}x (dollar value per point)`}
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
