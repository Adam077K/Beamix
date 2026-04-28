# Trust & Safety / Security Lead — Board Meeting 2026-04-27

**Author:** Trust & Safety / Security Lead
**Scope:** Pressure-test trust architecture against Adam's locked decisions (Workflow Builder in MVP, marketplace rewards on hold).
**Voice:** Paranoid by design. Every "must" enforced by a real mechanism.

---

## Q1: Monthly Update permalink — security/privacy posture

### My pick: PRIVATE BY DEFAULT — explicit share, unguessable, scoped, expirable. Hybrid redaction REJECTED at MVP.

The Round 1 board converged correctly. Customer Voice (Marcus, Dani, Yossi all voted private) confirms it. Product Lead resolved the PRD-vs-EDITORIAL contradiction in PRD's favor. I agree and harden.

The threat model is not "competitor scrapes the public web." It is the **Yossi-tier multi-tenant leak**: one Scale account manages 12 client domains; one client's Monthly Update contains "DevToolsCo gained 9 citations vs. you on 'API monitoring' — Beamix recommends pillar response on /docs/observability." That is competitive intel the client paid the agency for. URL leaks → indexed → competitor learns customer's strategy AND agency's playbook → agency loses client → Beamix loses agency. Multi-tenant blast radius.

### Permission / revocation / expiry policy

| Property | Default | Scale override |
|---|---|---|
| Initial state | Private (auth-required) | same |
| Share-link generation | Explicit click in /reports → "Generate share link" | per-client config |
| Link format | `beamix.tech/r/{nanoid21}` (122-bit entropy) | white-label subdomain Year 1 |
| Indexability | `X-Robots-Tag: noindex, nofollow` + `robots.txt` block | same |
| Default expiry | 30 days, renewable | unlimited (override available) |
| Password protection | not available | available (bcrypt-hashed) |
| Revocation | One-click → 410 Gone; CDN purge issued <60s | same |
| Subscriber controls client links | n/a | Yossi controls; client receives PDF |

### Hardened controls (new beyond Product Lead spec)

1. **Rate-limit unauthenticated views.** >100 views/24h triggers /inbox alert: *"Your shared report has been viewed 132 times. Was this expected?"* Awareness signal, not block.
2. **PII scrubbing at PDF render time.** No raw caller phone numbers, raw form-fill emails. Lead-attribution headline says "47 calls" not "Call from +972-50-...". Renderer enforces redaction allowlist.
3. **Yossi-tier permalink isolation.** Per-client URL namespace `/r/{client-nanoid}/{report-nanoid}`. Both nanoids must be valid. Routing-layer multi-tenant isolation, not just data-layer.
4. **Cancel cascades.** Cancel auto-revokes all share-links at end-of-grace-period. No orphan public URLs.

### Hybrid redaction — risk assessment

The Brand Lead's hybrid (private full PDF + public redacted summary card) is conceptually attractive. **I reject at MVP for three reasons.**

First, **redaction layers fail silently.** Classic mode: summary rendered server-side from full report data; future engineer adds field; redaction filter misses one path; new field appears in public summary three releases later. Provably-safe redaction requires affirmative allowlisting plus regression tests that fail builds on any non-allowlisted field. Buildable, but NOT MVP work.

Second, **the redacted summary creates a new attack surface**: OG-images cached by every social platform, embedded iframes that bypass `noindex`, Slack unfurlers fetching with elevated permissions. Every renderer is a potential leak.

Third, **customer voice was unanimous against any public default**, hybrid included. Solving a problem the customer doesn't have introduces engineering and audit cost. Park hybrid for Year 1; ship private-only at MVP.

---

## Q2: Truth File enforcement — making it real

### Validation rules (mandatory — every agent action runs all 5)

Every agent emitting customer-facing output routes through `ctx.validate(draft)` BEFORE `ctx.propose()`. Validator is a server-side service (separate process) that cannot be bypassed.

