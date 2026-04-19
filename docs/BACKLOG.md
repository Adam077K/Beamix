# Beamix — Strategic Backlog

> **Last synced:** April 2026 — aligned with April product rethink
> **Updated:** 2026-04-19
> **Source:** April 2026 board decisions + Wave 0/1 session logs

---

## Current Blockers (Resolve before Wave 2)

| # | Blocker | Notes |
|---|---------|-------|
| B1 | **Supabase MCP auth 401** | Requires PAT rotation + Claude Code restart from direnv-loaded terminal |
| B2 | **DB migration not applied to staging** | Run `apply-staging.sh --confirm` — 2-phase migration exists, not applied |
| B3 | **Legacy data cleanup pending** | Old enum values (old agent types), stripe_* columns, trial_* columns — use supabase-cleaner agent |

---

## Wave 2 — In Queue

| # | Item | Notes |
|---|------|-------|
| W2-1 | Hebrew RTL on 5 core screens | Home, Inbox, Scans, Automation, Settings |
| W2-2 | E2E Playwright test suite | Critical user paths: signup, scan, approve inbox item |
| W2-3 | Inngest agent-pipeline body | Real agent execution logic (currently stubbed) |
| W2-4 | Email event wiring | Wire Resend templates to Inngest events |
| W2-5 | Daily cap enforcement middleware | Block agent runs when monthly AI Run cap hit |
| W2-6 | Turnstile CAPTCHA | On /scan public form (anti-abuse) |
| W2-7 | Lint fixes | ESLint 9 + Next 16 compatibility issues |
| W2-8 | Sentry error monitoring | Configure Sentry for production error tracking |
| W2-9 | Empty states | All 7 pages need empty state designs |
| W2-10 | Mobile QA pass | Full responsive check across all 7 pages |

---

## Wave 3 — Growth Phase

| # | Item | Notes |
|---|------|-------|
| G1 | WordPress integration (Build tier) | Auto-publish approved content to WP |
| G2 | GA4 integration | Referral + conversion tracking |
| G3 | GSC integration | Keyword data, CTR, indexed pages |
| G4 | Slack integration | Alert delivery channel |
| G5 | Content performance tracking | Publication → visibility correlation |
| G6 | Agent workflow chains | Event-triggered multi-agent automation |
| G7 | Hebrew prompt library | GEO prompts optimized for Israeli market |
| G8 | Competitive intelligence dashboard enhancements | Share of voice deep-dive |
| G9 | Customer journey stage mapping | Awareness/consideration/decision classification |
| G10 | Per-agent credit budget sliders | Let users allocate monthly runs across agents |

---

## Cross-Cutting Engineering Items

| # | Item | Impact | Priority |
|---|------|--------|----------|
| E1 | Mobile/responsive design | High — SMB users check on mobile | Wave 2 |
| E2 | Circuit breaker tuning | Medium — 429 rate-limit threshold | Wave 2 |
| E3 | LLM output caching | Medium — 30-50% cost savings on identical prompts | Wave 3 |
| E4 | Workflow chain infinite loop protection | Medium — cooldown between triggers | Wave 2 |
| E5 | Database migration strategy documentation | High — rollback plan for schema changes | Wave 2 |

---

## Moat Builders (Post-Launch)

- Persona tracking across scans
- Public REST API for agencies
- Multi-workspace (agency accounts)
- Video SEO Agent (MVP-2, Scale tier)
- Browser simulation for Copilot/AI Overviews
- Prompt volume estimation (aggregate anonymized data)

---

## Intentionally Skipped

- White-label reselling
- Looker Studio connector
- CDN optimization layer
- Shopify plugin
- n8n orchestration (using Inngest directly)
- Stripe (using Paddle — merchant of record)
