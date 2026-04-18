# 8-Expert Pre-Build Audit (2026-04-18)

8 expert agents reviewed the complete build plan from different perspectives. Findings synthesized and decisions locked by CEO.

## Expert Panel

| # | Role | Focus | Key Finding |
|---|---|---|---|
| 1 | CTO | Architecture + code structure | Split shared types by domain. OpenRouter is single point of failure. Wave 0 ai-engineer scope too big. |
| 2 | VP Product | Feature coherence + UX | Too many concepts for Yael. "Invisible agents" that are visible everywhere. Ship 6 deep, 5 lighter. Query review gate needed on day-1. |
| 3 | Growth Expert | Conversion + retention | $79 cliff from free. No viral/share mechanism. No NPS. Missing PDF report. Credit exhaustion at day 15. |
| 4 | Security Engineer | Attack surface | 3 Critical (SSRF, prompt injection, protobufjs CVE) + 4 High (preview abuse, credit race, webhook spoofing, RLS gaps). |
| 5 | AI/ML Expert | LLM pipeline quality | Haiku QA is rubber stamp (25% miss). 5 golden cases too thin. Hebrew is existential gamble. Winnability scores are fictional. |
| 6 | DevOps Lead | Infrastructure + deployment | Inngest free tier breaks at 10-15 users. Enum migration can't rollback. Resend warm-up takes 2-4 weeks. No APM. |
| 7 | Startup Advisor | Business + execution risk | 224KB of specs with 0 customers. Planning paralysis risk. Cut 60% and ship. |
| 8 | Customer (Yael) | Israeli SMB marketing manager | Doesn't understand 11 terms. $199 is $1 over her approval limit. Needs PDF report for boss. Needs Hebrew. Needs guided path. |

## Convergence Points (Multiple Experts Agreed)

### 1. Customer Language Is Wrong
Experts: VP Product, Customer Yael, Growth
11 terms Yael doesn't understand: AI Runs, Query Mapper, Schema Generator, Entity Builder, JSON-LD, GEO, Off-Site Presence Builder, Freshness Agent, Knowledge Graph, FAQPage structured data, Citation.
**Decision:** Rename all user-facing labels to action-oriented language. Agent names are internal only. Users see actions ("Optimize your homepage", "Add FAQ to pricing page"), not agent names.

### 2. Security Is Non-Negotiable
Expert: Security Engineer
3 Critical + 4 High findings. All must be addressed in worker briefs.
**Decision:** Add to every backend worker brief: SSRF URL validator, prompt injection sanitization (XML-delimit user inputs), Cloudflare Turnstile on scan + preview signup, SELECT FOR UPDATE on credit RPCs, Paddle webhook signature verification, RLS verification test per table. Run npm audit fix before Wave 0.

### 3. Hebrew UI Polished, Content in English
Experts: AI/ML, Customer Yael, DevOps
**Decision:** Hebrew UI at launch (same quality as English). Agent-generated content in English only. Exception: Review Planner email/SMS templates in Hebrew (short-form). Hebrew content generation gates on benchmark study.

### 4. Scope: All 11 Agents Ship, Prioritized
Experts: VP Product, Startup Advisor, AI/ML
**Decision:** Keep all 11 agents. BUT prioritize into Deep 6 (20+ eval cases) and Lighter 5 (5 eval cases):
- Deep 6: Query Mapper, Content Optimizer, Blog Strategist, Performance Tracker, FAQ Builder, Off-Site Presence Builder
- Lighter 5: Freshness Agent, Schema Generator, Entity Builder, Review Planner, Reddit Planner

### 5. Infrastructure Upgrades Required
Experts: DevOps, CTO
**Decision:**
- Inngest: upgrade to Pro ($75/mo) before launch. Free tier breaks at 10-15 users.
- LLM routing: Direct Anthropic SDK for 80% of calls (agents/QA). OpenRouter only for Gemini/GPT/Perplexity (scans). New env key: ANTHROPIC_API_KEY.
- Migration: 3-phase deploy (add new enum values → dual-write → drop old). Not single migration.

