# Risk Sizing Calculator v2

**Professional position sizing calculator for traders with advanced volatility-adjusted risk management.**

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Tests](https://img.shields.io/badge/tests-118%20passing-brightgreen.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Calculation Methodology](#calculation-methodology)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Disclaimer](#disclaimer)

## Overview

The Risk Sizing Calculator v2 is a sophisticated tool designed for active traders who need precise position sizing calculations. It implements professional risk management principles including:

- **Conviction-based position sizing** (Type I/II/III risk levels)
- **YTD P&L scaling** (Kelly Criterion inspired)
- **Volatility-adjusted positions** (NEW in v2) - 5 volatility classes
- **Hierarchical risk caps** for capital preservation
- **ATR-based stop analysis** for optimal stop placement
- **R-multiple trade management** for consistent profit targets

### Why Use This Calculator?

- **Consistent Risk Management**: Never risk too much on any single trade
- **Adaptable Sizing**: Position sizes adjust based on instrument volatility
- **Educational**: Learn the math behind professional position sizing
- **Exportable**: Save your trade plans as markdown files
- **Fast**: Instant calculations as you type

## Features

### Core Calculation Engine

- **Conviction-Based Risk Allocation**
  - Type I (High): 5% base risk + 15% YTD scaling
  - Type II (Medium): 3% base risk + 10% YTD scaling
  - Type III (Low): 1% base risk + 5% YTD scaling

- **Volatility-Adjusted Position Sizing** (NEW v2)
  - Ultra Low (<20% annualized): 2.0x position size
  - Low (20-40%): 1.5x position size
  - Medium (40-60%): 1.0x baseline
  - High (60-100%): 0.5x position size
  - Ultra High (>100%): 0.3x position size

- **Risk Caps**
  - Monthly stop loss protection (25% max)
  - Type III hard cap (10% of capital)
  - Absolute maximum (5% per trade)

- **ATR Analysis**
  - Optimal stop placement recommendations
  - Stop distance in ATR multiples
  - Volatility warnings

### User Interface

- **InputCard**: Clean, intuitive trade setup form
- **OutputCard**: Comprehensive results with visual hierarchy
- **VolatilityImpactCard**: Visual comparison of position sizes across volatility levels
- **PolicyModal**: Configurable risk settings and multipliers
- **LearnDrawer**: 9 educational articles on risk management
- **CalculationBreakdownModal**: Step-by-step math transparency
- **Export to Markdown**: Save trade plans for record-keeping
- **Tooltips**: Contextual help on all inputs

### Educational Content

The calculator includes comprehensive educational materials:

1. **Risk Management Basics**
2. **Conviction Types Explained** (Type I/II/III)
3. **YTD P&L Scaling** (Kelly Criterion)
4. **R-Multiples Guide**
5. **What is Volatility?** (NEW v2)
6. **ATR Explained** (NEW v2)
7. **Position Size Adjustment** (NEW v2)
8. **Trade Management Plan**
9. **Risk of Ruin**

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/risk-sizing-calculator.git

# Navigate to project directory
cd risk-sizing-calculator

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Quick Start

1. **Enter your account details**
   - Free Capital: Your available trading capital
   - YTD P&L: Your year-to-date profit/loss

2. **Set up your trade**
   - Conviction Level: How confident are you? (Type I/II/III)
   - Volatility Class: What's the instrument's volatility?
   - Entry Price and Stop Loss

3. **Review results**
   - Position Size: How many shares/contracts to trade
   - Dollar Risk: Your 1R risk amount
   - Take Profit Target: Your 2R profit target

4. **Export your trade plan** (optional)
   - Click "Export" to save as markdown
   - Includes all calculations and trade management checklist

## Usage Guide

### Understanding Conviction Levels

**Type I - High Conviction (5% base risk)**
- Best setups with multiple confluences
- Strong technical and fundamental alignment
- Highest probability trades

**Type II - Medium Conviction (3% base risk)**
- Solid standard trades
- Good technical setup
- Normal risk/reward scenarios

**Type III - Low Conviction (1% base risk)**
- Testing new strategies
- Uncertain market conditions
- Lower probability setups

### Volatility Classification

Choose the volatility class that matches your instrument:

- **Ultra Low**: Major FX pairs, Treasuries
- **Low**: Blue-chip stocks (AAPL, MSFT)
- **Medium**: Most S&P 500 stocks
- **High**: Small-caps, BTC/USD
- **Ultra High**: Penny stocks, meme coins, 3x ETFs

The calculator automatically adjusts position size based on volatility to maintain consistent risk.

### Configuring Risk Policy

Click "Edit Policy" to customize:

- Conviction level risk percentages
- YTD scaling percentages
- Volatility multipliers
- Risk cap thresholds
- R-multiple targets

Changes are auto-saved to browser localStorage.

### Exporting Trade Plans

The Export feature generates a comprehensive markdown file including:

- Trade setup parameters
- Account information
- Position sizing breakdown
- Risk/reward analysis
- Volatility adjustments
- Trade management checklist
- Notes sections for thesis and review

Perfect for:
- Trade journals
- Performance tracking
- Regulatory compliance
- Team collaboration

## Calculation Methodology

### Position Sizing Formula

```
1. Base Risk = (Conviction % × Free Capital) + (YTD % × max(0, YTD P&L))

2. Apply Risk Caps:
   - Monthly stop cap (if applicable)
   - Type III hard cap (for low conviction)
   - Absolute maximum cap

3. Calculate Base Position = Final Risk ÷ (Entry - Stop)

4. Apply Volatility Adjustment:
   Final Position = Base Position × Volatility Multiplier

5. Calculate Take Profit = Entry + (Entry - Stop) × R-Multiple
```

### Risk Hierarchy

Risk caps are applied in order of priority:

1. **Monthly Stop Cap**: 25% of monthly stop loss (highest priority)
2. **Type III Cap**: 10% of (Free Capital + YTD) for low conviction
3. **Absolute Max**: 5% of Free Capital (applies to all trades)

This ensures no single trade can significantly damage your account.

### Volatility Adjustment Logic

The volatility multiplier scales position size inversely with volatility:

- **Lower volatility** = Larger position (more shares with smaller stops)
- **Higher volatility** = Smaller position (fewer shares with wider stops)

This maintains consistent dollar risk across instruments with different volatility profiles.

## Technology Stack

### Frontend

- **Next.js 16.0.0** - React framework with Turbopack
- **React 19.2.0** - UI library
- **TypeScript 5.x** - Type safety
- **Tailwind CSS v4** - Styling
- **Zustand 5.x** - State management
- **Zod 4.x** - Runtime validation

### Testing

- **Vitest 4.x** - Unit testing
- **@testing-library/react** - Component testing
- **118 test cases** - Comprehensive coverage

### Development

- **ESLint** - Code linting
- **TypeScript strict mode** - Maximum type safety
- **Git** - Version control

## Project Structure

```
risk-sizing-calculator/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Main calculator page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/
│   ├── calculator/          # Calculator-specific components
│   │   ├── InputCard.tsx
│   │   ├── OutputCard.tsx
│   │   ├── VolatilityImpactCard.tsx
│   │   ├── PolicyModal.tsx
│   │   ├── LearnDrawer.tsx
│   │   └── CalculationBreakdownModal.tsx
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Badge.tsx
│       ├── Modal.tsx
│       ├── Tooltip.tsx
│       ├── ButtonGroup.tsx
│       └── Footer.tsx
├── lib/
│   ├── calculator/          # Calculation engine
│   │   ├── calculations.ts  # Core logic
│   │   └── __tests__/       # 59 calculation tests
│   ├── store.ts            # Zustand state management
│   ├── schemas.ts          # Zod validation schemas
│   ├── constants.ts        # Configuration constants
│   ├── content.ts          # Educational content
│   └── export.ts           # Markdown export utility
├── types/
│   ├── calculator.ts       # Calculator type definitions
│   └── volatility.ts       # Volatility type definitions
└── __tests__/              # Additional tests

```

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Building
npm run build        # Production build
npm run start        # Start production server

# Testing
npm test             # Run all tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report

# Linting
npm run lint         # Run ESLint
```

### Development Workflow

1. **Make changes** to components or logic
2. **Run tests** to ensure nothing broke
3. **Build** to verify TypeScript compilation
4. **Commit** with descriptive message
5. **Push** to repository

### Adding New Features

1. **Update types** in `types/` directory
2. **Implement logic** in `lib/calculator/`
3. **Write tests** in `__tests__` directories
4. **Create components** in `components/`
5. **Update documentation** in README

## Testing

The project has comprehensive test coverage:

- **59 calculation tests** - Core position sizing logic
- **59 validation tests** - Input validation and edge cases
- **Total: 118 tests** - All passing

Run tests:

```bash
npm test                    # Run all tests
npm run test:ui             # Interactive test UI
npm run test:coverage       # Coverage report
```

Test files:
- `lib/calculator/__tests__/calculations.test.ts`
- `lib/calculator/__tests__/spec-verification.test.ts`
- `lib/__tests__/schemas.test.ts`

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Configure build settings**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Deploy**

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Environment Variables

No environment variables required for basic functionality. All settings are stored in browser localStorage.

## Disclaimer

**IMPORTANT: This calculator is for educational purposes only.**

### Not Financial Advice

This tool is provided for informational and educational purposes only. It is not intended to be, and should not be construed as, financial, investment, or trading advice.

### Risk Warning

Trading and investing involve substantial risk of loss and are not suitable for every investor. Past performance does not guarantee future results. You could lose some or all of your initial investment.

### No Warranties

This software is provided "as is" without warranties or guarantees of any kind. Use at your own risk.

### Seek Professional Advice

Before making any trading or investment decisions, consult with qualified financial advisors and perform your own due diligence.

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Support

For issues, questions, or suggestions:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/risk-sizing-calculator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/risk-sizing-calculator/discussions)

## Acknowledgments

Built with:
- Kelly Criterion principles for position sizing
- Professional risk management best practices
- Modern web development tools and frameworks

---

**Made for traders who take risk management seriously**

*Last updated: October 27, 2025*
