/**
 * Main Calculator Page
 * Risk Sizing Tool v2
 */

'use client';

import { InputCard } from '@/components/calculator/InputCard';
import { OutputCard } from '@/components/calculator/OutputCard';
import { VolatilityImpactCard } from '@/components/calculator/VolatilityImpactCard';

export default function CalculatorPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Risk Sizing Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Professional position sizing with volatility adjustment
          </p>
        </div>

        {/* Main Layout: Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Inputs */}
          <InputCard />

          {/* Right Column: Outputs */}
          <div className="space-y-6">
            <OutputCard />
            {/* NEW v2 Feature: Volatility Impact Visualization */}
            <VolatilityImpactCard />
          </div>
        </div>
      </div>
    </main>
  );
}