1. **Claim verification.** Factual claims (regex + LLM-classifier extraction) matched against Truth File. VERIFIED → allow. CONTRADICTED → BLOCK + escalate. UNVERIFIABLE → BLOCK + auto-revise to remove/weaken.
2. **Voice match.** Brand Voice Fingerprint (style vector built at onboarding from existing site) compared via cosine. Below threshold (0.85 content, 0.75 schema/FAQ) → BLOCK + auto-revise.
3. **Prohibited-term check.** Truth File `prohibited_claims` and `never_say` arrays scanned exact + semantic. ANY hit → hard BLOCK, no auto-revise.
4. **Vertical-specific rules.** SaaS: hallucinated-integration detector. E-commerce: price-claim rule. Plus regulated-vertical block — health/legal/financial language in non-regulated customer triggers manual escalation regardless of tier.
5. **Sensitive-topic classifier.** Refunds, hours, allergens, safety, pricing, regulatory claims, third-party named claims auto-escalate to manual approval regardless of autonomy setting.

### Failure handling

- **All 5 verified:** propose to /inbox per agent's autonomy tier.
- **Auto-revisable failure:** runtime calls `ctx.revise(draft, failures)` once. If revision passes, propose. If not, BLOCK.
- **Hard block:** /inbox shows flagged item: *"FAQ Agent attempted 'we offer 30-day money-back' but this conflicts with TF entry 'no_returns'. Beamix did not publish."* Customer reviews; can edit TF or reject. No auto-retry.
- **Validator unavailable:** ALL publishing suspended. After 15min degradation, /inbox shows "Beamix is in safe mode." Brownout posture — silent over unsafe.

### Bypass-prevention at the runtime layer

The Architect's "the SDK refuses to publish without conformance" is **partially aspirational**. To make it real:

1. **Capability-based runtime.** Agents have no direct write access to L4 site integration. Only `ctx.propose()`, which routes through validator. No `ctx.publish()` exists.
2. **Network egress block.** Agent sandboxes block direct egress except via `ctx.fetch` (allowlisted) and `ctx.llm` (proxied). First-party agents same sandbox, same block.
3. **Static analysis at deploy.** First-party and third-party code scanned on `beamix publish` for SDK-bypass calls, unauthorized scopes, `eval`, `Function`, dynamic `require`, raw `fetch`. Build fails if any present.
4. **Runtime telemetry tripwires.** Every `propose()` emits a span. Pipeline asserts: every published action has a corresponding `validate()` span within 60s preceding it. Missing → action quarantined, agent suspended for that customer, incident ticket opened.
5. **Per-action signed token.** `validate()` returns signed token with 60s TTL bound to draft hash. `propose()` requires signature + freshness + hash match. Cached token from prior validate fails on hash mismatch. **This is the cryptographic primitive that makes "the SDK refuses" actually true.**

### Workflow-publishing Truth File interaction

When Yossi publishes a workflow, the JSON is metadata about agents/order — NOT inline content templates. Each node is an agent reference; when an installer runs the workflow, **each agent runs against the INSTALLER'S Truth File, not Yossi's.**

1. **Static analysis at publish.** Workflow JSON scanned for embedded customer-specific data (URLs, business names, phone numbers, claims). Detected → publish blocked.
2. **Per-customer scope re-binding.** Workflow JSON cannot reference `truth_file_id` directly; only `$current_customer.truth_file`. Runtime auto-binds at install.
3. **Tier-permission enforcement at install.** Workflow requires Scale-only agents but installer is Build → install blocked. All-or-nothing.
4. **Per-step validation preserved.** Each agent inside a workflow runs validate→propose. Orchestrator does not bypass per-step validation.

### Audit log spec

Every TF read/write/validate-against emits immutable event:

```
{ ts, actor_type, actor_id, agent_version, customer_id, truth_file_id,
  operation, fields[], values_hash (sha256, NOT raw — privacy),
  request_id, validation_result, ip (user only), user_agent (user only) }
```

Append-only Postgres partitioned monthly, replicated to S3 hourly. Immutability enforced at DB level (no UPDATE/DELETE for app role; admin-via-MFA only). Retention: 7 years (covers GDPR + EU AI Act windows). Customer can DSAR-export their own log.

---

## Q3: Workflow-publishing review pipeline (post-rewards)

Adam dropped reward economics. T&S review does NOT relax. Threat model usefully shifts: from "developer gaming for $25K grant" to "incompetent or rushed Scale customer publishing a workflow that breaks." Less adversarial, more frequent.

### Who can publish

**Scale tier only**, plus:
1. Account age ≥ 30 days
2. Workflow run successfully on customer's own data ≥ 5 times (proves it works)
3. No open T&S incidents, no payment failures

### What's reviewed (the workflow threat model)

A workflow is composition of FIRST-PARTY agents. Agents are vetted. What still goes wrong:

- **Logical bombs:** scheduled 1000x/day; conditionals that loop infinitely on edge inputs
- **Resource conflicts** (Audit §1.5): two agents write the same page within 60s, race conditions
- **Tier-permission overflow:** Scale-only agents installed by Build customer
- **Truth File hostility:** chains output of A as input to B in a way that bypasses per-agent claim verification
- **Customer-specific data leakage:** Yossi's competitor names, client URLs, agency-internal voice prompts in workflow JSON
- **Notification spam:** high-frequency email/Slack/SMS
- **Cost bombs:** 50 LLM calls per execution daily, blowing up installer's credit balance

### 4-stage pipeline

**Stage 1 — Automated checks (sync, <60s).** DAG cycle detection. Tier-permission validation. Resource-conflict detection (no two write-scope agents on overlapping URL paths in one execution). Schedule sanity (max 1/hour at MVP). Static analysis: customer-specific data pattern matching. Cost estimator (refuse if p95-run >50 credits unless flagged).

**Stage 2 — Sandbox dynamic test (async, 5-15min).** Workflow runs against **3 reference customer profiles** (SaaS, e-commerce, agency) — sandboxed Truth Files, decoy domains. Real execution: agents run, validators run, propose-actions emit. Assertions: zero hard-blocks on reference TFs; valid envelopes; no cross-tenant data leak; p99 wall clock <90s; no budget blowout. Failure → reject with structured feedback.

**Stage 3 — Human T&S review (1-3 business days at MVP).** Beamix T&S engineer inspects: workflow description (no misleading claims), permission diff, edge-case behavior. At MVP volume (<10 publishes/month), one engineer covers it. Year 1 adds Stage 3a automated red-team agent.

**Stage 4 — Listing publication.** Approved → live with "Reviewed by Beamix" badge. Version locked; updates re-run pipeline.

### Sandbox-test infrastructure (new build)

3 fixed customer fixtures (SaaS B2B / e-commerce DTC / local services) with fixed TFs, mock domains, fixed scan history. Isolated tenants in production Supabase (different `customer_id`, RLS-enforced). Any sandbox→production data leak detected → workflow rejection AND incident.

### Takedown policy

Three levels (mirroring Marketplace spec §5.5 with adjustments):

1. **Soft suspension.** Listing hidden; existing installs continue. SLA: 4h from `report-a-problem` click.
2. **Customer-side suspension.** All installs paused; customers notified. Publisher has 7 days (not 30) to remediate. Reduced because Scale users are accountable subscribers.
3. **Hard takedown.** Listing removed; installs auto-uninstalled with rollback of TTL'd actions in trailing 30 days. Customer refunded per-run costs from trailing 30 days. Public takedown notice on transparency page. Repeat-offender flagged.

### Kill switch (load-bearing primitive)

Every published workflow has a "kill" capability in Beamix admin: one click suspends ALL installs across ALL customers. SLA: propagates within 60s (Inngest cancellation API + DB flag check at every step boundary).

---

## Q4: Day-180 incident scenarios

### Scenario A: Schema Doctor pushes wrong schema to 200 customers

**Setup.** v1.3.7 has bug: TF `services` containing slash ("X/Y") emits malformed `Service` JSON-LD. Validator's claim-verification doesn't catch syntax. schema.org rule (rule 4) was implemented for SaaS but not e-commerce/local-services. **200 customers receive malformed schema in one Inngest batch.**

**Detection** (three signals, instrumented):
1. Self-healing scan (12-24h later): Schema Validator step flags malformed JSON-LD → /inbox + ops Slack `#beamix-schema-alerts`
2. Google Search Console API integration: "Structured data error" delta >10 customers/24h triggers ops alert
3. Customer "Report a problem" button → same channel — first report likely Day-180+18h

**Escalation.** Severity 2 (>50 customers, no data loss, no compliance breach). On-call paged <5min. Within 30min: confirm scope via DB query. Within 1h: kill switch on v1.3.7. Within 2h: bulk rollback initiated.

**Comms.** Within 4h: targeted email signed Beamix CEO: *"On [date], a Schema Doctor update caused malformed structured data. We've reverted it. Here's exactly what happened, what we changed, what we're doing differently."* Public incident page on `beamix.tech/incidents/2026-MM-DD-schema-doctor`.

**Rollback.** Per F18 every action stores revert payload. Bulk rollback API takes action_ids, queues Inngest job per action, verifies via post-revert scan. Google reindex lag (2-8 weeks) acknowledged honestly: "rich snippets return as Google re-crawls."

