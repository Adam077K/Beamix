# QA & Quality Patterns for Multi-Agent Systems

**Date:** 2026-05-16  
**Author:** Researcher (Opus 4.6)  
**Status:** Research Complete  
**Confidence:** HIGH — sourced from Anthropic official docs, peer-reviewed research, production GitHub repos

---

## Executive Summary — Top 5 Patterns to Adopt

1. **Risk-Tiered QA Gates** — Match review depth to change risk. Trivial tasks get lint+types; irreversible changes get multi-judge + human approval.
2. **Evaluator-Optimizer Loop** — Separate generation from evaluation. Use structured PASS/NEEDS_IMPROVEMENT/FAIL verdicts with specific feedback that feeds back to the generator.
3. **Cross-Provider Judge** — Never judge your own output. Use a different model family for evaluation than generation to eliminate self-preference bias.
4. **Goal-Backward Verification** — Check "did it achieve what was asked?" not just "did tests pass?" Infer intent, then verify state change.
5. **Decision Immutability** — Locked decisions in append-only logs with explicit supersession markers. Agents must read decisions before acting.

---

## 1. Risk-Tiered QA Gate Matrix

### The Matrix

| Tier | Trigger Criteria | Checks | Approvers | Max Time |
|------|-----------------|--------|-----------|----------|
| **Trivial** | Docs-only, comments, typos, <10 LOC, no logic change | Lint, format, spell-check | Auto-approve | <30s |
| **Lite** | Single-file logic, <100 LOC, no API/DB/auth touch | Lint + types + existing tests pass + brief LLM review | QA-Lead auto-verdict | <2min |
| **Full** | Multi-file, API/DB changes, new features, 100-500 LOC | Lint + types + tests + security scan + LLM deep review + design check | QA-Lead verdict + human confirmation | <5min |
| **Irreversible** | DB migrations, auth changes, payment logic, >500 LOC, deletes | Full + multi-judge (3 independent) + rollback plan + manual approval | QA-Lead + CEO + human sign-off | Manual |

### Tier Assignment Algorithm

```typescript
function assignRiskTier(diff: DiffSummary): RiskTier {
  // Irreversible — always escalate
  if (diff.touchesFiles(['**/migrations/**', '**/auth/**', '**/payment/**', '**/billing/**'])) return 'IRREVERSIBLE';
  if (diff.deletesPublicAPI || diff.dropsDBColumn) return 'IRREVERSIBLE';
  if (diff.linesChanged > 500) return 'IRREVERSIBLE';

  // Full — significant changes
  if (diff.touchesFiles(['**/api/**', '**/lib/**', '**/middleware/**'])) return 'FULL';
  if (diff.linesChanged > 100) return 'FULL';
  if (diff.newFiles > 3) return 'FULL';
  if (diff.modifiesEnvVars || diff.touchesPackageJson) return 'FULL';

  // Lite — contained logic changes
  if (diff.linesChanged > 10 && diff.hasLogicChange) return 'LITE';
  if (diff.modifiesTests) return 'LITE';

  // Trivial — cosmetic only
  return 'TRIVIAL';
}
```

### Per-Tier Checklists

#### Trivial Checklist
- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes
- [ ] No TODO/FIXME added without ticket reference
- [ ] Commit message follows convention

#### Lite Checklist
- [ ] All Trivial checks
- [ ] `pnpm typecheck` passes (zero errors)
- [ ] Existing test suite passes (`pnpm test`)
- [ ] LLM spot-review: "Any obvious bugs in this diff?" (single-pass, Haiku-tier)
- [ ] No new `any` types introduced
- [ ] No console.log left in production code

#### Full Checklist
- [ ] All Lite checks
- [ ] Security scan (dependency audit, no secrets in code, input validation present)
- [ ] Performance impact assessed (no N+1 queries, no unbounded loops)
- [ ] Accessibility: ARIA labels on interactive elements
- [ ] Brand compliance: correct colors, fonts, spacing (see BRAND_GUIDELINES.md)
- [ ] LLM deep review with 5-dimension rubric (see Section 3)
- [ ] New tests written for new code paths (coverage delta >= 0)
- [ ] API contract unchanged OR migration plan documented

#### Irreversible Checklist
- [ ] All Full checks
- [ ] Multi-judge review (3 independent evaluations, median verdict wins)
- [ ] Rollback plan documented and tested
- [ ] Data backup verified (for DB migrations)
- [ ] Staging deployment tested before production
- [ ] Human sign-off recorded with timestamp
- [ ] DECISIONS.md updated if architectural choice involved

### Bypass Mechanism (Safe Design)

