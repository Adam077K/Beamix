# Adam's Manual Checklist — Before Wave 0 Spawns

These are the human-loop items that the agent army cannot do. Most run in parallel with Wave 0. Items marked **[BLOCKING]** must complete before Wave 0 worker spawns.

---

## Comet / PropelX Auto-Pilot Prompt (copy/paste)

Paste the entire fenced block below into a fresh Comet (or other browser-using agent) session. The agent will execute the checklist autonomously and return one final message with: a complete `.env.local` block, a per-item status table, and verification screenshots/links.

````
You are an autonomous browser-using agent. Your job is to harvest credentials and configure services for the Beamix product setup, then return a single structured report. Adam (the user) is the founder of Beamix — domain `beamixai.com`, app at `app.beamixai.com`, transactional email at `notify.beamixai.com`. The product is a Next.js / Supabase / Paddle SaaS for SMB AI-search visibility.

**Important assumption to override:** Adam already has accounts at most of these services with various states of setup. Do NOT assume anything needs to be created from scratch. For every service: DISCOVER what's already there, capture credentials, and flag deviations — only create new resources when something is genuinely missing and the spec requires it.

## Hard constraints — never violate

1. **DISCOVER BEFORE CREATING.** For each service: log in → list existing projects/keys/products → capture what's already there. Only create new resources if the required one is genuinely absent. If you find existing setup that diverges from the spec (different name, region, plan, prices), log it as `discovered-different` and let Adam decide whether to migrate — do NOT auto-rename, auto-delete, or duplicate.
2. **Never enter a payment card.** If a step requires billing details, pause and surface `needs-Adam` with the exact step + URL. Don't skip silently. Don't store payment data anywhere.
3. **Never accept ToS / legal agreements that bind a legal entity** (paid-tier upgrades, new merchant accounts) without Adam present. Same `needs-Adam` rule.
4. **Never share captured secrets outside this session.** Treat every API key, signing secret, JWT secret, and webhook secret as sensitive. Final report goes only to Adam in this conversation.
5. **Never proceed past a verification failure.** If a key doesn't authenticate or a domain doesn't verify, log `failed` with the reason — don't invent a workaround.
6. **Never invent values.** Don't make up project names, regions, prices, or plan tiers. If the spec says "$189" and existing config says "$199", flag `discovered-different`. If you have no value for an env var, leave it as `<MISSING>` in the env_block.

## Tools / access

- Browser automation. Use Adam's existing browser sessions / saved credentials where available; otherwise log `needs-Adam` for that service (don't try to guess credentials).
- If a 2FA challenge appears, log `needs-Adam` for that service — don't try to bypass.

## Per-service walkthrough — execute in this order

For EVERY service: step 1 is always "log in and discover what's already there." Capture what exists. Only proceed to creation if genuinely required.

### Service 1 — Supabase
Log into https://supabase.com.
- **Discover:** list all projects in Adam's org. Identify the one(s) intended for Beamix (by name or recency).
- **Capture (for each Beamix project):** project name, project URL, region, anon key, service_role key, JWT secret, plan tier (Free / Pro / Team), database password (if accessible — if not, log `needs-Adam`).
- **Required for build:** at minimum one project for development. Production project can come later (Wave 2).
- **Do NOT:** create a new project unless Adam has explicitly told you to. If he has only one Supabase project, that one IS the one — capture its keys and move on.
- **Flag for Adam:** if the project is on Free tier, note that Wave 2 production launch requires Pro ($25/mo) for daily PITR backups — `needs-Adam` decision, not your call.

### Service 2 — Paddle
Log into https://vendors.paddle.com (production) or https://sandbox-vendors.paddle.com (sandbox).
- **Discover:** list existing products. Note their names, recurring/one-time, prices, currency.
- **Required products (per board April-15):** 7 total. Compare existing against this spec. For each present and matching: capture its Price ID. For each missing OR differing in price: log `discovered-different` or `missing` — DO NOT auto-create products in production without Adam's explicit go.
  - Discover monthly $79 / annual $63/mo ($756)
  - Build monthly $189 / annual $151/mo ($1812)
  - Scale monthly $499 / annual $399/mo ($4788)
  - One-time $19 top-up (10 AI Runs equivalent)