**SLA.** Detection ≤24h. Containment ≤1h. Rollback initiated ≤2h. Comms ≤4h. Full rollback ≤24h. Post-mortem ≤7 days. **The Replit AI database deletion incident (2024) is the cautionary parallel** — Replit's lag in customer comms and absent rollback story turned a contained technical incident into viral trust collapse. Beamix's containment-then-comms protocol is designed to short-circuit that path.

### Scenario B: Yossi-published workflow runs 50x/day instead of 1x

**Setup.** "Daily Citation Audit" workflow correctly scheduled 1/day. Loop node iterates competitors[]. Yossi's reference fixture had 5 competitors. Installer (Marcus's friend) has 50 competitors imported. Loop fires 50x per scheduled run. Citation Fixer = 2 credits each. **100 credits/day burn instead of 10.** Customer hits credit ceiling day 3.

**Detection.**
1. Cost-anomaly tripwire: per-customer burn-rate > p99 of tier → `#beamix-cost-alerts`. Day 1.
2. Customer "out of credits" event day 3 → automatic Build/Scale ticket.
3. Workflow telemetry: avg_runs_per_install_per_day >10 auto-flagged.

**Escalation.** Severity 3 (~30 customers, one workflow). Determination: workflow logic correct given fixture; misconfig in customer's data not Yossi's code. **UX bug, not Yossi bug.** Resolution: pause workflow installs across ALL customers; require Yossi add max-iteration cap to Loop node; re-publish.

**Comms.** Within 4h: installer email: *"A workflow you installed was running more times than expected. We've paused it. Credits used in past 3 days have been refunded."* Yossi: *"Your published workflow needs a small fix. We'd like to work with you on a v1.1."*

**Rollback.** No content rollback (Citation Fixer outputs valid; just too many). Credit refund via admin RPC. Workflow paused via kill switch; re-enabled when v1.1 ships.

**SLA.** Detection ≤24h. Pause ≤1h. Comms ≤4h. Refunds ≤48h. v1.1 review ≤5 business days.

### Scenario C: Customer Truth File corrupted; 20 agents write incorrect content for a week

