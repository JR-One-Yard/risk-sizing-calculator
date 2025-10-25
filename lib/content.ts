/**
 * Educational Content Library
 * Articles and tooltips for the Learn Drawer
 */

export interface Article {
  id: string;
  title: string;
  category: 'basics' | 'volatility' | 'advanced';
  content: string;
  order: number;
}

export const ARTICLES: Article[] = [
  // BASICS CATEGORY
  {
    id: 'risk-management-basics',
    title: 'Risk Management Basics',
    category: 'basics',
    order: 1,
    content: `
# Risk Management Basics

Position sizing is the foundation of successful trading. It's not about *what* you trade, but *how much* you trade.

## The Core Principle

**Never risk more than you can afford to lose on a single trade.**

Most professional traders risk 1-2% of their capital per trade. This calculator helps you:
- Calculate exact position sizes based on your risk tolerance
- Ensure consistent risk across all trades
- Protect your capital from catastrophic losses

## Why Position Sizing Matters

Imagine two traders:
- **Trader A** risks 10% per trade. After 3 consecutive losses (30% drawdown), they need a 43% gain to recover.
- **Trader B** risks 2% per trade. After 3 consecutive losses (6% drawdown), they need only a 6.4% gain to recover.

Who's more likely to survive and thrive? Trader B, every time.

## The Math That Saves Accounts

This calculator uses a simple formula:

\`\`\`
Position Size = Dollar Risk ÷ (Entry Price - Stop Loss Price)
\`\`\`

If you want to risk $500 on a stock at $100 with a stop at $95:
- Risk per share = $100 - $95 = $5
- Position Size = $500 ÷ $5 = 100 shares

This ensures you lose exactly $500 if stopped out—no more, no less.
    `,
  },
  {
    id: 'conviction-types',
    title: 'Conviction Types Explained',
    category: 'basics',
    order: 2,
    content: `
# Conviction Types Explained

Not all trades are created equal. Your conviction level should determine how much you risk.

## The Three Conviction Levels

### Type I - High Conviction (5% base risk)
These are your **A+ setups**:
- All indicators align
- Strong fundamental catalyst
- Perfect technical setup
- You've done extensive research
- High confidence in the outcome

**Example:** A stock breaking out of a 6-month consolidation with strong earnings and increasing volume.

### Type II - Medium Conviction (3% base risk)
These are your **solid setups**:
- Good technical setup
- Reasonable fundamental support
- Standard probability trade
- Normal confidence level

**Example:** A stock bouncing off a key support level with decent volume.

### Type III - Low Conviction (1% base risk)
These are your **experimental or lower-probability trades**:
- Testing a new strategy
- Weaker setup but acceptable
- Learning opportunity
- Lower confidence

**Example:** A new trading pattern you're trying out, or a counter-trend trade.

## Why This Matters

By varying your position size with conviction, you:
1. **Maximize gains** on your best setups
2. **Minimize losses** on experimental trades
3. **Adapt** your risk to the quality of the opportunity
4. **Stay flexible** while maintaining discipline

## Important Note

**Conviction ≠ Certainty**

Even Type I trades can lose. Conviction just means you've done your homework and the setup meets your highest standards. Always use a stop loss.
    `,
  },
  {
    id: 'ytd-scaling',
    title: 'YTD P&L Scaling',
    category: 'basics',
    order: 3,
    content: `
# YTD P&L Scaling

Should you risk more when you're winning? This calculator uses the **Kelly Criterion** principle to scale your risk based on performance.

## The Concept

**When you're profitable, you have more capital to deploy.** This calculator factors your Year-to-Date (YTD) P&L into position sizing:

- **Positive YTD**: Slightly increase position size (you've proven you can trade profitably this year)
- **Negative YTD**: Maintain or slightly reduce position size (protect remaining capital)

## How It Works

The formula:
\`\`\`
Adjusted Risk = Base Risk + (YTD P&L × YTD Scaling %)
\`\`\`

Example with $100,000 capital:
- Base risk: 2% = $2,000
- YTD P&L: +$10,000 (10% gain)
- YTD Scaling: 25% (policy setting)
- Bonus risk: $10,000 × 25% = $2,500
- **Total risk: $2,000 + $2,500 = $4,500**

## Risk Caps Still Apply

YTD scaling **never** overrides your hard caps:
- Monthly Stop Cap
- Max Single Trade Cap
- Type III Hard Cap

If your scaled risk exceeds these limits, the calculator uses the cap instead.

## When to Use This

YTD scaling makes sense when:
- ✅ You're consistently profitable
- ✅ You want to compound gains faster
- ✅ You understand the increased risk

Consider disabling if:
- ❌ You're in a drawdown
- ❌ You're learning a new strategy
- ❌ Market conditions are choppy

## Conservative vs Aggressive

**Conservative traders**: Use 10-20% YTD scaling
**Moderate traders**: Use 25-35% YTD scaling
**Aggressive traders**: Use 40-50% YTD scaling

Remember: Higher scaling = higher volatility in your equity curve.
    `,
  },
  {
    id: 'r-multiples',
    title: 'R-Multiples Guide',
    category: 'basics',
    order: 4,
    content: `
# R-Multiples: The Universal Trade Metric

R-multiples are the secret language of professional traders. They measure profit and loss relative to your initial risk.

## What is an R-Multiple?

**R = Your Initial Risk**

If you risk $500 on a trade:
- Lose $500 = **-1R**
- Make $0 = **0R** (breakeven)
- Make $500 = **+1R**
- Make $1,000 = **+2R**
- Make $2,500 = **+5R**

## Why R-Multiples Matter

1. **Standardization**: Compare trades across different instruments, position sizes, and account sizes
2. **Expectancy**: Calculate your edge mathematically
3. **Psychology**: Focus on risk-reward, not dollar amounts
4. **Strategy Analysis**: Identify which setups are most profitable

## R-Multiple Expectancy

Your trading edge comes from this formula:

\`\`\`
Expectancy = (Win Rate × Avg Win) - (Loss Rate × Avg Loss)
\`\`\`

Example:
- Win Rate: 40%
- Avg Win: 3R
- Loss Rate: 60%
- Avg Loss: 1R

**Expectancy = (0.40 × 3R) - (0.60 × 1R) = 1.2R - 0.6R = +0.6R per trade**

Over 100 trades, you'd expect to make 60R profit.

## Practical Application

### Setting Targets
Instead of "$1,000 profit goal," think:
- **First target: 2R** (take partial profit)
- **Runner target: 5R+** (let winners run)
- **Stop loss: -1R** (always)

### Evaluating Performance
Track your R-multiples:
- **-1R to 0R**: Stop hit or breakeven
- **0R to 1R**: Small win
- **1R to 3R**: Good win
- **3R+**: Excellent win

### Building Confidence
After 50+ trades, you'll know your expectancy. If it's positive, trust your system and stay disciplined.

## The 2:1 Minimum Rule

This calculator defaults to a **2:1 reward-to-risk ratio** (2R target). Why?

- Gives you room to be wrong 50% of the time and still profit
- Encourages you to let winners run
- Focuses on quality over quantity

With a 40% win rate and 2R average wins vs 1R average losses:
- **You make money:** (0.40 × 2R) - (0.60 × 1R) = +0.2R per trade

## Advanced: The R-Multiple Ladder

Professional traders often scale out:
1. **1R**: Sell 25% (lock in a win)
2. **2R**: Sell 25% (bank profits)
3. **3R+**: Trail stop on remaining 50%

This balances taking profits with letting winners run.
    `,
  },

  // VOLATILITY CATEGORY
  {
    id: 'what-is-volatility',
    title: 'What is Volatility?',
    category: 'volatility',
    order: 5,
    content: `
# What is Volatility?

Volatility is the degree of price movement in an instrument. Understanding it is crucial for proper position sizing.

## The Basics

**Volatility = How much prices move**

- **Low volatility**: Prices move slowly and steadily (e.g., utility stocks, bonds)
- **High volatility**: Prices swing wildly (e.g., small-cap stocks, crypto)

## Why Volatility Matters for Position Sizing

Imagine two stocks:
- **Stock A** moves an average of 1% per day
- **Stock B** moves an average of 5% per day

If you use the same position size and stop distance for both:
- Stock A might take days to hit your stop
- Stock B could hit your stop in hours due to normal noise

**Solution:** Adjust position size based on volatility.

## The Five Volatility Classes

This calculator uses 5 classes based on **annualized volatility**:

### 1. ULTRA LOW (< 20% annualized)
**Examples:** Utilities (XLU), Large-cap staples (PG, JNJ)
**Multiplier:** 2.0x (double position size)
**Why:** Stable prices allow larger positions with same risk

### 2. LOW (20-30% annualized)
**Examples:** Blue chips (AAPL, MSFT), Equity ETFs (SPY, QQQ)
**Multiplier:** 1.5x
**Why:** Predictable movement allows slightly larger size

### 3. MEDIUM (30-50% annualized)
**Examples:** Growth stocks (many NASDAQ stocks), sector ETFs
**Multiplier:** 1.0x (standard size)
**Why:** This is the baseline—normal stock volatility

### 4. HIGH (50-80% annualized)
**Examples:** Small-caps, biotech, leveraged ETFs
**Multiplier:** 0.5x (half position size)
**Why:** Larger swings = need smaller size to manage risk

### 5. ULTRA HIGH (> 80% annualized)
**Examples:** Penny stocks, crypto, highly leveraged instruments
**Multiplier:** 0.3x (30% of standard size)
**Why:** Extreme swings = need very small positions

## Real-World Example

You want to risk $1,000 with a $5 stop distance:
- **Standard calc:** $1,000 ÷ $5 = 200 shares

With volatility adjustment:
- **Ultra Low (2.0x):** 200 × 2.0 = **400 shares**
- **Low (1.5x):** 200 × 1.5 = **300 shares**
- **Medium (1.0x):** 200 × 1.0 = **200 shares**
- **High (0.5x):** 200 × 0.5 = **100 shares**
- **Ultra High (0.3x):** 200 × 0.3 = **60 shares**

## The Key Insight

**Volatility-adjusted sizing maintains consistent risk across different instruments.**

Without adjustment:
- Low volatility stocks → you're under-sizing (missing opportunity)
- High volatility stocks → you're over-sizing (excessive risk)

This calculator fixes that automatically.
    `,
  },
  {
    id: 'atr-explained',
    title: 'ATR Explained',
    category: 'volatility',
    order: 6,
    content: `
# ATR (Average True Range) Explained

ATR is a technical indicator that measures volatility. It's one of the most useful tools for position sizing and stop placement.

## What ATR Measures

**ATR = Average of the "True Range" over N periods (typically 14 days)**

The "True Range" is the largest of:
1. Current High - Current Low
2. Current High - Previous Close (captures gap ups)
3. Previous Close - Current Low (captures gap downs)

ATR captures the **full volatility** including gaps, not just the daily range.

## Reading ATR Values

ATR is expressed in the instrument's price units:

**Example: AAPL trading at $180**
- ATR = $3.60
- This means AAPL moves an average of $3.60 per day

**As a percentage:**
- $3.60 ÷ $180 = 2% average daily move

## ATR for Stop Placement

Many traders use ATR multiples for stops:

### 1 ATR Stop (Tight)
- Stop: Entry ± 1 ATR
- **Pros:** Keeps losses small
- **Cons:** Higher stop-out rate (normal noise can trigger it)
- **Best for:** Day trading, scalping

### 2 ATR Stop (Standard)
- Stop: Entry ± 2 ATR
- **Pros:** Gives trade room to breathe
- **Cons:** Larger losses if wrong
- **Best for:** Swing trading (most common)

### 3 ATR Stop (Wide)
- Stop: Entry ± 3 ATR
- **Pros:** Rarely stopped by noise
- **Cons:** Large losses possible
- **Best for:** Position trading, volatile instruments

## ATR for Position Sizing

Using ATR improves position sizing:

**Without ATR:**
- You use a fixed % stop (e.g., 5%)
- Problem: 5% on a low-volatility stock = too tight
- Problem: 5% on a high-volatility stock = too loose

**With ATR:**
- You use a fixed ATR stop (e.g., 2 ATR)
- Adapts to each instrument's natural movement
- Consistent risk-adjusted stops

## Practical Example

**Trade Setup:**
- Entry: $100
- Risk: $1,000
- ATR: $2 (2% daily movement)

**Stop Distance Options:**
1. **1 ATR:** $100 - $2 = $98 stop → $1,000 ÷ $2 = 500 shares
2. **2 ATR:** $100 - $4 = $96 stop → $1,000 ÷ $4 = 250 shares
3. **3 ATR:** $100 - $6 = $94 stop → $1,000 ÷ $6 = 167 shares

Notice:
- Tighter stop = larger position (more shares, same $ risk)
- Wider stop = smaller position (fewer shares, same $ risk)

## Using ATR in This Calculator

**Custom ATR Input:**
You can override the volatility class with a specific ATR value.

Why?
1. **Different Timeframes**: You trade 4-hour charts, but ATR is daily
2. **Special Events**: Earnings coming, ATR will spike
3. **Your Platform**: You prefer a specific ATR calculation

**Example:**
- Stock normally has ATR of $2
- Earnings report tomorrow, historical earnings ATR = $6
- Input custom ATR of $6 to reduce position size preemptively

## Finding ATR on Your Platform

Most platforms show ATR(14):
- **TradingView**: Add "Average True Range" indicator
- **Thinkorswim**: Studies → ATR
- **Interactive Brokers**: Analytics → Volatility → ATR

**Tip:** Check ATR value, then divide by price to get ATR percentage. This helps classify volatility (< 2% = low, > 5% = high).

## ATR Pro Tips

1. **Rising ATR** = increasing volatility (often in trends)
2. **Falling ATR** = decreasing volatility (often in consolidations)
3. **ATR changes** = adjust position size accordingly
4. **During earnings** = ATR often doubles or triples

## The Bottom Line

ATR answers: "How much does this instrument normally move?"

Use it to:
- ✅ Set logical stop losses (based on natural price movement)
- ✅ Size positions appropriately (less size for wild movers)
- ✅ Avoid getting stopped out by noise (give trades proper room)
    `,
  },
  {
    id: 'volatility-adjustment',
    title: 'Position Size Adjustment',
    category: 'volatility',
    order: 7,
    content: `
# Volatility-Based Position Size Adjustment

This is the NEW v2 feature that makes this calculator special. Let's see how it works.

## The Problem This Solves

Traditional position sizing:
\`\`\`
Position Size = Dollar Risk ÷ Stop Distance
\`\`\`

**Problem:** This doesn't account for how volatile the instrument is.

Example:
- **Stock A** (Utility): Volatility = 15%, Stop = 5%
- **Stock B** (Biotech): Volatility = 80%, Stop = 5%

Same stop distance, same position size... but Stock B is **5x more volatile**!

Result:
- Stock A rarely hits stop (stable)
- Stock B frequently hits stop (choppy) → **death by a thousand cuts**

## The Solution: Volatility Multipliers

This calculator applies a multiplier based on volatility class:

| Volatility Class | Annualized Vol | Multiplier | Effect |
|------------------|----------------|------------|--------|
| ULTRA LOW        | < 20%          | 2.0x       | Double size |
| LOW              | 20-30%         | 1.5x       | +50% size |
| MEDIUM           | 30-50%         | 1.0x       | Normal size |
| HIGH             | 50-80%         | 0.5x       | Half size |
| ULTRA HIGH       | > 80%          | 0.3x       | 30% size |

## Real-World Comparison

Let's risk $1,000 with a 5% stop on different instruments:

**Without Volatility Adjustment:**
- All instruments: $1,000 ÷ 5% = same position value

**With Volatility Adjustment:**
- **JNJ (ULTRA LOW)**: $1,000 position × 2.0 = $2,000 position (larger)
- **AAPL (LOW)**: $1,000 position × 1.5 = $1,500 position
- **Random Growth Stock (MEDIUM)**: $1,000 position × 1.0 = $1,000 position (baseline)
- **Penny Stock (HIGH)**: $1,000 position × 0.5 = $500 position (smaller)
- **Crypto (ULTRA HIGH)**: $1,000 position × 0.3 = $300 position (much smaller)

## Why This Works

**For Low Volatility Stocks:**
- Normal price movement is small
- Stop is unlikely to be hit by noise
- You can safely take a **larger position**
- More capital deployed, same risk

**For High Volatility Stocks:**
- Normal price movement is large
- Stop can be hit by random swings (not a trend change)
- You need a **smaller position**
- Less capital at risk from noise

## The Math Behind It

The volatility multiplier adjusts for the **probability of stop being hit by noise** vs **legitimate stop out**.

Low volatility:
- 5% stop is **3.3x** the daily movement (15% annual ÷ ~16 trading days)
- High confidence stop is a real signal
- Safe to increase size

High volatility:
- 5% stop is only **0.6x** the daily movement (80% annual ÷ ~16 trading days)
- Stop could hit from normal noise
- Reduce size to manage whipsaw risk

## Visualizing the Impact

**The VolatilityImpactCard shows:**
1. Your base position size (without adjustment)
2. The volatility multiplier (0.3x to 2.0x)
3. Your final position size (with adjustment)
4. The percentage change (+100% to -70%)
5. An explanation of why the adjustment helps

## Customizing Multipliers

In the **Policy Settings** (click "Edit Policy"):
- Navigate to "Volatility" tab
- Adjust multipliers for each class
- Conservative? Use smaller multipliers (0.5x - 1.5x)
- Aggressive? Use larger range (0.2x - 2.5x)

**Defaults are research-based and work well for most traders.**

## When to Override

Use the **Custom ATR** field when:
- You have specific volatility data (e.g., from your platform)
- You know an event will spike volatility (earnings, Fed announcement)
- You want to be extra conservative

Example:
- Stock normally LOW volatility (1.5x multiplier)
- Earnings tomorrow (historically HIGH volatility on earnings)
- Input custom ATR → calculator may classify as HIGH (0.5x multiplier)
- Your position size drops 3x for this trade → **smart risk management**

## The Key Benefit

**Consistent risk-adjusted position sizing across all instruments.**

You're no longer:
- ❌ Over-sized in volatile stocks (getting whipsawed)
- ❌ Under-sized in stable stocks (missing opportunities)

You are:
- ✅ Properly sized for the instrument's characteristics
- ✅ Protected from noise in choppy markets
- ✅ Maximizing capital efficiency in stable markets

This is professional-grade position sizing. Use it wisely.
    `,
  },

  // ADVANCED CATEGORY
  {
    id: 'trade-management-plan',
    title: 'Trade Management Plan',
    category: 'advanced',
    order: 8,
    content: `
# Trade Management Plan

Position sizing gets you in the trade correctly. Trade management determines how much you actually make.

## The Three Stages

### 1. Entry Stage (0R)
- Your stop loss is placed
- Your position size is calculated
- Your take profit target is set (typically 2R)
- **Action:** Wait for initial move

### 2. Profitable Stage (0R to 1R)
- Trade is moving in your favor
- You're not yet at breakeven
- **Action:** Monitor price action, but don't micromanage

### 3. Breakeven Stage (1R+)
- Trade is profitable by at least 1R
- Time to protect your capital
- **Action:** Move stop to breakeven

## The Breakeven Rule

**When your trade is up 1R, move your stop to breakeven.**

Why?
- Eliminates risk (stop at entry = 0R loss if stopped)
- Removes emotional attachment (it's a "free trade" now)
- Allows you to hold for larger gains without fear

## Partial Profit Taking

Many pro traders scale out in stages:

**Example 3-Part Exit:**
1. **At 1R:** Sell 33% → Lock in some profit
2. **At 2R:** Sell 33% → Bank more profit
3. **At 3R+:** Trail stop on final 33% → Let winners run

**Benefits:**
- Always take some profit (psychological win)
- Still exposed if trade runs (don't miss big wins)
- Balanced approach

## The Trailing Stop

After reaching 2R, trail your stop using:
- **ATR-based trail:** Stop = Current Price - (2 × ATR)
- **Percent-based trail:** Stop = Current Price - 3%
- **Support-based trail:** Stop = Below recent swing low

**Trailing allows you to:**
- Capture extended moves (5R, 10R, even 20R+)
- Exit when trend ends (not on arbitrary price target)
- Ride trends without constant monitoring

## Time-Based Exits

Some trades need time limits:

**Day Trades:** Exit by end of day (no overnight risk)
**Swing Trades:** Exit after 5-10 days if no momentum
**Position Trades:** Hold weeks to months if thesis intact

**Why time exits matter:**
- Capital tied up in dead trades is wasted capital
- Opportunity cost (could be in a better trade)
- Psychological relief (indecision is stressful)

## The R-Multiple Ladder

Track your exits by R-multiple:

| R-Multiple | Action | Reasoning |
|------------|--------|-----------|
| -1R to 0R  | Stop hit or manual exit | Trade didn't work |
| 0R to 1R   | Take 25-50% off | Bank some profit |
| 1R to 2R   | Take 25-50% off | Hit your target |
| 2R to 3R   | Trail stop aggressively | Protect profits |
| 3R+        | Trail stop widely | Let it run |

## Managing Losing Trades

**Never move your stop away from price.**

If your thesis changes:
- ✅ Exit immediately (take the loss)
- ✅ Accept you were wrong
- ✅ Move on to next trade

If your thesis is still valid:
- ✅ Let the stop do its job
- ✅ Don't hope or pray
- ✅ Trust your original analysis

**The stop is there for a reason: to limit losses.**

## The Weekly Review

Every week, review your trades:

**Questions to ask:**
1. Did I follow my trade plan?
2. Did I exit too early? Too late?
3. What was my average R-multiple?
4. Did I let losers run or cut them quickly?
5. Did I let winners run or cut them too soon?

**Adjust your management plan based on data, not emotions.**

## Advanced: The Kelly Criterion for Exits

If you know your win rate and average R-multiples:
- High win rate (> 60%) → Take profits early (1-2R)
- Low win rate (< 40%) → Let winners run (3-5R+)

Why?
- High win rate strategies benefit from consistency
- Low win rate strategies need big wins to offset losses

## The Golden Rule

**Let winners run, cut losers short.**

It's the oldest advice in trading because it's the most important. This calculator gives you the tools to size positions correctly. Trade management is where you turn that into profits.
    `,
  },
  {
    id: 'risk-of-ruin',
    title: 'Risk of Ruin',
    category: 'advanced',
    order: 9,
    content: `
# Risk of Ruin: The Math That Matters

Risk of Ruin is the probability you'll blow up your account. Let's make sure that probability is near zero.

## What is Risk of Ruin?

**Risk of Ruin = Probability of losing so much capital that you can't continue trading**

For most traders, "ruin" = losing 50%+ of capital (very hard to recover from psychologically and mathematically).

## The Math of Drawdowns

This is why position sizing matters:

| Drawdown | Gain Needed to Recover |
|----------|------------------------|
| -10%     | +11%                   |
| -20%     | +25%                   |
| -30%     | +43%                   |
| -40%     | +67%                   |
| -50%     | +100%                  |
| -60%     | +150%                  |
| -75%     | +300%                  |
| -90%     | +900%                  |

**Key Insight:** Losses hurt exponentially more than equivalent gains help.

## Position Size and Survival

Let's compare two traders over 10 consecutive losses (worst case):

**Trader A: Risks 10% per trade**
- Trade 1: $100,000 → $90,000 (-10%)
- Trade 2: $90,000 → $81,000 (-10%)
- Trade 3: $81,000 → $72,900 (-10%)
- ...
- Trade 10: $38,742 remaining (-61% total)

**Trader B: Risks 2% per trade**
- Trade 1: $100,000 → $98,000 (-2%)
- Trade 2: $98,000 → $96,040 (-2%)
- Trade 3: $96,040 → $94,119 (-2%)
- ...
- Trade 10: $81,707 remaining (-18% total)

**Trader A is done. Trader B is bruised but alive.**

## The Kelly Criterion

The Kelly Criterion calculates optimal position size:

\`\`\`
Kelly % = (Win Rate × Avg Win) - (Loss Rate × Avg Loss)
         / Avg Win
\`\`\`

**Example:**
- Win Rate: 50%
- Avg Win: 2R
- Avg Loss: 1R

\`\`\`
Kelly % = (0.50 × 2) - (0.50 × 1) / 2 = 0.25 = 25%
\`\`\`

**But wait!** 25% per trade is insanely aggressive.

**Most pros use "Half Kelly" or "Quarter Kelly":**
- Half Kelly = 12.5% per trade
- Quarter Kelly = 6.25% per trade

Even Quarter Kelly is too much for most. That's why this calculator defaults to 1-5% risk per trade.

## Maximum Drawdown vs Risk of Ruin

**Maximum Drawdown:** The largest peak-to-trough decline
**Risk of Ruin:** Probability of hitting that drawdown

With 2% risk per trade and 40% win rate:
- Max drawdown: ~20-30% (over many trades)
- Risk of Ruin: < 1%

With 10% risk per trade and 40% win rate:
- Max drawdown: 60-80%
- Risk of Ruin: > 50%

**Lower risk per trade = higher chance of survival.**

## Monthly Stop Loss Cap

This calculator includes a **Monthly Stop Cap** (default 5% of capital).

Why?
- Protects you from digging a deep hole
- Forces you to stop and analyze what's wrong
- Prevents revenge trading
- Gives you time to reset emotionally

**Example:**
- Capital: $100,000
- Monthly Stop Cap: 5% = $5,000
- You lose 3 trades at $2,000 each = -$6,000
- **Calculator prevents additional trades this month**

**This could save your account.**

## The Gambler's Ruin

If you risk too much, even with a profitable strategy, you'll eventually hit a losing streak that wipes you out.

**Gambler's Ruin Formula:**
\`\`\`
Probability of Ruin = (1 - Edge) / (1 + Edge) ^ (Capital / Risk per Trade)
\`\`\`

**Translation:**
- Bigger edge → lower ruin probability
- More capital → lower ruin probability
- Less risk per trade → **much lower ruin probability**

**Example:**
- Edge: 5% (you make 5% on average per trade)
- Capital: $100,000
- Risk per trade: $5,000 (5%)

Probability of Ruin ≈ 15% (terrifying!)

Now change risk to $1,000 (1%):
- Probability of Ruin ≈ 0.01% (negligible)

## Sequence of Returns Risk

It's not just *if* you lose, but *when*.

**Scenario A:** Win, Win, Win, Lose, Lose
**Scenario B:** Lose, Lose, Win, Win, Win

Same trades, different order. Scenario B is harder to recover from psychologically, even if the math is the same.

**Solution:** Consistent risk limits + good trade management

## How to Never Blow Up

Follow these rules:

1. **Risk 1-2% per trade** (maximum 5% on highest conviction)
2. **Use a monthly stop loss cap** (5-10% of capital)
3. **Don't double down** on losing trades (no averaging down without a plan)
4. **Take breaks** after 3 consecutive losses
5. **Review and adapt** your strategy when in drawdown

**This calculator enforces these rules automatically.**

## The Ironclad Law

**Preservation of capital is rule #1.**

You can't compound gains if you have no capital left. Every professional trader knows this. Now you do too.

Use this calculator to keep your Risk of Ruin near zero. Your future self will thank you.
    `,
  },
];