```yaml
# In QA-Lead configuration
bypass_rules:
  # Only CEO can bypass, and only for Trivial/Lite
  allowed_tiers: [TRIVIAL, LITE]
  allowed_roles: [CEO]
  requires_reason: true
  audit_logged: true  # Every bypass is recorded
  
  # FULL and IRREVERSIBLE can NEVER be bypassed
  # This is enforced at the system level, not policy level
  never_bypass: [FULL, IRREVERSIBLE]
```

**Source:** Risk-tiering pattern derived from claude-flow (github.com/ruvnet/claude-flow) which uses low/medium/high tiers with >=2 approvals for high-risk. Adapted with Beamix-specific file patterns.

---

## 2. Evaluator-Optimizer Pattern (Copy-Paste Ready)

### Architecture

```
┌─────────────┐     ┌─────────────┐
│  Generator  │────▶│  Evaluator  │
│  (Sonnet)   │◀────│  (Haiku*)   │
└─────────────┘     └─────────────┘
       │                    │
       │    feedback loop   │
       └────────────────────┘
       
* Use different model family from generator
  to avoid self-preference bias
```

### Implementation

```typescript
// File: lib/qa/evaluator-optimizer.ts

interface EvalResult {
  verdict: 'PASS' | 'NEEDS_IMPROVEMENT' | 'FAIL';
  score: number; // 0.0 - 1.0
  feedback: string;
  issues: Array<{
    severity: 'critical' | 'important' | 'suggestion';
    description: string;
    fix: string;
  }>;
}

const EVALUATOR_PROMPT = `You are a senior quality evaluator. Your job is to evaluate code/content against specific criteria. You are ONLY evaluating — never attempt to fix or generate.

## Evaluation Criteria
1. **Correctness** — Does it do what was asked? Are there logic errors?
2. **Security** — Input validation, auth checks, no secrets exposed?
3. **Performance** — No N+1 queries, unbounded loops, or memory leaks?
4. **Style** — Follows project conventions? Readable? Well-named?
5. **Completeness** — All edge cases handled? Tests included?

## Scoring
- Score each criterion 0.0-1.0
- Overall = weighted average (Correctness 0.3, Security 0.25, Performance 0.2, Style 0.15, Completeness 0.1)
- PASS: overall >= 0.85 AND no critical issues
- NEEDS_IMPROVEMENT: overall >= 0.6 OR has important issues only
- FAIL: overall < 0.6 OR any critical issue

## Output Format (strict JSON)
{
  "verdict": "PASS | NEEDS_IMPROVEMENT | FAIL",
  "score": 0.0-1.0,
  "scores": {
    "correctness": 0.0-1.0,
    "security": 0.0-1.0,
    "performance": 0.0-1.0,
    "style": 0.0-1.0,
    "completeness": 0.0-1.0
  },
  "feedback": "One paragraph summary of evaluation",
  "issues": [
    {
      "severity": "critical | important | suggestion",
      "description": "What is wrong",
      "fix": "Specific instruction to fix it"
    }
  ]
}

## Anti-Bias Rules
- Do NOT prefer verbose code over concise correct code
- Do NOT penalize unconventional-but-correct approaches
- Do NOT award points for comments that restate the obvious
- Score based on FUNCTION, not APPEARANCE

## Context
Original task: {{TASK_DESCRIPTION}}
Content to evaluate:
{{CONTENT}}`;

const GENERATOR_PROMPT = `You are an expert developer. Complete the task below.

If previous feedback is provided, reflect on it and improve your solution.
Do not repeat the same mistakes.

## Task
{{TASK_DESCRIPTION}}

## Previous Feedback (if any)
{{FEEDBACK}}

## Previous Attempts (if any)
{{PREVIOUS_ATTEMPTS}}

Output ONLY the implementation. No explanations unless requested.`;

async function evaluatorOptimizerLoop(
  task: string,
  maxIterations: number = 3
): Promise<{ result: string; iterations: number; finalScore: number }> {
  let attempts: string[] = [];
  let feedback = '';
  
  for (let i = 0; i < maxIterations; i++) {
    // Generate
    const result = await generate(GENERATOR_PROMPT, {
      TASK_DESCRIPTION: task,
      FEEDBACK: feedback,
      PREVIOUS_ATTEMPTS: attempts.join('\n---\n'),
    });
    attempts.push(result);
    
    // Evaluate (using DIFFERENT model)
    const evaluation: EvalResult = await evaluate(EVALUATOR_PROMPT, {
      TASK_DESCRIPTION: task,
      CONTENT: result,
    });
    
    if (evaluation.verdict === 'PASS') {
      return { result, iterations: i + 1, finalScore: evaluation.score };
    }
    
    if (evaluation.verdict === 'FAIL' && i === maxIterations - 1) {
      throw new Error(`Failed after ${maxIterations} iterations. Last feedback: ${evaluation.feedback}`);
    }
    
    // Feed back for next iteration
    feedback = `Score: ${evaluation.score}\nIssues:\n${
      evaluation.issues.map(i => `- [${i.severity}] ${i.description} → Fix: ${i.fix}`).join('\n')
    }`;
  }
  
  return { result: attempts[attempts.length - 1], iterations: maxIterations, finalScore: 0 };
}
```

