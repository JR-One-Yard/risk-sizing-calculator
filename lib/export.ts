/**
 * Export Utility
 * Generates markdown export of trade plan
 */

import type { CalculatorInputs } from '@/types/calculator';
import type { VolatilityClass } from '@/types/volatility';
import type { CalculationOutputs } from '@/lib/store';

interface ExportData {
  inputs: CalculatorInputs;
  results: CalculationOutputs | null;
  timestamp: string;
}

/**
 * Format currency values
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage values
 */
function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get volatility class label
 */
function getVolatilityLabel(volatilityClass: VolatilityClass): string {
  const labels: Record<VolatilityClass, string> = {
    ULTRA_LOW: 'Ultra Low',
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    ULTRA_HIGH: 'Ultra High',
  };
  return labels[volatilityClass];
}

/**
 * Get conviction label
 */
function getConvictionLabel(conviction: 'I' | 'II' | 'III'): string {
  const labels = {
    'I': 'Type I - High Conviction',
    'II': 'Type II - Medium Conviction',
    'III': 'Type III - Low Conviction',
  };
  return labels[conviction];
}

/**
 * Get time horizon label
 */
function getTimeHorizonLabel(timeHorizon: 'day' | 'swing' | 'position'): string {
  const labels = {
    'day': 'Day Trade',
    'swing': 'Swing Trade',
    'position': 'Position Trade',
  };
  return labels[timeHorizon];
}

/**
 * Generate markdown trade plan
 */
