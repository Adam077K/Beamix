# Board Member 7 — QA Process Enforcer

## Verdict: QA WILL CATCH 60% — IT WILL MISS THE THINGS THAT MATTER

The QA gate is specced as a *technical correctness* gate (security holes, types, idempotency, RLS, semgrep). It is not specced as a *product quality* gate. The spec assumes "code reviewer + qa-engineer + semgrep + security-engineer + adversary-engineer + Opus security" produces a thorough review — but every one of those reviewers has the same lens: **technical correctness**. None of them owns craft, customer value, or "billion-dollar feel." The verdict frontmatter is `verdict | risk_tier | findings: []` with zero schema for visual craft, copy quality, or customer-outcome alignment. Bad PRs that are *correct but mediocre* will pass.

---

## What the QA gate WILL catch

- **Security holes.** SSRF, prompt injection, missing RLS, webhook replay, TOCTOU credit races — all explicitly enumerated in the per-worker security ownership lists. Full-tier reviewers are specifically chartered for these.
- **Type drift.** API contract divergence from `@/lib/types/api` is called out in Wave 1 line 379 as an explicit BLOCK condition.
- **Idempotency / replay / kill-switch races.** Paddle webhook, `allocate_monthly_credits`, agent pipeline finally-blocks — all specced and reviewable.
- **`z.any()` escape hatches** (sometimes — see "ball-drop" below).
- **Missing tests.** qa-engineer reviews the `__tests__/` directory presence.
- **`npm audit` advisories.**
- **Semgrep rule violations** (the pre-defined rule set only).
- **Prompt-injection / AI disclosure leakage** in agent output prompts (input-guard layer is reviewable).
- **DB advisor findings** (Worker 1 is gated on `mcp__supabase__get_advisors`).

That's a strong technical floor. The MVP will not ship with an OWASP-Top-10 hole.

---

## What the QA gate WILL NOT catch

1. **Sub-billion-dollar feel.** No craft criterion exists anywhere in the QA gate. Board Member 4's audit already flagged this — the QA verdict has zero entries for visual quality. A frontend PR that ships generic Shadcn defaults will pass Full-tier QA cleanly because the reviewers aren't asked about craft.
2. **Cold-Shadcn-default ship.** There is NO visual review step in Full-tier. No design-lead in the QA reviewer set. No screenshot-vs-reference comparison. Wave 2 Worker 4 runs Playwright screenshot *regression* tests — these detect drift, not mediocrity. Three frontend workers will ship three subtly divergent UIs and all three will pass.
3. **Customer-value drift.** No reviewer is chartered with "does this PR move the customer outcome metric?" The 10 board-mandated security items get per-worker ownership; the customer outcome has no owner. A PR that ships a technically perfect feature pointing at the wrong customer outcome will pass.
4. **Reviewer overlap → shallow coverage.** code-reviewer + qa-engineer + security-engineer + adversary-engineer all read the same diff with overlapping mandates. Without explicit non-overlapping charters per reviewer (which the spec does not provide), they'll produce 4 shallow reviews instead of 4 deep ones — classic multi-reviewer dilution.
5. **Block-vs-Suggest threshold is undocumented.** The verdict is binary (PASS | BLOCK) but the *threshold* for BLOCK is nowhere specified. Reviewers will default to "suggest" because BLOCK feels confrontational, especially when CEO is pressing for wave completion. Expect findings-as-comments rather than findings-as-blocks.
6. **QA Lead under-tiering its own work.** The QA Lead orchestrator decides the risk tier per PR. There's no audit of that decision. Under pressure, QA Lead will risk-tier a borderline Full PR as Lite to save tokens/time. The brief says "all Wave 0/1/2 PRs are Full-tier" — but the moment a "small fix" PR ships post-launch, the tier-down logic is undefined.
7. **Docs-only / typo PRs.** The spec says every Wave PR is Full-tier. Trivial tier exists in `11-START-HERE.md` ("Haiku-only review, copy edit") but no rule says when Trivial applies. A README typo will run a $5 Full-tier review, training the team to skip QA on real PRs out of frustration.
8. **Iteration loop is undefined.** When QA BLOCKs, the spec says "CEO collects feedback, hands back to worker for revisions, re-runs QA" — but no contract for *how* the worker re-enters the worktree, whether the same worker or a new one, and whether the BLOCK findings persist in the verdict file. CEOs under pressure will patch in place instead of re-spawning the worker, violating the layer contract.
9. **55 golden-case agent evals at "4/5 publish-ready by Adam."** This is 55 agent outputs Adam personally reviews. That is 4–6 hours of focused reading. Realistically Adam will skim, mark "publish-ready" liberally on cases 30+, and the eval bar collapses to "Adam tolerated it" not "publish-ready." Bar should be 5/5, fewer cases (3 per agent = 33), with rubric.
10. **The `z.any()` escape hatch on hard endpoints.** Agent Simulator board member already flagged this in `01-agent-execution-simulator.md` line 114 — Lite-tier QA is "single review" and a tired Lite reviewer will pass `z.record(z.unknown())` on the discriminated unions. The Full-tier briefs don't explicitly require the reviewer to grep the diff for `z.any` / `z.unknown`.