## Decisions Locked (2026-04-18)

### Pricing
- Build tier: **$189/mo** (was $199). Annual: $151/mo. Under Yael's NIS 700 approval limit.
- All other tiers unchanged: Discover $79, Scale $499.

### Agent Priority Tiers
- **Deep 6** (20+ eval cases, polished prompts): Query Mapper, Content Optimizer, Blog Strategist, Performance Tracker, FAQ Builder, Off-Site Presence Builder
- **Lighter 5** (5 eval cases, functional): Freshness Agent, Schema Generator, Entity Builder, Review Planner, Reddit Planner

### Free Preview Aha Moment
- Free preview runs: **FAQ Builder** (real output, $0.04 cost, copy-pasteable)
- Plus: **Content Optimizer teaser** — first 3 sentences of homepage rewrite shown, rest blurred with "Unlock full rewrite — Start with Build." Zero cost (doesn't run agent).

### Query Review Gate
- User must review and confirm top-10 queries from Query Mapper BEFORE downstream agents fire on day-1.
- Day-1 auto-trigger: Paddle webhook → Query Mapper → **user reviews queries** → scan → rules → agents.
- This adds one user interaction to the pipeline but prevents garbage queries cascading.

### Guided Step-by-Step Path
- Home suggestions display as numbered sequential steps, not unordered feed.
- Progress bar: "4 of 11 actions completed."
- Each step shows: what it fixes, estimated time, which engine it helps.

### PDF Report
- Add professional PDF export of scan results + action plan.
- One-page summary Yael can email her boss.
- Includes: score, competitor comparison, top 3 fixes, "powered by Beamix" watermark.
- Build with react-pdf or puppeteer screenshot of a styled page.

### LLM Architecture
- Direct Anthropic SDK (ANTHROPIC_API_KEY) for all Claude models — 80% of calls.
- OpenRouter stays for Gemini, GPT, Perplexity — scan engines + fallback.
- New file: src/lib/llm-router.ts — routes by provider.
- Cheaper (no OpenRouter markup on Anthropic) + resilient (survives OR outage).

### Infrastructure
- Inngest Pro ($75/mo) — required before launch.
- Supabase Pro (verify PITR enabled) — required for data safety.
- Resend: start domain warm-up for notify.beamix.tech 2 weeks before launch.
- Add /api/health endpoint that validates all env vars on deploy.

### Security Requirements (in all worker briefs)
- SSRF: URL allowlist validator rejecting private IPs, cloud metadata, non-HTTPS
- Prompt injection: XML-delimit user inputs in prompts, 500-char cap on customInstructions
- Bot protection: Cloudflare Turnstile on scan form + preview signup
- Credit safety: SELECT FOR UPDATE in hold_credits RPC
- Webhook: Paddle.webhooks.verify() with signature check
- RLS: per-table verification test (User A can't read User B's data)
- Dependencies: npm audit fix, pin protobufjs >=7.5.5
- Output: rehype-sanitize on react-markdown rendering
- Rate limiting: per-user 60 req/min across authenticated routes
- Cost: max_tokens cap on every LLM call, cost circuit breaker at 15% of subscription price

### User-Facing Language
- Agent names are INTERNAL ONLY (used in code, logs, specs).
- Users see ACTION LABELS: "Optimize your homepage", "Generate FAQ page", "Check directory listings"
- "AI Runs" → consider renaming to "Actions" or "Credits" (simpler for Yael)
- "GEO" → never shown to user. Use "AI Search Visibility" or "AI Visibility"

### Missing Features Added to Plan
- PDF report export (professional, one-page, emailable)
- Share scan result button (OG image + public link with blurred competitors)
- NPS at day 14 and day 45 (2-question modal)
- Cancellation exit survey (required before downgrade/cancel)
- In-app feedback widget
