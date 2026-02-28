# /audit — Full Codebase Audit

Scout maps the entire codebase and produces a structured health report.

## Usage
```
/audit [focus: "security" | "performance" | "debt" | "docs" | "stubs" | "all"]
```

## What Gets Checked

### For `/audit all`
1. **Structure Map** — Glob all file patterns, update CODEBASE-MAP.md
2. **Dependency Audit** — Check for outdated deps, security vulnerabilities
3. **Stub Scan** — Find TODO/FIXME/placeholder/return null/empty handlers
4. **Wiring Check** — APIs connected? State rendered? Forms submitting?
5. **Code Quality** — `any` types, console.logs, anti-patterns
6. **Coverage Estimate** — How much of critical paths has tests?
7. **Debt Score** — Calculate (Risk × Impact) / Effort for each finding

### For `/audit security`
Guardian handles: OWASP Top 10 check, `npm audit`, secret scanning, 3-level wiring verification

### For `/audit stubs`
Scout runs targeted stub detection across all source files:
```bash
# Run across entire src/ directory
grep -rn "TODO\|FIXME\|placeholder\|return null$\|=> {}" src/
grep -rn "Not implemented\|coming soon" src/ -i
grep -rn ": any\|as any" src/ --include="*.ts"
```

### For `/audit docs`
Scout generates: API docs for all routes, README gaps, inline doc coverage

## Output

Scout produces:
- **`.claude/memory/CODEBASE-MAP.md`** — Updated project map
- **Audit Report** — Severity-rated findings (🔴 BLOCK / 🟡 WARN / 🔵 NOTE)
- **Stub Report** — Every placeholder found with file + line
- **Priority list** — What Atlas should fix first (ranked by risk × impact)

## Estimated Time
- Small codebase (<50 files): ~5 min
- Medium (50-200 files): ~15 min
- Large (200+ files): ~30 min
