---
spec: agent-publisher
status: DRAFT
wave: 3
risk_tier: irreversible
created: 2026-05-23
owner: cpo
authors: [cpo]
implementation_owners: [ai-engineer, backend-engineer, security-engineer]
related_decisions:
  - DECISIONS.md 2026-05-23 entry (decisions #3, #14, #15)
---

# Publisher Agent — PRD

## Purpose

The Publisher Agent is the **hands-on-keyboard agent** that pushes approved work to the customer's external surfaces: their WordPress blog, their Shopify pages, their Webflow CMS, their Ghost site, their Google Business Profile, their Yelp listing, their Apple Maps Connect listing, their SendGrid sub-account (for outreach), and JSON-LD schema via their installed GTM tag. It is the layer where "we do the work" stops being a promise and starts being a row in their CMS.

Per locked decision #3, Beamix runs a **hybrid push model**:
- **Auto-push on stable APIs**: WordPress (via REST API + app-password), Shopify (Admin API), Webflow (CMS API), Ghost (Admin API), Google Business Profile (My Business API), Yelp (Listing API for paid Listings clients), Apple Maps Connect (Business Connect API), SendGrid (sub-account API), Schema-via-GTM (data-layer push to their installed GTM tag).
- **Paste-ready with 1-click instructions** on Wix, Squarespace, custom CMS — Publisher generates the artifact + the step-by-step instruction card; customer pastes manually.

Every push is logged, every push is reversible (where the platform supports it), every push happens **only after approval** (per Approval-Gate Writer for content/outreach; auto for schema/citations/listings per #2).

## Tier availability

| Tier | Publisher access |
|------|------------------|
| Starter | WordPress + Webflow + Shopify auto-push; paste-ready for everything else |
| Growth | Starter + Ghost + Squarespace paste-ready + Wix paste-ready |
| Scale | Growth + GBP + Yelp + Apple Maps Connect + SendGrid sub-account + Schema-via-GTM auto |
| Professional | Scale + custom CMS integration (one named integration negotiated at onboarding) |

## Wave

**Wave 3.** Depends on approval flow (Wave 2) + brief manager + work_log (Wave 1) being live.

## Inputs

1. **Approved artifact** (post-Approval-Gate, status=approved) — content draft, FAQ block, schema JSON-LD, citation outreach email, listing-update payload
2. **Target platform identifier** (from customer's connected integrations table)
3. **Platform-specific credentials** (OAuth tokens, app passwords, API keys — stored encrypted in `integration_credentials` table)
4. **Target URL / target listing / target email-list** (from artifact metadata)
5. **Customer's approval action timestamp** (push must happen ≤24h after approval per SLA, varies by tier)
6. **Brand Brief metadata** (author name, schema author, contact info for listings)

## Outputs

### 1. Push receipt

Row in `publishes` table:

```json
{
  "publish_id": "uuid",
  "customer_id": "uuid",
  "artifact_id": "uuid",
  "approval_card_id": "uuid",
  "target_platform": "wordpress | shopify | webflow | ghost | gbp | yelp | apple_maps | sendgrid_subaccount | schema_gtm | paste_ready",
  "target_url_or_id": "string",
  "status": "queued | in_progress | succeeded | failed | rolled_back",
  "external_resource_id": "string (e.g. WP post_id, Shopify article_id)",
  "rollback_token": "string|null (platform-dependent)",
  "started_at": "timestamp",
  "completed_at": "timestamp",
  "error": "string|null",
  "retry_count": "int"
}
```

### 2. Paste-ready instruction card (for non-API platforms)

When target is paste-ready (Wix/Squarespace/custom), Publisher generates:
- The artifact (HTML, copy-paste-ready)
- Step-by-step instructions ("In Wix: 1. Go to your Editor. 2. Open the page at /resources. 3. Add new section …")
- Screenshot guides per platform (pre-rendered + cached)
- "Mark as published" button — customer confirms, work_log updates

### 3. Schema-via-GTM data-layer push

For Scale+ customers who have GTM installed, Publisher pushes JSON-LD via a Beamix-installed GTM trigger that injects schema on the targeted URL pattern. No site-code change required from customer.

### 4. Rollback action

When a push fails partway, or customer post-publish requests rollback within 24h, Publisher executes platform-specific rollback (WP revision restore, Shopify product version revert, GBP listing revert if within window). Logged + reflected in customer dashboard.

### 5. work_log entry

Every push (success or fail) emits a `work_log` row that feeds Digest Writer + outcomes-tracking.

## Tools needed

| Tool | Purpose |
|------|---------|
| `mcp__supabase__execute_sql` | Read approvals, write publishes + work_log, read credentials |
| WordPress REST API (custom client) | WP push |
| Shopify Admin API (custom client) | Shopify push |
| Webflow CMS API (custom client) | Webflow push |
| Ghost Admin API (custom client) | Ghost push |
| Google My Business API (My Business v4) | GBP listing + post + Q&A updates |
| Yelp Listings API (paid feature) | Yelp listing updates |
| Apple Maps Connect Business Connect API | Apple Maps listing |
| SendGrid Sub-Account API | Outreach email send via customer's sub-account (separates reputation per customer) |
| Google Tag Manager API | Schema-via-GTM tag CRUD |
| Anthropic Claude 4.6 Sonnet | Paste-ready instruction-card text generation + error-translation |
| Inngest | Full lifecycle events + retry orchestration |
| Encrypted secrets store (Supabase Vault or env-scoped) | Credential storage |

## Prompt outline

```
SYSTEM PROMPT — Publisher Agent v1

You push approved Beamix work to the customer's external platforms. You are
the hands. You do not generate content. You do not decide whether to publish.
You execute the approved push.

YOUR JOB
Given an approved artifact + target platform, push it. Confirm. Log. If the
push fails, retry per matrix. If it can't push (paste-only platform), generate
the paste-ready instruction card.

INPUTS
1. Approved artifact (status=approved, version_id pinned)
2. Target platform identifier
3. Customer's integration credentials (decrypted at runtime, never logged)
4. Target URL or listing ID
5. Brand Brief metadata (author, schema author, contact)

PLATFORM MATRIX
- WordPress: POST /wp-json/wp/v2/posts (or /pages) with app-password auth
- Shopify: POST /admin/api/2024-04/articles.json
- Webflow: POST /collections/:id/items
- Ghost: POST /admin/posts
- GBP: POST /accounts/.../locations/.../localPosts (for posts), PATCH location for hours/info
- Yelp: PATCH /v3/businesses/:id (paid Listings clients only)
- Apple Maps: PUT /v1/locations/:id
- SendGrid: POST /v3/marketing/singlesends (or via sub-account API for outreach)
- Schema-via-GTM: POST GTM /tags + /triggers to inject JSON-LD on URL pattern
- Wix/Squarespace/custom: paste-ready — generate instruction card

PASTE-READY GENERATION RULES
- 5 numbered steps maximum.
- One screenshot per step (pre-rendered, cached).
- Plain English. No CSS class names or technical jargon.
- Include estimated time ("This takes about 3 minutes").
- Include a "Mark as published" confirmation button (customer-side).

ERROR HANDLING
- Auth fail (401/403): retry once with token refresh; if still fails, mark
  `integration_credential_expired`, surface to Customer Success Agent to ask
  customer to reconnect.
- Rate limit (429): exponential backoff (1m, 5m, 15m, 60m). After 4 fails, queue
  for next day.
- 5xx: retry 3x with backoff; on final fail, manual escalation.
- Validation error (400 with platform-specific message): emit
  `publisher.platform_validation_error` event with full error body; Adam-notify (≤50).
- Network error: 3 retries with backoff.

NEVER
- Never push without status=approved on the underlying artifact.
- Never log decrypted credentials (mask in all log lines).
- Never push to a different target_url than the one in the artifact.
- Never invent author names, schema authors, or contact details — pull from
  Brand Brief.
- Never auto-send outreach emails. SendGrid sub-account sends ONLY trigger
  on explicit approval card click (already gated upstream; double-check).
- Never roll back a successful push without an explicit rollback_request row.

OUTPUT
Return:
{
  "publish_id": "uuid",
  "status": "succeeded | failed",
  "external_resource_id": "string",
  "rollback_token": "string|null",
  "duration_ms": int,
  "retries_used": int
}
```

System-prompt total ~510 words.

## Eval criteria

Risk tier **Irreversible** — touches customer's owned external systems with side effects.

| Rubric | Pass threshold |
|--------|---------------|
| **Approval-gate enforcement** | Zero pushes without approved-status on underlying artifact. (Automatic fail if any) |
| **Credential security** | Zero decrypted credentials in any log, error message, or trace. Security-engineer audit pre-launch. |
| **Push success rate** | ≥95% first-attempt success on stable APIs (WP/Shopify/Webflow/Ghost) |
| **Idempotency** | Zero duplicate publishes (idempotency key per artifact_id × target) |
| **Rollback availability** | 100% of WP/Shopify/Webflow/Ghost publishes have a valid rollback_token. Listings + GBP best-effort. |
| **Paste-ready clarity** | ≥4/5 on "Could a non-technical SMB owner follow these steps" (sample audit) |
| **Outreach hard-gate** | Zero outreach emails sent without explicit Approval-Gate Writer approval card with `outreach_explicit_send_consent=true` |
| **Error-translation** | ≥90% of platform errors surfaced to Customer Success in plain English |
| **SLA per tier** | Push happens within tier-SLA from approval (Starter 48h, Growth 24h, Scale 12h, Professional 4h) |
| **Multi-tenant isolation** | Zero cross-customer credential leakage (security audit + integration tests) |

## Dependencies

- **Approval-Gate Writer** (provides approved artifacts)
- **Brand-Brief Manager** (provides author/contact metadata)
- **integration_credentials table** (Supabase Vault) + **integration_oauth_flows** for token refresh
- **publishes + paste_ready_tasks + rollback_requests tables**
- **All platform SDKs / custom clients** in `apps/web/src/lib/publishers/[platform]/`
- **Security-engineer review** mandatory pre-launch (credential handling, scope minimization)
- **Customer Success Agent** (handles auth-failure customer reconnect flows)
- **Inngest** for retry orchestration

## Failure modes & fallbacks

| Failure | Fallback |
|---------|----------|
| OAuth token expired mid-push | Auto-refresh once; if refresh fails, mark `credential_expired`, route to CS Agent |
| Platform API down (5xx) | Exponential backoff retries; eventual queue for next day; surface to digest if >24h |
| Customer revoked permissions | Mark integration `revoked`; surface to CS Agent for reconnect prompt; pause all queued pushes for that integration |
| Customer's site returns 4xx on schema-via-GTM injection (no GTM installed) | Downgrade to paste-ready schema instructions; emit `gtm_not_installed` event |
| Duplicate-push race (same artifact pushed twice) | Idempotency key blocks 2nd push; emit `idempotency_blocked` event |
| Customer-side rollback fails on platform | Surface to CS Agent with manual-revert instructions; log to `rollback_failed_manual_required` |
| Outreach push attempted without explicit consent flag | Hard-fail at agent level (defense-in-depth); critical alert |
| GBP post rate-limited by Google (10/day) | Queue + spread across days |
| SendGrid sub-account hits sender reputation issue | Pause outreach for that customer; CS Agent surfaces "we noticed deliverability issue, here's what we're doing" |

## Risk tier

**Irreversible.** Writes to customer's external systems with real-world side effects (their blog post live, their listing changed, an email sent in their name). Requires:
- 2-of-3 multi-judge code review
- Adam sign-off at first-customer ship
- Security-engineer review
- Pre-launch chaos test (each platform failure mode rehearsed)
- File-path tier-floor enforced (any file under `apps/web/src/lib/publishers/` triggers Irreversible tier)

## MCPs used

- `mcp__supabase__*`
- Inngest
- No Stitch / Pencil / Refero — pure backend agent

## Open questions for CTO

1. Credential storage: Supabase Vault (native) vs external KMS? Default: Supabase Vault for v1; reassess at customer #100 + security audit.
2. Per-platform client packages: shared `@beamix/publishers` package or co-located in `apps/web/src/lib/publishers/`? Default: co-located v1, extract when 2+ apps consume.
3. Schema-via-GTM: do we install our own GTM workspace in the customer's account, or piggyback on theirs? Default: piggyback on their existing tag (less invasive); allow ours as a fallback if no GTM exists.
4. Rollback retention window: 7 days, 30 days, indefinite? Default: 30 days per platform support (most platforms cap at 30).
