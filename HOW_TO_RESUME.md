# How to Resume This Project

**If you lose this chat or your computer shuts down, follow these steps to get back on track.**

---

## 🚀 Quick Resume (30 seconds)

### 1. Open Claude Code in the NEW project folder

```bash
cd "/Users/jamesroberts/Desktop/Projects Collection/Projects/Risk-Sizing-Calculator"
```

**Then open Claude Code in THIS directory** (Risk-Sizing-Calculator, NOT the old Sizing Tool)

### 2. Say exactly this:

```
"I'm working on the Risk Sizing Tool v2. I completed Days 1-4.
Please check git log and tell me the current state. The calculator
is fully functional with volatility-adjusted position sizing.
What should we work on next?"
```

### 3. Claude will:
- Review git commits to see progress
- Check current implementation state
- Understand what's working
- Suggest next steps (polish, features, or refinements)

---

## 📁 Project Locations

### NEW Project (Work Here):
```
/Users/jamesroberts/Desktop/Projects Collection/Projects/Risk-Sizing-Calculator/
```
**This is where all new development happens.**

### OLD Project (Reference Only):
```
/Users/jamesroberts/Desktop/Projects Collection/Projects/Sizing Tool/risk-sizing-app/
```
**Keep this for reference - working code, proven formulas.**

### Shared Documentation:
```
/Users/jamesroberts/Desktop/Projects Collection/Projects/Sizing Tool/docs/
```
**Implementation guides, design specs, analysis.**

---

## 📖 Key Files to Know About

### In NEW Project (Risk-Sizing-Calculator):

**Your Progress:**
- `HOW_TO_RESUME.md` - This file (resume instructions)
- Git history: `git log --oneline` to see all commits
- Dev server: http://localhost:3001 (when running)

**Implementation Guides (in Sizing Tool/docs):**
- `../Sizing Tool/docs/implementation-guides/FRESH_START_IMPLEMENTATION_MASTER_GUIDE.md` - Complete roadmap
- `../Sizing Tool/docs/analysis/START_FRESH_VS_CONTINUE_ANALYSIS.md` - Why we started fresh
- `../Sizing Tool/docs/design-specs/FRESH_IMPLEMENTATION_UX_DESIGN.md` - UI/UX design
- `../Sizing Tool/docs/design-specs/RISK_MANAGEMENT_SPECIFICATIONS.md` - Risk calculations

**Your Code:**

*Types & Constants:*
- `types/calculator.ts` - Type definitions (CORRECT conviction labels!)
- `types/volatility.ts` - Volatility framework with 5 classes
- `lib/constants.ts` - Defaults and constants

*Calculation Engine:*
- `lib/calculator/calculations.ts` - Complete calculation engine
- `lib/calculator/index.ts` - Public API

*State Management:*
- `lib/store.ts` - Zustand store with LocalStorage persistence
- `lib/schemas.ts` - Zod validation schemas

*UI Components:*
- `components/ui/` - Design system primitives (Card, Button, Input, Select, Badge)
- `components/calculator/InputCard.tsx` - Trade setup form
- `components/calculator/OutputCard.tsx` - Results display
- `components/calculator/VolatilityImpactCard.tsx` - NEW v2 feature (volatility visualization)

*Tests:*
- `lib/calculator/__tests__/` - 59 calculation tests
- `lib/__tests__/schemas.test.ts` - 59 validation tests

---

## 🎯 Current Status (Day 4 COMPLETE!)

✅ **Day 1 - Project Setup:**
- Next.js 14 with TypeScript
- Tailwind CSS v4 design system
- Type definitions (calculator + volatility)
- Constants and defaults
- Git repository initialized

✅ **Day 2 - Calculation Engine:**
- Core position sizing calculations
- Conviction-based risk allocation (Type I/II/III)
- YTD P&L scaling (Kelly Criterion)
- Volatility-adjusted position sizing (5 classes)
- Hierarchical risk caps
- ATR analysis
- R-multiple calculations
- 59 calculation tests (all passing)

✅ **Day 3 - State Management:**
- Zod validation schemas
- Zustand store with middleware
- LocalStorage persistence (versioned)
- Auto-calculation on input changes
- Optimized selectors
- 59 schema validation tests (all passing)

