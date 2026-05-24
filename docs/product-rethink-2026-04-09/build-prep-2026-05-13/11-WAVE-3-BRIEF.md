# Wave 3 — Publishing Integrations Matrix (CEO Brief)

*Created 2026-05-23 — agency pivot. Sequenced AFTER Wave 2 ships and paying customer #1 onboards. Can flip to in-parallel with Wave 2 if customer #1 books before Wave 2 completes — CEO decides.*

---

## Mission

Wave 3 turns Beamix from a "we tell you what to do" advisor into a "we did it for you" agency. Workers in Wave 3 build the actual publishing layer: real OAuth flows, real API clients, real DNS-aligned email subusers, real schema injection, real listing pushes against Google/Yelp/Apple, plus paste-ready fallback content for platforms without an API.

**Estimated turns (per worker):** 50–100. Wave 3 is heavier than Wave 2 because each integration is a self-contained subsystem with its own auth, rate limits, and rollback story.

**Wave 3 scope is bounded by the 11 integrations below.** No publishing target outside this list ships without a new wave brief. If a customer asks for HubSpot CMS or Joomla, the answer is "paste-ready, manual" until Wave 4.

---

## Required Reading

The CEO (you) reads all of these. Pass relevant ones to each worker.

1. `.claude/memory/DECISIONS.md` 2026-05-23 entry (15 agency-pivot decisions)
2. `docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md` (full grill matrix)
3. `docs/08-agents_work/sessions/2026-05-23-cto-agency-pivot-wave-rescope.md` (architectural decisions A1–A10)
4. `docs/03-system-design/ARCHITECTURE.md` §Agency pivot delta (top of file)
5. `docs/03-system-design/DATABASE_SCHEMA.md` §`publishing_credentials`, §`approval_queue`
6. `docs/03-system-design/API_CONTRACTS.md` §POST /api/publish/:platform/:resource
7. `docs/03-system-design/AI_AGENTS.md` §Publisher agent
8. `docs/04-features/specs/agent-publisher.md` (CPO PRD — referenced, not duplicated)
9. `docs/ENGINEERING_PRINCIPLES.md` §Publishing-action logging (new principle 9)
10. Wave 1 + Wave 2 PRs in commit history (read approval_queue + held-revenue implementations)

---

## QA gate output contract (carried forward from Wave 1 + 2)

Same verdict-frontmatter schema; **every Wave 3 PR is risk-tier Full or Irreversible** per QA gate matrix (these PRs touch customer external properties — they cannot be Lite). See `.claude/qa-tier-floor.yml` (updated this wave): file-path floor for `apps/web/src/lib/publishing/**` = `irreversible`. CTO cannot downgrade.

```yaml
---
verdict: PASS | BLOCK
risk_tier: full | irreversible    # never lite or trivial in Wave 3
findings: []
craft_score: 1-5                  # for UI-touching PRs (publish-status UI, approval-queue UI)
craft_findings: []
customer_outcome_check: ""         # name the metric this PR moves
rollback_plan: ""                  # MANDATORY for Wave 3 — every PR documents how Beamix undoes the publish
publishing_target: "wordpress|shopify|webflow|ghost|gbp|yelp|apple|sendgrid|gtm|paste"
adam_signoff: "REQUIRED|n/a"       # REQUIRED on any irreversible-tier merge
---
```

The `rollback_plan` field is non-negotiable. Every push to a customer external property must specify (a) can Beamix programmatically undo it (yes — keep undo endpoint scoped) (b) if no, the manual-rollback runbook the support team follows. PRs without rollback_plan get blocked even at PASS verdict.

---

## Security requirements (every Wave 3 worker)

Wave 3 raises the security baseline above Wave 1+2:

1. **All OAuth tokens encrypted at rest** in `publishing_credentials.encrypted_token` via pgcrypto sym key (`PUBLISHING_TOKEN_KEY` env). Never logged. Never returned in API responses.
2. **Token refresh worker** (`inngest/functions/publishing-token-refresh.ts`) runs hourly; refreshes any token within 24h of expiry; writes audit_log row per refresh.
3. **OAuth state CSRF parameter** on every flow; verified on callback; 5-minute TTL.
4. **Scope minimization** — every integration requests least-privilege scopes. Documented in the per-integration table below.
5. **Per-platform rate limiter** wraps every API client. Limits sourced from each platform's published rate-limit docs; defaults conservative (50% of platform max).
6. **Audit log row per publish action** — `audit_log` row written on every external API call with `customer_id, platform, resource_type, resource_id_external, status, approval_queue_id (if gated), undo_token (if reversible)`.
7. **Approval-gate enforcement** — every publish endpoint checks `gating_rules` config; if action is gated, must reference a valid `approval_queue` row with `status='approved'`. No bypass path.
8. **Customer disconnect path** — every integration has a "disconnect" endpoint that revokes the token at the platform and marks `publishing_credentials.status='revoked'`. Disconnects are immediate; queued actions abort.
9. **No agent names in any response** (per A8 / engineering principle 9). The API returns publishing outcomes, never the agent that produced them.
10. **DNS verification for SendGrid sub-account** — customer must verify SPF/DKIM/DMARC records before any email-as-them can fire. Verification status is per-record (SPF=ok, DKIM=ok, DMARC=ok); all three required.

---

## Integration matrix

For each integration: API auth, scopes, rate limits, retry/failure handling, approval-gate posture, rollback path, effort size (S < 2 days, M = 2–5 days, L > 5 days), and Beamix risk tier.

### Integration 1 — WordPress REST API + Beamix WordPress plugin (MVP)

**Owner:** backend-engineer (worker `pub-wordpress`)
**Effort:** M | **Tier:** Irreversible | **Adam sign-off:** Required
**Worktree:** `.worktrees/w3-pub-wordpress` | **Branch:** `feat/w3-pub-wordpress`

**Auth:** Application Password (WordPress 5.6+) for `.org` self-hosted; OAuth2 for `.com` business plans. Customer follows a 4-step install: install Beamix plugin from WP admin → click "Connect to Beamix" → redirected to Beamix dashboard → token stored. The plugin sets up an Application Password and proxies API calls so customer never needs to manage credentials manually.

**Scopes:** `read`, `edit_posts`, `edit_pages`, `manage_categories`, `upload_files`. No `manage_options`.

**Rate limits:** WordPress.com REST API ~150 requests/min/site. Self-hosted is unbounded but rate-limit conservatively at 30/min to avoid customer host issues. Use `p-queue` per-customer.

**Retry policy:** 5xx → exponential backoff 1s/4s/16s/64s, 5 attempts max. 401 → token-refresh worker + retry once. 403 → flag credential as stale, alert via Customer-success agent.

**Failure modes:** (a) plugin uninstalled — detected by 404 on heartbeat endpoint; status → `disconnected`, alert customer. (b) Application Password revoked — 401 with no refresh path; customer must reconnect. (c) WordPress site offline — 5xx after retry exhaustion; queued publishes stay in approval_queue with status `retry_pending`.

