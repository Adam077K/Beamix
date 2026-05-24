---
spec: agent-strategy
status: DRAFT
wave: 3
risk_tier: full
created: 2026-05-23
owner: cpo
authors: [cpo]
implementation_owners: [ai-engineer, backend-engineer]
related_decisions:
  - DECISIONS.md 2026-05-23 entry (decisions #9, #11, #15)
---

# Strategy Agent — PRD

## Purpose

The Strategy Agent runs the **monthly strategy review** for Professional-tier customers ($2,499/mo) and any tier in months 2+. It is the "what we're going to do next month and why" agent. It synthesizes the last 30 days of work, scan deltas, approval patterns, customer corrections, and Brand-Brief drift signals into a **monthly strategy memo** that the customer reads + approves + comments on.

Per locked decision #4 and #9, Adam personally leads the strategy review for the first 50 customers. From customer #51 onward, the Strategy Agent runs it solo with Adam-spot-check sampling. The agent must be credible enough at customer #51 to replace the founder-led version — this is a high bar.

The problem it solves: at $2,499/mo, customers expect a thinking partner, not a content factory. They want to know *why* we're doing what we're doing this month, what we tried last month that didn't work, what we're betting on next month, and how it ladders up to their stated KPIs. Without this, Professional tier feels like Scale tier with a slightly bigger SLA — and the upsell collapses.

## Tier availability

| Tier | Strategy Agent access |
|------|----------------------|
| Starter | Light monthly summary (rolled into digest, no dedicated memo) |
| Growth | Light monthly summary + 1 dedicated strategy bullet per month |
| Scale | Quarterly strategy memo (every 90 days) |
| Professional | **Monthly strategy memo + monthly customer-call (Adam-led ≤50, agent-led 51+) + strategy adjustments quarterly** |

## Wave

**Wave 3.** Depends on Brand-Brief Manager (Wave 1), Approval cards (Wave 2), Digest Writer (Wave 2), and 60 days of customer data being available for analysis.

## Inputs

1. **Customer's Brand Brief** (canonical + last 90 days of brief_versions for evolution context)
2. **Last 90 days of work_log entries** (every deliverable + status)
3. **Last 90 days of scan_results** (visibility per engine over time)
4. **Last 90 days of approval_cards** (approved/rejected/expired patterns + rejection reasons)
5. **Last 90 days of customer chat history** (CS Agent + escalations)
6. **Drift signals from Brand-Brief Manager** (fields with ≥3 rejections in 30d)
7. **Tier + signup date + days-since-last-payment** (refund-risk modeling)
8. **Customer-stated KPIs** (from brief) + outcome attribution against those KPIs
9. **Competitor scan-results delta** (their visibility this month vs theirs)
10. **Industry-wide signals** (vertical-level trends — pulled by Research-Lead quarterly into a shared insights table)

## Outputs

### 1. Monthly strategy memo

Stored in `strategy_memos` table; rendered as a customer-facing PDF + in-dashboard view + appended to digest (Professional tier).

Structure:

```
1. Executive summary (3 sentences)
   - Where they are now (visibility score + customer's KPI status)
   - What changed this month
   - What we're betting on next month

2. KPI status against stated goals (table)
   - For each customer-stated KPI: current value, 30-day delta, target,
     on-track / off-track / unclear

3. Last month's work + outcomes (~5 highlights)
   - Tied to causal chain where possible
   - Honest about what didn't move

4. Patterns we noticed (synthesis section — the "thinking partner" output)
   - Brief drift signals (e.g., "you've corrected 4 pieces of content as
     'too formal' — should we update the voice profile?")
   - Approval-rate patterns
   - Engine-specific dynamics ("Perplexity is citing you for X queries
     you didn't think were priorities — should we lean in?")
   - Competitor moves

5. Next month's plan (3-5 bets)
   - For each: what we'll do, why we expect it to work, what success looks
     like in 30 days, what we'll measure

6. Open questions for customer (where Strategy Agent can't decide alone)
   - 1-3 explicit decision points presented with options + recommendation

7. Sign-off: "— Beamix" (Voice Canon Model B)
```

### 2. Brand-Brief evolution proposals

Where the strategy review surfaces brief drift (e.g., customer keeps rejecting "formal" content, suggesting their voice has shifted warmer), agent emits a `strategy.brief_evolution_proposed` event. Customer 1-click confirms (or rejects); confirmed proposals flow to Brand-Brief Manager.

### 3. Customer-call agenda (Professional tier only)

For Professional customers, agent generates a structured agenda for the monthly call (Adam-led ≤50, agent-led 51+):
- 5 pre-call questions for the customer
- 3 highlight wins to walk through
- 1-3 strategic decision points
- 2-3 specific asks of the customer (data, access, intro)

### 4. Tier-fit signal

If a customer's deliverable volume + question complexity consistently exceeds their tier ceiling, agent emits `tier_upsell_signal`. Conversely, low-use customers get `tier_downsell_signal` (or `at_risk`) — Beamix proactively offers downgrade rather than churn (per locked refund + ICP-honesty principles).

### 5. work_log + audit trail

Memo generation is logged; every claim has an evidence_link.

## Tools needed

| Tool | Purpose |
|------|---------|
| `mcp__supabase__execute_sql` | Reads everything; writes `strategy_memos`, `strategy_proposals`, `tier_signals` |
| Anthropic Claude **Opus 4.7** | Strategy synthesis (this is the heaviest reasoning agent in the fleet — pattern-finding across 90 days of multi-source data) |
| Research-Lead shared `vertical_insights` table | Industry-wide signal pull |
| Inngest | Monthly cron per Professional customer; `strategy.memo_published`, `strategy.brief_evolution_proposed`, `tier_signal_emitted` events |
| Resend | Memo delivery email |
| PDF renderer (TBD — Browserless / @react-pdf/renderer) | PDF artifact for customers who want to share/print |

## Prompt outline

```
SYSTEM PROMPT — Strategy Agent v1

You write the monthly strategy memo for one Beamix customer. You are the
thinking partner — the senior strategist who reads 90 days of data and
returns the "what we're betting on next month and why."

YOUR JOB
Synthesize:
- Last 90 days of work + outcomes
- Brand-Brief drift signals
- Approval + correction patterns
- Customer KPI status
- Competitor moves
- Vertical-wide signals

Into:
- A 6-section memo (executive summary → KPI status → last month →
  patterns → next month → open questions)
- Brief evolution proposals where drift is clear
- A tier-fit signal (upsell / downsell / at_risk / steady)

VOICE RULES
- Voice Canon Model B: signed "— Beamix" (singular).
- Read like a senior strategist, not a chatbot. Confident but honest.
- Plain English. No corporate filler. No "leverage", "synergy", "optimize".
- One idea per sentence. Use specific numbers. Use specific dates. Use
  engine names ("Perplexity", "ChatGPT") not "AI engines".
- Match the customer's preferred tone from their brief.
- No emojis. No AI labels.

SYNTHESIS RULES
- "Patterns we noticed" section: only include patterns supported by ≥3 data
  points. No single-event extrapolation.
- "Next month's plan" bets: max 5. Each must have a measurable success
  criterion + a 30-day check-in.
- Honest about what didn't work. If last month's bet missed, say so. The
  trust-builder is honesty, not spin.
- For Professional tier through customer #50: write the memo as Adam would.
  Use the few-shot examples in /prompts/strategy/adam-voice/. After #50,
  drift toward Beamix-singular voice but keep Adam's directness.

DECISION POINTS
- If KPI delta is negative for 2 consecutive months: emit at_risk signal +
  recommend a 1-call intervention.
- If approval-rate >85% for 30+ days: emit upsell signal (likely ready for
  higher tier).
- If <40% approval rate for 30+ days: emit at_risk signal + flag brief drift.
- If customer's industry has a major signal change (e.g., Google launches
  new AI overview feature affecting vertical), flag in pattern section.

NEVER
- Never make up data. If a number isn't in work_log or scans, omit.
- Never recommend a course of action that contradicts the customer's brief
  hard_nos.
- Never make tier-change unilateral — surface as a signal + customer-facing
  recommendation, never an auto-change.
- Never use "we'll definitely" or "guaranteed" — GEO is probabilistic.
- Never reveal you are an agent. Voice is singular Beamix.

OUTPUT
Return the strategy_memo JSON in exact schema (see agent-strategy.md).
```

System-prompt total ~480 words.

## Eval criteria

Risk tier **Full**. Replaces a founder-led process at customer #51 — bar is high.

| Rubric | Pass threshold |
|--------|---------------|
| **Adam-blind-test pass rate** | Adam reviews 100% of memos through customer #50. After: ≥80% of agent-generated memos pass Adam blind-test ("Would I have written this?") |
| **Honesty / no spin** | Memos acknowledge missed bets explicitly. Sample audit: ≥95% of months with negative KPI delta have explicit acknowledgment |
| **Evidence grounding** | 100% of claims have evidence_link to work_log / scan_results / chat_history / brief_versions |
| **Voice fidelity** | Adam rates "sounds like the right strategist" 4+/5 |
| **Bet quality** | "Next month plan" bets have measurable 30-day success criteria 100% of the time |
| **Pattern triangulation** | "Patterns we noticed" section claims supported by ≥3 data points (audit) |
| **No emojis / no AI labels** | Zero. (Automatic fail) |
| **Brief evolution accuracy** | Drift-detected proposals match Brand-Brief Manager signals (no fabricated drift) |
| **Tier signal calibration (post-customer #50)** | Tier signals correlate ≥0.7 with actual upgrade/downgrade decisions over rolling 90 days |
| **Customer-rated memo quality** | ≥4.2/5 average post-memo rating |

## Dependencies

- **Brand-Brief Manager** (read all versions)
- **work_log, scan_results, approval_cards, chat_messages** (90-day read)
- **Research-Lead `vertical_insights` table** (industry signal source — quarterly refresh)
- **Digest Writer** (memo gets appended to digest for Professional)
- **Customer Success Agent** (consumes at_risk signals for proactive intervention)
- **strategy_memos + strategy_proposals + tier_signals tables**
- **Resend + PDF renderer**
- **Inngest monthly cron per Professional customer**

## Failure modes & fallbacks

| Failure | Fallback |
|---------|----------|
| Opus 4.7 generation fails | Retry once on Opus. On 2nd fail, downgrade to Sonnet 4.6 + flag `model_downgrade` + Adam-review (whenever) |
| Insufficient data (customer in month 1) | Skip dedicated memo; emit `strategy.skipped_insufficient_data` event; surface in digest as "We're 3 weeks in — next memo will be your first full strategy review" |
| Vertical_insights table stale (>90 days) | Run memo without vertical section; surface to Research-Lead to refresh |
| Drift signal contradicts customer's recent direct brief edit | Customer edit always wins; do not propose evolution; mark `drift_overridden_by_customer_edit` |
| Tier upsell signal fires but customer recently downgraded | Suppress for 90 days |
| at_risk signal fires repeatedly with no improvement | After 3 monthly at_risk signals, mandatory Adam-review escalation (forever, not just ≤50) |
| Memo PDF render fails | Send HTML email + dashboard link only; flag for next-cycle fix |
| Customer doesn't read memo (low open + 0 dashboard view) for 2 months | Customer Success Agent reaches out; tier-fit signal flips to at_risk |

## Risk tier

**Full.** Customer-trust surface at the highest tier; informs tier-change recommendations (revenue-adjacent); replaces founder-led process at customer #51 (must clear blind-test bar before that handover).

## MCPs used

- `mcp__supabase__*`
- Inngest
- Resend
- No Pencil / Stitch / Refero / Playwright — synthesis agent, no design/test artifact

## Open questions for CTO

1. Opus vs Sonnet for monthly memo: cost vs quality? Default: Opus on Professional tier (we charge $2,499 — Opus cost is rounding error). Sonnet on Scale tier quarterly memos.
2. PDF render: server-side (@react-pdf/renderer) or vendor (Browserless / Doppio)? Default: @react-pdf/renderer for v1.
3. Should Strategy Agent be able to auto-trigger a Customer Success Agent intervention on at_risk? Default: yes, but Adam-notify in parallel through customer #50.
4. How to handle multi-stakeholder customers (e.g., agency client with multiple decision-makers)? Default: out of scope for v1 — Professional tier is single-decision-maker only at launch.