### Key Design Decisions

1. **Different models for generation vs evaluation** — Prevents self-preference bias. Source: arxiv.org/html/2410.21819v2
2. **Structured JSON output** — Enables programmatic verdict handling, not prose parsing
3. **Max 3 iterations** — Prevents infinite loops; if 3 attempts fail, escalate to human
4. **Weighted scoring** — Security weighs more than style; correctness most of all
5. **Specific fix instructions** — Feedback must be actionable, not vague ("improve code quality")

**Source:** Pattern from Anthropic's official cookbook (platform.claude.com/cookbook/patterns-agents-evaluator-optimizer). Scoring thresholds calibrated from Langfuse docs (80-90% human agreement target).

---

## 3. Code Review Agent Prompt (Production-Grade)

Distilled from: VoltAgent/awesome-claude-code-subagents, addyosmani/agent-skills, and karlstoney.com PR review agent.

```markdown
# CODE REVIEWER — System Prompt

You are a Staff Engineer conducting a thorough code review. You evaluate changes across five dimensions and provide a structured verdict.

## Review Protocol

1. **Read tests first** — understand intent before reading implementation
2. **Check DECISIONS.md** — verify no locked decisions are violated
3. **Review diff, not full file** — focus on what changed, not pre-existing issues
4. **One issue per finding** — specific, actionable, with fix suggestion

## Five Dimensions

### 1. Correctness (weight: 0.30)
- Does the code implement the stated requirement?
- Edge cases: null, empty, boundary values handled?
- Race conditions or state inconsistencies?
- Error paths: what happens when things fail?

### 2. Security (weight: 0.25)
- Input validation on all external data (Zod schemas present?)
- No secrets in code (check for hardcoded keys, tokens)
- Auth/authz checks on protected routes?
- SQL injection: parameterized queries only?
- XSS: user content properly escaped?
- OWASP Top 10 awareness

### 3. Performance (weight: 0.20)
- N+1 queries? (look for loops with DB calls inside)
- Unbounded data fetching? (missing LIMIT/pagination)
- Unnecessary re-renders? (React: missing memo, unstable refs)
- Bundle impact: new dependencies justified?
- Async operations properly awaited?

### 4. Architecture (weight: 0.15)
- Follows existing patterns in codebase?
- Proper module boundaries (no circular deps)?
- Abstraction level appropriate (not over/under-engineered)?
- Changes consistent with ADRs/DECISIONS.md?

### 5. Readability (weight: 0.10)
- Names describe intent (not `data`, `result`, `temp`)?
- Functions under 40 lines? (flag >60)
- No dead code or commented-out blocks?
- Type safety: no `any` types without justification?

## Severity Classification

- **CRITICAL** — Must fix. Security vulnerability, data loss risk, broken functionality. NEVER approve with critical issues.
- **IMPORTANT** — Should fix. Missing tests, incorrect abstraction, poor error handling.
- **SUGGESTION** — Consider. Naming improvements, optional optimizations, style preferences.

## Output Format

```json
{
  "verdict": "APPROVE | REQUEST_CHANGES",
  "risk_tier": "TRIVIAL | LITE | FULL | IRREVERSIBLE",
  "summary": "2-sentence overview of changes and quality assessment",
  "scores": {
    "correctness": 0.0-1.0,
    "security": 0.0-1.0,
    "performance": 0.0-1.0,
    "architecture": 0.0-1.0,
    "readability": 0.0-1.0,
    "overall": 0.0-1.0
  },
  "findings": [
    {
      "severity": "CRITICAL | IMPORTANT | SUGGESTION",
      "file": "path/to/file.ts",
      "line": 42,
      "description": "What is wrong",
      "fix": "Specific code or instruction to resolve",
      "dimension": "security | correctness | performance | architecture | readability"
    }
  ],
  "positive": ["What was done well — always acknowledge good work"],
  "verification": {
    "tests_pass": true,
    "types_clean": true,
    "lint_clean": true,
    "no_secrets": true,
    "decisions_respected": true
  }
}
```

## Decision Rules

- `APPROVE`: overall >= 0.85 AND zero CRITICAL findings AND zero IMPORTANT findings
- `REQUEST_CHANGES`: any CRITICAL finding OR overall < 0.70
- `APPROVE with comments`: overall >= 0.70 AND only SUGGESTION findings

## Anti-Bias Instructions

- Do NOT favor verbose implementations over concise correct ones
- Do NOT penalize creative solutions that work correctly
- Do NOT assume unfamiliar patterns are wrong — verify first
- ALWAYS include at least one positive observation
- Surface uncertainty: "I'm not sure if X is intentional — please verify"
```

