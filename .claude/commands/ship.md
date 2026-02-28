# /ship — Pre-Deploy Pipeline

Run the full quality + security gate before production deploy.

## Usage
```
/ship [feature-name or "all"]
```

## Pipeline Steps

### Step 1 — Scout Review
Scout audits recently changed files:
- Code quality + severity ratings (🔴 BLOCK / 🟡 WARN / 🔵 NOTE)
- Stub detection: any `TODO`, `return null`, empty handlers, placeholder text?
- Wiring check: APIs connected? State rendered? Forms submitting?
- API documentation current?

If 🔴 BLOCK found → **STOP**, route to Atlas for fixes.

### Step 2 — Guardian Gate
Guardian runs:
- `npm audit --audit-level=high`
- OWASP checklist for changed routes
- 3-level verification: exists → substantive → wired
- Auth tests on new endpoints
- LLM eval if AI features changed

Verdict: **PASS** or **BLOCK**

If BLOCK → **STOP**, route to Atlas for security fixes.

### Step 3 — Nexus Deploy
If PASS:
- Deploy to staging
- Smoke test: auth + payment + core feature
- Deploy to production
- Health check + error rate baseline
- **Verify deploy succeeded** (don't just kick it off — confirm it's live and healthy)

### Step 4 — Confirm
- Verify: `curl -s -o /dev/null -w "%{http_code}" https://[app-url]/api/health`
- Notify: "[feature] deployed to production"
- Log to `.claude/memory/DECISIONS.md` if architecture changed

## Abort Conditions

- Stubs found by Scout → Fix required before continuing
- 🔴 BLOCK from Scout → Atlas fixes first
- BLOCK from Guardian → Security fix required
- Build failure → Atlas to fix
- Health check fails after deploy → Auto-rollback via `vercel rollback`
