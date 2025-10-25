/**
 * Main Calculator Page
 * Risk Sizing Tool v2
 */

'use client';

import { useState } from 'react';
import { InputCard } from '@/components/calculator/InputCard';
import { OutputCard } from '@/components/calculator/OutputCard';
import { VolatilityImpactCard } from '@/components/calculator/VolatilityImpactCard';
import { PolicyModal } from '@/components/calculator/PolicyModal';
import { LearnDrawer } from '@/components/calculator/LearnDrawer';
import { Button, Footer } from '@/components/ui';

export default function CalculatorPage() {
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isLearnDrawerOpen, setIsLearnDrawerOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Risk Sizing Calculator
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mt-2">
                  Professional position sizing with volatility adjustment
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsLearnDrawerOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span className="hidden xs:inline">Learn</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsPolicyModalOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="hidden xs:inline">Policy</span>
                </Button>
              </div>
            </div>
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

        {/* Policy Settings Modal */}
        <PolicyModal
          isOpen={isPolicyModalOpen}
          onClose={() => setIsPolicyModalOpen(false)}
        />

        {/* Learn Drawer */}
        <LearnDrawer
          isOpen={isLearnDrawerOpen}
          onClose={() => setIsLearnDrawerOpen(false)}
        />
      </main>

      {/* Footer with Disclaimer */}
      <Footer />
    </>
  );
}