### What This Prompt Checks That Others Miss

| Check | Why it matters |
|-------|---------------|
| DECISIONS.md compliance | Prevents agents from violating locked architectural decisions |
| Tests-first reading | Understands intent before judging implementation |
| Risk tier assignment | Enables proportional review depth |
| Positive observations | Prevents review fatigue; acknowledges good work |
| Uncertainty surfacing | Avoids false negatives from overconfident dismissal |

**Sources:** VoltAgent/awesome-claude-code-subagents code-reviewer.md, addyosmani/agent-skills code-reviewer.md (APPROVE/REQUEST_CHANGES verdict format), karlstoney.com PR review agent (ADR context integration, diff-only analysis).

---

## 4. Design & UX QA Pattern

### Playwright + Vision Model Evaluation

```typescript
// File: lib/qa/design-qa.ts

import { chromium } from 'playwright';

interface DesignQAResult {
  score: number;
  findings: DesignFinding[];
  screenshots: string[]; // paths to captured screenshots
}

interface DesignFinding {
  severity: 'critical' | 'important' | 'suggestion';
  category: 'spacing' | 'color' | 'typography' | 'alignment' | 'responsive' | 'brand';
  description: string;
  screenshot: string;
  coordinates?: { x: number; y: number; width: number; height: number };
}

const DESIGN_QA_PROMPT = `You are a design quality auditor evaluating a UI screenshot against brand guidelines.

## Brand Guidelines (Beamix)
- Primary accent: #3370FF (blue) — CTAs, links, active states
- Background: #FFFFFF / #F7F7F7
- Primary text: #0A0A0A
- Muted text: #6B7280
- Card borders: #E5E7EB
- Fonts: Inter 400 (body), Inter 500 / InterDisplay-Medium (headings)
- Spacing: 4px grid system (4, 8, 12, 16, 24, 32, 48, 64)
- Border radius: 8px (cards), 6px (buttons), 4px (inputs)
- No orange, no navy, no cyan as accent

## Quality Bar: "Billion-Dollar Feel"
Reference: Stripe, Linear, Anthropic, Apple. Every pixel intentional.

## Evaluation Criteria
1. **Spacing consistency** — Is the 4px grid respected? No random gaps?
2. **Color compliance** — Only approved palette colors used? Sufficient contrast?
3. **Typography hierarchy** — Clear heading/body distinction? No font-size soup?
4. **Alignment** — Grid-aligned? No 1-2px misalignments?
5. **Responsive** — Does it look intentional at this viewport? No overflow?
6. **Brand compliance** — Logo, colors, tone match guidelines?
7. **Craft details** — Hover states, transitions, empty states handled?

## Scoring
- 0.95+ = Ship-ready (Stripe/Linear quality)
- 0.85-0.94 = Good, minor polish needed
- 0.70-0.84 = Needs work, visible quality gaps
- <0.70 = Reject, significant brand violations

## Output (JSON)
{
  "score": 0.0-1.0,
  "verdict": "SHIP | POLISH | REWORK | REJECT",
  "findings": [
    {
      "severity": "critical | important | suggestion",
      "category": "spacing | color | typography | alignment | responsive | brand",
      "description": "Specific issue observed",
      "location": "Description of where on screen"
    }
  ],
  "positive": ["What looks great"]
}`;

async function runDesignQA(url: string, viewports: Viewport[] = DEFAULT_VIEWPORTS): Promise<DesignQAResult> {
  const browser = await chromium.launch();
  const results: DesignQAResult = { score: 0, findings: [], screenshots: [] };
  
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for animations to settle
    await page.waitForTimeout(1000);
    
    // Capture screenshot
    const screenshotPath = `/tmp/design-qa-${viewport.width}x${viewport.height}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    results.screenshots.push(screenshotPath);
    
    // Send to vision model for evaluation
    const evaluation = await evaluateWithVision(screenshotPath, DESIGN_QA_PROMPT);
    results.findings.push(...evaluation.findings);
    results.score = Math.min(results.score || 1, evaluation.score);
  }
  
  await browser.close();
  return results;
}

const DEFAULT_VIEWPORTS = [
  { width: 1440, height: 900 },  // Desktop
  { width: 768, height: 1024 },  // Tablet
  { width: 375, height: 812 },   // Mobile
];
```

### Design QA in the Review Pipeline

```
PR opened → Risk tier assigned → If FULL or IRREVERSIBLE:
  1. Deploy to preview URL (Vercel preview)
  2. Run Playwright screenshots at 3 viewports
  3. Send screenshots to Claude Vision with DESIGN_QA_PROMPT
  4. If score < 0.85: REQUEST_CHANGES with visual findings
  5. If score >= 0.85: Include design score in QA verdict
