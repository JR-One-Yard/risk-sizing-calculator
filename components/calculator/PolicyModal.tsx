/**
 * PolicyModal Component
 * Configure risk management policy settings
 */

'use client';

import { useState } from 'react';
import { Modal, Button, Input, Badge } from '@/components/ui';
import { useRiskSizingStore } from '@/lib/store';
import type { RiskPolicy } from '@/lib/store';
import { VolatilityClass, VOLATILITY_CONFIGS } from '@/types/volatility';

export interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'conviction' | 'caps' | 'volatility' | 'trade-mgmt';

export function PolicyModal({ isOpen, onClose }: PolicyModalProps) {
  const policy = useRiskSizingStore((state) => state.policy);
  const updatePolicy = useRiskSizingStore((state) => state.updatePolicy);
  const resetPolicy = useRiskSizingStore((state) => state.resetPolicy);

  // Local form state (allows cancel without saving)
  const [formData, setFormData] = useState<RiskPolicy>(policy);
  const [activeTab, setActiveTab] = useState<TabId>('conviction');

  // Sync form data when modal opens
  useState(() => {
    if (isOpen) {
      setFormData(policy);
    }
  });

  const handleSave = () => {
    updatePolicy(formData);
    onClose();
  };

  const handleCancel = () => {
    setFormData(policy); // Reset to current policy
    onClose();
  };

  const handleReset = () => {
    if (confirm('Reset all policy settings to defaults?')) {
      resetPolicy();
      setFormData(policy); // Will update on next render
      onClose();
    }
  };

  const updateFormData = (updates: Partial<RiskPolicy>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const tabs: { id: TabId; label: string; badge?: string }[] = [
    { id: 'conviction', label: 'Conviction Levels' },
    { id: 'caps', label: 'Risk Caps' },
    { id: 'volatility', label: 'Volatility', badge: 'NEW' },
    { id: 'trade-mgmt', label: 'Trade Management' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Risk Policy Settings" size="xl">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8" aria-label="Policy sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
              {tab.badge && (
                <Badge variant="info" size="sm" className="ml-2">
                  {tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6 min-h-[400px]">
        {/* Conviction Levels Tab */}
        {activeTab === 'conviction' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Conviction Type Settings
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Configure risk allocation and YTD P&L scaling for each conviction level.
              </p>
            </div>

            {/* Type I (High Conviction) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Type I - High Conviction</h4>
                  <p className="text-sm text-gray-600">Highest confidence trades</p>
                </div>
                <Badge variant="info">Type I</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Base Risk (% of Free Capital)"
                  value={formData.typeI.basePctOfFC}
                  onChange={(e) =>
                    updateFormData({
                      typeI: { ...formData.typeI, basePctOfFC: parseFloat(e.target.value) },
                    })
                  }
                  step="0.1"
                  min="0"
                  max="10"
                />
                <Input
                  type="number"
                  label="YTD P&L Scaling (%)"
                  value={formData.typeI.ytdPct}
                  onChange={(e) =>
                    updateFormData({
                      typeI: { ...formData.typeI, ytdPct: parseFloat(e.target.value) },
                    })
                  }
                  step="1"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Type II (Medium Conviction) */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Type II - Medium Conviction</h4>
                  <p className="text-sm text-gray-600">Standard confidence trades</p>
                </div>
                <Badge variant="success">Type II</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Base Risk (% of Free Capital)"
                  value={formData.typeII.basePctOfFC}
                  onChange={(e) =>
                    updateFormData({
                      typeII: { ...formData.typeII, basePctOfFC: parseFloat(e.target.value) },
                    })
                  }
                  step="0.1"
                  min="0"
                  max="10"
                />
                <Input
                  type="number"
                  label="YTD P&L Scaling (%)"
                  value={formData.typeII.ytdPct}
                  onChange={(e) =>
                    updateFormData({
                      typeII: { ...formData.typeII, ytdPct: parseFloat(e.target.value) },
                    })
                  }
                  step="1"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Type III (Low Conviction) */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Type III - Low Conviction</h4>
                  <p className="text-sm text-gray-600">Lower confidence or experimental trades</p>
                </div>
                <Badge variant="warning">Type III</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Base Risk (% of Free Capital)"
                  value={formData.typeIII.basePctOfFC}
                  onChange={(e) =>
                    updateFormData({
                      typeIII: { ...formData.typeIII, basePctOfFC: parseFloat(e.target.value) },
                    })
                  }
                  step="0.1"
                  min="0"
                  max="10"
                />
                <Input
                  type="number"
                  label="YTD P&L Scaling (%)"
                  value={formData.typeIII.ytdPct}
                  onChange={(e) =>
                    updateFormData({
                      typeIII: { ...formData.typeIII, ytdPct: parseFloat(e.target.value) },
                    })
                  }
                  step="1"
                  min="0"
                  max="100"
                />
                <Input
                  type="number"
                  label="Hard Cap (% of Free + YTD)"
                  value={formData.typeIII.hardCapPctOfFreePlusYTD || 0}
                  onChange={(e) =>
                    updateFormData({
                      typeIII: {
                        ...formData.typeIII,
                        hardCapPctOfFreePlusYTD: parseFloat(e.target.value) || undefined,
                      },
                    })
                  }
                  step="0.1"
                  min="0"
                  max="10"
                  helperText="Optional absolute maximum for Type III trades"
                />
              </div>
            </div>
          </div>
        )}

        {/* Risk Caps Tab */}
        {activeTab === 'caps' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Risk Caps</h3>
              <p className="text-sm text-gray-600 mb-6">
                Hard limits that override conviction-based risk calculations.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="space-y-4">
                <Input
                  type="number"
                  label="Max Single Trade Risk (% of Free Capital)"
                  value={formData.maxSingleTradePct}
                  onChange={(e) =>
                    updateFormData({ maxSingleTradePct: parseFloat(e.target.value) })
                  }
                  step="0.1"
                  min="0"
                  max="20"
                  helperText="Absolute maximum risk per trade, regardless of conviction"
                />
                <Input
                  type="number"
                  label="Monthly Stop Cap (% of Free Capital)"
                  value={formData.monthlyStopCapPct}
                  onChange={(e) =>
                    updateFormData({ monthlyStopCapPct: parseFloat(e.target.value) })
                  }
                  step="0.1"
                  min="0"
                  max="20"
                  helperText="Maximum monthly drawdown before stopping trading"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-yellow-600 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-gray-700">
                  These caps apply hierarchically. The calculator will use the most restrictive
                  limit between conviction-based risk, monthly stop cap, and max single trade cap.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Volatility Tab */}
        {activeTab === 'volatility' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Volatility Settings</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Adjust position sizes based on instrument volatility
                  </p>
                </div>
                <Badge variant="info">NEW v2 Feature</Badge>
              </div>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-semibold text-gray-900">Enable Volatility Adjustment</div>
                  <p className="text-sm text-gray-600">
                    Automatically adjust position sizes based on volatility class
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.volatility.enabled}
                  onChange={(e) =>
                    updateFormData({
                      volatility: { ...formData.volatility, enabled: e.target.checked },
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>

            {formData.volatility.enabled && (
              <>
                {/* Volatility Multipliers */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Position Size Multipliers</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Adjust position size based on volatility class. Lower volatility = larger
                    position (higher multiplier).
                  </p>

                  <div className="space-y-3">
                    {Object.entries(VOLATILITY_CONFIGS).map(([key, config]) => {
                      const volClass = key as VolatilityClass;
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {config.class.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-gray-600">{config.annualizedRange}</div>
                          </div>
                          <Input
                            type="number"
                            value={formData.volatility.multipliers[volClass]}
                            onChange={(e) =>
                              updateFormData({
                                volatility: {
                                  ...formData.volatility,
                                  multipliers: {
                                    ...formData.volatility.multipliers,
                                    [volClass]: parseFloat(e.target.value),
                                  },
                                },
                              })
                            }
                            step="0.1"
                            min="0.1"
                            max="3"
                            className="w-24"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ATR Settings */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="font-semibold text-gray-900">Enable ATR Analysis</div>
                        <p className="text-sm text-gray-600">
                          Show Average True Range analysis for stop placement
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.volatility.atrEnabled}
                        onChange={(e) =>
                          updateFormData({
                            volatility: {
                              ...formData.volatility,
                              atrEnabled: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                    {formData.volatility.atrEnabled && (
                      <Input
                        type="number"
                        label="ATR Period (days)"
                        value={formData.volatility.atrPeriod}
                        onChange={(e) =>
                          updateFormData({
                            volatility: {
                              ...formData.volatility,
                              atrPeriod: parseInt(e.target.value, 10),
                            },
                          })
                        }
                        min="5"
                        max="50"
                        helperText="Standard is 14 days"
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Trade Management Tab */}
        {activeTab === 'trade-mgmt' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Trade Management Settings
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Configure default R-multiple targets and alerts.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-4">
                <Input
                  type="number"
                  label="Default R:R Target"
                  value={formData.defaultRMultipleTarget}
                  onChange={(e) =>
                    updateFormData({ defaultRMultipleTarget: parseFloat(e.target.value) })
                  }
                  step="0.5"
                  min="0.5"
                  max="10"
                  helperText="Default reward-to-risk ratio for take profit calculation"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    R-Multiple Alert Levels
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.rMultipleAlerts.map((alert, index) => (
                      <Input
                        key={index}
                        type="number"
                        value={alert}
                        onChange={(e) => {
                          const newAlerts = [...formData.rMultipleAlerts];
                          newAlerts[index] = parseFloat(e.target.value);
                          updateFormData({ rMultipleAlerts: newAlerts });
                        }}
                        step="0.5"
                        min="0"
                        max="20"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    R-multiples where you want to be alerted (e.g., 1R = breakeven, 2R = 1st target)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-blue-600 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-gray-700">
                  R-multiples measure your profit/loss relative to your initial risk. 1R means you
                  made back exactly what you risked, 2R means you made twice your risk, etc.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
        <Button variant="ghost" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Policy
          </Button>
        </div>
      </div>
    </Modal>
  );
}