export function generateTradePlanMarkdown(data: ExportData): string {
  const { inputs, results, timestamp } = data;

  let markdown = `# Trade Plan\n\n`;
  markdown += `**Generated:** ${timestamp}\n\n`;
  markdown += `---\n\n`;

  // ========================================================================
  // TRADE SETUP
  // ========================================================================
  markdown += `## Trade Setup\n\n`;
  markdown += `| Parameter | Value |\n`;
  markdown += `|-----------|-------|\n`;
  markdown += `| **Conviction Level** | ${getConvictionLabel(inputs.conviction)} |\n`;
  markdown += `| **Volatility Class** | ${getVolatilityLabel(inputs.volatilityClass)} |\n`;
  markdown += `| **Time Horizon** | ${getTimeHorizonLabel(inputs.timeHorizon)} |\n`;
  markdown += `| **Entry Price** | ${formatCurrency(inputs.entryPrice)} |\n`;
  markdown += `| **Stop Loss** | ${formatCurrency(inputs.stopLoss)} |\n`;

  if (results) {
    markdown += `| **Take Profit** | ${formatCurrency(results.takeProfitPrice)} |\n`;
  }

  markdown += `\n`;

  // ========================================================================
  // ACCOUNT INFORMATION
  // ========================================================================
  markdown += `## Account Information\n\n`;
  markdown += `| Parameter | Value |\n`;
  markdown += `|-----------|-------|\n`;
  markdown += `| **Free Capital** | ${formatCurrency(inputs.freeCapital)} |\n`;
  markdown += `| **YTD P&L** | ${formatCurrency(inputs.ytdPnL)} |\n`;

  if (inputs.monthlyStopLoss !== undefined) {
    markdown += `| **Monthly Stop Loss** | ${formatCurrency(inputs.monthlyStopLoss)} |\n`;
  }

  markdown += `\n`;

  // ========================================================================
  // POSITION SIZING (if results available)
  // ========================================================================
  if (results) {
    markdown += `## Position Sizing\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| **Dollar Risk** | ${formatCurrency(results.dollarRisk)} |\n`;
    markdown += `| **Risk Percentage** | ${formatPercent(results.riskPercentage)} |\n`;
    markdown += `| **Position Size** | ${Math.floor(results.positionSize).toLocaleString()} shares |\n`;
    markdown += `| **Position Value** | ${formatCurrency(results.positionValue)} |\n`;
    markdown += `| **Volatility Multiplier** | ${results.volatilityMultiplier.toFixed(2)}x |\n`;
    markdown += `\n`;

    // ========================================================================
    // RISK/REWARD ANALYSIS
    // ========================================================================
    markdown += `## Risk/Reward Analysis\n\n`;
    const riskAmount = Math.abs(inputs.entryPrice - inputs.stopLoss);
    const rewardAmount = results ? Math.abs(results.takeProfitPrice - inputs.entryPrice) : 0;

    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| **Risk per Share** | ${formatCurrency(riskAmount)} |\n`;
    markdown += `| **Reward per Share** | ${formatCurrency(rewardAmount)} |\n`;
    markdown += `| **R-Multiple Target** | ${results.rMultiple.target}R |\n`;
    markdown += `| **Current R-Multiple** | ${results.rMultiple.current.toFixed(2)}R |\n`;
    markdown += `| **Breakeven R** | ${results.rMultiple.breakeven.toFixed(2)}R |\n`;
    markdown += `| **Potential Profit** | ${formatCurrency(results.takeProfitValue)} |\n`;
    markdown += `\n`;

    // ========================================================================
    // APPLIED ADJUSTMENTS
    // ========================================================================
    if (results.appliedCaps.length > 0 || results.volatilityMultiplier !== 1.0) {
      markdown += `## Applied Adjustments\n\n`;

      if (results.volatilityMultiplier !== 1.0) {
        markdown += `### Volatility Adjustment\n`;
        markdown += `- Volatility class: ${getVolatilityLabel(inputs.volatilityClass)}\n`;
        markdown += `- Volatility multiplier: ${results.volatilityMultiplier.toFixed(2)}x\n`;
        if (results.volatilityAdjustment) {
          markdown += `- Position size adjustment: ${Math.floor(results.volatilityAdjustment).toLocaleString()} shares\n`;
        }
        markdown += `\n`;
      }

      if (results.appliedCaps.length > 0) {
        markdown += `### Risk Caps Applied\n`;
        results.appliedCaps.forEach(cap => {
          markdown += `- ${cap}\n`;
        });
        markdown += `\n`;
      }
    }

    // ========================================================================
    // ALERTS & WARNINGS
    // ========================================================================
    if (results.alerts && results.alerts.length > 0) {
      markdown += `## Alerts & Warnings\n\n`;
      results.alerts.forEach(alert => {
        const emoji = alert.level === 'danger' ? '🔴' : alert.level === 'warning' ? '⚠️' : 'ℹ️';
        markdown += `${emoji} **${alert.level.toUpperCase()}:** ${alert.message}\n\n`;
      });
    }
  }

  // ========================================================================
  // TRADE MANAGEMENT PLAN
  // ========================================================================
  markdown += `## Trade Management Plan\n\n`;
  markdown += `### Entry\n`;
  markdown += `- [ ] Entry price confirmed: ${formatCurrency(inputs.entryPrice)}\n`;
  markdown += `- [ ] Position size verified: ${results ? Math.floor(results.positionSize).toLocaleString() : 'N/A'} shares\n`;
  markdown += `- [ ] Stop loss order placed: ${formatCurrency(inputs.stopLoss)}\n\n`;

  markdown += `### Exit\n`;
  markdown += `- [ ] Take profit order placed: ${results ? formatCurrency(results.takeProfitPrice) : 'N/A'}\n`;
  markdown += `- [ ] Trailing stop strategy defined\n`;
  markdown += `- [ ] Scale-out levels identified (if applicable)\n\n`;

  markdown += `### Monitoring\n`;
  markdown += `- [ ] Set price alerts at key levels\n`;
  markdown += `- [ ] Review trade daily/as appropriate\n`;
  markdown += `- [ ] Document reasons for early exit (if applicable)\n\n`;

  // ========================================================================
  // NOTES SECTION
  // ========================================================================
  markdown += `## Trade Notes\n\n`;
  markdown += `### Trade Thesis\n`;
  markdown += `<!-- Add your trade thesis and analysis here -->\n\n`;

  markdown += `### Exit Rationale\n`;
  markdown += `<!-- Document why you exited (when trade is closed) -->\n\n`;

  markdown += `### Lessons Learned\n`;
  markdown += `<!-- Post-trade review notes -->\n\n`;

  // ========================================================================
  // DISCLAIMER
  // ========================================================================
  markdown += `---\n\n`;
  markdown += `**Disclaimer:** This trade plan is for personal use only. Trading involves substantial risk of loss. `;
  markdown += `This document is not financial advice. Always perform your own analysis and risk assessment.\n\n`;
  markdown += `*Generated by Risk Sizing Calculator v2*\n`;

  return markdown;
}

/**
 * Download markdown file
 */
export function downloadMarkdown(markdown: string, filename?: string): void {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const defaultFilename = `trade-plan-${timestamp}.md`;
  const finalFilename = filename || defaultFilename;

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Main export function - generates and downloads trade plan
 */
export function exportTradePlan(
  inputs: CalculatorInputs,
  results: CalculationOutputs | null,
  filename?: string
): void {
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const data: ExportData = {
    inputs,
    results,
    timestamp,
  };

  const markdown = generateTradePlanMarkdown(data);
  downloadMarkdown(markdown, filename);
}