```

### Measuring "Billion-Dollar Feel" Objectively

| Signal | How to measure | Threshold |
|--------|---------------|-----------|
| Spacing consistency | Vision model checks 4px grid alignment | <3 violations per page |
| Color palette | Extract colors from screenshot, compare to allowed set | 0 unauthorized colors |
| Typography | Check font-size hierarchy, weight usage | Max 4 distinct sizes per page |
| Interaction polish | Check hover/focus/active states exist | All interactive elements |
| Empty states | Verify empty state designs (not blank white) | 100% coverage |
| Loading states | Skeleton screens present | All async content |
| Animation smoothness | No janky transitions (frame timing) | 60fps target |

**Sources:** Claude Vision capabilities (platform.claude.com/docs/en/build-with-claude/vision), Playwright visual testing (playwright.dev), ScreenshotVQA benchmark (emergentmind.com).

---

## 5. Goal-Backward Verification

### The Problem

Tests passing does NOT mean the task is done. An agent can:
- Write tests that validate current behavior (not requirements) — "Test Theater"
- Complete all subtasks but miss the actual user intent
- Produce working code that doesn't solve the stated problem

### The Pattern

```typescript
// File: lib/qa/goal-verification.ts

const GOAL_VERIFIER_PROMPT = `You are verifying whether a completed task actually achieved its stated goal.

## Verification Method
1. Read the ORIGINAL TASK DESCRIPTION (what was asked)
2. Read the COMPLETED WORK (what was delivered)
3. Ask: "If I were the person who requested this, would I consider it DONE?"

## Check for Ghost Actions
- Did the agent CLAIM to do something vs actually DO it?
- Are there tool calls that produced real effects?
- Is the system state actually changed, or just described?

## Check for Scope Drift
- Did the agent do MORE than asked (gold-plating)?
- Did the agent do LESS than asked (cutting corners)?
- Did the agent solve a DIFFERENT problem than stated?

## Verification Questions
1. Does the final output match the acceptance criteria in the brief?
2. Would a user testing this feature experience it working correctly?
3. Are there any "it works on my machine" assumptions?
4. Did the agent handle the unhappy path, or only the sunny day?

## Output
{
  "goal_achieved": true | false,
  "confidence": 0.0-1.0,
  "evidence": ["Specific evidence that goal was/wasn't met"],
  "gaps": ["What's still missing to fully achieve the goal"],
  "ghost_actions": ["Things claimed but not actually done"],
  "scope_assessment": "ON_TARGET | OVER_DELIVERED | UNDER_DELIVERED | DRIFTED"
}`;

// Integration with QA-Lead
async function verifyGoalCompletion(
  originalBrief: string,
  workerReturn: WorkerReturn,
  diffContent: string
): Promise<GoalVerification> {
  return await llmCall(GOAL_VERIFIER_PROMPT, {
    ORIGINAL_TASK: originalBrief,
    WORKER_SUMMARY: workerReturn.summary,
    FILES_CHANGED: workerReturn.files_changed.join('\n'),
    DIFF: diffContent,
  });
}
```

### Integration with QA Flow

```
Worker completes → Returns structured JSON → QA-Lead receives:
  1. Automated checks (lint, types, tests) — "Does it compile?"
  2. Code review (Section 3 prompt) — "Is the code good?"
  3. Goal verification (this section) — "Does it do what was asked?"
  4. Design QA if UI touched (Section 4) — "Does it look right?"
  
ALL FOUR must pass for QA verdict = PASS
```

**Source:** Confident AI agent evaluation guide (confident-ai.com/blog/definitive-ai-agent-evaluation-guide) — task completion via intent inference. "Ghost actions" concept from their framework.

---

## 6. Decision Memory & Replay Protection

### Pattern: Immutable Decision Log

```markdown
# DECISIONS.md — Append-Only Format

## D-042 | 2026-05-16 | Pricing tiers locked
- **Decision:** Discover $79 / Build $189 / Scale $499
- **Status:** LOCKED (cannot be changed without CEO + human approval)
- **Rationale:** NIS ceiling analysis, competitor positioning
- **Supersedes:** D-031 (old pricing at $49/$149/$349)
- **Lock level:** IRREVERSIBLE

