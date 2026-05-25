---
date: 2026-05-24
agent: cto
session_slug: infra-gap-scoping
status: COMPLETE
qa_verdict: n/a (planning session, no code shipped)
tier: planning
linear_ticket: (none — CEO follow-up dispatch 2026-05-24)
files_edited: 5
files_created: 1 (this session file)
parent_session: 2026-05-23-cto-agency-pivot-wave-rescope.md
---

# CTO — Infrastructure Gap Scoping (2026-05-24)

## Mission

CEO dispatched 6 infrastructure gaps surfaced by cross-team synthesis on top of the 2026-05-23 agency pivot. None already scoped in the wave briefs; all must be scoped in-place (no new files).

Source-of-truth read first (cached, single block):
1. `docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md` (15 decisions)
2. `docs/08-agents_work/sessions/2026-05-23-cto-agency-pivot-wave-rescope.md` (A1–A10)
3. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/09-WAVE-1-BRIEF.md` (current Wave 1 scope incl. agency rescope)
4. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/10-WAVE-2-BRIEF.md` (rescoped)
5. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/11-WAVE-3-BRIEF.md` (publishing matrix)
6. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/00-INDEX.md`
7. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/06-ADAM-CHECKLIST.md`
8. `docs/03-system-design/TECH_STACK.md`

External verification performed in this session:
- `dig` lookups against `notify.beamixai.com`, `beamixai.com`, `_dmarc.beamixai.com`, `resend._domainkey.beamixai.com` → all returned EMPTY (the checklist's "✅ Resend + DNS done" claim is wrong; DNS records are NOT yet live).
- `apps/web/` directory verified ABSENT (hard reset commit `56f1422` archived it; greenfield for Paddle scoping).

## Decisions made (B1–B6 — sub-decisions for the 6 gaps)

| # | Decision | Reversibility |
|---|---|---|
| B1 | **Discovery booking = Cal.com self-hosted (free Individual tier MVP).** Embedded via Cal.com web component on `/discovery/book`. Adam-owned single host slot for customers 1–50; multi-host pool from #51. | LITE — can swap to Calendly mid-flight; integration is iframe + webhook |
| B2 | **Voice/chat = text-only chat MVP via streaming Anthropic Sonnet** (no Vapi, no Retell, no Realtime API at launch). Voice deferred to MVP+90. | LITE — chat infra reusable; voice plugs in via separate adapter |
| B3 | **WordPress plugin = self-hosted .zip first (Wave 3 day-1), wordpress.org marketplace submission parallel.** Backend-engineer builds; no WP-specialist contractor. | EASY — distribution choice can flip when WP.org approves; same plugin code |
| B4 | **Resend DNS gap is REAL** (contradicts checklist claim). Adam must add 4 records before Wave 1 BE-3 ships transactional email. Resend Pro tier ($20/mo) required at ~10 paying customers (Pro = 50K emails/mo; free = 3K). | EASY (Adam DNS action) |
| B5 | **Paddle is greenfield** (`apps/web/` archived; no existing `lib/paddle/`). Adam must reconfigure Paddle products for the 4 new agency tiers ($499/$999/$1,499/$2,499 × monthly + annual = 8 products) BEFORE Wave 1 BE-2 ships. Old $79/$189/$499 products archive (not delete — referenced by historical webhook events). | FULL — touches money flow; Adam sign-off + lawyer ToS review block invoicing |
| B6 | **Free-scan rate limit re-aligned for lead-magnet flow.** New baseline: per-IP 3/day (was 5/hr); per-email 1/day; +Turnstile token mandatory (existing). Adam-network IP allowlist via `RATE_LIMIT_ALLOWLIST` env (CIDR list). | LITE — limits are env-tunable per route |

## Files edited (5)

1. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/09-WAVE-1-BRIEF.md` — added 4 infra-gap subsections (Discovery booking, Voice/chat, Resend DNS, Free-scan rate limit + abuse) under a new "INFRA GAP SCOPING — 2026-05-24" section near the top.
2. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/11-WAVE-3-BRIEF.md` — added WordPress plugin distribution + build-owner subsection to Integration 1.
3. `docs/03-system-design/TECH_STACK.md` — added §0.9 "Infrastructure vendor picks (2026-05-24)" with Cal.com + chat-stack + WordPress-plugin-distribution.
4. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/00-INDEX.md` — added "Infrastructure prerequisites" callout flagging the 6 gaps + Adam blockers.
5. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/06-ADAM-CHECKLIST.md` — appended "2026-05-24 — Infrastructure gap action items" section with 6 Adam actions.

## Files created (1)

This session file only. No new planning files (per brief constraint).

## Gap scoping summary

### Gap 1 — Discovery booking (B1)

**Pick:** Cal.com (open-source, Individual tier free, self-hostable later).
**Why:** Free tier covers a single Adam-host through customer #50. Embeddable web component avoids iframe quirks. Same OSS codebase upgrades to multi-host pool at #51 via "Teams" tier ($15/user/mo) without integration rewrite. Calendly is the alternative ($10–15/mo per user) but locks Beamix to a paid SaaS from day-1 and has weaker embed quality. Custom integration rejected (1–2 worker-weeks for what Cal.com gives in 4 hours).
**Integration shape:** Cal.com web component on `/discovery/book` (Wave 1 FE-discovery-funnel scope). Webhook `booking.created` → POST to `/api/discovery/booked` → writes `discovery_bookings` row (already in Wave 1 scope) + fires Inngest event `discovery.scheduled`. Adam's Google Calendar OAuth'd via Cal.com app marketplace.
**Effort:** S (≤2 days FE + ½-day BE webhook).
**Risk tier:** Full (touches customer-facing funnel critical path; Wave 1 W1.2 already Full).
**Adam action:** Sign up at cal.com → connect Google Calendar → create event type "Beamix Discovery Call (20-min)" → set availability → copy embed URL/ID → paste into `apps/web/.env.local` as `NEXT_PUBLIC_CALCOM_DISCOVERY_LINK=beamix/discovery-call` and `CALCOM_WEBHOOK_SECRET=<from dashboard>`.

### Gap 2 — Voice/chat for Discovery agent (B2)

**Pick:** Text-only streaming chat (Anthropic Sonnet, server-sent events) at launch. NO voice.
**Why:** Voice (Vapi $0.05–0.15/min platform + LLM/TTS ≈ $0.08–0.20/min net; Retell $0.07–0.15/min; ElevenLabs ~$0.10–0.20/min; OpenAI Realtime ~$0.06/min input + $0.24/min output ≈ $0.15–0.30/min net) adds material cost AND adds: telephony complexity, transcription QA loop, accent failure modes, recording legal compliance per-jurisdiction. Text-first cuts ~80% of build time and 100% of per-minute spend. Discovery agent's job is structured 20-question extraction — text is sufficient. Voice deferred to MVP+90 once we have 50 customer baseline + we know which questions actually need vocal nuance.
**Integration shape:** Discovery agent already in Wave 1 (PRD: `docs/04-features/specs/agent-discovery.md`). The W1.1 brief currently says "text, then voice if available" — this scoping LOCKS it to text-only at launch. Voice adapter interface left as a stub in `apps/web/src/lib/agents/discovery/voice-adapter.ts` so MVP+90 voice plug-in is a swap, not a rewrite.
**Cost per discovery call (text-only):** ~20 turns × ~2K tokens avg context × Sonnet pricing ≈ **$0.20–0.40 per discovery call**. Well within agency margin.
**Effort:** S (chat-streaming infrastructure is standard Anthropic SDK).
**Risk tier:** Full (customer-facing agent — already in Wave 1 W1.1).
**Adam action:** Decision confirm only. No vendor signup. (When voice ships at MVP+90, Adam picks Vapi vs Retell at that point with real customer data.)

### Gap 3 — Beamix WordPress plugin (B3)

**Distribution pick:** Hybrid — ship self-hosted `.zip` (uploadable via WP admin → Plugins → Add New → Upload) at Wave 3 day-1 launch, AND submit to wordpress.org marketplace in parallel.
**Why:** wordpress.org review lead time = 2–4 weeks AND first-submission rejection rate is high (must comply with plugin guidelines, GPL license, no obfuscated code, security review). Blocking Wave 3 launch on WP.org approval is a hard NO. Self-hosted .zip ships on day 1 with worse UX (manual upload, no auto-update). Once WP.org approves (typically v1.1), customer can switch to the WP.org-installed version (we publish a migration note in the plugin's `readme.txt`).
**Build owner:** **backend-engineer in our fleet**, not a WP-specialist contractor. WordPress plugin code is PHP/WP REST API/JS — well within backend-engineer's scope per Layer Contract. Contractor adds coordination overhead + IP-leak risk + creates a single-point-of-failure dependency.
**Plugin architecture:** PHP plugin shell + WP REST API consumer + Beamix OAuth-style flow (admin clicks "Connect to Beamix" → opens Beamix dashboard → Beamix issues Application Password back via callback → stored in `wp_options` encrypted). Scope minimization: requests only `read`, `edit_posts`, `edit_pages`, `manage_categories`, `upload_files` (NEVER `manage_options`). Update mechanism for self-hosted: in-plugin "Check for updates" button polls `https://app.beamixai.com/api/wp-plugin/version` → if newer, downloads .zip; admin clicks "Install update". Update mechanism for WP.org version: automatic via standard WP plugin updater.
**Branding per WP marketplace guidelines:** Plugin name "Beamix GEO Connector" (NOT "Beamix" alone — too generic for WP.org index). Description must NOT promise SEO ranking improvements (WP.org forbids "guaranteed results" claims). Must include GDPR/privacy disclosure linking to `app.beamixai.com/privacy`. Author = "Beamix Ltd" with verified beamixai.com URL.
**Effort:** M (3–5 worker-days for plugin + integration + WP.org submission packaging).
**Risk tier:** Irreversible (already in Wave 3 brief — touches customer external property).
**Adam action:** (a) Register `Beamix Ltd` author account at wordpress.org/plugins (free, instant). (b) Set up SVN credentials Wordpress requires for marketplace submissions (Adam supplies once; backend-engineer uses for the submission). (c) Decide plugin display name (default suggestion above). NO action blocks Wave 3 day-1 launch — self-hosted .zip path requires zero Adam input.

