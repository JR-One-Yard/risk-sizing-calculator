# How to Resume This Project

**If you lose this chat or your computer shuts down, follow these steps to get back on track.**

---

## 🚀 Quick Resume (30 seconds)

### 1. Open Claude Code in the NEW project folder

```bash
cd "/Users/jamesroberts/Desktop/Projects Collection/Projects/Sizing Tool/risk-sizing-v2"
```

**Then open Claude Code in THIS directory** (risk-sizing-v2, NOT the old risk-sizing-app)

### 2. Say exactly this:

```
"I'm working on the Risk Sizing Tool v2. I completed Day 1 setup.
Please read DAY_1_SUMMARY.md and continue with Day 2 - building
the calculation engine with volatility features. Reference the
FRESH_START_IMPLEMENTATION_MASTER_GUIDE.md for the plan."
```

### 3. Claude will:
- Read your Day 1 summary
- Understand current project state
- Continue from exactly where you left off
- Follow the implementation guide

---

## 📁 Project Locations

### NEW Project (Work Here):
```
/Users/jamesroberts/Desktop/Projects Collection/Projects/Sizing Tool/risk-sizing-v2/
```
**This is where all new development happens.**

### OLD Project (Reference Only):
```
/Users/jamesroberts/Desktop/Projects Collection/Projects/Sizing Tool/risk-sizing-app/
```
**Keep this for reference - working code, proven formulas.**

---

## 📖 Key Files to Know About

### In NEW Project (risk-sizing-v2):

**Your Progress:**
- `DAY_1_SUMMARY.md` - What you've completed
- `HOW_TO_RESUME.md` - This file (resume instructions)
- Git history: `git log --oneline` to see commits

**Implementation Guides (in parent directory):**
- `../FRESH_START_IMPLEMENTATION_MASTER_GUIDE.md` - Complete roadmap
- `../START_FRESH_VS_CONTINUE_ANALYSIS.md` - Why we started fresh
- `../DECISION_FRAMEWORK.md` - Decision rationale

**Your Code:**
- `types/calculator.ts` - Type definitions (CORRECT conviction labels!)
- `types/volatility.ts` - Volatility framework
- `lib/constants.ts` - Defaults and constants
- `app/globals.css` - Design system

---

## 🎯 Current Status (Day 1 Complete)

✅ **Completed:**
- Project setup with Next.js 14
- TypeScript types (calculator + volatility)
- Constants and defaults
- Design system (Tailwind CSS)
- Git repository initialized
- Testing infrastructure ready

⏳ **Next (Day 2):**
- Build calculation engine
- Implement position sizing with volatility
- Add risk cap logic
- Create unit tests

---

## 🔄 How to Check Your Progress

### Check git commits:
```bash
cd "/Users/jamesroberts/Desktop/Projects Collection/Projects/Sizing Tool/risk-sizing-v2"
git log --oneline
```

You should see:
- Initial project setup commit
- Day 1 summary commit

### Check files created:
```bash
ls -la types/
ls -la lib/
```

You should have:
- `types/calculator.ts`
- `types/volatility.ts`
- `lib/constants.ts`

### Check what's NOT created yet:
```bash
ls lib/calculator/
```

Should be empty (Day 2 work)

---

## 💡 Different Resume Scenarios

### Scenario 1: Lost chat, same session
**Say:** "I'm resuming work on Risk Sizing Tool v2. Read DAY_1_SUMMARY.md and continue with Day 2."

### Scenario 2: Computer restarted, new day
**Say:** "I'm working on Risk Sizing Tool v2. I completed Day 1 (check DAY_1_SUMMARY.md). What's the status and what should I do next?"

### Scenario 3: Week later, forgot where you were
**Say:** "I'm resuming Risk Sizing Tool v2 after a break. Please review my git commits, DAY_1_SUMMARY.md, and tell me what's completed and what's next."

### Scenario 4: Want to jump to specific day
**Say:** "I'm on Risk Sizing Tool v2. I've completed Day 1-2. Please help me with Day 3 - [specific feature]."

---

## 📋 What to Tell Claude

### Minimum Information:
1. "I'm working on Risk Sizing Tool v2"
2. "Please read DAY_1_SUMMARY.md"
3. "Continue with [next task]"

### More Context (if needed):
1. Current directory: risk-sizing-v2
2. What day you're on
3. What you just completed
4. What you want to do next