/**
 * Get article by ID
 */
export function getArticle(id: string): Article | undefined {
  return ARTICLES.find((article) => article.id === id);
}

/**
 * Get articles by category
 */
export function getArticlesByCategory(category: Article['category']): Article[] {
  return ARTICLES.filter((article) => article.category === category).sort(
    (a, b) => a.order - b.order
  );
}

/**
 * Get all articles sorted by order
 */
export function getAllArticles(): Article[] {
  return [...ARTICLES].sort((a, b) => a.order - b.order);
}

/**
 * Tooltips for input fields
 */
export const TOOLTIPS = {
  freeCapital:
    'Your available trading capital. This is the total amount you have available to allocate across all open positions.',
  ytdPnL:
    'Your Year-to-Date profit or loss. Positive YTD may increase position size (Kelly scaling), negative YTD keeps you conservative.',
  conviction:
    'Your confidence level: Type I (High/5%), Type II (Medium/3%), Type III (Low/1%). Higher conviction = larger position size.',
  volatilityClass:
    'The volatility classification of the instrument. Lower volatility allows larger positions, higher volatility requires smaller positions.',
  timeHorizon:
    'How long you plan to hold: Day (intraday), Swing (days to weeks), Position (weeks to months).',
  entryPrice: 'The price at which you plan to enter the trade.',
  stopLoss:
    'Your stop loss price. This determines your risk per share and position size. Never trade without a stop!',
  slippage:
    'Buffer for execution slippage and commissions. Reduces position size slightly to account for real-world costs.',
  instrumentMultiplier:
    'Contract multiplier. Use 1 for stocks, varies for futures/options (e.g., 50 for ES, 100 for options).',
  customATR:
    'Override volatility class with a specific ATR value. Useful for custom timeframes or known volatility events.',
  monthlyStopLoss:
    'Your current month-to-date losses. If this exceeds your monthly cap, the calculator will warn you to stop trading.',
};