### Gap 4 — Resend infrastructure (B4)

**Status: GAP FOUND.** The checklist line 383 claims "Resend + DNS — Domain configured; keys in Vercel env" but live DNS lookups today return EMPTY for every Resend-required record. The API key is captured, but `notify.beamixai.com` has NO records (no MX, no SPF, no DKIM, no DMARC). Resend will accept the API call but emails will land in spam or be rejected by every major receiver.
**Gaps:**
1. No SPF record on `notify.beamixai.com` (need: `v=spf1 include:_spf.resend.com ~all` on TXT)
2. No DKIM CNAME (need: `resend._domainkey.notify.beamixai.com` → Resend-provided CNAME target from dashboard)
3. No DMARC on `beamixai.com` apex (need: `_dmarc.beamixai.com` TXT `v=DMARC1; p=none; rua=mailto:adam419067@gmail.com`)
4. No MX or `notify.beamixai.com → notify.resend.com` CNAME for the subdomain itself
**Resend tier:** Free tier = 3,000 emails/mo + 100/day cap. Projected volume = (1 weekly digest × N customers) + (~3 transactional × signup) + (Day-1 onboarding chain × N) + (refund/cancel/approval-link emails). At 10 customers: ~80 weekly digests + ~600 transactional = ~680/mo (free tier covers). At 50 customers: ~3,400/mo + bursts. **Upgrade to Resend Pro ($20/mo, 50K emails/mo, 50/sec rate, dedicated IP option) at ~10 paying customers** (not 50 — gives headroom for digest send-bursts at Sunday 16:00 customer-local).
**Adam action:**
1. Log into Resend dashboard → Domains → `notify.beamixai.com` → copy the 3 DNS records shown.
2. Log into Cloudflare DNS for `beamixai.com` → add: SPF TXT, DKIM CNAME, DMARC TXT. (CNAME for the subdomain itself if Resend's dashboard provides one.)
3. Click "Verify" in Resend dashboard. Wait up to 30 min for propagation.
4. Send a test email via Resend dashboard to `adam419067@gmail.com` to confirm inbox delivery (NOT spam).
5. Bookmark `https://resend.com/settings/billing` — upgrade trigger = when monthly send approaches 2,500 (alert from Resend dashboard).

### Gap 5 — Paddle (B5)

**Status: GAP FOUND.** `apps/web/` is archived (hard reset commit `56f1422`); no `lib/paddle/` exists. Paddle setup is greenfield. Checklist deferred items confirm: `PADDLE_VENDOR_ID` + `PADDLE_PUBLIC_KEY` are NOT yet captured (Adam blocked on sandbox login mismatch). Additionally, the existing checklist references the OLD pricing ($79/$189/$499 + $19 top-up = 7 products); the agency pivot KILLED these and replaced with 4 new tiers × monthly + annual = **8 new products required**.
**Gaps:**
1. `PADDLE_VENDOR_ID` not captured (Adam blocked on sandbox login).
2. `PADDLE_PUBLIC_KEY` not captured.
3. `PADDLE_NOTIFICATION_SECRET` (HMAC webhook signing) — not confirmed captured.
4. Old products ($79/$189/$499/$19 top-up) — archive (do NOT delete; historical webhooks reference them).
5. **8 new agency-tier products to create** (sandbox first, then production):
   - Starter monthly $499 / Starter annual $5,388 ($449/mo)
   - Growth monthly $999 / Growth annual $10,788 ($899/mo)
   - Scale monthly $1,499 / Scale annual $16,188 ($1,349/mo)
   - Professional monthly $2,499 / Professional annual $26,988 ($2,249/mo)
   - (Annual pricing assumed 10% discount per agency-standard; CBO validates final discount % before products created.)
6. Refund policy: "Custom — partial refunds allowed" already documented for ADQ-5; agency pivot uses 60-day money-back guarantee with held-revenue model (CTO A4) — Paddle refund policy stays "Custom" because backend (`refund_events` ledger) controls amounts.
7. Top-up product: KILL — agency model has no top-up SKU; deliverables are tier-gated, not credit-gated.
**Sequencing:** Adam creates **Starter monthly + Starter annual FIRST** (the most-likely day-1 SKU). Wave 1 BE-2 (now `be-tier-rename`) wires those two price IDs and ships. The other 6 products can be created in parallel with Wave 1 — only Starter blocks the first customer signup. Hard-block for invoicing customer #1: ToS lawyer review (Adam-blocker #2 in grill session) — Paddle must NOT be flipped to production until lawyer-reviewed ToS is published.
**Adam action:**
1. Resolve sandbox login (password reset or fresh account) → log into `sandbox-vendors.paddle.com`.
2. Create 8 new products in Sandbox (priority: Starter monthly + annual first).
3. Capture: `PADDLE_VENDOR_ID`, `PADDLE_PUBLIC_KEY`, `PADDLE_API_KEY`, `PADDLE_NOTIFICATION_SECRET`, 8 price IDs.
4. Add to Vercel env (Preview + Production scopes).
5. Schedule lawyer ToS review (Israeli or UK SaaS lawyer, ~2hr engagement, ~$500–1500). Hard-block: do NOT flip Paddle to production billing until lawyer-approved ToS is published at `app.beamixai.com/terms`.
6. Archive (do NOT delete) old $79/$189/$499 + $19 top-up products in Paddle dashboard.

### Gap 6 — Free-scan rate limiting + abuse prevention (B6)

**Re-alignment context:** Original spec (Wave 1 BE-2) had per-IP 5/hour + Turnstile. Under tool-product framing, free scan was the funnel front door + viral score share. Under agency framing (decision #6), free scan is a LEAD MAGNET feeding `/discovery/book` — fewer scans per visitor are expected, conversion-to-discovery matters more than raw scan throughput. New limits below tighten the rate to discourage abuse without throttling genuine leads.
**Spec:**
| Vector | Old (tool framing) | New (agency framing) |
|---|---|---|
| Per-IP `/api/scan/free` | 5/hour | **3/day** (full-IP), with `Retry-After: 86400` header on breach |
| Per-email | not enforced | **1/day** (email captured at soft email-gate; second submit within 24h same email blocks with "We already scanned this — check your inbox.") |
| Turnstile | required (already in spec) | required (unchanged — keeps E8 mitigation) |
| Per-domain (scanned URL) | not enforced | **2/week** (prevents competitor-domain harvesting via repeated free scans) |
| Allowlist | none | **CIDR allowlist `RATE_LIMIT_ALLOWLIST` env var** — Adam's home/office IP + Adam's network (warm-network DM recipients add their IP via `?adamkey=<rotating-token>` query param that auto-allowlists for 24h) |
| Discovery-book endpoint `/api/discovery/book` | n/a (new) | per-IP 5/day, per-email 1/day |
**Bot/spam prevention layers (defense-in-depth):**
1. Cloudflare Turnstile (already E8 — keeps fully).
2. IP rate limit via `@upstash/ratelimit` (already Wave 1 BE-2 scope).
3. Email rate limit via Supabase row check (new — adds ~50 LOC to BE-2's `/api/scan/free` handler).
4. Domain rate limit (new — same row-check pattern).
5. Honeypot field on the `/scan` form (visible-to-bots input with `display:none`; if filled, server silently returns 200 with bogus scan_id and logs `audit_log` row `event_kind=honeypot_triggered`).
6. WHOIS/parked-domain check before LLM spend (verification pipeline already in Wave 2 W2.4 for signup; lifted to free-scan critical path — reject scan if WHOIS < 30 days old AND not on Adam-allowlist).
**Allowlist UX:** Adam shares cold DMs with link `https://app.beamixai.com/scan?adamkey=<24h-token>`. Token signed with HMAC of `(date, salt)`, valid 24h. Server adds requester IP to `RATE_LIMIT_ALLOWLIST` (Supabase `rate_limit_overrides` table) for 24h. Removes friction for warm-network prospects.
**Adam action:** Provide list of static IPs (home, office, VPN if any) to add to `RATE_LIMIT_ALLOWLIST` env. None blocking — defaults work; allowlist is optional polish.

## Adam-blockers (consolidated, new from this session)

| # | Blocker | Wave gate |
|---|---|---|
| AB-1 | Cal.com signup + Google Calendar OAuth + capture embed URL + webhook secret | Wave 1 W1.2 (discovery funnel) |
| AB-2 | Resend DNS records added at Cloudflare DNS (SPF + DKIM + DMARC + subdomain CNAME); verify in Resend dashboard | Wave 1 BE-3 (transactional email) |
| AB-3 | Paddle sandbox login resolved → 8 new products created (Starter pair first) → 8 price IDs + vendor ID + public key + notification secret captured | Wave 1 BE-2 / `be-tier-rename` |
| AB-4 | ToS lawyer review scheduled + completed | Before flipping Paddle to production billing (Wave 2 cutover) |
| AB-5 | WordPress.org publisher account + SVN credentials | Wave 3 plugin marketplace submission (NOT day-1 blocking) |
| AB-6 | (Optional) Static IP allowlist for RATE_LIMIT_ALLOWLIST | Wave 1 BE-2 polish (not blocking) |

(AB-7+ unchanged from grill session: insurance procurement, financial-model validation — already in source-of-truth.)

## Consistency findings

1. **Checklist line 383** claims Resend + DNS done — contradicts live DNS. Edited `06-ADAM-CHECKLIST.md` to add a correction note. (Did NOT edit the original "Completion log" historical record per append-only convention.)
2. **W1.5 Paddle reconfig** (in `09-WAVE-1-BRIEF.md`) flags "Adam reconfigures in Paddle dashboard for $499/$999/$1,499/$2,499." The 2026-05-24 gap-scoping pins exact SKU count = **8 products** (4 tiers × 2 cycles), kills top-up SKU, and sequences Starter first.
3. **Voice "text, then voice if available"** language in W1.1 — now LOCKED to text-only. Voice deferred to MVP+90 explicitly.
4. **Free-scan rate-limit numbers** in Wave 1 BE-2 (5/hr per IP) — superseded by new agency-aligned numbers (3/day per IP, plus per-email + per-domain + allowlist).
5. **Top-up product/SKU** in `06-ADAM-CHECKLIST.md` line 226 — KILL. Agency tiers don't use credit top-ups; deliverables are tier-gated.

## Blockers

None at engineering layer. All blockers are upstream Adam actions enumerated in AB-1..6 above.

## Next steps

1. CEO surfaces AB-1..6 to Adam as a single consolidated to-do list.
2. CTO briefs backend-engineer + frontend-engineer for Wave 1 W1.2 only after AB-1 (Cal.com setup) is captured in env.
3. CTO briefs backend-engineer for `be-tier-rename` only after AB-3 (8 Paddle products + price IDs) is captured.
4. CTO briefs ai-engineer for Discovery agent (W1.1) — voice-adapter stub interface only, text-only chat live.
5. devops-engineer adds a CI check that runs `dig` against required DNS records during CI smoke-tests (catches DNS regressions before email-dependent E2E tests run).
