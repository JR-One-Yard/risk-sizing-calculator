/**
 * Zustand State Management Store
 * Risk Sizing Tool v2 - Fresh Implementation
 *
 * Manages application state with LocalStorage persistence:
 * - Calculator inputs (with volatility features)
 * - Risk policy settings
 * - Calculation results
 * - UI state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculate } from '@/lib/calculator';
import { DEFAULT_INPUTS, DEFAULT_RISK_POLICY } from '@/lib/constants';
import { VolatilityClass } from '@/types/volatility';
import type { ConvictionType } from '@/types/calculator';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Calculator input state
 */
export interface CalculatorInputs {
  // Account
  freeCapital: number;
  ytdPnL: number;

  // Trade Setup
  conviction: ConvictionType;
  volatilityClass: VolatilityClass;
  timeHorizon: 'day' | 'swing' | 'position';

  // Price Levels
  entryPrice: number;
  stopLoss: number;

  // Advanced Options
  customATR?: number;
  slippage: number;
  instrumentMultiplier: number;

  // Monthly Risk Tracking
  monthlyStopLoss?: number;
}

/**
 * Risk policy configuration
 */
export interface RiskPolicy {
  // Conviction Levels
  typeI: {
    basePctOfFC: number;
    ytdPct: number;
  };
  typeII: {
    basePctOfFC: number;
    ytdPct: number;
  };
  typeIII: {
    basePctOfFC: number;
    ytdPct: number;
    hardCapPctOfFreePlusYTD?: number;
  };

  // Global Caps
  maxSingleTradePct: number;
  monthlyStopCapPct: number;

  // Volatility Settings (NEW in v2)
  volatility: {
    enabled: boolean;
    multipliers: Record<VolatilityClass, number>;
    atrEnabled: boolean;
    atrPeriod: number;
  };

  // R-Multiple Settings
  defaultRMultipleTarget: number;
  rMultipleAlerts: number[];
}

/**
 * Calculation output state
 */
export interface CalculationOutputs {
  // Core Results
  dollarRisk: number;
  riskPercentage: number;
  positionSize: number;
  positionValue: number;
  basePositionSize: number; // Before volatility adjustment

  // Volatility Impact (NEW in v2)
  volatilityMultiplier: number;
  volatilityAdjustment: number | null; // Difference in position size

  // Take Profit
  takeProfitPrice: number;
  takeProfitValue: number;

  // R-Multiple Analysis
  rMultiple: {
    current: number;
    target: number;
    breakeven: number;
  };

  // Alerts & Warnings
  appliedCaps: string[];
  alerts: Array<{
    level: 'info' | 'warning' | 'danger';
    message: string;
    type: string;
  }>;

  // ATR Analysis (NEW in v2)
  atrAnalysis: {
    atr: number;
    atrPct: number;
    stopInATR: number;
    recommendation: string;
    severity: 'info' | 'warning' | 'error';
  } | null;

  // Trade Direction
  isLong: boolean;

  // Calculation Timestamp
  calculatedAt: number;
}

/**
 * UI state
 */
export interface UIState {
  showAdvancedOptions: boolean;
  showVolatilitySettings: boolean;
  showPolicyModal: boolean;
  activeTab: 'calculator' | 'history' | 'learn';
}

/**
 * Complete store state
 */
interface RiskSizingStore {
  // State
  inputs: CalculatorInputs;
  policy: RiskPolicy;
  outputs: CalculationOutputs | null;
  ui: UIState;

  // Input Actions
  updateInputs: (updates: Partial<CalculatorInputs>) => void;
  setInput: <K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K]
  ) => void;
  resetInputs: () => void;

  // Policy Actions
  updatePolicy: (updates: Partial<RiskPolicy>) => void;
  resetPolicy: () => void;

  // Calculation Actions
  calculate: () => void;
  clearOutputs: () => void;

  // UI Actions
  toggleAdvancedOptions: () => void;
  toggleVolatilitySettings: () => void;
  setActiveTab: (tab: UIState['activeTab']) => void;
  setPolicyModalOpen: (open: boolean) => void;

  // Utility Actions
  reset: () => void; // Reset everything
  exportState: () => string; // Export for sharing/debugging
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialInputs: CalculatorInputs = {
  freeCapital: DEFAULT_INPUTS.freeCapital,
  ytdPnL: DEFAULT_INPUTS.ytdPnL,
  conviction: DEFAULT_INPUTS.conviction,
  volatilityClass: DEFAULT_INPUTS.volatilityClass,
  timeHorizon: DEFAULT_INPUTS.timeHorizon,
  entryPrice: DEFAULT_INPUTS.entryPrice,
  stopLoss: DEFAULT_INPUTS.stopLoss,
  slippage: DEFAULT_INPUTS.slippage,
  instrumentMultiplier: DEFAULT_INPUTS.instrumentMultiplier,
};