---

## The "craft" reviewer gap — proposed fix

**Add a 5th Full-tier reviewer: `craft-reviewer` (Sonnet).** Charter:

> Read the PR diff with one lens only: "Does this ship at Linear / Stripe / Mercury / Things3 quality, or does this ship at PostHog quality?" You are NOT reviewing for correctness — other reviewers do that. You are reviewing for: spacing rhythm, typography intentionality, hover/focus states, animation choreography, microcopy precision, empty-state quality, error-state quality, loading-state quality. You compare against the reference set: Linear (lists), Stripe (forms + payment), Mercury (dashboards), Things3 (empty states), Anthropic.com (typography). You BLOCK if any of: (a) Tailwind default tracking on >24px text, (b) Shadcn default focus ring on any interactive element, (c) skeleton uses pulse instead of shimmer, (d) any animation uses Framer Motion's default spring, (e) microcopy contains the word "Loading..." with no context, (f) empty state ships placeholder SVG, (g) error toast uses Shadcn default styling, (h) hover state changes only opacity or color (no transform / no shadow), (i) padding drift from `_patterns.md` reference, (j) any user-facing string contains "AI" disclosure.

Add this reviewer to Wave 0 Worker 3 (app shell, design tokens), every Wave 1 frontend worker, and Wave 2 Worker 4. Skip for backend-only PRs. Spec this BEFORE Wave 1 spawns — it's the only check that prevents the "expensive Shadcn template" failure mode.

**Also add: a verdict-file schema change.** Frontmatter should include:
```yaml
craft_score: 1-5  # 1=PostHog, 3=baseline-good-SaaS, 5=Linear/Stripe
craft_findings: []  # explicit list, never empty for frontend PRs
customer_outcome_check: "does this PR move <metric>? — yes/no/n-a"
```
Empty `craft_findings` on a frontend PR is itself suspicious and CEO must challenge it.

---

## Adam's checklist when he's the final reviewer

(Right now Adam has NO checklist — PRs land on him with `verdict: PASS` and that's it. Below is what should sit next to him for every PR review.)

1. **Does this PR move a specific customer outcome metric?** Name the metric. If you can't name it in <10 seconds, BLOCK.
2. **Pull the PR locally / Vercel preview. Click 3 surfaces. What feels off?** Write down 3 specific moments where the craft slipped. If you can't find 3, you weren't looking hard enough.
3. **Read the user-facing copy. Out loud.** Does it sound like Beamix or like ChatGPT? Any "AI" word? Any "Loading..." with no context?
4. **Check one empty state and one error state.** Are they thoughtful, or stubs?
5. **Pick one interaction. Hover, focus, click.** Are all three states intentional?
6. **Does this PR introduce any TODO / FIXME / "we'll fix later" in code or copy?** If yes, BLOCK.
7. **Does this PR introduce a new pattern that should be in `_patterns.md`?** If yes, was `_patterns.md` updated?
8. **One sentence: what would the Linear team think of this PR?**
9. **One sentence: what would the PostHog team think of this PR?** If the answer is "same as Linear," BLOCK — it means there's no differentiation.
10. **What does the QA verdict file say in `craft_findings`?** Empty on a frontend PR → reject and re-run QA.

Print this. Tape it to the monitor.

---

## The single PR type most likely to slip through Full-tier

**A Wave 1 frontend PR for a "boring" page** — most likely the Settings page or Archive page. Here's why:

- It's NOT the wound-reveal (which has a tight visual spec).
- It's NOT the Home page (which the board has flagged as highest-leverage).
- It IS user-facing, but specced thinly — `08-UX-ARCHITECTURE.md` gives layout intent, not pixel choreography.
- The frontend worker will ship "correct Shadcn defaults + Beamix tokens + working state management." It will typecheck, lint, build, pass RLS smoke, pass semgrep, pass the security-engineer review (no SSRF, no XSS, rehype-sanitize present).
- The qa-engineer sees tests exist. PASS.
- The adversary-engineer finds no exploit path. PASS.
- The Opus security agent confirms no auth bypass. PASS.
- No reviewer is asked about craft. PASS.
- Adam, reviewing his 6th PR of the wave, sees verdict PASS and merges.

**That PR is the one that ships at PostHog tier.** And once 2–3 of those merge, the *baseline* of the product is PostHog tier, and the wound-reveal alone can't pull the whole brand back up.

The craft-reviewer addition above is the single biggest leverage point in the QA gate.

---

## Bottom line for the board

The QA gate is a competent technical gate. It is not a product quality gate. Without a `craft-reviewer` charter + a verdict-file schema change + an Adam-facing review checklist, the MVP will ship secure, fast, and correct — and visually indistinguishable from every other AI-search-visibility SaaS. The locked rule "CEO and CTO cannot override QA" only matters if QA is asking the right questions. Today it is not.
