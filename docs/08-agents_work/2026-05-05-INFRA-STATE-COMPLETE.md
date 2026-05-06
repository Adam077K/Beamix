# Beamix Infrastructure — Complete State as of 2026-05-05
**Date:** 2026-05-05
**Status:** Production infrastructure complete. Tier 0 build can begin immediately.
**Source:** Comet (autonomous browser agent) sessions 2026-05-04 + 2026-05-05.

---

## TL;DR

All external infrastructure for MVP launch is now wired. Build team can dispatch Tier 0 tickets without waiting on Adam. Outstanding items are non-blocking (audit completion, Twilio, GitHub OAuth) or build-team work.

---

## What's LIVE

### Domain + DNS
- `beamixai.com` apex (Framer marketing site)
- `app.beamixai.com` (Vercel product, Production READY/CURRENT)
- `notify.beamixai.com` (Resend transactional email, Verified)
- `links.notify.beamixai.com` (Resend click-tracking)
- Cloudflare DNS for all (A records, CNAMEs, DKIM, SPF, MX, DMARC)

### Auth
- Google OAuth Client ID + Secret in Vercel env (Sensitive)
- Supabase Auth Google provider enabled
- Supabase URL Configuration: Site URL = `https://app.beamixai.com`, redirect URLs configured

### Billing — Paddle (PRODUCTION)
| Product | Monthly | Annual | Status |
|---|---|---|---|
| Beamix Discover | $79/mo | $63/mo ($756/yr) | ✅ Active |
| Beamix Build | $189/mo | $151/mo ($1812/yr) | ✅ Active |
| Beamix Scale | $499/mo | $399/mo ($4788/yr) | ✅ Active |
| Beamix Scale — Additional Domain | $49/mo per unit | n/a | ✅ Active |

- Webhook: `https://app.beamixai.com/api/webhooks/paddle` (Active, 56 events subscribed; 11 consumed)
- API key + webhook secret in Vercel env (Sensitive, ROTATED 2026-05-05)
- Client-side token in Vercel env (NEXT_PUBLIC, OK to be public)
- 7 price IDs in Vercel env (NOT sensitive — identifiers only)
- `PADDLE_ENVIRONMENT=production` set
- Old wrong products (Starter/Pro/Business at $49/$149/$349) archived
- Old leaked API key revoked

### Email — Resend
- `RESEND_API_KEY` rotated 2026-05-05 + Sensitive
- `RESEND_FROM_EMAIL=noreply@notify.beamixai.com`
- Domain verified via Cloudflare DKIM/SPF/DMARC

### Async — Inngest
- Keys rotated 2026-05-04
- Custom Production Domain: `https://app.beamixai.com`
- App synced
- Functions registered (scan-free, scan-manual, agent-execute, etc.)

### Database — Supabase
- Production project active
- `SUPABASE_SERVICE_ROLE_KEY` in Vercel (Sensitive)
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` set

### LLM APIs
- `ANTHROPIC_API_KEY` (Sensitive)
- `OPENROUTER_AGENT_KEY` (Sensitive)
- `OPENROUTER_SCAN_KEY` (Sensitive)

### SEO
- Google Search Console domain property active, sitemap submitted, indexing requested
- Bing Webmaster Tools imported, sitemap submitted

---

## All Vercel env vars (Production + Preview)

| Variable | Sensitive? | Source |
|---|---|---|
| `GOOGLE_OAUTH_CLIENT_ID` | ✅ | Google Cloud Console |
| `GOOGLE_OAUTH_CLIENT_SECRET` | ✅ | Google Cloud Console |
| `PADDLE_API_KEY` | ✅ (rotated 2026-05-05) | Paddle production |
| `PADDLE_WEBHOOK_SECRET` | ✅ (rotated 2026-05-05) | Paddle webhook |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | public | Paddle |
| `PADDLE_ENVIRONMENT=production` | non-sensitive | manual |
| `PADDLE_DISCOVER_MONTHLY_PRICE_ID` | non-sensitive | Paddle |
| `PADDLE_DISCOVER_ANNUAL_PRICE_ID` | non-sensitive | Paddle |
| `PADDLE_BUILD_MONTHLY_PRICE_ID` | non-sensitive | Paddle |
| `PADDLE_BUILD_ANNUAL_PRICE_ID` | non-sensitive | Paddle |
| `PADDLE_SCALE_MONTHLY_PRICE_ID` | non-sensitive | Paddle |
| `PADDLE_SCALE_ANNUAL_PRICE_ID` | non-sensitive | Paddle |
| `PADDLE_SCALE_ADDON_PRICE_ID` | non-sensitive | Paddle |
| `RESEND_API_KEY` | ✅ (rotated 2026-05-05) | Resend |
| `RESEND_FROM_EMAIL` | non-sensitive | manual |
| `INNGEST_EVENT_KEY` | platform-managed | Inngest integration |
| `INNGEST_SIGNING_KEY` | platform-managed | Inngest integration |
| `INNGEST_SIGNING_KEY_FALLBACK` | ✅ | Inngest |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase |
| `NEXT_PUBLIC_APP_URL=https://beamixai.com` | public | manual |
| `ANTHROPIC_API_KEY` | ✅ | Anthropic |
| `OPENROUTER_AGENT_KEY` | ✅ | OpenRouter |
| `OPENROUTER_SCAN_KEY` | ✅ | OpenRouter |
| `CRON_SECRET` | ✅ (fixed 2026-05-05) | manual |
| `INTERNAL_REVALIDATE_SECRET` | ✅ | manual |