const initialPolicy: RiskPolicy = {
  typeI: {
    basePctOfFC: DEFAULT_RISK_POLICY.typeI.basePctOfFC,
    ytdPct: DEFAULT_RISK_POLICY.typeI.ytdPct,
  },
  typeII: {
    basePctOfFC: DEFAULT_RISK_POLICY.typeII.basePctOfFC,
    ytdPct: DEFAULT_RISK_POLICY.typeII.ytdPct,
  },
  typeIII: {
    basePctOfFC: DEFAULT_RISK_POLICY.typeIII.basePctOfFC,
    ytdPct: DEFAULT_RISK_POLICY.typeIII.ytdPct,
    hardCapPctOfFreePlusYTD: DEFAULT_RISK_POLICY.typeIII.hardCapPctOfFreePlusYTD,
  },
  maxSingleTradePct: DEFAULT_RISK_POLICY.maxSingleTradePct,
  monthlyStopCapPct: DEFAULT_RISK_POLICY.monthlyStopCapPct,
  volatility: {
    enabled: true, // Volatility features enabled by default in v2
    multipliers: {
      [VolatilityClass.ULTRA_LOW]: 2.0,
      [VolatilityClass.LOW]: 1.5,
      [VolatilityClass.MEDIUM]: 1.0,
      [VolatilityClass.HIGH]: 0.5,
      [VolatilityClass.ULTRA_HIGH]: 0.3,
    },
    atrEnabled: true,
    atrPeriod: 14,
  },
  defaultRMultipleTarget: DEFAULT_RISK_POLICY.defaultRMultipleTarget,
  rMultipleAlerts: DEFAULT_RISK_POLICY.rMultipleAlerts,
};

const initialUI: UIState = {
  showAdvancedOptions: false,
  showVolatilitySettings: false,
  showPolicyModal: false,
  activeTab: 'calculator',
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useRiskSizingStore = create<RiskSizingStore>()(
  persist(
    (set, get) => ({
      // Initial State
      inputs: initialInputs,
      policy: initialPolicy,
      outputs: null,
      ui: initialUI,

      // Input Actions
      updateInputs: (updates) => {
        set((state) => ({
          inputs: { ...state.inputs, ...updates },
        }));

        // Auto-calculate if we have valid entry and stop
        const { inputs } = get();
        if (inputs.entryPrice > 0 && inputs.stopLoss > 0) {
          get().calculate();
        }
      },

      setInput: (key, value) => {
        set((state) => ({
          inputs: { ...state.inputs, [key]: value },
        }));

        // Auto-calculate if we have valid entry and stop
        const { inputs } = get();
        if (inputs.entryPrice > 0 && inputs.stopLoss > 0) {
          get().calculate();
        }
      },

      resetInputs: () => {
        set({ inputs: initialInputs, outputs: null });
      },

      // Policy Actions
      updatePolicy: (updates) => {
        set((state) => ({
          policy: { ...state.policy, ...updates },
        }));

        // Recalculate if we have outputs
        if (get().outputs) {
          get().calculate();
        }
      },

      resetPolicy: () => {
        set({ policy: initialPolicy });

        // Recalculate if we have outputs
        if (get().outputs) {
          get().calculate();
        }
      },

      // Calculation Actions
      calculate: () => {
        const { inputs, policy } = get();

        try {
          // Prepare inputs for calculation engine
          const result = calculate({
            // Account
            freeCapital: inputs.freeCapital,
            ytdPnL: inputs.ytdPnL,

            // Trade Parameters
            entry: inputs.entryPrice,
            stop: inputs.stopLoss,
            conviction: inputs.conviction,

            // Optional Parameters
            slippage: inputs.slippage,
            multiplier: inputs.instrumentMultiplier,
            rrTarget: policy.defaultRMultipleTarget,
            monthlyStopLoss: inputs.monthlyStopLoss,

            // Volatility (NEW in v2)
            volatilityClass: policy.volatility.enabled
              ? inputs.volatilityClass
              : undefined,
            atr: inputs.customATR,
            atrPeriod: policy.volatility.atrPeriod,
          });

          // Calculate derived values
          const positionValue = result.finalPositionSize * inputs.entryPrice;
          const riskPercentage = (result.dollarRisk / inputs.freeCapital) * 100;
          const riskDistance = Math.abs(inputs.entryPrice - inputs.stopLoss);
          const takeProfitDistance = Math.abs(result.takeProfitPrice - inputs.entryPrice);
          const takeProfitValue = (takeProfitDistance / riskDistance) * result.dollarRisk;

          // Transform warnings to alerts
          const alerts: Array<{
            level: 'info' | 'warning' | 'danger';
            message: string;
            type: string;
          }> = [];

          // Add cap warnings as alerts
          result.riskCalculation.warnings.forEach((warning) => {
            alerts.push({
              level: 'warning',
              message: warning.message,
              type: warning.type.toUpperCase().replace(/_/g, ' '),
            });
          });

          // Add high risk alert if > 3%
          if (riskPercentage > 3) {
            alerts.push({
              level: riskPercentage > 5 ? 'danger' : 'warning',
              message: `High risk allocation: ${riskPercentage.toFixed(2)}% of capital`,
              type: 'HIGH_RISK',
            });
          }

          // Add ATR warning if available
          if (result.atrAnalysis && result.atrAnalysis.severity === 'warning') {
            alerts.push({
              level: 'warning',
              message: result.atrAnalysis.recommendation,
              type: 'VOLATILITY_WARNING',
            });
          }

          // Transform calculation result to store format
          const outputs: CalculationOutputs = {
            dollarRisk: result.dollarRisk,
            riskPercentage,
            positionSize: result.finalPositionSize,
            positionValue,
            basePositionSize: result.basePositionSize,
            volatilityMultiplier: result.volatilityAdjustment?.multiplier ?? 1.0,
            volatilityAdjustment: result.volatilityAdjustment?.adjustment ?? null,
            takeProfitPrice: result.takeProfitPrice,
            takeProfitValue,
            rMultiple: {
              current: 0, // At entry, no profit/loss yet
              target: policy.defaultRMultipleTarget,
              breakeven: 0, // Breakeven is at entry (0R)
            },
            appliedCaps: result.riskCalculation.warnings.map((w) => w.message),
            alerts,
            atrAnalysis: result.atrAnalysis
              ? {
                  atr: result.atrAnalysis.atr,
                  atrPct: result.atrAnalysis.atrPct,
                  stopInATR: result.atrAnalysis.stopInATR,
                  recommendation: result.atrAnalysis.recommendation,
                  severity: result.atrAnalysis.severity,
                }
              : null,
            isLong: result.isLong,
            calculatedAt: Date.now(),
          };

          set({ outputs });
        } catch (error) {
          console.error('Calculation error:', error);
          // Could set an error state here
          set({ outputs: null });
        }
      },

      clearOutputs: () => {
        set({ outputs: null });
      },

      // UI Actions
      toggleAdvancedOptions: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            showAdvancedOptions: !state.ui.showAdvancedOptions,
          },
        }));
      },

      toggleVolatilitySettings: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            showVolatilitySettings: !state.ui.showVolatilitySettings,
          },
        }));
      },

      setActiveTab: (tab) => {
        set((state) => ({
          ui: { ...state.ui, activeTab: tab },
        }));
      },

      setPolicyModalOpen: (open) => {
        set((state) => ({
          ui: { ...state.ui, showPolicyModal: open },
        }));
      },

      // Utility Actions
      reset: () => {
        set({
          inputs: initialInputs,
          policy: initialPolicy,
          outputs: null,
          ui: initialUI,
        });
      },

      exportState: () => {
        const state = get();
        return JSON.stringify(
          {
            inputs: state.inputs,
            policy: state.policy,
            outputs: state.outputs,
            version: 'v2.0.0',
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );
      },
    }),

    // Persistence Configuration
    {
      name: 'risk-sizing-v2-storage', // Versioned storage key
      storage: createJSONStorage(() => localStorage),

      // Only persist inputs and policy, not outputs or UI state
      partialize: (state) => ({
        inputs: state.inputs,
        policy: state.policy,
      }),

      // Version for migration support
      version: 2,

      // Migration function for future versions
      migrate: (persistedState: any, version: number) => {
        // If migrating from v1 or unversioned storage
        if (version < 2) {
          // Could map old conviction labels here if needed
          // But since we're starting fresh, this is just a placeholder
          return persistedState;
        }
        return persistedState;
      },
    }
  )
);

