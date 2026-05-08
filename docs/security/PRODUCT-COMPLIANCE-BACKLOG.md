# Product Compliance Backlog

**Scope:** This file tracks compliance / procurement / security obligations for **Beamix-the-product** (the GEO platform with paying customers). It is NOT war-room scope.

**Source:** Surfaced by the WS3 (war-room tech stack) procurement-grade adversary critic on 2026-05-08. The critic found 12 high-impact gaps that procurement teams of enterprise customers would block deals on. Adam corrected the framing on 2026-05-08: these apply to the product, not the war room. They are deferred to a product-side workstream.

**Status:** OPEN. None of these items have been actioned. They become blocking before Beamix-the-product approaches its first $499/mo Scale-tier customer.

**Owner today:** Adam.
**Owner future (when delegated):** Likely CCO Routine + legal counsel persona + adversary-engineer (Aria) for review.

---

## Item index

Each item has a target gate: **[Pre-MVP]** must be addressed before MVP product launch · **[Pre-Scale]** must be addressed before first $499/mo Scale-tier customer signs · **[Post-MVP]** can wait until scale-up.

| # | Item | Gate | Critic finding | Notes |
|---|---|---|---|---|
| 1 | **ZDR (Zero Data Retention) confirmation with Anthropic** | Pre-MVP | Adversary F1 | Adam contacts Anthropic Sales: "does my Max subscription include ZDR?" If no, decide: budget Enterprise upgrade (likely $500-2,000+/mo at smallest tier) OR don't publish a "we don't share customer data with AI vendors for training" claim on the `/security` page OR architect customer data so it never reaches Routines (anonymize aggregates only). |
| 2 | **Sub-processor list** | Pre-MVP | Adversary F2 + BOM F6 | Public artifact at `/security/sub-processors` (or `docs/security/sub-processors.md` exposed via the marketing site). Each row: vendor name, what data flows there, region, DPA status (signed/unsigned/n-a), cross-border SCC status, customer-erasure mechanism. Vendors named in WS3 BOM: Anthropic, Vercel, Supabase, Cloudflare, Mem0 cloud, OpenAI (embeddings), Helicone, Inngest, Resend, Paddle, GitHub, OpenRouter (legacy product LLM gateway). |
| 3 | **Right-to-erasure cascade procedure** | Pre-Scale | Adversary F3 | Per-sub-processor deletion procedure. Customer DSAR triggers a cascade: Supabase audit_log + customer rows → Mem0 cloud (whatever the customer-data exposure is) → Anthropic Memory Tool fallback files → OpenAI embeddings (source-text retention claim verification) → Helicone request logs (customer prompts/responses) → Cloudflare R2 (artifacts) → Cloudflare KV (nonces; auto-expire). Document each path with evidence-of-deletion. |
| 4 | **Incident response procedure** (`docs/security/incident-response-procedure.md`) | Pre-MVP | Adversary F4 | Defines: what counts as a "personal data breach" under GDPR Article 4(12), who has authority to declare a breach (Adam at solo stage, deputy when one is named), the customer-notification SLA (likely 24-48h, Beamix's own SLA), the supervisory-authority notification SLA (72h GDPR Article 33), the indemnification trigger under the Scale DPA (DECISIONS.md 2026-04-28 row 20: $25K/incident cap). |
| 5 | **Deputy / break-glass operator** | Pre-Scale | Adversary F5 + BOM F14 | Adam names a trusted deputy (friend / advisor / contractor) with sealed break-glass credentials in a shared 1Password vault emergency-access. Deputy can rotate compromised secrets, declare a breach, and act on incident response when Adam is unreachable for 72+ hours. Test annually with a "deputy drill." |
| 6 | **Mem0 cloud DPA + EU Standard Contractual Clauses** | Pre-Scale | Adversary F6 + BOM F6 | Mem0 is US-resident. EU customers' data flowing through Routines that touch Mem0 = GDPR Article 44 cross-border transfer. Adam reviews Mem0's DPA, signs SCCs, OR accelerates WS1F Phase 2 OSS migration to remove Mem0 cloud entirely (data stays on Beamix's own EU-region Supabase). |
| 7 | **Anthropic outage SLA carve-out clause** | Post-MVP | Adversary F7 | Update Scale-tier DPA to exclude upstream vendor outages from the $25K/incident indemnification commitment. OR commit to a customer-facing "best-effort" uptime claim with degradation discount (e.g., 50% credit for >24h outage). Anthropic Max has no uptime SLA; customer-side SLA must reconcile this. |
| 8 | **Cloudflare Durable Objects EU-region pinning** | Pre-Scale | Adversary F8 | Configure DOs to home in EU region for EU customers, OR exclude EU customers from Scale tier explicitly until configured. Default DO region is US. The `(routine_id, ticket_id)` lock state may carry customer context = personal data. |
| 9 | **Cyber liability / E&O insurance** | Pre-Scale | Adversary F9 | Bind a quote (~$50-150/mo at SaaS-startup scale) backing the $25K/incident DPA commitment. Hiscox, NEXT Insurance, Embroker, At-Bay are quote sources. Without insurance, the indemnification commitment is unenforceable. |
| 10 | **Backup encryption + KMS key ownership** | Pre-Scale | Adversary F10 | Document Supabase PITR backups: encrypted at rest (Supabase default), key ownership (Supabase-managed today; customer-managed key is a Pro+ feature for legal hold). Storage region for backups (Supabase EU project = EU region). Document in `docs/security/data-handling.md`. |
| 11 | **GDPR Article 30 ROPA** (Records of Processing Activities) | Pre-Scale | Adversary F11 | Standard template: data category, purpose, legal basis, sub-processors, retention period, safeguards, data subject categories. Use a published template (e.g., GDPR.eu's or ICO's). One-time write at MVP launch; update when sub-processor list changes. |
| 12 | **Pen-test cadence + right-to-audit clauses** | Post-MVP | Adversary F12 | Annual pen-test budget line (~$5K-15K for a focused web-app pen-test). Right-to-audit clauses on Cloudflare/Supabase/Anthropic DPA addendums for Enterprise-only vendors. SOC 2 Type II is multi-month, multi-thousand-dollar; defer until at least 5 paying enterprise customers OR first deal blocker. |

---

## Decision triage

The 12 items split as follows:

**Pre-MVP launch (4 items — MUST ship before first paying customer of the product):**
1. ZDR confirmation (item 1)
2. Sub-processor list (item 2)
3. Incident response procedure (item 4)
4. Deputy / break-glass (item 5) — OR explicit "single-PoF accepted; gate Scale tier" choice

**Pre-Scale tier sales (5 items — block first $499/mo deal):**
- Right-to-erasure cascade (item 3)
- Mem0 EU SCC (item 6)
- Cloudflare DO regional pinning (item 8)
- Cyber liability insurance (item 9)
- ROPA (item 11)

**Post-MVP / scale-up (3 items):**
- Anthropic SLA carve-out (item 7)
- Backup encryption documentation (item 10)
- Pen-test cadence (item 12)

---

## How items move from this backlog to LOCKED

When the product compliance workstream picks up:
1. Pick a triage tier (Pre-MVP / Pre-Scale / Post-MVP).
2. For each item: assign owner, document evidence (signed DPA, deployed configuration, runbook, etc.), and move to a closed-items section at the bottom of this file.
3. Update DECISIONS.md with a "PRODUCT-COMPLIANCE-N LOCKED" entry per closed item.
4. Update the marketing site `/security` page with the customer-facing version (sub-processor list publishes here once verified).

---

## See also

- `docs/08-agents_work/TECH-STACK.md` §procurement (the war-room scope note that points here)
- `docs/08-agents_work/2026-05-08-agent-build/CRITIQUE-WS3-adversary.md` (full critic findings)
- `docs/08-agents_work/WS3-CRITIQUE-AND-REVISIONS.md` §R8 (the revision cluster that surfaced these gaps)
- DECISIONS.md 2026-04-28 row 20 (Scale-tier DPA $25K/incident indemnification — the trigger for items 4, 5, 7, 9)
- DECISIONS.md 2026-05-08 (war-room is internal infra, not customer product — the framing course correction)
