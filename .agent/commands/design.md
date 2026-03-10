# /design — Design Pipeline

Design a UI component or screen with Pencil MCP and WCAG accessibility check.

## Usage
```
/design [component or screen description]
```

## What This Does

### Step 1 — CEO Intake
CEO asks: What is this for? Who uses it? What states does it need (loading, empty, error, success)? What existing components should it use?

### Step 2 — Design Lead
Design Lead:
1. Loads Tailwind or Radix UI design skill
2. Checks existing components (`src/components/**`) — reuse before creating
3. Tries Pencil MCP (`mcp__pencil__get_editor_state`):
   - **Available**: Designs in Pencil first, then passes design reference to Frontend Developer
   - **Not available**: Writes detailed component spec (structure, Tailwind classes, props, all states)

### Step 3 — Frontend Developer Implements
Frontend Developer receives design reference or spec:
- Creates worktree `feat/design-[component]`
- Implements with Tailwind + Shadcn/UI
- All 3 states required: loading, empty/error, success
- Mobile-first responsive

### Step 4 — WCAG Accessibility Check
QA Lead runs WCAG check specifically:
- Color contrast ratios
- Keyboard navigation
- ARIA labels and roles
- Focus management

PASS = proceed. BLOCK = Frontend Developer fixes accessibility issues.

### Step 5 — Human Confirmation + Merge
Build Lead presents component, shows states, confirms WCAG PASS. User approves.

## Abort Conditions
- Missing component spec (no states defined) → Design Lead asks user
- Existing component already covers this → return existing component path, no new work
- WCAG BLOCK → fix before shipping

## Notes
- Never ships placeholder UI — all states must be real
- Pencil MCP is optional — pipeline works without it
- Check existing components first — avoid duplication