✅ **Day 4 - UI Components:**
- Design system primitives (Card, Button, Input, Select, Badge)
- InputCard component (full trade setup form)
- OutputCard component (comprehensive results)
- VolatilityImpactCard (NEW v2 feature - educational visualization)
- Full Zustand integration
- Auto-calculation working
- Production build passing

**Total Tests:** 118/118 passing ✅
**Build Status:** Production build passing ✅
**Dev Server:** Running on http://localhost:3001 ✅

⏳ **Next Steps (Day 5+):**
- Polish and refinements
- Mobile optimization
- Additional features (trade history, policy settings)
- Performance optimization
- Accessibility improvements
- Documentation

---

## 🔄 How to Check Your Progress

### Check git commits:
```bash
cd "/Users/jamesroberts/Desktop/Projects Collection/Projects/Risk-Sizing-Calculator"
git log --oneline
```

You should see:
- Day 4 Complete: Add VolatilityImpactCard (NEW v2 feature)
- Day 4: Add InputCard and OutputCard components
- Day 4: UI components and TypeScript fixes
- Day 3 Complete: State management with Zustand + Zod validation
- Day 2 Complete: Calculation engine with 59 passing tests
- Day 1: Complete project setup with types and constants
- Initial commit

### Run the dev server:
```bash
npm run dev
```

Should start on http://localhost:3001 (or 3000 if available)

### Run tests:
```bash
npm test
```

Should show 118 tests passing

### Build for production:
```bash
npm run build
```

Should complete successfully

---

## 💡 Different Resume Scenarios

### Scenario 1: Lost chat, same session
**Say:** "I'm resuming Risk Sizing Tool v2. Show me `git log --oneline` and tell me what's completed."

### Scenario 2: Computer restarted, new day
**Say:** "I'm working on Risk Sizing Tool v2. Days 1-4 are complete. Check git commits and tell me the current state."

### Scenario 3: Week later, forgot where you were
**Say:** "I'm resuming Risk Sizing Tool v2 after a break. Please review git commits and tell me what's done and what's next."

### Scenario 4: Want to add new features
**Say:** "Risk Sizing Tool v2 has a working calculator (Days 1-4 done). I want to add [specific feature]. What do you suggest?"

### Scenario 5: Want to test it out
**Say:** "Start the dev server for Risk Sizing Tool v2 and let me test the calculator."

---

## 📋 What to Tell Claude

### Minimum Information:
1. "I'm working on Risk Sizing Tool v2"
2. "Days 1-4 are complete"
3. "What should we work on next?" OR "I want to add [feature]"

### More Context (if needed):
1. Current directory: Risk-Sizing-Calculator
2. What you want to build/fix/improve
3. Any issues you're encountering

### Example Good Prompts:

**For Resuming:**
```
"I'm working on Risk Sizing Tool v2 in Risk-Sizing-Calculator directory.
Days 1-4 are complete (calculator is working). Please check git log
and tell me the current state. What polish or features should we add next?"
```

**For New Features:**
```
"Risk Sizing Tool v2 calculator is working (Days 1-4 done). I want to add
[trade history / policy settings / mobile optimization / etc.].
What's the best approach?"
```

**For Debugging:**
```
"Risk Sizing Tool v2 - the calculator is built but I'm seeing [issue].
Can you help debug? Run the dev server if needed."
```

---

## 🗂️ File Organization

```
Projects/
├── Sizing Tool/                  # Original project folder
│   ├── risk-sizing-app/          # OLD - Keep for reference
│   │   └── src/lib/calculations.ts   # ← Reference these formulas!
│   └── docs/                     # Shared documentation
│       ├── implementation-guides/
│       ├── design-specs/
│       └── analysis/
│
└── Risk-Sizing-Calculator/       # NEW - Your main project ←
    ├── HOW_TO_RESUME.md          # ← This file
    ├── types/                    # ← Type definitions
    ├── lib/                      # ← Calculation engine & state
    │   ├── calculator/           # ← Position sizing logic
    │   ├── schemas.ts            # ← Zod validation
    │   └── store.ts              # ← Zustand state management
    ├── components/               # ← UI components
    │   ├── ui/                   # ← Design system primitives
    │   └── calculator/           # ← Calculator-specific components
    ├── app/                      # ← Next.js pages
    └── ...
```

---

## 🎓 Important Context for Claude

When resuming, Claude needs to know:

1. **Project:** Risk Sizing Tool v2 (position sizing calculator for traders)
2. **Stage:** Working calculator with volatility features (Days 1-4 complete)
3. **Architecture:** Next.js 14, TypeScript, Tailwind CSS, Zustand, Zod
4. **Progress:**
   - ✅ Calculation engine working
   - ✅ State management with persistence
   - ✅ Full UI (InputCard, OutputCard, VolatilityImpactCard)
   - ✅ 118 tests passing
   - ✅ Production build passing
5. **Key Feature:** Volatility-adjusted position sizing (5 classification levels)
6. **Critical Detail:** Conviction types are CORRECT (I=High, II=Medium, III=Low)

---

## ⚠️ Common Mistakes to Avoid

❌ **DON'T** open Claude in the old `risk-sizing-app` directory
✅ **DO** open Claude in the new `Risk-Sizing-Calculator` directory

❌ **DON'T** say "continue where we left off" (too vague)
✅ **DO** say "check git log and show me what's completed"

❌ **DON'T** forget we're on v2 with volatility features
✅ **DO** specify "Risk Sizing Tool v2" with volatility

---

## 🔧 If Things Go Wrong

### Claude seems confused?
**Say:** "Please run `git log --oneline` and `npm test` to verify the project state."

### Not sure what's been done?
**Say:** "List recent git commits and show me what components exist in components/calculator/"

### Want to verify everything?
**Say:** "Please verify: 1) We're in Risk-Sizing-Calculator directory, 2) Run `npm test` to check tests, 3) Show git log"

### Dev server won't start?
**Say:** "Try running `npm run dev` and show me any errors."

---

## 📞 Emergency Recovery

If completely lost, say exactly this:

```
"I'm working on Risk Sizing Tool v2 (fresh implementation with volatility).
Current directory should be:
/Users/jamesroberts/Desktop/Projects Collection/Projects/Risk-Sizing-Calculator

Please:
1. Verify we're in the right directory (run pwd)
2. Check git log --oneline (should show Days 1-4 commits)
3. Run npm test (should show 118 passing)
4. List components/calculator/ files
5. Tell me what's completed and suggest next steps"
```

---

## 🎯 Quick Reference Card

**Current Project:** Risk-Sizing-Calculator (NEW)
**Reference Project:** Sizing Tool/risk-sizing-app (OLD)
**Days Completed:** Days 1-4 (Setup → Calculation → State → UI)
**Status:** ✅ Working calculator with volatility features
**Tests:** 118/118 passing
**Build:** Production ready
**Dev URL:** http://localhost:3001
**Next:** Polish, features, optimizations

---

## 🎨 What's Built (Quick Overview)

**Calculation Engine:**
- Position sizing with conviction-based risk (Type I/II/III)
- YTD P&L scaling (Kelly Criterion inspired)
- **NEW:** Volatility-adjusted sizing (5 classes: ULTRA_LOW to ULTRA_HIGH)
- Hierarchical risk caps (Monthly Stop → Type III → Absolute Max)
- ATR analysis for stop optimization
- R-multiple calculations

**State Management:**
- Zustand store with LocalStorage persistence
- Zod validation for all inputs
- Auto-calculation on changes
- Optimized selectors

**UI Components:**
- Design system (Card, Button, Input, Select, Badge)
- InputCard (complete trade setup form)
- OutputCard (comprehensive results display)
- **NEW:** VolatilityImpactCard (educational visualization showing position size adjustments)

**Quality:**
- 118 tests passing (59 calculation + 59 validation)
- TypeScript strict mode
- Production build passing
- Responsive design

---

## 💾 Save This File!

This file is saved in your project:
```
/Users/jamesroberts/Desktop/Projects Collection/Projects/Risk-Sizing-Calculator/HOW_TO_RESUME.md
```

**Bookmark it!** It's your lifeline to resume work anytime.

---

## ✅ Quick Test

Before you close this chat, test the resume process:

1. Note what directory Claude is in: `pwd`
2. Check git commits: `git log --oneline`
3. Close this chat
4. Reopen Claude Code in Risk-Sizing-Calculator
5. Say: "Show me git log and tell me what's completed"
6. If Claude shows Days 1-4 commits, you're good!

---

**You're all set! Calculator is working, 118 tests passing, ready for next features!** 🚀