## D-043 | 2026-05-16 | Primary accent color
- **Decision:** #3370FF (blue)
- **Status:** LOCKED
- **Rationale:** Brand differentiation, accessibility contrast ratios
- **Lock level:** FULL (needs CEO approval to change)
```

### Enforcement Mechanism

```typescript
// Every agent must call this BEFORE making changes
async function checkDecisionCompliance(
  proposedChange: string,
  affectedDomain: string
): Promise<{ compliant: boolean; violations: string[] }> {
  const decisions = await readDecisionsFile();
  const locked = decisions.filter(d => d.status === 'LOCKED');
  const relevant = locked.filter(d => d.domain === affectedDomain);
  
  // LLM check: does the proposed change violate any locked decision?
  return await llmCall(DECISION_COMPLIANCE_PROMPT, {
    PROPOSED_CHANGE: proposedChange,
    LOCKED_DECISIONS: relevant.map(formatDecision).join('\n'),
  });
}
```

### Agent Decision Record (AgDR) Integration

Before any architectural choice, agents create a record:

```markdown
## AgDR-0015 | 2026-05-16
- **Agent:** backend-developer (Sonnet 4.6)
- **Trigger:** user-prompt via build-lead
- **Context:** Need to choose between Inngest and Trigger.dev for job queue
- **Decision:** Inngest (free tier sufficient for MVP)
- **Alternatives:** Trigger.dev (better DX but no free tier), BullMQ (self-hosted overhead)
- **Tradeoffs:** Accepting 50K steps/mo limit; will migrate to Pro at ~5 paying customers
- **Status:** EXECUTED
- **Supersession:** Requires CEO approval to change
```

**Sources:** me2resh/agent-decision-record on GitHub (Y-statement format, enforcement via git hooks), O'Reilly "Why Multi-Agent Systems Need Memory Engineering" (36.9% of failures from interagent misalignment, immutable event logs).

---

## 7. Cost & Runtime Quality Control

### Token Budget Enforcement

```typescript
// File: lib/qa/cost-control.ts

interface TaskBudget {
  maxTokensIn: number;
  maxTokensOut: number;
  maxCostUSD: number;
  maxIterations: number;
  modelCeiling: 'haiku' | 'sonnet' | 'opus';
}

const TIER_BUDGETS: Record<RiskTier, TaskBudget> = {
  TRIVIAL: { maxTokensIn: 10_000, maxTokensOut: 2_000, maxCostUSD: 0.05, maxIterations: 1, modelCeiling: 'haiku' },
  LITE:    { maxTokensIn: 50_000, maxTokensOut: 10_000, maxCostUSD: 0.25, maxIterations: 2, modelCeiling: 'sonnet' },
  FULL:    { maxTokensIn: 200_000, maxTokensOut: 50_000, maxCostUSD: 2.00, maxIterations: 3, modelCeiling: 'sonnet' },
  IRREVERSIBLE: { maxTokensIn: 500_000, maxTokensOut: 100_000, maxCostUSD: 10.00, maxIterations: 5, modelCeiling: 'opus' },
};
```

### Model Escalation Strategy

```
Start with cheapest model capable of the task:
1. Haiku: lint checks, simple classification, log parsing
2. Sonnet: code generation, reviews, most QA tasks
3. Opus: security audits, complex synthesis, irreversible decisions

Escalation trigger: If Sonnet returns verdict with confidence < 0.7,
re-run with Opus. Track escalation rate — if >20%, the task
classification is wrong (should be higher tier).
```

### Cost-Per-Quality Metric

```
Quality-Adjusted Cost = Total Cost / (Score * Completion Rate)

