# /audit — Full Codebase Audit

Map the codebase and produce a structured health report.

## Usage
```
/audit
/audit [focus: security | quality | architecture | all]
```

## What This Does

### Step 1 — Codebase Mapping
codebase-mapper runs with focus areas based on argument:
- `architecture`: ARCHITECTURE.md, STRUCTURE.md
- `quality`: CONVENTIONS.md, TESTING.md
- `security`: CONCERNS.md focused on security
- `all` (default): all focus areas

Maps output written to `.claude/memory/CODEBASE-MAP.md`.

### Step 2 — Code Review (Quality + Tech Debt)
Code Reviewer scans entire codebase:
- P1 issues: broken logic, security holes, data loss risk
- P2 issues: tech debt, duplication, missing error handling
- P3 notes: optimization opportunities

### Step 3 — Security Engineer (OWASP)
Security Engineer runs OWASP audit on all source files:
- Authentication/authorization gaps
- Injection vulnerabilities
- Exposed secrets or misconfigured env
- Dependency vulnerabilities (npm audit)

Both Step 2 and 3 run in parallel.

### Step 4 — QA Lead Synthesizes
QA Lead aggregates all findings into prioritized report:

```
## Codebase Audit — [Date]

### Critical (Fix Now)
- [file:line] — [issue] — [fix]

### High Priority (Fix This Sprint)
- [file:line] — [issue]

### Medium Priority (Fix Next Sprint)
- [file]  — [issue]

### Low / Notes
- [observations]

### Tech Debt Summary
- [count] P1 issues
- [count] P2 issues
- [count] security findings

### Recommended Next Steps
1. [Most important action]
2. [Second action]
```

## Notes
- CODEBASE-MAP.md updated with current state after audit
- QA Lead verdict: PASS (healthy, no critical issues) / NEEDS ATTENTION (critical issues found)
- If Critical issues found: CEO recommends routing to `/fix` immediately
