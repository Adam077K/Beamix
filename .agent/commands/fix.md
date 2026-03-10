# /fix — Bug Fix Pipeline

Fix a bug with diagnosis first, then isolated fix, then verification.

## Usage
```
/fix [bug description]
```

## What This Does

### Step 1 — CEO Intake
CEO reads memory, asks: What's the symptom? When did it start? Is it reproducible? What's the expected behavior? Assigns complexity (Quick fix vs. needs diagnosis).

### Step 2 — Diagnosis (if complex)
For non-obvious bugs, CEO dispatches debugger:
- Creates `DEBUG.md` with persistent state
- Uses scientific method: falsifiable hypotheses, binary search, evidence appending
- Returns root cause analysis with evidence

For obvious bugs (typo, wrong variable): skip to Step 3 directly.

### Step 3 — Build Lead Fixes
Build Lead assigns Backend Developer or Frontend Developer with:
- Root cause from debugger (or CEO's understanding)
- Files to fix
- Worktree: `feat/fix-[bug-name]`
- Success criteria: "Bug no longer reproducible"

### Step 4 — QA Gate
QA Lead checks:
- Does the fix break anything else? (test coverage)
- Did the fix introduce any security issues?

PASS = proceed. BLOCK = fix the new issues first.

### Step 5 — Human Confirmation + Merge
Build Lead presents: what was fixed, what changed, QA PASS. User confirms merge.

## Abort Conditions
- Root cause still unknown after debugger → CEO asks user for more context
- Fix requires architectural change → CEO asks user for decision
- QA BLOCK after fix → fix the new issues before merging

## Notes
- debugger maintains DEBUG.md state — can context-reset and resume
- Always creates a worktree — never hacks directly on main
- Test to reproduce first, then fix