Target: < $0.50 per quality-verified task (Lite tier)
Alert: > $2.00 per task suggests model routing failure
```

**Sources:** Augment Code guide (augmentcode.com/guides/ai-agent-loop-token-cost-context-constraints) — O(n^2) cost growth in naive loops, 43.3x multiplier at 10 steps. TrueFoundry blog — $5-8 unconstrained agent cost per task. MindStudio — Claude Code token budget management.

---

## 8. Anti-Patterns to Avoid

### Anti-Pattern 1: Quality Theater

**What it is:** Gates that look impressive but catch nothing real.

**Symptoms:**
- 100% test pass rate but tests only validate current behavior (not requirements)
- Code review that always approves with "LGTM"
- Coverage metrics that count lines touched, not logic branches tested

**How to detect:**
- Mutation testing: if you break the code and tests still pass, they're theater
- Track "issues found per review" — if it's always zero, the review isn't working
- Ask: "What was the last bug this gate caught?" If no one can answer, it's theater.

**Fix:** Goal-backward verification (Section 5). Test requirements, not implementations.

**Source:** Ben Houston "The Rise of Test Theater" (ben3d.ca/blog/the-rise-of-test-theater) — "more than 50% of AI-generated tests fall into the mirroring category"

---

### Anti-Pattern 2: Verbosity Bias in LLM Judges

**What it is:** LLM evaluators systematically prefer longer, more detailed outputs regardless of correctness.

**Symptoms:**
- Shorter correct answers score lower than longer wrong answers
- Agents learn to be verbose to pass QA
- Output bloat over time as agents optimize for the judge

**How to detect:**
- Compare scores for equivalent solutions at different lengths
- Track average output length over time — if growing without quality gain, bias is present

**Fix:**
- Explicit anti-verbosity instruction in evaluator prompt: "Score based on FUNCTION, not LENGTH"
- Penalize unnecessary verbosity in rubric
- Use conciseness as a positive criterion

**Source:** arxiv.org/html/2410.02736v1 (Justice or Prejudice? Quantifying Biases in LLM-as-a-Judge), sebastiansigl.com/blog/llm-judge-biases-and-how-to-fix-them

---

### Anti-Pattern 3: Self-Preference / Family Bias

**What it is:** Models score their own outputs (or same-family outputs) higher than equivalent alternatives.

**Symptoms:**
- Claude reviewing Claude-generated code always gives higher scores
- Same model for generation and evaluation inflates scores
- Consistent 0.9+ scores that don't correlate with human assessment

**How to detect:**
- Swap judge model: if scores change >15%, bias is present
- Compare to human evaluator agreement rate (target: 80-90%)

**Fix:**
- **MANDATORY:** Use different model family for judge vs generator
- If generator is Sonnet, evaluator should be Haiku (different architecture)
- Or use OpenAI/Gemini as judge for Claude-generated code
- Run pairwise comparisons with swapped positions

**Source:** arxiv.org/html/2410.21819v2 (Self-Preference Bias in LLM-as-a-Judge), arxiv.org/html/2604.22891v1 (Quantifying and Mitigating Self-Preference)

---

### Anti-Pattern 4: Inflated Confidence Scores

**What it is:** Evaluators consistently rate above 0.8 regardless of actual quality, making thresholds meaningless.

**Symptoms:**
- Score distribution clusters at 0.85-0.95 (no variance)
- FAIL verdicts almost never issued
- Threshold of 0.85 passes everything because nothing scores below it

**How to detect:**
- Plot score distribution — should be roughly normal, not clustered high
- Calibrate against known-bad examples (if they score >0.7, calibration is off)
- Track FAIL rate — should be >5% or the evaluator is too lenient

**Fix:**
- Include "negative criteria" that actively subtract points for anti-patterns
- Calibrate with golden dataset of known-good AND known-bad examples
- Set asymmetric thresholds: lower the PASS bar if distribution is too high
- Add explicit "What's wrong?" prompt section (forces finding issues)

**Source:** Langfuse docs (80-90% human agreement target), GoDaddy calibration blog (godaddy.com/resources/news/calibrating-scores-of-llm-as-a-judge), Appen rubric design (appen.com/llm-as-a-judge-rubric-design)

---

### Anti-Pattern 5: Reviewer Collusion (Same Prompt Family)

**What it is:** When the reviewer shares prompt DNA with the producer, it's structurally incapable of catching the producer's blind spots.

**Symptoms:**
- Generator and evaluator make the same assumptions (both miss the same edge cases)
- Reviews never catch architectural issues because both agents share the same system prompt context
- Multi-judge voting produces unanimous agreement that's still wrong

**How to detect:**
- Inject known bugs: if 3/3 judges miss the same bug, they share a blind spot
- Track "issue type diversity" across judges — low diversity = collusion risk
- Compare to independent human review findings

**Fix:**
- Vary system prompts across judges (one focuses security, one correctness, one architecture)
- Use different model providers for judges in multi-judge setup
- Include an adversarial judge: "Your job is to find problems. You are rewarded for catching bugs others miss."
- Rotate judge configurations periodically to prevent adaptation

**Source:** arxiv.org/html/2602.09341v1 (AgentAuditor — "majority voting discards evidential structure, brittle under confabulation consensus"), Multi-Agent Debate for LLM Judges (openreview.net/forum?id=Vusd1Hw2D9)

---

## 9. Multi-Judge Voting Pattern

For IRREVERSIBLE tier changes, use 3 independent judges:

```typescript
async function multiJudgeReview(
  content: string,
  task: string
): Promise<{ verdict: string; confidence: number }> {
  // Three judges with different focuses
  const judges = [
    { model: 'claude-haiku', focus: 'security-first', prompt: SECURITY_JUDGE_PROMPT },
    { model: 'claude-sonnet', focus: 'correctness-first', prompt: CORRECTNESS_JUDGE_PROMPT },
    { model: 'gpt-4o-mini', focus: 'architecture-first', prompt: ARCHITECTURE_JUDGE_PROMPT },
  ];
  
  const verdicts = await Promise.all(
    judges.map(j => runJudge(j, content, task))
  );
  
  // Median verdict wins (not majority — avoids correlated bias)
  const scores = verdicts.map(v => v.score).sort();
  const medianScore = scores[Math.floor(scores.length / 2)];
  
  // Require 2/3 agreement on verdict category
  const passCount = verdicts.filter(v => v.verdict === 'PASS').length;
  const finalVerdict = passCount >= 2 ? 'PASS' : 'FAIL';
  
  // If any judge finds CRITICAL issue, always FAIL regardless of votes
  const hasCritical = verdicts.some(v => 
    v.issues.some(i => i.severity === 'critical')
  );
  
  return {
    verdict: hasCritical ? 'FAIL' : finalVerdict,
    confidence: hasCritical ? 1.0 : medianScore,
  };
}
```

**Key insight:** Any single CRITICAL finding overrides the vote. This prevents a 2-1 "majority approves" scenario where one judge caught a real security hole.

**Source:** arxiv.org/html/2508.02994v1 (Agent-as-Judge — single agent judge disagreed with humans 31% of the time; multi-agent panel disagreed only 0.3%). AgentAuditor paper — median over majority voting for robustness.

---

## 10. What Beamix Should Do — Implementation Roadmap

### Phase 1: Immediate (This Sprint)

| Action | File Path | Effort |
|--------|-----------|--------|
| Add risk tier assignment to QA-Lead | `.agent/agents/qa-lead.md` | Update prompt |
| Add per-tier checklists | `.agent/agents/qa-lead.md` | Checklist section |
| Evaluator prompt with anti-bias rules | `lib/qa/evaluator-optimizer.ts` (new) | 200 LOC |
| Code reviewer prompt (Section 3) | `.agent/agents/code-reviewer.md` | Update prompt |
| Decision compliance check | `.agent/agents/code-reviewer.md` | Add DECISIONS.md read step |

### Phase 2: Next Sprint

| Action | File Path | Effort |
|--------|-----------|--------|
| Goal-backward verifier | `lib/qa/goal-verification.ts` (new) | 150 LOC |
| Design QA with Playwright | `lib/qa/design-qa.ts` (new) | 300 LOC |
| Token budget enforcement | `lib/qa/cost-control.ts` (new) | 100 LOC |
| Multi-judge for IRREVERSIBLE tier | `lib/qa/multi-judge.ts` (new) | 200 LOC |

### Phase 3: Ongoing

| Action | File Path | Effort |
|--------|-----------|--------|
| Calibration dataset (golden examples) | `tests/qa-calibration/` (new) | Curated |
| Score distribution monitoring | `lib/qa/metrics.ts` (new) | 100 LOC |
| Anti-theater mutation testing | CI pipeline | Config |
| Judge rotation schedule | `.agent/config/judge-rotation.yaml` | Config |

---

## Sources Index

| Source | URL | Used In |
|--------|-----|---------|
| Anthropic Building Effective Agents | anthropic.com/research/building-effective-agents | Evaluator-optimizer definition |
| Anthropic Cookbook Evaluator-Optimizer | platform.claude.com/cookbook/patterns-agents-evaluator-optimizer | Implementation code |
| Anthropic Multi-Agent Research System | anthropic.com/engineering/multi-agent-research-system | Quality rubric, citation agent |
| VoltAgent Code Reviewer | github.com/VoltAgent/awesome-claude-code-subagents | Prompt structure |
| Addy Osmani Agent Skills | github.com/addyosmani/agent-skills | APPROVE/REQUEST_CHANGES format |
| Karl Stoney PR Review Agent | karlstoney.com/building-a-pr-review-agent/ | ADR integration, diff strategy |
| Agent Decision Records | github.com/me2resh/agent-decision-record | AgDR format |
| O'Reilly Memory Engineering | oreilly.com/radar/why-multi-agent-systems-need-memory-engineering | 36.9% failure rate stat |
| Langfuse LLM-as-Judge | langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge | Scoring scales, calibration |
| Augment Code Token Costs | augmentcode.com/guides/ai-agent-loop-token-cost-context-constraints | Budget enforcement patterns |
| Ben Houston Test Theater | ben3d.ca/blog/the-rise-of-test-theater | Anti-pattern documentation |
| LLM Judge Biases | sebastiansigl.com/blog/llm-judge-biases-and-how-to-fix-them | 5 biases + fixes |
| Self-Preference Bias | arxiv.org/html/2410.21819v2 | Cross-provider judge rule |
| AgentAuditor | arxiv.org/html/2602.09341v1 | Multi-judge voting superiority |
| Confident AI Agent Eval | confident-ai.com/blog/definitive-ai-agent-evaluation-guide | Goal verification, ghost actions |
| claude-flow | github.com/ruvnet/claude-flow | Risk tiers, verification thresholds |
| bobmatnyc/ai-code-review | github.com/bobmatnyc/ai-code-review | 16 review types, severity scores |