// ============================================================================
// SELECTOR HOOKS (for optimized component re-renders)
// ============================================================================

/**
 * Select only inputs (avoids re-render when outputs change)
 */
export const useInputs = () => useRiskSizingStore((state) => state.inputs);

/**
 * Select only outputs (avoids re-render when inputs change)
 */
export const useOutputs = () => useRiskSizingStore((state) => state.outputs);

/**
 * Select only policy (avoids re-render when inputs/outputs change)
 */
export const usePolicy = () => useRiskSizingStore((state) => state.policy);

/**
 * Select only UI state
 */
export const useUI = () => useRiskSizingStore((state) => state.ui);

/**
 * Select specific input value (most granular, best performance)
 */
export const useInput = <K extends keyof CalculatorInputs>(key: K) =>
  useRiskSizingStore((state) => state.inputs[key]);

/**
 * Select calculation action (doesn't cause re-renders)
 */
export const useCalculate = () => useRiskSizingStore((state) => state.calculate);

/**
 * Select input update action (doesn't cause re-renders)
 */
export const useUpdateInputs = () =>
  useRiskSizingStore((state) => state.updateInputs);

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get current state snapshot (useful for debugging)
 */
export const getStateSnapshot = () => useRiskSizingStore.getState();

/**
 * Check if calculator has valid inputs for calculation
 */
export const hasValidInputs = () => {
  const { inputs } = useRiskSizingStore.getState();
  return (
    inputs.freeCapital > 0 &&
    inputs.entryPrice > 0 &&
    inputs.stopLoss > 0 &&
    inputs.entryPrice !== inputs.stopLoss
  );
};

/**
 * Check if volatility features are enabled
 */
export const isVolatilityEnabled = () => {
  const { policy } = useRiskSizingStore.getState();
  return policy.volatility.enabled;
};
