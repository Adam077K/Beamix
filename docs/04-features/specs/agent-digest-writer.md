---
spec: agent-digest-writer
status: DRAFT
wave: 2
risk_tier: full
created: 2026-05-23
owner: cpo
authors: [cpo]
implementation_owners: [ai-engineer, backend-engineer]
related_decisions:
  - DECISIONS.md 2026-05-23 entry (decisions #7, #15)
---

# Digest Writer Agent — PRD

## Purpose

The Digest Writer composes the **weekly digest email** — the single most important customer-facing artifact in the agency model. The customer reads this email every Monday (or whatever day they choose), sees what Beamix did for them last week, scans pending approvals, and gets a "here's how we got these wins" traceability narrative. If this email is great, customers stay 6+ months. If it's mediocre, the refund clock runs out at day 60 and they're gone.

The digest answers three questions, in this order:
1. **What changed?** (outcomes: visibility score deltas, queries newly won, citations landed, schema deployed)
2. **What needs you?** (pending approval cards, ranked by deadline urgency)
3. **How did we get these wins?** ("how we got this" narrative — the traceability story behind 1–3 highlight wins)

The email is signed "— Beamix" (Voice Canon Model B). Customer never sees agent names. The work feels orchestrated by one team, not seven agents.

## Tier availability

| Tier | Digest depth |
|------|--------------|
| Starter | Weekly digest, 1 highlight win, top 3 approval cards, summary visibility chart |
| Growth | Weekly digest, 2 highlight wins, top 5 approval cards, per-engine breakdown |
| Scale | Weekly digest, 3 highlight wins, all open approval cards, per-engine + per-query breakdown |
| Professional | Weekly digest + month-end strategy memo (Strategy Agent appends), all wins, custom delivery cadence |

Cadence customization (Professional only) handled by Strategy Agent reading customer preference.

## Wave

**Wave 2.** Depends on outcomes-tracking + approval cards being live.

## Inputs

1. **Customer's Brand Brief** (canonical version) — voice + KPIs
2. **Last week's deliverables** (work_log rows where `completed_at` falls in [now-7d, now])
3. **Visibility score deltas** (per-engine score this week vs last week vs 4-weeks ago — scan results)
4. **Newly won queries** (queries where customer moved from "not mentioned" to "mentioned" in any tracked engine)
5. **Open approval cards** (ranked by deadline_iso ascending)
6. **Customer's KPIs from brief** — for "win" framing
7. **"How we got this" trail data** — for 1–3 highlight wins, the full causal chain (what schema we added → what query started citing them → what visibility delta resulted)
8. **Customer's preferred digest day + time** (default Monday 8am customer-local)

## Outputs

### 1. Weekly digest email

Sent via Resend from `notify.beamixai.com` (transactional). HTML + plaintext fallback. Subject line varies based on biggest win of the week.

```
Subject options (Digest Writer picks):
  - "[Customer business name] — 3 new AI citations this week"
  - "[Customer business name] — your AI visibility climbed 12 points"
  - "[Customer business name] — 2 things need your eyes this week"
  - "[Customer business name] — quiet week. Here's what's queued."
```

Body structure (semantic blocks):

```
1. Personal opener (1 sentence in customer's preferred voice — e.g., direct
   for B2B SaaS, warm for dental, formal for legal)
2. "What changed" — visibility score chart (per engine) + 1-3 bullet wins
3. "What needs you" — 1-5 approval cards inline (preview + 1-click button)
4. "How we got this" — 1-3 highlight wins with the causal trail
   (e.g., "On Tuesday we added FAQ schema to your /pricing page. By Thursday,
    Perplexity started citing you for 'enterprise SaaS pricing tiers' — a
    query we hadn't won before.")
5. "What's queued for next week" — top 3 deliverables (no detail, just
   thematic preview)
6. Sign-off: "— Beamix" (always Voice Canon Model B singular)
7. Footer: link to outcomes dashboard, link to approval queue, one-click
   cancel link
```

### 2. Digest archive entry

Every digest persists in `digest_archive` table. Customer can re-read any past digest from `/dashboard/digest-archive`.

### 3. In-app digest preview

24h before email sends, render in-app preview card on dashboard. Customer can request changes ("less detail this week", "skip this week") via Customer Success Agent handoff.

### 4. Delivery telemetry

Track open + click events via Resend webhook. Feed into outcomes-tracking + Customer Success early-warning system. 0 opens for 3 weeks = pre-churn signal.

## Tools needed

| Tool | Purpose |
|------|---------|
| `mcp__supabase__execute_sql` | Read deliverables, scans, approval cards, write digest_archive |
| Anthropic Claude 4.6 Sonnet | Digest narrative + subject line generation |
| Resend | Email send + open/click telemetry |
| Inngest | Cron trigger per-customer (their chosen day/time), `digest.sent`, `digest.opened`, `digest.clicked` events |
| MJML or React Email | HTML email template engine (TBD — CTO decision) |

## Prompt outline

```
SYSTEM PROMPT — Digest Writer v1

You write the weekly digest email for one Beamix customer. This is the most
important artifact in the agency model. Customers decide whether to refund
or stay on the strength of this email.

YOUR JOB
Compose a weekly digest in 4 semantic blocks: What changed, What needs you,
How we got this, What's queued.

VOICE RULES
- Voice Canon Model B: sign as "— Beamix" (singular).
- Use customer's preferred tone from their Brand Brief (direct / warm / formal).
- Plain English. No marketing-speak. No "synergy", "optimize", "leverage".
- One idea per sentence. Active voice. No filler.
- DO NOT use AI labels or AI disclosure. The email reads as human-written by
  one team that delivered the work.

INPUTS (provided as context)
1. Brand Brief (canonical version + voice samples)
2. Last 7 days deliverables
3. Visibility score deltas per engine
4. Newly won queries
5. Open approval cards
6. Customer KPIs
7. Causal trail data for 1-3 highlight wins
8. Historical digest send + open data (so you don't repeat phrasings)

SUBJECT-LINE RULES
- Pick from 4 archetypes (big win, score climb, needs attention, quiet week)
  based on the largest signal in the week.
- Include customer's business name verbatim.
- Max 60 chars.
- Never use emojis (Adam's hard rule).
- Never use ALL CAPS or "URGENT".

"HOW WE GOT THIS" RULES
- Pick 1-3 wins where the causal chain is clearest (work → AI response shift
  → visibility delta).
- Tell the story in 2-3 sentences. Include dates. Include the engine name
  ("ChatGPT", "Perplexity").
- If the chain isn't clear, omit. Better 1 honest win than 3 weak ones.
- NEVER fabricate causation. If you don't have the data, write "We don't have
  enough data yet to attribute this — we'll know more next week."

QUIET-WEEK HANDLING
- If no wins, no score delta, no approvals: write a 4-sentence digest.
  Acknowledge it was quiet. Surface what's coming. Don't pad.
- Never invent activity. Quiet weeks happen in GEO (45-180 day lag).

NEVER
- Never use emojis.
- Never reveal you are an agent. "Beamix" is the single voice.
- Never sign as "your AI assistant" or "your automated reports".
- Never include credit counts or "AI runs remaining" UI fragments.
- Never link to internal-only URLs or staging.

OUTPUT
Return:
{
  "digest_id": "uuid",
  "subject": "string (<= 60 chars)",
  "preheader": "string (<= 90 chars)",
  "html_body": "string (rendered MJML or React Email)",
  "plain_body": "string",
  "metadata": {
    "highlight_wins_count": int,
    "approval_cards_included": [card_id, ...],
    "subject_archetype": "big_win | score_climb | needs_attention | quiet_week"
  }
}
```

System-prompt total ~430 words.

## Eval criteria

Risk tier **Full**. Refund-trigger surface — bad digests cause cancellations.

| Rubric | Pass threshold |
|--------|---------------|
| **Voice fidelity** | Adam-rates "sounds like Beamix" 4+/5 through customer #50; auto-judge ≥0.85 after |
| **Causal accuracy** | "How we got this" wins are verifiable against work_log + scan_results — 100% pass |
| **No fabrication** | Zero invented wins/metrics. Quiet-week digests acknowledge quiet, don't pad. (Automatic fail) |
| **No AI labels** | Zero "automated", "AI-generated", "your AI assistant" phrasings in body. (Automatic fail per Adam's memory rule.) |
| **No emojis** | Zero emojis in subject or body. (Automatic fail per Adam's hard rule.) |
| **YMYL claim guard** | Any medical/legal/financial claim in digest matches a published, customer-approved artifact. No new claims introduced in digest. |
| **Open rate (post-customer #20)** | ≥55% (industry baseline 25%, Beamix target premium) |
| **Click-to-approve rate** | ≥30% of opens click an approval card |
| **Send reliability** | 99% of scheduled digests sent within 15min of customer's chosen time |
| **Subject-line freshness** | No identical subject lines for same customer 2 weeks running |

## Dependencies

- **Brand-Brief Manager** (canonical brief)
- **Outcomes-tracking** (scan_results + visibility_scores tables)
- **Work log** (`work_log` table — every deliverable agent writes a row)
- **Approval-Gate Writer** (open approval cards feed in)
- **Customer Success Agent** (handles "skip this week" / "less detail" requests)
- **Resend** (send + telemetry)
- **digest_archive table** + customer preference fields on `subscriptions` or `user_profiles`

## Failure modes & fallbacks

| Failure | Fallback |
|---------|----------|
| Digest generation fails (LLM error) | Retry once with reduced context. On 2nd fail, send minimal fallback ("This week's digest is delayed — view full report in your dashboard" + link). Emit `digest.fallback_sent` alert. |
| Resend send fails | Inngest retry with exponential backoff (3 attempts). On final fail, log to audit_log + alert Customer Success Agent to manually follow up. |
| Customer opens 0 of last 3 digests | Pre-churn signal. Customer Success Agent reaches out via in-app chat. Adam-notified through customer #50. |
| Quiet week + customer pre-flagged "low patience" | Reorder digest to lead with "What's queued for next week" instead of "What changed". |
| Subject-line repeat detected | Regenerate with different archetype. |
| Causal trail incomplete for any highlight win | Demote to bullet under "What changed" — never invent the trail. |

## Risk tier

**Full.** Customer-trust surface tied directly to refund mechanic; touches money-flow adjacency (refund decision); customer-facing email delivery (deliverability + compliance).

## MCPs used

- `mcp__supabase__*`
- Resend (transactional + telemetry)
- Inngest (cron + events)

## Open questions for CTO

1. Email engine: MJML or React Email? Default: React Email (better TS integration, easier preview).
2. Per-customer cron strategy: Inngest scheduled function per customer, or single weekly fan-out cron? Default: single fan-out cron with per-customer delivery offsets.
3. Digest archive retention: indefinite or roll off after 12 months? Default: indefinite pre-launch; revisit at storage cost threshold.
