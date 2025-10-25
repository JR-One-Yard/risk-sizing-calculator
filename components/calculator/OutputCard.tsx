/**
 * OutputCard Component
 * Displays calculation results and trade metrics
 */

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { useRiskSizingStore } from '@/lib/store';
import { exportTradePlan } from '@/lib/export';
import { CalculationBreakdownModal } from './CalculationBreakdownModal';

export function OutputCard() {
  const outputs = useRiskSizingStore((state) => state.outputs);
  const inputs = useRiskSizingStore((state) => state.inputs);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

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
          <div className="text-center py-12 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
                <span>Details</span>
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
                <span>Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Primary Results */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Position Size</span>
                <span className="text-2xl font-bold text-blue-900">
                  {formatNumber(outputs.positionSize)} shares
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Position Value</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(outputs.positionValue)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Dollar Risk (1R)</span>
                <span className="font-semibold text-red-700">
                  {formatCurrency(outputs.dollarRisk)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Risk Percentage</span>
                <span className="font-semibold text-gray-900">
                  {outputs.riskPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Take Profit */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Take Profit Target
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Target Price (2R)</span>
                  <span className="text-lg font-bold text-green-900">
                    {formatCurrency(outputs.takeProfitPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Target Profit</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(outputs.takeProfitValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* R-Multiple Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              R-Multiple Targets
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm py-2 border-b">
                <span className="text-gray-600">Breakeven</span>
                <span className="font-mono">{outputs.rMultiple.breakeven.toFixed(2)}R</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b">
                <span className="text-gray-600">Current (Entry)</span>
                <span className="font-mono">{outputs.rMultiple.current.toFixed(2)}R</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b">
                <span className="text-gray-600">Target</span>
                <span className="font-mono font-bold text-green-700">
                  {outputs.rMultiple.target.toFixed(2)}R
                </span>
              </div>
            </div>
          </div>

          {/* Volatility Adjustment */}
          {outputs.volatilityMultiplier !== 1.0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Volatility Adjustment
              </h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Multiplier Applied</span>
                  <Badge variant="info">
                    {outputs.volatilityMultiplier}x
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Position size adjusted for instrument volatility
                </p>
              </div>
            </div>
          )}

          {/* Caps Applied */}
          {outputs.appliedCaps.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Risk Caps Applied
              </h3>
              <div className="space-y-2">
                {outputs.appliedCaps.map((cap, index) => (
                  <div
                    key={index}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  >
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 text-yellow-600 mt-0.5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-gray-700">{cap}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {outputs.alerts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Alerts
              </h3>
              <div className="space-y-2">
                {outputs.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-3 ${
                      alert.level === 'danger'
                        ? 'bg-red-50 border border-red-200'
                        : alert.level === 'warning'
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-blue-50 border border-blue-200'
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
                      <p className="text-sm text-gray-700">{alert.message}</p>
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
    </>
  );
}