**Setup.** Postgres bug (or stolen-session deletion attack) wipes 70% of customer's TF on Day-180-Wed. Remaining 30% includes stale "hours" (24/7) being updated when corruption hit. Over 7 days agents write content that:
- references services no longer in TF (claim-verification: "unverifiable" → auto-revise removes claim → OK)
- BUT cites stale "hours" as verified ground truth → 11 published changes propagate "open 24/7" to site and citations
- Trust File Auditor (MVP agent #5) is designed to catch this — but ran day before corruption, won't run again for 6 days

**Detection.**
1. **TF integrity hash:** every TF write computes hash; nightly job compares to previous-day hash; >50% field-loss in 24h triggers Sev-1 alert.
2. Trust File Auditor next run (day 7) catches discrepancy.
3. Customer report if they notice.

**The integrity-hash tripwire is the missing piece** — without it, Scenario C has 6-7 day detection latency. **MUST be in pre-MVP locks.**

**Escalation.** Severity 1 (single-customer data integrity breach). SVP Eng paged. Within 1h: TF restored from Supabase PITR. Within 2h: every agent action since corruption identified; rollbackable actions queued; customer notified.

**Comms.** Within 2h: **phone call** — yes, phone — for Sev-1 single-customer data breach especially Build/Scale: *"Your Truth File was corrupted on [date]. We've restored it. Here's every change since then; we're rolling back the affected ones. We'll credit your account."*

**Rollback.** PITR restores TF. Per-action rollback for the 11 changes. Index lag: some external surfaces will take days to update; communicate honestly.

**SLA.** Detection ≤24h with hash tripwire (currently no such tripwire — MUST add). Containment ≤1h. Restoration ≤2h. Customer call ≤2h. Public post-mortem ≤14 days.

---

## Q5: Data privacy / GDPR / DSAR posture

### Data classification & storage

| Data class | Storage | Region | Retention |
|---|---|---|---|
| Account profile | Supabase PG | US-East | Lifetime + 30d post-cancel |
| Truth File | Supabase PG | US-East | Lifetime + 30d post-cancel |
| Brief | Supabase PG | US-East | Lifetime + 30d post-cancel |
| Scan results | PG + S3 cold | US-East | 90d hot, 2y cold |
| Provenance log | PG (1y) + S3 (7y) | US-East | 7 years |
| Twilio call records | Twilio (30d), Beamix metadata only | US | 30d recordings, 2y metadata |
| UTM clicks | Supabase PG | US-East | 2 years |
| Audit log | PG + S3 | US-East | 7 years (immutable bucket) |

All AES-256 at rest (Supabase default). **EU region**: at MVP, all data is US-stored. Beamix is NOT GDPR-Article-44 compliant for serving EU controllers without SCC/DPF transfer mechanism. **MVP wedge is Israeli/US — not EU primary market.** EU signups: TOS includes Standard Contractual Clauses + DPA naming Beamix as processor. **Year 1**: EU Supabase project for proper data residency.

### What's collected, retained, deleted

- **Signup:** email, name (optional), domain, Paddle billing (card with Paddle, not Beamix), business profile.
- **Use:** Truth File content (customer-authored), scan results (Beamix-generated), agent outputs, click/call metadata, support tickets.
- **Retention default:** 30 days post-cancel grace, then hard-delete except (a) audit log retained 7 years for compliance, (b) Paddle billing per their controllership, (c) anonymized aggregates indefinitely.
- **Deletion mechanism:** /settings → Privacy → "Delete my account" runs Inngest job: hard-delete from PG, mark S3 archives for purge (Object Lock retention exception path), Twilio number released, Paddle cancelled, audit log marker added. **Hard-delete completes within 30 days of request.**

### DSAR / GDPR compliance

**Article 15 (Access).** /settings → Privacy → "Export my data". Inngest assembles: profile JSON, TF JSON, all scans (CSV + bulk JSON), all agent actions (CSV with provenance), all /inbox items + decisions, audit log (last 12 months). Delivered as signed S3 URL valid 7 days. **SLA: 30 days max (GDPR Article 12 ceiling); target 7 days.**

**Article 17 (Erasure).** As above. Audit log retains hashed pointers (legitimate-interest carve-out for incident investigation) — disclosed in DPA.

**Article 20 (Portability).** Export format JSON (machine-readable). TF exports as JSON Schema-conformant — anti-lock-in by design.

**Article 33 (Breach notification).** Personal data breach → affected customers notified within 72h of confirmation. Template in incident runbook.

### Twilio call recordings

**Decision: Beamix does NOT store recordings at MVP.** Metadata only (caller number, duration, timestamp). Recordings stay in Twilio for 30d default then delete. Dramatically simplifies privacy: no recordings = no biometric data, no two-party-consent issues, no transcription PII. **Customer's privacy obligation to their callers** (CA, FL, IL two-party-consent states): customer responsible for whatever disclosure their existing phone system requires; Twilio-forwarded number behaves identically to existing number. Document in TOS.

If Year 1 adds call analysis (transcription for lead-quality scoring): opt-in per customer, beep-tone disclosure, regional consent rules, transcript-only retention, customer-side consent burden documentation. **Not at MVP.**

### Truth File + Brief — confidentiality

Treat as **customer-confidential**. Beamix-internal access limited to: customer's own session, on-call engineers via break-glass MFA-auth audit-logged access, agent runtime (sandboxed, signed envelopes only). DPA must include: "Beamix does not use customer content for training general LLM models. TF and content processed only for customer's own service."

### What B2B SaaS founders can claim to EU customers

After Year 1 EU region: *"We use Beamix as sub-processor. They are GDPR-compliant, store data in [US/EU], have signed our DPA, and process content only for our use."* At MVP: *"...store data in US under SCCs..."* — workable for many EU customers, not all. **Larger EU customers will push back.** Known revenue ceiling at MVP.

---

## Q6: Cancel + post-cancel + data export

### Cancel sequence

**T+0 (cancel click).** /settings → Billing → "Cancel". Single-click. No dark-pattern retention loops. Confirmation page: *"You're cancelling. Here's what will happen — read once, then click confirm."* Friction is informational, not retention.

**T+0 → T+30 (grace).** Subscription functional until next billing date. After billing date passes:
- Login still works; /home, /inbox, /scans read-only.
- Agents: PAUSED. /inbox shows: *"Your subscription ended on [date]. Beamix has paused. Your data is safe for [N] more days."*
- Workflows paused. Email: only data-export and grace-period reminders; Monday Digest stops; Monthly Update stops.

**T+30 (data export window opens).** Email: *"Your account ends in 30 days. Export your data now."* One-click /settings → Privacy → "Export".

**T+60 (hard delete).** Customer data hard-deleted per Q5. Twilio number released. UTM URLs return 410 Gone. Audit log retains hashed customer_id pointer; raw identifying data removed.

### Per-artifact behavior

| Artifact | T+0 | T+30 | T+60 | Restore on re-signup? |
|---|---|---|---|---|
| Twilio number | forwards still active | released to pool | gone | new number issued |
| UTM URLs (live on site) | resolve to customer's site | "campaign ended" page | 410 Gone | regenerated; old URLs hard-coded on customer site — must re-update |
| Monthly Update permalinks | resolve normally | resolve with "account closed" banner | 410 Gone | Lost. Cannot be restored. |
| Brief + Truth File | accessible | read-only | hard-deleted | NOT restored; customer re-creates |
| Scan history | accessible | read-only | hard-deleted | NOT restored |
| Agent action log | accessible | read-only | hashed-only | NOT restored |

### "I cancelled but Beamix is still publishing under my name" — defense

Existential nightmare scenario. Defense:

1. **Hard pause at next billing.** Subscription `status = canceled` AND `current_period_end < now()` → ALL agent jobs killed at runtime. Inngest functions check `customer_active(customer_id)` at every step boundary; false → exit.
2. **Twilio forwarding stops at T+30** (configurable to T+0). Callers get "this number is no longer active." Beamix not in loop after T+30.
3. **No new content publishes after T+0.** Race condition / retry queue → propose() endpoint checks customer_active and rejects.
4. **Existing live content stays.** Beamix doesn't have permanent CMS access — most actions applied via customer's CMS auth at the time. Customer requests rollback during grace via /scans → Completed Items → Rollback. After hard-delete: customer removes residual manually (we provide export of "everything Beamix added" as part of cancel).
5. **Audit log proof.** If customer ever claims "Beamix published after I cancelled," audit log proves it didn't (every action timestamped; every customer_active check logged). Surfaceable on demand.

### Re-signup after cancel

Within 60 days: system can offer to restore prior data ONLY if hard-delete hasn't run. Past 60 days: fresh start. We do NOT silently retain "just in case." Privacy violation.

### TOS / contract clauses

- Termination effects clause naming each artifact behavior above
- Liability cap (TBD with legal counsel — typical: refund of last 3 months; capped at total fees paid in last 12 months)
- E&O insurance disclosure (`/trust` page)
- Data export and deletion SLAs
- Sub-processor list (Supabase, Twilio, Paddle, Resend, Anthropic, OpenAI, Google, Perplexity) maintained at `/trust/subprocessors`

---

## Trust Architecture pre-MVP locks

**MUST be built and verified before any agent runs against a real customer's domain. No exceptions, no partial-credit.**

1. **Truth File schema (vertical-specific)** + customer-edit UI. SaaS and e-commerce schemas must be distinct (audit caught the spec contradiction; vertical-specific wins).
2. **Pre-publication validator service** (separate process from agent runtime) implementing the 5 mandatory rules + signed-token enforcement.
3. **Brand Voice Fingerprint** computed at onboarding from customer's existing site. Vector + cosine threshold. Validated on every content output.
4. **Provenance envelope** on every action: agent_id, version, inputs[], TF references, validation result, rollback_token, ttl. Persisted; visible in /inbox detail.
5. **Per-action revert payload** (PRD F18) generated at action creation. Tested rollback flow per agent class.
6. **Truth File integrity hash** + nightly comparison job. >50% field loss in 24h → Sev-1 alert. (Closes Scenario C detection gap.)
7. **Network egress sandbox** for agent runtime. No direct internet. All LLM via `ctx.llm`, all HTTP via `ctx.fetch` allowlist.
8. **Customer-active runtime check** at every Inngest step boundary. Cancelled customer = no execution.
9. **Audit log** on TF access (read + write + validate-against). Append-only. 7-year retention.
10. **Incident runbook** (internal) with severity classification, escalation, comms templates. Sev-1 phone-call protocol defined. Kill switch admin tool tested in pre-launch dress rehearsal.
11. **Data export endpoint** (DSAR Article 15/20). Minimum viable JSON dump. Functional before launch.
12. **Cancel cascade** end-to-end test. Twilio release, UTM 410, permalink revoke, hard-delete at T+60.
13. **TOS + DPA + Privacy Policy** with SCCs for non-US customers. Signed before any signup.
14. **Tech E&O insurance bound** before launch. ~$1M/$1M minimum.
15. **Per-tenant isolation testing** including Yossi multi-domain. RLS policies fuzzed.

PRD F3, F4, F18 cover items 1, 2, 5, 10. Items 3, 6, 7, 8, 9, 11, 12, 14 are NEW additions to build scope.

---

## Risks the board has under-weighted

1. **Validator-as-bottleneck.** Every output passes through validator. At 25K customers, ~250K validator calls/week, each LLM-mediated. **Validator is on critical path of every customer-facing action AND is the most expensive component per call.** PRD Risk 4 only addressed scan engine cost. Mitigation: caching (identical-draft hash → 24h cached verdict), fast-path for low-risk schema changes (rule-based, no LLM), degraded mode that suspends publishing when validator p99 >30s rather than letting agents bypass.

2. **First-party-vs-third-party trust gap is misframed.** PRD treats third-party as the threat. **At MVP all agents are first-party** — but TF enforcement / validator runtime is the same code path for both. **If first-party agents are NOT routed through the same validator-as-third-party from day 1, the muscle memory degrades.** When third-party arrives Year 1, team discovers validator was over-fit to first-party assumptions. Mitigation: build first-party agents AGAINST the same SDK, validator, sandbox boundaries, from day 1. Marketplace spec §2.1 ("Stripe pattern — same SDK") is correct; ensure engineering follows.

3. **Hebrew/non-English review gap (BOARD2 Risk 6).** PRD specifies English UI; "agents output in Hebrew" (FAQ Agent, Brand Voice Guard handle Hebrew per §5). Audit and prior board flagged; current product round has not added a mechanism. English-primary founder approves Hebrew FAQ they cannot evaluate. Defense: Hebrew-output validation MUST include a back-translation surfaced in /inbox so English-primary user can evaluate. 1-week build using `ctx.llm`. Not optional.

4. **Aggregate brand voice drift is silent at MVP.** Fingerprint catches per-output drift via cosine. Does NOT catch slow aggregate drift (the "ChatGPT fingerprint" — each output within tolerance, 6-month aggregate is wrong). MVP-1.5 should add quarterly Voice Drift Report. Currently not on any roadmap line.

5. **Workflow Builder × Truth File × cross-customer composition is the highest-risk MVP feature.** Workflow Builder ships at MVP per Adam. Workflows compose agents. When Scale user publishes a workflow that an installer runs, the cross-tenant TF binding (Q2) is the load-bearing safety primitive. **NEW engineering; doesn't exist yet; built simultaneously with Workflow Builder UI; validator never tested under workflow chaining.** **Recommendation: workflow PUBLISHING should defer to MVP-1.5 even though Workflow Builder is in MVP.** Customers can build private workflows for themselves at MVP; publish-to-marketplace adds cross-tenant complexity and should ship after TF binding has been tested in production for 4-6 weeks.

---

## E&O insurance / legal posture recommendation

**Insurance:** Bind Tech E&O + Cyber Liability combined policy before launch. Minimum $1M/$1M for MVP-period. Scale: $3M/$3M at $1M ARR, $5M/$5M at $5M ARR. Underwriters quoting SaaS+AI: Coalition, At-Bay, Cowbell, Beazley. Premium estimate at MVP: $8K-$15K/year. Underwriter requires: DPA + privacy policy, incident response plan, MFA + SSO + access controls, backup + recovery posture, sub-processor agreements. **Underwriter diligence will validate the pre-MVP locks.** Useful forcing function.

**Contract terms:** TOS includes (a) limitation of liability cap = 12 months of fees paid, (b) refund-of-fees as primary remedy, (c) safe-harbor for non-Beamix-controlled content (customer's CMS, AI engines), (d) indemnification carve-out for customer-submitted content (TF facts customer asserts true), (e) regulated-vertical disclaimer ("Beamix is not your compliance officer; agents may not be used for medical/legal/financial regulated claims without explicit feature flag and human review").

**Disclosures:** Public `/trust` page listing sub-processors, data residency, certifications-in-progress (SOC 2 Type II target Year 1 Q4), incident transparency log, vulnerability-reporting contact. **Transparency page is itself a sales asset** — Marcus's procurement team will read it before paying.

---

*~3,300 words. Ready for board synthesis.*