### Example Good Prompt:
```
"I'm working on Risk Sizing Tool v2 in the risk-sizing-v2 directory.
I just completed Day 1 (project setup - check DAY_1_SUMMARY.md).
I'm ready to start Day 2: building the calculation engine with
volatility features. Please follow the FRESH_START_IMPLEMENTATION_MASTER_GUIDE.md."
```

---

## 🗂️ File Organization

```
Projects/Sizing Tool/
├── risk-sizing-app/              # OLD - Keep for reference
│   └── src/lib/calculations.ts   # ← Reference these formulas!
│
├── risk-sizing-v2/               # NEW - Work here ←
│   ├── DAY_1_SUMMARY.md          # ← Your progress
│   ├── HOW_TO_RESUME.md          # ← This file
│   ├── types/                    # ← Your types
│   ├── lib/                      # ← Your code
│   └── ...
│
└── Documentation (all .md files): # Implementation guides
    ├── FRESH_START_IMPLEMENTATION_MASTER_GUIDE.md
    ├── START_FRESH_VS_CONTINUE_ANALYSIS.md
    ├── VOLATILITY_AND_ADVANCED_RISK_ROADMAP.md
    └── Many others...
```

---

## 🎓 Important Context for Claude

When resuming, Claude needs to know:

1. **Project:** Risk Sizing Tool v2 (position sizing calculator for traders)
2. **Stage:** Fresh start, building from scratch with volatility features
3. **Architecture:** Next.js 14, TypeScript, Tailwind, Zustand, Zod
4. **Progress:** Day 1 complete (setup), ready for Day 2 (calculation engine)
5. **Key Feature:** Volatility-adjusted position sizing (5 classification levels)
6. **Critical Detail:** Conviction types are CORRECT (I=High, II=Medium, III=Low)

---

## ⚠️ Common Mistakes to Avoid

❌ **DON'T** open Claude in the old `risk-sizing-app` directory
✅ **DO** open Claude in the new `risk-sizing-v2` directory

❌ **DON'T** say "continue where we left off" (too vague)
✅ **DO** say "read DAY_1_SUMMARY.md and continue with Day 2"

❌ **DON'T** forget to mention you're working on v2
✅ **DO** specify "Risk Sizing Tool v2"

---

## 🔧 If Things Go Wrong

### Claude seems confused?
**Say:** "Please list all files in the current directory and check DAY_1_SUMMARY.md to understand the project state."

### Not sure what's been done?
**Say:** "Run `git log --oneline` and show me what commits exist. Then read DAY_1_SUMMARY.md."

### Want to verify everything?
**Say:** "Please verify: 1) We're in risk-sizing-v2 directory, 2) Day 1 is complete (check summary), 3) What should we do next?"

---

## 📞 Emergency Recovery

If completely lost, say exactly this:

```
"I'm working on Risk Sizing Tool v2 (fresh implementation with volatility).
Current directory should be:
/Users/jamesroberts/Desktop/Projects Collection/Projects/Sizing Tool/risk-sizing-v2

Please:
1. Verify we're in the right directory
2. List all files in types/ and lib/
3. Check git log for commits
4. Read DAY_1_SUMMARY.md
5. Tell me what's completed and what's next
6. Reference FRESH_START_IMPLEMENTATION_MASTER_GUIDE.md for the plan"
```

---

## 🎯 Quick Reference Card

**Current Project:** risk-sizing-v2 (NEW)
**Reference Project:** risk-sizing-app (OLD)
**Day Completed:** Day 1 (Setup)
**Next Day:** Day 2 (Calculation Engine)
**Progress File:** DAY_1_SUMMARY.md
**Master Guide:** FRESH_START_IMPLEMENTATION_MASTER_GUIDE.md
**Total Timeline:** 21 days to MVP+

---

## 💾 Save This File!

This file is saved in your project:
```
/Users/jamesroberts/Desktop/Projects Collection/Projects/Sizing Tool/risk-sizing-v2/HOW_TO_RESUME.md
```

**Bookmark it!** It's your lifeline to resume work anytime.

---

## ✅ Quick Test

Before you close this chat, test the resume process:

1. Note what directory Claude is in: `pwd`
2. Close this chat
3. Reopen Claude Code in risk-sizing-v2
4. Say: "Read DAY_1_SUMMARY.md and tell me what's completed"
5. If Claude understands, you're good!

---

**You're all set! You can resume from anywhere, anytime.** 🚀