**Approval-gate posture:** Content publishes = **gated** (per decision #2). Schema injections = **auto**. Media uploads attached to gated publishes = grouped with the parent publish approval.

**Rollback:** Every published post stores `external_post_id` + `published_at` in `publishing_actions` table. Undo endpoint calls `DELETE /wp/v2/posts/:id`. Schema rollback: re-injects empty JSON-LD at the same DOM hook.

**Beamix WordPress plugin scope:**
- Beamix Connect button (OAuth-style flow to Beamix dashboard)
- Heartbeat endpoint for connection-health monitoring
- Schema injection helper (renders JSON-LD in `<head>` from Beamix-stored content)
- Health check page in WP admin showing connection status

Plugin code lives in `apps/web/integrations/wordpress-plugin/` (separate sub-package; published to wordpress.org plugin directory once approved).

---

### Integration 2 — Schema injection via Google Tag Manager (MVP)

**Owner:** backend-engineer (worker `pub-gtm`)
**Effort:** M | **Tier:** Full | **Adam sign-off:** n/a (Full not Irreversible — GTM container changes are reversible within GTM history)
**Worktree:** `.worktrees/w3-pub-gtm` | **Branch:** `feat/w3-pub-gtm`

**Auth:** Google OAuth2 with `https://www.googleapis.com/auth/tagmanager.edit.containers` scope. Customer connects GTM during onboarding if they have GTM installed; otherwise Schema agent falls back to platform-native injection (WP plugin, Shopify metafields, Webflow embed).

**Scopes:** `tagmanager.edit.containers` only. No `accounts` admin.

**Rate limits:** GTM API quota = 250 writes/day per container. We batch all customer JSON-LD blobs into a single Custom HTML tag per container, updated once per scan cycle (so 1 write/scan, not 1 per FAQ).

**Retry policy:** 4xx parameter errors → log + alert (not retried). 429 → exponential backoff, 3 attempts max. 5xx → exponential backoff, 5 attempts max.

**Failure modes:** (a) container deleted — 404; status → `disconnected`, alert customer. (b) workspace conflict — GTM has draft/published states; we always publish via API but check workspace state first. (c) tag firing-rule misconfigured — visible in GTM Preview; Schema agent runs a Preview check after every push.

**Approval-gate posture:** **Auto** for schema (per decision #2). Customer sees the JSON-LD diff in their weekly digest but doesn't need to approve.

**Rollback:** GTM container versioning is built-in. Every push creates a new container version with `name='beamix-update-{scan_id}'`. Undo = `gtm.versions.live` set to previous version.

---

### Integration 3 — SendGrid sub-account ("send as them") (MVP)

**Owner:** backend-engineer (worker `pub-sendgrid`)
**Effort:** L | **Tier:** Irreversible | **Adam sign-off:** Required
**Worktree:** `.worktrees/w3-pub-sendgrid` | **Branch:** `feat/w3-pub-sendgrid`

**Auth:** SendGrid Subuser API (Beamix has a master API key with `subuser.create` scope, creates one subuser per customer, generates a subuser-scoped API key, stores it encrypted). Each customer is a SendGrid subuser under Beamix's primary account.

**Scopes:** Per-subuser key has `mail.send`, `sender_authentication.read`, `sender_authentication.update`. No `users` admin.

**Rate limits:** SendGrid free tier = 100 emails/day; Pro = 100K/month. Subuser limits inherit from parent plan. Beamix queues outbound at 10 emails/min/customer regardless of plan (deliverability protection).

**Retry policy:** 5xx → retry 3× with 1s/4s/16s. 4xx → log + dead-letter (don't retry). 429 → respect Retry-After header.

**Failure modes:**
- **DNS not aligned** — customer's domain doesn't have SPF/DKIM/DMARC records for Beamix's SendGrid IPs. **This is the single biggest failure mode.** Sender Authentication onboarding flow walks customer through DNS setup; subuser is created but cannot send until all three records verify. Verification re-checks every 30 min for 7 days; then manual re-trigger.
- **Subuser disabled by SendGrid abuse team** — if customer's emails generate spam complaints > 0.1%, SendGrid disables the subuser. Customer-success agent surfaces this; Beamix support reaches out.
- **Bounce rate > 5%** — auto-pause sending and flag for human review (Customer-success agent).

**Approval-gate posture:** **Gated** (per decision #2 — email-as-them is gated). Every email draft sits in approval_queue with status `pending`, customer 1-clicks approve in weekly digest, status flips to `approved`, sender worker fires.

**Rollback:** Sent email is sent. There is no "undo" for delivered email. The undo story is (a) customer disconnects the SendGrid subuser → no further sends, queue drained; (b) for emails caught in time, status `pending → revoked` before send.

**Critical DNS-verification UX:** the connection flow shows a 3-row table (SPF, DKIM, DMARC) with `Status: ok | pending | failed`. Customer copies the TXT record from a code block, pastes into their DNS provider, clicks "Re-check now." 7-day verification window before sender goes live. Without all 3 records green, email-as-them is disabled.

---

### Integration 4 — Paste-ready content generator (Wix / Squarespace / custom CMS) (MVP)

**Owner:** frontend-engineer (worker `pub-paste`)
**Effort:** S | **Tier:** Lite | **Adam sign-off:** n/a
**Worktree:** `.worktrees/w3-pub-paste` | **Branch:** `feat/w3-pub-paste`

**Auth:** None — this is a paste-out flow. No external API. Beamix renders the content in the dashboard with copy buttons and a checklist.

**Scopes:** n/a

**Rate limits:** n/a

**Retry policy:** n/a

**Failure modes:** Customer doesn't paste = customer doesn't ship. Customer-success agent monitors `published_at` vs `prepared_at` delta; if > 7 days, nudges customer.

**Approval-gate posture:** **Gated** — same content publish gate as API-based platforms. Customer approves the content in approval_queue; status flips to `approved`; "Ready to paste" state shows in dashboard with copy buttons; customer marks `mark_as_published` manually (or Beamix infers via subsequent visibility-scan re-detection of the change on their site).

**Rollback:** Customer-side. Beamix does not see the customer's CMS. Customer-success agent walks customer through removal if requested.

**UX requirements:**
- 1-click copy buttons for: page title, meta description, body markdown, JSON-LD schema, FAQ section
- Step-by-step instructions per platform (Wix, Squarespace, custom CMS card, with screenshots)
- "Mark as published" button + URL field so Beamix can re-scan and confirm the change went live
- Visual diff against existing page content (if Beamix scanned the URL prior)

---

### Integration 5 — Google My Business / Business Profile API (Wave 3 stretch)

**Owner:** backend-engineer (worker `pub-gbp`)
**Effort:** M | **Tier:** Irreversible | **Adam sign-off:** Required
**Worktree:** `.worktrees/w3-pub-gbp` | **Branch:** `feat/w3-pub-gbp`

**Auth:** Google OAuth2 with `https://www.googleapis.com/auth/business.manage` scope. Customer connects during onboarding; Beamix lists their locations; customer picks which to manage.

**Scopes:** `business.manage` (broad — Google doesn't offer granular scopes). Documented to customer in approval flow.

**Rate limits:** GBP API quota = 1000 read/day, 1500 write/day per project. Beamix project hits all customers; per-customer cap = 50 writes/day enforced server-side.

**Retry policy:** Standard exponential backoff. 403 → likely scope or location-ownership issue; flag for support.

**Failure modes:** (a) location ownership revoked at Google — customer must re-claim; status `disconnected`. (b) Posts/Q&A rejected by Google moderation — visible in API response; flagged to Customer-success agent.

**Approval-gate posture:**
- Location info updates (hours, address, phone, website) = **auto** (these are correctness updates)
- New posts = **gated** (posting is marketing surface)
- Q&A answers = **gated**
- Photos = **gated**

**Rollback:** GBP doesn't version locations server-side. Beamix stores the pre-edit snapshot in `publishing_actions.previous_state` JSONB; undo = re-apply previous_state via PATCH.

---

### Integration 6 — Shopify Admin API (Wave 3 stretch)

**Owner:** backend-engineer (worker `pub-shopify`)
**Effort:** L | **Tier:** Irreversible | **Adam sign-off:** Required
**Worktree:** `.worktrees/w3-pub-shopify` | **Branch:** `feat/w3-pub-shopify`

**Auth:** Shopify OAuth2 — Beamix needs to register as a Shopify Partner app, generate App API key + secret. Customer installs the Beamix Shopify app via the install URL, approves scopes, webhook redirects to Beamix dashboard.

**Scopes:** `write_products`, `write_pages`, `read_themes` (for schema injection scope detection), `write_content` (blog), `write_metafields` (for product-level schema). No `write_customers`, no `write_orders`.

**Rate limits:** Shopify uses leaky-bucket — 40 req/sec burst, 2 req/sec sustained for Standard plans; 80/4 for Plus. Beamix client adheres to header `X-Shopify-Shop-Api-Call-Limit` and backs off on 429.

**Retry policy:** Standard backoff + leaky-bucket awareness.

**Failure modes:** (a) app uninstalled by customer — Shopify webhook `app/uninstalled` arrives; status → `disconnected`. (b) scope change required — Shopify forces re-auth; customer notified. (c) theme doesn't support schema metafields — fall back to GTM injection if customer has GTM.

**Approval-gate posture:**
- Product schema updates (metafields) = **auto** (technical, no marketing surface)
- New blog posts = **gated**
- Page content updates (about, FAQ) = **gated**

**Rollback:** Shopify API returns the resource before update; Beamix stores `previous_state`. Undo = re-PATCH with previous_state.

---

### Integration 7 — Webflow API (Wave 4 deferred)

**Owner:** TBD (Wave 4)
**Effort:** M | **Tier:** Irreversible | **Adam sign-off:** Required

**Auth:** Webflow OAuth2 with site-specific scopes. Customer installs Beamix from Webflow marketplace.

**Scopes:** `cms:write`, `pages:write`, `assets:write`.

**Rate limits:** 60 requests/min per token; soft limit. Aggressive backoff on 429.

**Failure modes:** Webflow's CMS is more rigid (collections, fields). Field mismatches between Beamix content shape and customer's collection schema → fall back to paste-ready.

**Approval-gate posture:** All content publishes gated. Schema = auto.

**Rollback:** Webflow versions CMS items; Beamix can roll back via `revisions/:id/restore`.

**Defer rationale:** Webflow customer overlap with our launch ICP is low (B2B SaaS more likely WordPress/Shopify; legal/dental more likely WordPress). Re-evaluate after customer #20.

---

### Integration 8 — Ghost Admin API (Wave 4 deferred)

**Owner:** TBD (Wave 4)
**Effort:** S | **Tier:** Full | **Adam sign-off:** n/a

**Auth:** Ghost API Key (admin) — customer generates in Ghost admin, pastes into Beamix. Simpler than OAuth.

**Scopes:** Admin-level (Ghost doesn't offer scoped keys); documented to customer.

**Rate limits:** Self-hosted = unbounded; ghost.io = ~100 req/min.

**Failure modes:** Key revoked = re-paste flow. Self-hosted Ghost offline = retry/alert.

**Approval-gate posture:** Content publishes gated.

**Rollback:** Ghost stores post revisions; Beamix can call `posts/:id/revisions` to restore.

**Defer rationale:** Tiny customer base on Ghost in launch ICP. Wave 4.

---

### Integration 9 — Yelp Fusion API (Wave 4 deferred — research first)

**Owner:** TBD (Wave 4)
**Effort:** M | **Tier:** Irreversible | **Adam sign-off:** Required

**Auth:** Yelp Developer API key. **CRITICAL: Yelp restricted business-modification API access in 2024.** Most write operations (claim, update, respond to reviews) are now gated to Yelp Reservations or paid Yelp Ads partners.

**Pre-Wave-4 spike:** Wave 4 starts with a 0.5-day spike from researcher to confirm current Yelp API access for business operations. If write API is fully closed (read-only Yelp Fusion only), Wave 4 drops Yelp integration entirely and substitutes paste-ready Yelp instructions ("here's the content; log into Yelp business owner portal and update").

**Approval-gate posture:** If API access allows, listing updates auto; review responses gated.

**Defer rationale:** API access uncertainty + lower customer ROI than GBP for dental/legal.

---

### Integration 10 — Apple Business Connect API (Wave 4 deferred)

**Owner:** TBD (Wave 4)
**Effort:** M | **Tier:** Irreversible | **Adam sign-off:** Required

**Auth:** Apple Business Connect API uses Apple ID-linked tokens; partner-tier access required. Beamix applies as a partner before Wave 4.

**Scopes:** Apple's API surfaces are narrow (location, hours, photos, showcases). All scoped.

**Rate limits:** Documented after partner onboarding.

**Failure modes:** Partner tier rejected → fall back to paste-ready instructions for Apple Maps Connect web portal.

**Approval-gate posture:** Hours / location = auto. Showcases / photos = gated.

**Rollback:** Apple keeps history; can revert via API.

**Defer rationale:** Lower traffic-share than GBP for launch ICP. Wave 4 once partner status confirmed.

---

### Integration 11 — Citation submission engine (MVP, batched)

**Owner:** backend-engineer (worker `pub-citations`)
**Effort:** M | **Tier:** Full | **Adam sign-off:** Adam reviews citation directory list once
**Worktree:** `.worktrees/w3-pub-citations` | **Branch:** `feat/w3-pub-citations`

**Targets:** Top 30 SMB citation directories (Yellowpages, BBB, Foursquare, Yelp, Bing Places, Apple Maps via #10, Trustpilot, G2, Capterra, Clutch, etc.). Mix of:
- Direct submission via partner API (where available — BrightLocal, Whitespark, Yext can be intermediaries)
- Email-based submission (we send a structured email with NAP + categories to a citation editor)
- Manual queue (for directories without an API — Customer-success agent processes batch)

**Auth:** Per-aggregator. If we use BrightLocal/Whitespark/Yext as intermediary, we hold one master API key for the aggregator and submit per-customer through it.

**Recommendation:** Start with BrightLocal Citation Builder (~$2/submission, white-label friendly). Beamix wraps it as a single submission endpoint; customer never touches BrightLocal.

**Approval-gate posture:** **Auto** (citation listings are factual, not marketing). Customer sees the submission report in weekly digest after submission completes.

**Rollback:** Most directories don't offer programmatic removal. Customer must email the directory for removal. Beamix's role is to track the submission, not undo it.

---

## Cross-cutting infrastructure (built once, shared by all integrations)

### `apps/web/src/lib/publishing/` shared layer (worker `pub-shared`)

**Owner:** backend-engineer
**Effort:** M | **Tier:** Full
**Worktree:** `.worktrees/w3-pub-shared` | **Branch:** `feat/w3-pub-shared`

Built first, before any platform-specific worker spawns. Provides:

- `BasePublisher` abstract class with `publish()`, `rollback()`, `healthCheck()`, `disconnect()` methods
- Token storage + encryption + refresh utilities (`tokens.ts`)
- Approval-gate check (`gates.ts` — reads `gating_rules` config, enforces approval_queue lookup)
- Rate-limit wrapper (`rate-limit.ts` — per-platform, leaky-bucket-aware)
- Audit-log writer (`audit.ts` — atomic with the publish action)
- Retry policy (`retry.ts` — platform-aware exponential backoff)
- Health-check cron (`inngest/functions/publishing-health-check.ts` — every 6 hours per credential)

Every platform-specific publisher extends `BasePublisher`. No platform-specific code may bypass these utilities (enforced by lint rule + qa-tier-floor.yml — any file in `apps/web/src/lib/publishing/<platform>/` that calls `fetch` directly is rejected).

---

### Approval-queue UI (worker `pub-approval-ui`)

**Owner:** frontend-engineer
**Effort:** M | **Tier:** Full (touches customer-facing surface)
**Worktree:** `.worktrees/w3-pub-approval-ui` | **Branch:** `feat/w3-pub-approval-ui`

Approval-queue list view + per-item review modal. Already scaffolded in Wave 1 (shell only). Wave 3 completes:
- Per-item diff view (current state vs proposed state)
- Inline 1-click approve / reject / edit-and-approve actions
- Bulk-approve for low-risk batches (citations)
- Approval-from-email flow (signed URL → land on per-item view → confirm)
- Expiry countdown + auto-publish indicator (if customer opted in)

Craft reviewer applies — every interaction polished.

---

## Deliverables-tracker integration (worker `pub-deliverables`)

**Owner:** backend-engineer
**Effort:** S | **Tier:** Lite
**Worktree:** `.worktrees/w3-pub-deliverables` | **Branch:** `feat/w3-pub-deliverables`

Wave 2 built the `deliverables_per_customer_per_month` table. Wave 3 wires every publish action into it:
- Every `BasePublisher.publish()` success increments the relevant counter (`schema_pushed_count`, `citation_submitted_count`, `faq_published_count`, etc.)
- Per-tier caps enforced before publish: if customer is Starter and already used 4/4 schemas this month, publish rejected with `LimitExceededError` and queued for next month.
- Customer dashboard outcomes panel reads from this table.

---

## Wave 3 acceptance criteria

Wave 3 ships when **all four MVP integrations** are live, exercising real customer credentials, on staging, with a paying customer (or Adam in a staging role) running a full end-to-end test:

1. WordPress plugin installs from wordpress.org, customer connects, schema injects, content publish goes through approval gate, audit log shows the publish, undo endpoint reverses it.
2. GTM injection on a real customer container with verifiable JSON-LD landing in `<head>` (validated via Schema.org validator).
3. SendGrid sub-account with DNS verified on a real domain, test email sent successfully, bounce + complaint webhooks wired.
4. Paste-ready Wix flow: content generated, customer pastes, Beamix re-scans + detects, marks `published_at`.

Wave 3 does NOT ship until all four pass. Stretch integrations (GBP, Shopify) ship in a follow-up PR train, gated on first customer demand.

---

## Failure-mode dashboard (CTO ownership)

A new `/admin/publishing-health` page (per `20-ADMIN-DASHBOARD-SPEC.md`) shows:
- Connection status per (customer, platform) — green/yellow/red
- Last successful publish timestamp
- Queued approvals awaiting customer
- Pending DNS verifications (SendGrid)
- Failed publishes in last 24h (with platform + error)
- Token expiry warnings (24h, 7d windows)

Adam reviews this dashboard weekly during the founding-100 phase.

---

## Wave 3 worker dispatch order

Workers fire in this order; never out-of-sequence:

1. **`pub-shared`** (M, Full) — must merge first; all platform workers depend on it.
2. **`pub-approval-ui`** (M, Full) and **`pub-deliverables`** (S, Lite) — parallel after `pub-shared`.
3. **`pub-wordpress`** (M, Irreversible), **`pub-gtm`** (M, Full), **`pub-paste`** (S, Lite) — parallel after step 2.
4. **`pub-sendgrid`** (L, Irreversible) — sequential after step 3 to avoid security-engineer review-queue overload (SendGrid + WordPress + GTM all need security-engineer attention).
5. **`pub-citations`** (M, Full) — parallel with step 4.
6. **Stretch:** `pub-gbp`, `pub-shopify` — only spawned after steps 1–5 ship and Adam decides.

CEO dispatches max 3 workers in parallel per step (constrained by security-engineer review capacity, not engineering capacity).

---

## Risk tier summary

| Integration | Tier | Adam sign-off | MVP? |
|---|---|---|---|
| `pub-shared` (cross-cutting) | Full | n/a | Yes |
| `pub-approval-ui` | Full | n/a | Yes |
| `pub-deliverables` | Lite | n/a | Yes |
| WordPress | Irreversible | Required | Yes |
| GTM | Full | n/a | Yes |
| SendGrid | Irreversible | Required | Yes |
| Paste-ready | Lite | n/a | Yes |
| Citations (BrightLocal) | Full | Required (directory list) | Yes |
| GBP | Irreversible | Required | Stretch |
| Shopify | Irreversible | Required | Stretch |
| Webflow | Irreversible | Required | Wave 4 |
| Ghost | Full | n/a | Wave 4 |
| Yelp | Irreversible | Required | Wave 4 (spike first) |
| Apple Business Connect | Irreversible | Required | Wave 4 |

---

*Wave 3 brief locked 2026-05-23 — agency pivot.*