**Inngest platform note:** `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` cannot be marked Sensitive due to Vercel-Inngest integration design. Acceptable — Inngest manages them server-side via the integration handshake.

---

## Security incident — 2026-05-05

**Comet pasted live API keys in chat output during 2026-05-04 session** despite explicit prompt instruction not to. The leaked secrets were:
- `PADDLE_API_KEY` (`pdl_live_apikey_01kqvwcpzsxevfgzqexs9m8wrr_...`)
- `PADDLE_WEBHOOK_SECRET` (`pdl_ntfset_O1kqvvk3h1Oywhz6az7jmmy5tk_...`)
- `RESEND_API_KEY` (`re_UFA4SRXq_FkBiiTTxXiKA63NnnGhbxS5R`)

**Resolution (2026-05-05):**
- All 3 secrets rotated; new values generated and added to Vercel env
- Old API keys revoked at Paddle + Resend
- Future Comet prompts include explicit "DO NOT print secrets in chat output" rule + masked-output report format

**Lesson learned for future agent prompts:** the "never share secrets" rule must be repeated in CRITICAL caps at top of every browser-agent prompt, with explicit guidance that secrets get pasted DIRECTLY into destination fields and reports use masked placeholders only.

---

## What still needs Adam's manual setup

| Item | Status | Time | When needed |
|---|---|---|---|
| **GitHub OAuth App** (CLIENT_ID + CLIENT_SECRET) | ❌ Not done | 5 min | Before T19 Workflow Builder Git-mode |
| **Twilio account + first IL/US number** | ❌ Not done | 10 min | Before T75 Lead Attribution F12 |
| **DPA indemnification cap legal call** | ❌ Pending | 30 min | Before T66 Trust Center publishes |
| **Tech E&O insurance binding** | ❌ Pending | 1 hr broker call | Before T66 publishes |
| **SOC 2 Type I auditor engagement** (Drata + Prescient Assurance or equivalent) | ❌ Pending | 2 hr vetting | Observation must START at MVP launch for MVP+90 ship of T89 |
| **Status page vendor pick** (Better Stack default $24/mo) | ❌ Pending | 5 min | Before T68 |
| **HackerOne bug bounty program** | ❌ Pending | 1 day setup | Before T88 (MVP+30) |
| **5 pre-build validations** | ❌ Pending | 1-2 days | Before merging Option E PR |

The browser agent (Comet) handled GitHub OAuth + Twilio in spec but those weren't part of yesterday's prompts. Adam can dispatch a follow-up Comet session for those when ready.

---

## Build team status

**Tier 0 build can begin TODAY** — independent tickets that don't need Adam's manual setup:
- T58 (10 named easing curves)
- T59 (3 ESLint custom rules)
- T60 (Variable Inter + subset Fraunces)
- T61 (Status vocabulary lock)
- T62 (Block primitive TypeScript interfaces)
- T63 (Speed CI gate)
- T64 (security.txt at /.well-known)
- T65 (Dark mode tokens)
- T93 (Heebo 300 italic)
- T94 (Phase-transition motion canon)
- T95 (Google OAuth primary signup) — env vars already set ✅
- T96 (Two-tier UI state tokens)
- T97 (handle_new_user smoke test)
- T98 (4 WCAG 2.1 AA fixes)
- T99 (Status page redirect — Adam picks vendor first)
- T135 (Sentry / error monitoring)
- T136 (Structured logging)
- T137 (Playwright + Lighthouse perf CI gate)
- T140 (State of AI Search data instrumentation)

**Tier 1 + Tier 2 + Tier 3 tickets** depend on Tier 0 completion.

---

## Predecessors

- PR #52: Audit baseline
- PR #53: Round 1 design board + 65 cuts
- PR #54: Round 2/3 + Aria persona
- PR #55: PRD v4 + Build Plan v2
- PR #56: Onboarding audit
- PR #57: Scan↔Onboarding architecture (Option E)
- PR #58: PRD v5 + Build Plan v3 + Option E spec
- PR #59: Verification audits + fix-plan
- PR #60: PRD v5.1 + Build Plan v3.1 patches applied
- PR #61: Final feature AC restoration (F4-F18 + F26/F32/F37/F41/F43/F47)
- This commit: Infrastructure state lock 2026-05-05

---

*Source: Comet autonomous browser agent reports 2026-05-04 + 2026-05-05.*
