---
spec: agent-discovery
status: DRAFT
wave: 1
risk_tier: full
created: 2026-05-23
owner: cpo
authors: [cpo]
implementation_owners: [ai-engineer, backend-engineer, frontend-engineer]
related_decisions:
  - DECISIONS.md 2026-05-23 entry (decisions #4, #15)
  - docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md
---

# Discovery Agent — PRD

## Purpose

The Discovery Agent runs the **30-minute kickoff call** that turns a paid signup into an actionable engagement. It is the customer's first impression of "the work being done for them" and the single most consequential touchpoint in the agency model. The agent pulls the customer's live site, Google Business Profile, and existing scan results, then runs an adaptive voice + chat Q&A (15–25 questions, branching) that captures: brand identity, voice samples, ICP fit, service catalog, geographic scope, competitor set, hard-no topics, approval style, primary KPIs. Output is a **Draft Brand Brief** that flows into the Brand-Brief Manager Agent (canonical store) and seeds every downstream agent (Content/FAQ, Schema, Citation, Publisher, Strategy).

The problem this solves: customers cannot articulate their brand voice on a blank page, will not fill in a 40-field form, and will churn within 14 days if they feel the agent doesn't "get them." A live 30-minute Q&A produces a 10x higher quality brief than self-serve forms while feeling concierge-grade.

Through customer #50 Adam reviews and signs off on every Draft Brand Brief before it goes to the customer for confirmation. After #50 the agent ships directly with a Confidence score threshold gate.

## Tier availability

| Tier | Discovery agent access |
|------|------------------------|
| Starter $499/mo | Short discovery (15 questions, chat-only, ~15 min) |
| Growth $999/mo | Standard discovery (20 questions, voice + chat, ~25 min) |
| Scale $1,499/mo | Full discovery (25 questions, voice + chat, ~30 min, includes competitor walk-through) |
| Professional $2,499/mo | Deep discovery (25+ questions, voice + chat, ~45 min, Adam joins live through customer #50, then agent-only with monthly strategy review) |

Free-scan visitors get a "Book your discovery call" CTA after the scan completes. No discovery access without a paid subscription.

## Wave

**Wave 1.** Must ship in the first product wave because every downstream agent depends on the Brand Brief existing.

## Inputs

1. **Customer-provided URL** (primary domain, already captured at scan)
2. **Free scan results** (visibility per engine + cited competitors — populated before discovery starts)
3. **Live site crawl summary** (headlines, about page text, service pages, 10-page sample — fetched by web-fetch tool inside the agent)
4. **Google Business Profile lookup** (if dental/legal/local) — name, categories, hours, top reviews snippet, photo count
5. **Customer voice + chat transcript** (streamed in during the call)
6. **Customer's vertical** (B2B SaaS / Solo Lawyer / Single-Location Dental) — drives the question script branch
7. **Pre-call survey responses** (3 short questions sent 24h before call: "Top business goal in 90 days?", "What's the #1 thing AI search misunderstands about you?", "Who would you hate to be confused with?")

## Outputs

### 1. Draft Brand Brief (primary artifact)

Stored as a row in `brand_briefs` table, status `draft`, awaiting customer confirmation (and Adam sign-off through customer #50).

```json
{
  "brand_brief_id": "uuid",
  "customer_id": "uuid",
  "version": 1,
  "status": "draft",
  "vertical": "b2b_saas | solo_lawyer | single_location_dental",
  "identity": {
    "business_name_canonical": "string",
    "tagline_one_liner": "string",
    "category": "string (canonical, schema.org-compatible)",
    "founded_year": "int",
    "geo_scope": ["country", "state/region", "city"],
    "languages": ["en", "he"]
  },
  "voice": {
    "tone_descriptors": ["string"],
    "reading_level": "8 | 10 | 12 | college",
    "person": "first | third",
    "humor": "none | dry | warm",
    "forbidden_phrases": ["string"],
    "preferred_phrases": ["string"],
    "voice_samples": [{"source": "url|paste", "text": "string"}]
  },
  "icp": {
    "primary_segment": "string",
    "secondary_segments": ["string"],
    "buyer_jtbd": "string",
    "decision_triggers": ["string"]
  },
  "service_catalog": [
    {"name": "string", "is_primary": true, "geo_constraints": ["string"], "service_area_km": "int"}
  ],
  "competitor_set": [
    {"name": "string", "url": "string", "relationship": "direct | adjacent | aspirational"}
  ],
  "approval_style": {
    "default_mode": "auto | digest_one_click | always_human",
    "ymyl_override": "always_human",
    "preferred_review_cadence": "weekly | biweekly"
  },
  "kpis_self_reported": {
    "primary": "string",
    "secondary": ["string"]
  },
  "hard_nos": {
    "topics": ["string"],
    "claims": ["string"],
    "competitors_to_never_compare": ["string"]
  },
  "confidence_score": 0.0,
  "evidence_links": ["transcript_segment_id"]
}
```

### 2. Call recording + transcript

Stored in `discovery_recordings` (Supabase storage bucket + transcript row). 90-day retention; customer can request deletion.

### 3. Onboarding completion event

Inngest event `discovery.completed` → triggers Brand-Brief Manager indexing, Adam-review notification (≤50), and Wave 1 deliverables kickoff.

### 4. Customer-facing confirmation email

"Here's what we heard. Confirm or correct in one click." Single page with each field editable; submission updates `brand_briefs.status = confirmed`.

## Tools needed

| Tool | Purpose |
|------|---------|
| `mcp__supabase__execute_sql` | Read scan results, write brand_brief draft |
| `mcp__supabase__apply_migration` | (Backend-engineer only, pre-launch) brand_briefs + discovery_recordings tables |
| Web-fetch (built-in) | Crawl customer site, fetch 10-page sample |
| Google Places API | GBP lookup for local-vertical customers (dental/legal) |
| Voice transcription (Whisper-1 via OpenAI) | Live voice → text during call |
| Anthropic Claude 4.7 Sonnet | Adaptive question generation + brief synthesis |
| Resend | Confirmation email + Adam-review notification |
| Inngest | `discovery.completed` event emission |

No Pencil/Figma MCP needed (no design artifact). No Stripe — Paddle handles billing only.

## Prompt outline

```
SYSTEM PROMPT — Discovery Agent v1

You are the Beamix Discovery Agent — Beamix's first conversation with a paying
customer. You are direct, warm, and visibly competent. You are NOT a chatbot
making small talk. You are a senior strategist running a structured kickoff.

YOUR JOB
Capture enough about this customer in 15–30 minutes to seed a Brand Brief
that will drive 6 downstream agents (Content/FAQ, Schema, Citation, Approval-
Gate Writer, Publisher, Strategy). Your output is a Draft Brand Brief in the
exact schema defined in agent-discovery.md.

INPUTS YOU GET BEFORE THE CALL
1. Customer URL + free-scan results (visibility per engine, competitor mentions)
2. Live site crawl (about page, top 10 pages, headlines)
3. GBP record (if local vertical)
4. Pre-call survey (3 answers)
5. Vertical (b2b_saas / solo_lawyer / single_location_dental) — drives script

QUESTION BANK (you do NOT ask all of these — you adapt)
- Identity (5): canonical name, tagline, founded, scope, languages
- Voice (6): show 2 site snippets, ask "does this sound like you?", capture
  3 voice-sample paste, ask about reading level, humor, person, forbidden phrases
- ICP (4): who's the buyer, what triggers the purchase, what's the JTBD
- Service catalog (5): what do you sell, what's primary, geo constraints
- Competitors (3): who shows up in the scan you wish didn't, who do you wish
  showed up alongside you, who do you NEVER want to be compared to
- Approval (2): preferred review mode (auto / 1-click digest / always human),
  YMYL hard-no topics
- KPIs (2): primary outcome in 90 days, secondary outcomes

ADAPTIVE RULES
- If voice samples are clear in first 3 questions, skip the rest of the voice
  block. If unclear, dig in.
- If GBP is empty for a local vertical, flag as a fix in the brief.
- If customer hesitates on competitors, pull from scan results and ask
  "the scan shows [X] mentioned 4x more than you — does that match what you'd
  expect?"
- If customer wants to ramble, let them. Capture 30 seconds, then redirect.

OUTPUT RULES
- After the call, generate the Draft Brand Brief JSON in exact schema.
- Every field MUST have an evidence_link pointing to a transcript_segment_id
  or input source. NO fabricated fields.
- Set confidence_score 0.0–1.0 reflecting how grounded each section is. Sections
  with no direct customer answer get max 0.5 confidence.
- For customers 1–50, set status="draft" and emit adam.review.requested event.
  For customer 51+, set status="confirmed_pending" and email the customer.

NEVER
- Never recommend a tier upgrade during discovery (that's the Strategy Agent's
  job, monthly).
- Never quote pricing or contract terms (live in marketing copy + portal).
- Never reveal that you're an agent. Customer-facing voice is "Beamix" (singular).
- Never invent facts. If the customer doesn't answer a question, leave the
  brief field null and set evidence_link="not_captured".
```

System-prompt total ~400 words. Few-shot examples (3 per vertical) live in `apps/web/src/lib/agents/discovery/prompts/few-shots/`.

## Eval criteria

Risk tier **Full**. QA-Lead evaluates every brief through customer #50; sample-based after.

| Rubric | Pass threshold |
|--------|---------------|
| **Schema completeness** | 100% of required fields present (null with evidence_link="not_captured" is acceptable) |
| **Voice fidelity** | Beamix Voice Canon Model B — Adam (or auto-judge) rates "sounds like the customer" 4+/5 |
| **Evidence grounding** | ≥90% of populated fields have evidence_link to transcript segment or input source |
| **No fabrication** | Zero fields populated without a verifiable source — automatic fail |
| **YMYL handling** | All medical/legal/financial topics flagged as approval_style.ymyl_override="always_human" — automatic fail otherwise |
| **Customer confirmation rate** | ≥85% of briefs confirmed without major edits (target post-customer #50) |
| **Adam-review pass rate** | ≥80% of first 50 briefs pass Adam review without rewrite |
| **Time to brief** | ≤5 minutes after call ends (synthesis + JSON gen) |
| **Recording integrity** | Recording + transcript saved, retrievable, customer-deletable |

Reject + regenerate triggers: schema missing fields, fabricated fields detected by hash check, voice score <4.

## Dependencies

- **Brand-Brief Manager Agent** — consumes Draft Brand Brief, owns canonical version
- **brand_briefs Supabase table** — schema must exist before agent ships
- **discovery_recordings Supabase storage bucket** — 90-day retention policy
- **Free scan results** — must complete before customer can book discovery
- **Voice infra (Whisper-1 + WebSocket session)** — frontend-engineer + ai-engineer joint scope
- **Calendar booking flow** — frontend-engineer scope (Cal.com or self-built minimal)
- **Inngest `discovery.completed` event** — Brand-Brief Manager + Adam-review listeners

## Failure modes & fallbacks

| Failure | Fallback |
|---------|----------|
| Voice transcription fails mid-call | Chat-only fallback; agent says "voice cut out — let's continue in chat" and resumes |
| Customer no-shows discovery call | 24h grace + auto-reschedule offer; second no-show = manual outreach |
| Site crawl returns empty (e.g. blocked) | Agent says "Your site blocks crawlers — I'll ask you the questions a crawl would normally answer." Manual capture |
| GBP lookup fails (rate-limit / not local vertical) | Skip silently |
| Customer answers <50% of questions | Set confidence_score to floor of partial completeness; flag for Adam review even after #50 |
| Brief synthesis times out (>5 min) | Retry once with reduced context; on second fail, emit `discovery.synthesis_failed` → human handoff |
| Adam-review queue backlog (≤50) | Auto-extend "draft for your review" email cadence; never auto-confirm without Adam through #50 |
| YMYL topic detected but customer requested auto-mode | Hard-override to always_human; surface to customer in confirmation email |

## Risk tier

**Full.** Touches new database tables, customer-facing voice flow, payment-adjacent (gates billing-state activation), and YMYL content. Requires Codex second opinion per Beamix QA matrix.

## MCPs used

- `mcp__supabase__*` — DB reads + writes
- Web-fetch (built-in) — site crawl
- No Stitch, no Pencil, no Refero, no Framer, no Playwright

## Open questions for CTO

1. Voice infra: self-built WebSocket + Whisper-1, or vendor (e.g. Vapi, Retell)? Decision needed by Wave 1 start.
2. `brand_briefs` table — should `voice_samples` be JSONB or separate `brand_brief_voice_samples` table? Default: JSONB until query patterns emerge.
3. Adam-review queue UI — new internal-only page or repurpose existing Approval Queue UI? Default: new `/internal/brief-review` page through #50, then archived.