- **Capture:** vendor ID, public key, server-side API key, **`PADDLE_NOTIFICATION_SECRET`** (HMAC signing secret from Notifications settings — mandatory).
- **Webhook URL:** if not already configured, note that it needs to be set to `https://<deployed-app-url>/api/webhooks/paddle` once Vercel deployment URL is known. Flag as `needs-Adam`.
- **Refund Policy:** required setting is "Custom / partial refunds allowed" (per Beamix ADQ-5: ≤50% credits consumed → full refund, >50% → 50% cap; backend enforces the math). If existing policy differs, log `discovered-different`.

### Service 3 — Anthropic API
Log into https://console.anthropic.com.
- **Discover:** does Adam already have an API key for Beamix? Anthropic doesn't allow re-reading existing keys — only the org-level key list with creation dates is visible.
- **If no Beamix-labeled key exists:** create one, label it `beamix-production`, capture immediately (it's shown once).
- **If a key exists but you can't read it:** log `needs-Adam` with the message "Adam, please paste your existing Anthropic API key — Anthropic doesn't let me re-fetch it."
- **Verify:** billing is Console-billing (NOT subscription OAuth — that's a project-memory rule). Capture current credit balance and report it; let Adam decide if a top-up is needed.
- **Verify:** prompt caching is on at org level (default).
- **Smoke test:** if you have a usable key, make one `claude-haiku-4-5` test call. Log success/failure.

### Service 4 — Cloudflare Turnstile
Log into https://dash.cloudflare.com → Turnstile.
- **Discover:** does a Turnstile site exist for `app.beamixai.com` or `beamixai.com`? If yes, capture site key + secret key.
- **If missing:** create a new site, hostname `app.beamixai.com`, mode "Managed", free tier. Capture both keys.

### Service 5 — Resend + DNS
Log into https://resend.com.
- **Discover:** is `notify.beamixai.com` already added as a sending domain? If yes, capture API key and verification status.
- **If missing:** add the domain. Resend will give you 3 records (CNAME / SPF / DKIM) — capture them and surface as `needs-Adam` ("add these DNS records at whoever runs DNS for beamixai.com"). Also flag DMARC: `v=DMARC1; p=none; rua=mailto:<Adam-provided-monitoring-email>`.
- **DNS configuration:** unless Adam tells you which registrar manages `beamixai.com`, do NOT attempt to log into it. Surface the records as `needs-Adam` and let Adam apply them.
- **Capture:** Resend API key.
- **Verify (only if records are already in DNS):** poll up to 10 min. If still unverified, log `needs-Adam` (DNS propagation may need longer).

### Service 6 — OpenRouter
Log into https://openrouter.ai.
- **Discover:** does Adam have an API key already? OpenRouter shows existing keys; capture if visible.
- **If missing:** create one labeled `beamix`. Capture.
- **Capture current credit balance.** Report it. Let Adam decide on top-ups.
- **Note (for the .env.local comment):** this key is used ONLY for non-Anthropic models (`google/gemini-*`, `openai/*`, `perplexity/*`). Direct Anthropic SDK handles all `claude-*` calls.

### Service 7 — Perplexity (Sonar API)
Log into https://www.perplexity.ai/settings/api.
- **Discover:** existing API key. Capture if visible.
- **If missing:** generate one. Capture.

### Service 8 — Sentry
Log into https://sentry.io.
- **Discover:** does a Beamix-related project exist in any of Adam's orgs? If yes, capture its DSN.
- **If missing:** create one (suggested name `beamix-web`; let Adam confirm name later if he cares). Capture DSN.

### Service 9 — Inngest
Log into https://inngest.com.
- **Discover:** existing Beamix project? Capture name, plan tier, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`.
- **Plan tier note:** board April-18 says Pro ($75/mo) is required from launch (free tier breaks at 10–15 paying users). If current plan is Free, log `needs-Adam` (upgrade requires payment card + decision).
- **Webhook endpoint:** if not yet set, will need to be `https://<deployed-app-url>/api/inngest` later — flag as `needs-Adam`.

### Service 10 — Vercel
Log into https://vercel.com.
- **Discover:** is the Beamix repo already linked? Capture project name, framework, current deployment status.
- **Domain:** is `app.beamixai.com` configured? If yes, capture the DNS record format being used. If no, surface as `needs-Adam` with the recommended record to add.
- **Env vars:** at this stage, the env_block isn't fully populated yet. Do NOT paste env vars into Vercel during this session — Adam will do that after reviewing your report.

### Service 11 — PostHog
Log into https://eu.posthog.com (EU region — required for GDPR per memory).
- **Discover:** existing Beamix project? Capture project API key + host.
- **If missing:** create one named `Beamix`, EU region. Capture key.
- **Output keys:** `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`.

### Service 12 — Email alias + Postmaster Tools
- **`support@beamixai.com`:** check whoever manages email routing for `beamixai.com` (could be the registrar, Google Workspace, Cloudflare Email Routing, or an existing inbox). Do NOT attempt to log into Adam's email infrastructure unless he's told you which provider. Surface as `needs-Adam` with the goal: "alias `support@beamixai.com` should forward to whichever inbox Adam wants support routed to."
- **Google Postmaster Tools:** at https://postmaster.google.com. Requires DNS TXT verification + Google account — surface as `needs-Adam` (high-friction; Adam handles).

## Output contract — final message format

Return exactly one message, structured like this:

```
## env_block

# ---- Supabase ----
NEXT_PUBLIC_SUPABASE_URL=<value or <MISSING>>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<value or <MISSING>>
SUPABASE_SERVICE_ROLE_KEY=<value or <MISSING>>
# (any extra Supabase env vars discovered)

# ---- Paddle ----
PADDLE_VENDOR_ID=<value or <MISSING>>
PADDLE_API_KEY=<value or <MISSING>>
PADDLE_PUBLIC_KEY=<value or <MISSING>>
PADDLE_NOTIFICATION_SECRET=<value or <MISSING>>
PADDLE_PRICE_DISCOVER_MONTHLY=<pri_... or <MISSING>>
PADDLE_PRICE_DISCOVER_ANNUAL=<...>
PADDLE_PRICE_BUILD_MONTHLY=<...>
PADDLE_PRICE_BUILD_ANNUAL=<...>
PADDLE_PRICE_SCALE_MONTHLY=<...>
PADDLE_PRICE_SCALE_ANNUAL=<...>
PADDLE_PRICE_TOPUP=<...>

# ---- LLM providers ----
ANTHROPIC_API_KEY=<value or <MISSING — Adam paste>>
OPENROUTER_API_KEY=<value or <MISSING>>
PERPLEXITY_API_KEY=<value or <MISSING>>

# ---- Bot protection ----
TURNSTILE_SITE_KEY=<value or <MISSING>>
TURNSTILE_SECRET_KEY=<value or <MISSING>>

# ---- Email ----
RESEND_API_KEY=<value or <MISSING>>

# ---- Background jobs ----
INNGEST_EVENT_KEY=<value or <MISSING>>
INNGEST_SIGNING_KEY=<value or <MISSING>>

# ---- Observability ----
SENTRY_DSN=<value or <MISSING>>

# ---- Analytics ----
NEXT_PUBLIC_POSTHOG_KEY=<value or <MISSING>>
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

## status

| Service | Status | Notes |
|---------|--------|-------|
| Supabase | discovered | 1 project found, plan: Free, name: <name>, region: <region>. Pro upgrade needed before prod launch (needs-Adam). |
| Paddle | discovered-partial | 3 of 7 products exist with matching prices; 4 missing (needs-Adam to authorize creation). |
| Anthropic | needs-Adam | Existing key in dashboard not re-readable; Adam paste the key. |
| Cloudflare Turnstile | created | New site for app.beamixai.com, both keys captured. |
| Resend + DNS | discovered-different | Domain `notify.beamixai.com` exists but DKIM record missing. needs-Adam to apply 1 record at registrar. |
| OpenRouter | discovered | Key visible. Current balance: $X. |
| Perplexity | created | Key generated. |
| Sentry | discovered | Existing project `beamix-web` — DSN captured. |
| Inngest | discovered | Project exists, plan: Free. Pro upgrade required (needs-Adam). |
| Vercel | discovered | Repo linked. Domain `app.beamixai.com` not yet configured (needs-Adam: add CNAME). |
| PostHog | created | New EU project. Key captured. |
| Email alias + Postmaster | needs-Adam | Routing provider unknown; Postmaster verification high-friction. |

## discovered_vs_spec

(For each service where what you found diverges from this prompt's spec, list the divergence so Adam can decide: keep existing, migrate, or recreate. Example: "Paddle Build monthly price shows $199 in dashboard but spec says $189 — needs-Adam decision.")

## screenshots

(Optional — links to dashboard pages Adam can click to verify your findings.)

## summary

One paragraph: how many services completed / discovered / needs-Adam / failed. Cross-cutting blockers Adam should resolve first (e.g., "DNS for beamixai.com isn't configured anywhere — that blocks Resend, Vercel, and Postmaster simultaneously").
```

## Failure handling

If you can't complete a service, log it under `needs-Adam` with the exact URL and the step where you stopped. You don't invent workarounds. You don't proceed past a verification failure. If you find existing setup that diverges from the spec, log it under `discovered_vs_spec` — don't auto-migrate.

Begin.
````

---

## [BLOCKING] Supabase: New project

- [ ] Create new Supabase project named `beamix-v2-staging` (organization: existing).
- [ ] Create second project `beamix-v2-prod` (for Wave 2 cutover; can wait if budget-sensitive).
- [ ] Capture for each: Project URL, anon key, service role key, JWT secret.
- [ ] Add staging values to `apps/web/.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  ```
- [ ] Add same set as Vercel preview env vars (for branch deploys).

## [BLOCKING] Paddle: Products + Price IDs

Create 7 Paddle products in Paddle dashboard (Sandbox first, then Production):

- [ ] Discover monthly — $79
- [ ] Discover annual — $63/mo billed annually ($756)
- [ ] Build monthly — $189
- [ ] Build annual — $151/mo billed annually ($1,812)
- [ ] Scale monthly — $499
- [ ] Scale annual — $399/mo billed annually ($4,788)
- [ ] Top-up pack — $19 (one-time, 10 AI Runs)

For each, capture the **Price ID** (Paddle dashboard → Product → Pricing). Add to env:

```
PADDLE_PRICE_DISCOVER_MONTHLY=pri_...
PADDLE_PRICE_DISCOVER_ANNUAL=pri_...
PADDLE_PRICE_BUILD_MONTHLY=pri_...
PADDLE_PRICE_BUILD_ANNUAL=pri_...
PADDLE_PRICE_SCALE_MONTHLY=pri_...
PADDLE_PRICE_SCALE_ANNUAL=pri_...
PADDLE_PRICE_TOPUP=pri_...
PADDLE_VENDOR_ID=...
PADDLE_API_KEY=...
PADDLE_PUBLIC_KEY=...      # for webhook signature verification
PADDLE_NOTIFICATION_SECRET=...  # MANDATORY — Paddle Billing v2 requires HMAC-SHA256 signature verification on raw webhook body
```

- [ ] Webhook URL set in Paddle dashboard: `https://<staging-url>/api/webhooks/paddle`
- [ ] HMAC signature secret captured from Paddle dashboard → Notifications settings → `PADDLE_NOTIFICATION_SECRET` (NOT optional — Paddle Billing v2 mandates HMAC)
- [ ] Sandbox checkout works end-to-end with a test card before Wave 1 begins
- [ ] **Refund policy configured per ADQ-5 (resolved 2026-05-14; clarified 2026-05-16 per board verdict P0-D):** in Paddle dashboard → Refund Policy, set to "Custom — partial refund allowed". Beamix's own backend enforces the rule: ≤50% credits consumed → full refund; >50% consumed → 50% refund cap. **Only user-initiated runs count toward the 50% threshold** — auto-runs (Day-1 onboarding chain, scheduled weekly scans, scheduled freshness checks) are excluded so Beamix-initiated consumption cannot penalize the customer. Documented in `18-LEGAL-PUBLISHING-PLAN.md` refund clause and surfaced on the Paddle checkout T&Cs link. The Wave 1 BE-2 refund handler (`09-WAVE-1-BRIEF.md`) does the consumption math (`credit_transactions.initiator = 'user'` only) and surfaces the split to the customer; Paddle just executes the requested amount.

## [BLOCKING] Anthropic API key — primary LLM provider

Per board April-18: direct Anthropic SDK handles ~80% of all agent calls (`claude-*` models). OpenRouter is reserved for non-Anthropic providers only. ANTHROPIC_API_KEY is primary, NOT a fallback.

- [ ] Anthropic Console: create API key with $500+ credit buffer (Console billing — NEVER subscription OAuth on a server, per memory `feedback_claude_code_oauth_ban_risk.md`)
- [ ] Add to env: `ANTHROPIC_API_KEY=sk-ant-...`
- [ ] Verify with a single `claude-haiku-4-5` hello-world request before Wave 0 Worker 2 starts
- [ ] Confirm prompt caching is enabled (default on Anthropic SDK; cache reads bill at 10% of input cost)

## [BLOCKING] Cloudflare Turnstile — bot protection on free scan (E8)

Free `/scan` endpoint is unauthenticated and triggers paid LLM calls. Without a CAPTCHA, 10k automated submissions/hr → ~$500/hr cost-amplification attack.

- [ ] Create a Turnstile site in Cloudflare dashboard → free tier, "Managed" challenge mode, hostname `app.beamixai.com`.
- [ ] Capture site key (public) + secret key (server-only). Add to env:
  ```
  TURNSTILE_SITE_KEY=0x4A...
  TURNSTILE_SECRET_KEY=0x4A...
  ```
- [ ] Add site key to Vercel preview + production env vars (Wave 1 FE-2 embeds the widget; Wave 1 BE-2 verifies the token server-side).

## DNS: notify.beamixai.com for Resend (can run during Wave 0)

- [ ] Add CNAME record: `notify.beamixai.com → notify.resend.com` (or what Resend specifies)
- [ ] Add SPF: `v=spf1 include:_spf.resend.com ~all`
- [ ] Add DKIM record per Resend dashboard
- [ ] Add DMARC: `v=DMARC1; p=none; rua=mailto:adam419067@gmail.com`
- [ ] Verify domain in Resend dashboard → status "Verified"
- [ ] Send test email via Resend dashboard to confirm delivery before Wave 1 backend worker 3 starts

## Resend / OpenRouter / Perplexity API keys (can run during Wave 0)

- [ ] Resend: API key → `RESEND_API_KEY`
- [ ] OpenRouter: API key with $500+ credit buffer → `OPENROUTER_API_KEY` (used ONLY for Gemini / GPT / Perplexity scan engines per board April-18; never for `claude-*` calls)
- [ ] Perplexity (Sonar): API key (separate provider, not via OpenRouter) → `PERPLEXITY_API_KEY`

Note: `ANTHROPIC_API_KEY` is in the BLOCKING section above — it is primary, not a fallback.

Verify each by making a single live call against the API documentation's hello-world example before Wave 0 Worker 2 starts.

## Sentry (can run during Wave 0)

- [ ] Create Sentry project `beamix-web` in existing org
- [ ] Capture DSN → `SENTRY_DSN`
- [ ] Wave 2 devops-lead wires alert rules — no setup needed pre-Wave 0

## Inngest (Pro tier from launch — can run during Wave 0)

Per board April-18: **Inngest Pro from launch** ($75/mo). Free tier breaks at 10–15 paying users due to step-quota limits, which would stall the Day-1 onboarding chain mid-flight. Memory `project_inngest_tier_strategy.md` is superseded by the board minute on this point.

- [ ] Inngest cloud project exists, upgraded to **Pro ($75/mo)** before launch
- [ ] Capture: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`
- [ ] Webhook endpoint set: `https://<staging-url>/api/inngest`

## Vercel (can run during Wave 0)

- [ ] Project linked to the Beamix repo, branch deploys enabled
- [ ] All env vars above added to Vercel project settings
- [ ] Domain configured: `app.beamixai.com` → Vercel project (production)
- [ ] Preview deploys: staging branches auto-deployed at `<branch>-beamix-web-<hash>.vercel.app`

## Branding / Brand-side prereqs (no blocker, but useful)

- [ ] Confirm the existing Framer marketing site links to `app.beamixai.com` (signup CTAs, pricing page CTAs)
- [ ] Free scan page link: `app.beamixai.com/scan` (Framer site's homepage CTA points here)

## Customer Validation (parallel with Wave 0)

- [ ] Book 5 problem interviews — 3 Israeli SMB / 2 English-speaking
- [ ] Use questions from `01-P0-RESOLUTIONS.md` §Customer Validation Plan
- [ ] Write findings to `.claude/memory/USER-INSIGHTS.md` (research-lead-owned)
- [ ] Flag any disconnect by end of Wave 0 → may require Wave 1 copy adjustments

## Analytics, support, data governance (can run during Wave 0)

These were missing from the original checklist. Required by board April-17/18 + Fix Agent 5 analytics/legal/admin specs. **See `../17-ANALYTICS-SPEC.md`, `../18-LEGAL-PUBLISHING-PLAN.md`, `../19-SUPPORT-CHANNEL-SPEC.md`, `../20-ADMIN-DASHBOARD-SPEC.md`, `../21-DATA-GOVERNANCE.md` for the full per-domain specs.**

- [ ] **PostHog project (EU region):** create a new project for Beamix at `https://eu.posthog.com`, capture `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`. Board B4 requires instrument-from-day-1. Spec: `../17-ANALYTICS-SPEC.md`.
- [ ] **Email alias `support@beamixai.com`** created (in domain registrar) and forwarding to Adam's inbox OR routed into the chosen support tool (Plain or Crisp). Refund disputes, customer support — needed before launch to prevent chargebacks. Spec: `../19-SUPPORT-CHANNEL-SPEC.md`.
- [ ] **Support tool: choose Plain (recommended) or Crisp.** Sign up for free tier. Configure routing categories per `../19-SUPPORT-CHANNEL-SPEC.md`. Capture API keys for Wave 2 worker.
- [ ] **Supabase Pro plan upgrade** ($25/mo) for the `beamix-v2-prod` project — enables daily PITR backups + 7-day point-in-time recovery. **[BLOCKING for Wave 2]** — required before launch for EU customers (data governance). Spec: `../21-DATA-GOVERNANCE.md`.
- [ ] **Google Postmaster Tools + Microsoft SNDS** registration for `beamixai.com` — needed before transactional email volume ramps (deliverability monitoring on Gmail + Outlook).
- [ ] **Paddle dunning retry config confirmation** — verify Paddle dashboard → Notifications → Recovery settings shows the default 3 retries over 7 days enabled. Default config is fine for MVP; only override if you want different cadence.
- [ ] **T&Cs / Privacy Policy / Cookie Policy lawyer review scheduled** — external Israeli or UK SaaS lawyer, ~2-hour engagement, ~$500–1500. Target completion: BEFORE invoicing customer #1. Block any paid signup until done. Spec: `../18-LEGAL-PUBLISHING-PLAN.md`.
- [ ] **Localized query templates ready** — `apps/web/src/lib/scan/templates/{en,he}/<industry>.ts` files reviewed by Adam before Wave 1 BE-2 ships. Hebrew template wording matters for IL conversion. Wave 1 BE-2 owns implementation; Adam owns sign-off on the wording.

## Wave 2 readiness items (only needed before Wave 2 launches)

- [ ] Production Supabase project created and migrations applied (devops-lead handles application; Adam confirms project exists)
- [ ] Production env vars all set in Vercel
- [ ] Status page or update channel for cutover communication (can be email-only — keep simple)

---

## What CEO does NOT need from Adam to start Wave 0

These items can wait, deliberately:
- GA4 / GSC OAuth configuration (Wave 1 ships UI stubs; OAuth setup is a post-MVP polish item)
- Hebrew copy review (Wave 2 worker 1 handles; Adam reviews translation pass at end of Wave 2)

Note: **Annual pricing ships day-1** per board April-17 — it is NOT deferred. See `09-WAVE-1-BRIEF.md` paywall modal spec.

---

## Verification before Wave 0 spawn

Adam confirms to the CEO agent in a single message:

```
Manual prereqs done:
- Supabase v2-staging up + keys captured
- Paddle sandbox products live + 7 price IDs captured + webhook URL set
- Resend domain verified
- OpenRouter / Perplexity / Anthropic / Inngest / Sentry / Vercel keys captured
- All env vars committed to .env.local AND set in Vercel preview env

Ready for Wave 0.
```

CEO does NOT spawn workers until Adam sends this confirmation.

---

## Completion log — 2026-05-16

Adam ran the Comet auto-pilot prompt + manual cleanup. Status of every section as of 2026-05-16:

### ✅ Done
- **Supabase** — Existing project used; URL + anon + service_role + JWT all captured in Vercel env.
- **Anthropic** — API key captured + in Vercel env.
- **OpenRouter** — API key captured + in Vercel env.
- **Perplexity (Sonar)** — API key captured + in Vercel env.
- **Cloudflare Turnstile** — Site created for `app.beamixai.com`. Site key + secret key in Vercel env (Production + Preview): `NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAADQDL5m_8h-590Qe`, `TURNSTILE_SECRET_KEY=0x4AAAAAADQDL9ppx4udAprW00v-BmKKKDc`.
- **PostHog** — New EU project created (Project ID `180294`). `NEXT_PUBLIC_POSTHOG_KEY=phc_qxNNratn7MDHAz6Mtq8J4ryYqwepZHhdmGTY6rVfxveq`, `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com` — both in Vercel env.
- **Resend + DNS** — Domain configured; keys in Vercel env.
- **Sentry** — DSN captured + in Vercel env.
- **Inngest** — Event key + signing key captured + in Vercel env. (See deferred below for Pro upgrade.)
- **Vercel** — `Adam077K/Beamix` repo linked to project at `vercel.com/adam419067-gmailcoms-projects/beamix`. Domain `app.beamixai.com` configured. Branch deploys enabled.
- **Email + Postmaster** — Cloudflare Email Routing: `support@beamixai.com` → `adam419067@gmail.com`. MX + TXT records added by Cloudflare. Google Postmaster Tools registered + verified 2026-05-16.

### 🟡 Deferred — maps to specific wave gates

| Item | Reason | Blocks |
|------|--------|--------|
| **Paddle vendor ID + public key** | Saved password didn't match at `sandbox-vendors.paddle.com`. Adam to log in → Developer Tools → API Keys → fetch `PADDLE_VENDOR_ID` and `PADDLE_PUBLIC_KEY` → add to Vercel env. | **Wave 1 BE-2** (Paddle webhook handler implementation). NOT a Wave 0 blocker. |
| **Supabase `beamix-v2-prod` Pro plan upgrade** | Requires payment card. $25/mo for daily PITR backups. | **Wave 2 production cutover only.** NOT a Wave 0 or Wave 1 blocker. |
| **Inngest Pro plan upgrade ($75/mo)** | Requires payment card. Board April-18 mandates Pro from launch (free tier breaks at 10–15 paying users). | **Wave 1 BE-1 / BE-3** (recommended) or **Wave 2 launch** (latest acceptable). NOT a Wave 0 blocker — Wave 0 doesn't fire production Inngest load. |

### Wave 0 spawn status: ✅ UNBLOCKED

Foundation work (DB schema, agent system skeleton, app shell) has no dependency on the 3 deferred items. Wave 0 can spawn from a fresh CEO session immediately. The 3 deferred items must be resolved before their respective downstream waves.
