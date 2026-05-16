# WS3 Critique & Revisions

**Status:** PROPOSED revisions — awaiting Adam-review gate (per WS3 hand-off methodology Step 6)
**Synthesizer:** CEO/Opus 4.7 (this session)
**Reviewer cohort:** 4 parallel Sonnet critics, adversarial framing
**Total findings:** 57 unique (26 H / 21 M / 10 L)
**Revision clusters:** 11
**Adam decisions required:** 7 questions (Q1-Q7)
**Source files:**
- `docs/08-agents_work/2026-05-06-agent-build/CRITIQUE-WS3-bom.md` (BOM critic — 14 findings)
- `docs/08-agents_work/2026-05-08-agent-build/CRITIQUE-WS3-dr.md` (DR runbook critic — 18 findings + 3 coverage gaps)
- `docs/08-agents_work/2026-05-08-agent-build/CRITIQUE-WS3-cost.md` (cost-projection critic — 13 findings)
- `docs/08-agents_work/2026-05-08-agent-build/CRITIQUE-WS3-adversary.md` (procurement-grade adversary — 12 findings)

---

## Triage summary

| Cluster | Severity weight | Cluster description | Adam input? |
|---|---|---|---|
| **R1** | H | `audit_log.status` enum extension (3 missing values) | No — mechanical |
| **R2** | H | Cost arithmetic corrections (Inngest price contradiction, board-meeting cost, $5/mo headline omission, worst-case math) | Q8 (Inngest price verify) |
| **R3** | H | Mem0 Day-1 cliff (baseline already at Hobby ceiling) | Q1 (tier choice) |
| **R4** | H | Runbook procedure gaps (12 specific operational defects across 7 runbooks) | No — mechanical |
| **R5** | M | DR coverage gaps (3 missing runbooks: Inngest, Vercel, Telegram) | Q6 (add now or defer) |
| **R6** | H | Alert calibration ($5/h false-positive; $0.50/h blind spot; webhook-storm gap; DO burst; Vercel function hours) | Q7 (threshold strategy) |
| **R7** | H | Goodhart anti-guard insufficient (docs-only PRs + decision-ticket splitting) | No — mechanical |
| **R8** | H | Procurement compliance gaps (ZDR, sub-processors, erasure cascade, IR SLA, deputy, cross-border SCC, Anthropic SLA, insurance, encryption, ROPA, pen-test) | Q2, Q3, Q4 (priority + scope) |
| **R9** | H | Owner accountability — single-human-PoF | Q5 (deputy now or defer) |
| **R10** | M | DPA / sub-processor inventory enforcement (Resend DPA missing, Mem0 DPA TBD, full list does not exist) | Bundled with Q2 |
| **R11** | M-L | BOM minor corrections (CF CPU claim, Vercel per-member, OpenAI replacement claim, KV limits placeholder, GitHub Actions estimate, Supabase-Mem0 lock-in coupling, SHORTCUT_SECRET rotation scope, OpenRouter status, R2 reversibility) | No — mechanical |

**Anti-revisions** (critics surfaced but we will NOT change): see [§Anti-revisions](#anti-revisions) at bottom.

---

## R1 [H] — `audit_log.status` enum extension

**Source critics:** DR F2 + cross-cutting through F14, F15

**Finding (paraphrase):** The runbooks reference `audit_log.status = anthropic_error | linear_api_error | mem0_error` as primary detection signals. ORCHESTRATION.md §2G locks the enum at `fired | accepted | complete | blocked | timeout | over_budget | anomaly | rule_violation`. The runbook signals don't exist in the schema.

**Revision:**
- **Extend `audit_log.status` enum** (per ORCHESTRATION.md §2G) to include: `anthropic_error | linear_api_error | mem0_error | rate_limited | lock_lost | webhook_storm`. WS4 migration must include these.
- **Update all 7 runbooks' Detection sections** to cite the now-valid enum values.
- **Document the WS2 → WS3 schema patch** as a one-line note in WS2 ORCHESTRATION.md (errata footer) so the canonical doc is accurate without re-locking WS2.
- **Worker code (WS4)** must accept these new values; security-engineer Zod schema (`spec.ts`) does NOT need to change (this is the audit_log schema, not the trust spec).

**Status:** PROPOSED → mechanical fix on Adam approval.

---

## R2 [H] — Cost arithmetic corrections

**Source critics:** BOM F3, F7 · cost F2, F6, F12 (cluster-confirmed across 2 critics)

**Findings:**
1. **Inngest Pro price contradiction** — DECISIONS.md 2026-04-27 says "$150/mo." TECH-STACK.md §3F says "$75/mo." 2× discrepancy. The true Inngest Pro pricing as of mid-2026 is most likely $75/mo for 200K runs or $150/mo for higher tiers; I cannot resolve from open data. **Adam must verify via Inngest pricing page.**
2. **Inngest cliff customer count off by 5×** — DECISIONS.md says trigger at "5 paying customers OR 75% of free-tier ceiling." TECH-STACK.md §3F says "25 customers." The locked decision wins.
3. **Inngest baseline understated** — `step.run` calls multiply against free tier. Conservative re-estimate ~5,210 war-room steps without product Inngest. Combined product + war-room hits free-tier ceiling well before 25 customers.
4. **$5/mo "incremental new spend" headline omits $24/mo board-meeting budget** — board meetings consume Max-subscription tokens but the BOM's headline excludes the $24/mo (now revised to $46/mo per finding 5).
5. **Board-meeting cost cap omits Round 2** — true per-meeting cap is $5.83 (R0 + R1 $2.40 + R2 $2.40 + Synth $1.00), not $3. Monthly board-meeting budget = $46/mo, not $24/mo. ORCHESTRATION.md §2F itself has the math wrong post-WS2-critique.
6. **"Total cliff cost at 500 customers (worst case)"** — sum of true worst-case deltas = $805/mo not $580-720/mo.

**Revision:**
- **Fix Inngest cliff trigger** in TECH-STACK.md §3F: customer count 5 (not 25); trigger metric "Inngest dashboard rolling-30-day runs >40K OR 5 paying customers, whichever comes first." Cost delta: pending Q8.
- **Add a footnote** in §3F clarifying that Inngest counts each `step.run` as billable; war-room baseline is ~5,210 steps even before product Inngest; combined picture must include product agent execution.
- **Fix $5/mo headline** in TECH-STACK.md executive summary and §locks: state as "**$5/mo Cloudflare Workers Paid + $46/mo board-meeting Max-subscription token consumption** (absorbed by Max budget; reduces capacity available to standing Routines by $46/mo)". Reconcile with ORCHESTRATION.md §cost summary.
- **Fix worst-case math** in §3F summary: "$160/mo baseline + ~$650/mo worst-case upgrades = ~$810/mo at 500 customers worst case." Update the customer-mix margin claim.
- **Update ORCHESTRATION.md §2F** (errata): board-meeting per-meeting cap is $5.83, monthly budget is $46/mo. (This is a WS2 doc but the critique surfaced a math error; we patch it as part of WS3 lock.)

**Status:** PROPOSED → mechanical on Adam approval. Q8 needs Adam to verify Inngest current pricing.

---

## R3 [H] — Mem0 Day-1 cliff (the headline finding)

**Source critics:** BOM F1 · cost F1, F10 (cluster-confirmed across 2 critics, deepest-impact finding)

**Findings:**
1. The "10K writes/mo" Hobby tier limit cited in TECH-STACK.md is **fabricated** (Mem0's public pricing page does not publish a numeric Hobby write limit).
2. Even taking 10K as the assumption, war-room baseline (10 Routines × ~30 writes/day × 30 days) = **9,000 writes/mo before any customer exists** — already at ~90% of the assumed ceiling.
3. ORCHESTRATION.md cost table buries this in a parenthetical: "Hobby until 10K writes/mo (likely hit at 5+ paying customers; bumps to $19 Starter then)" — but the math says it bumps before customer 1, not customer 5.
4. Cost critic F10 raises that the Mem0 Starter cliff at 5 customers is unlisted in §3F's customer-count cliff table.
5. The §3F Mem0 cliff at "100 customers" is wrong by an order of magnitude; the real cliff is now.

**Revision (assuming Adam takes Q1 default):**
- **Reclassify Mem0 Hobby → Mem0 Starter ($19/mo) as a Day-1 spend**, not a 100-customer cliff. Update TECH-STACK.md §3A.2 BOM card to reflect Mem0 Starter as the active tier, with an annotation: "Hobby insufficient for war-room baseline; Starter is the MVP tier." Update §locks "war-room incremental new spend" to **$24/mo** ($5 Cloudflare Paid + $19 Mem0 Starter).
- **Re-anchor the Mem0 cliff in §3F** to: "Mem0 Starter → Pro tier (or Phase 2 OSS migration) at ~50 paying customers." Add a Day-1 entry: "Mem0 Hobby → Starter at MVP launch — $19/mo. Trigger: war-room baseline write count exceeded."
- **Update ORCHESTRATION.md §cost summary** (errata footer): Mem0 line item is **$19/mo Starter from MVP**, not "$0 until 10K writes/mo."
- **Add a Mem0 write-count metric** to the burn-down report (§3D.2) — raw number per Routine per month — so we can see when Starter → Pro cliff approaches.
- **Document the unverified-Hobby-limit honestly** in §unknowns: "Mem0 Hobby tier write limit is publicly unspecified. Decision is to skip Hobby on grounds that war-room baseline writes likely exceed any reasonable Hobby ceiling. Pre-MVP smoke-test confirms Starter holds throughput."

**Status:** PROPOSED. **Q1 — does Adam approve $19/mo Mem0 Starter as a Day-1 line item, or prefer to (a) reduce Routine write frequency, (b) accelerate WS1F Phase 2 OSS, (c) defer Mem0 entirely until WS1F lands?**

---

## R4 [H] — Runbook procedure gaps (12 specific operational defects)

**Source critic:** DR — F1, F3-F7, F8-F11, F13-F18 (cluster of mechanical defects; an incident commander gets stuck or makes things worse following the current runbooks)

**Findings (numbered F-IDs from DR critic):**
1. **F1 — `bridge:paused` KV key has no documented CLI / namespace ID.** Wrangler command + KV namespace ID must be in the runbook.
2. **F3 — `cloudflare-compromise.md` self-lockout race.** Recovery token must be created BEFORE force-logout. Reorder Immediate steps 3-4: (a) create recovery token, (b) revoke other tokens, (c) force-logout sessions.
3. **F4 — `github-compromise.md` force-reset main needs a PAT after all PATs revoked.** Add procedure: create minimal-scope PAT named `recovery-YYYY-MM-DD` BEFORE Mitigation step 2.
4. **F5 — `secret-rotation.md` `BRIDGE_HMAC_SECRET` atomic swap has no Routine-side update procedure.** Add procedure: (a) prepare new HMAC value; (b) script-update all 10 Routines via Anthropic API in parallel (loop in `infra/cloudflare-bridge/scripts/rotate-bridge-hmac.ts`); (c) deploy bridge with new secret simultaneously; (d) verify by sampling HMAC verification logs for first 5 minutes. Document expected transition-window failure rate (~30s of bridge HMAC failures while Routines update).
5. **F6 — `supabase-corruption.md` Path A circular dependency.** Add: "Document writes via Inngest dead-letter queue tail (Inngest stores recent failed events including their payloads). Cross-reference with R2 artifact uploads timestamps from Cloudflare R2 dashboard. These are independent of audit_log corruption."
6. **F7 — `mem0-outage.md` references KV side-buffer that doesn't exist.** Either (a) remove the side-buffer references and accept that memory writes during fallback go directly to Anthropic Memory Tool with no Mem0 catch-up replay, OR (b) add the KV side-buffer as a WS4 deliverable. **Recommendation: (a) — simpler, sufficient for P1.**
7. **F8 — `cloudflare-compromise.md` + `github-compromise.md` parallel run disables Actions needed by CF redeploy.** Add cross-reference: "If running both runbooks in parallel, defer `github-compromise.md` Immediate step 6 (Actions disable) until CF bridge is redeployed via Wrangler directly. Provide explicit `wrangler publish` fallback in `cloudflare-compromise.md` Mitigation."
8. **F9 — `anthropic-outage.md` replay-orphans depends on Morning Digest cron.** Add an explicit "Manual orphan replay" procedure: SQL query to find orphans + manual Linear ticket-creation script. Don't wait until 07:30 next day.
9. **F10 — `linear-api-break.md` "drain holding queue" is undefined.** Either define the holding queue (KV key prefix `holding:linear:*`, JSON schema, drain via Inngest job triggered by `bridge:linear_paused` flip-to-false) OR remove the references. **Recommendation: define + add to WS4 scope.**
10. **F11 — `secret-rotation.md` Supabase service-role key Inngest mid-flight job risk.** Add procedure: (a) pause new Inngest invocations via Inngest dashboard pause; (b) wait 5 minutes for in-flight to drain; (c) rotate key; (d) redeploy; (e) un-pause. Document explicit pause/resume controls.
11. **F13 — `cloudflare-compromise.md` SQL forensic query placeholders undefined.** Add a step before the query: "Determine `$compromise_start` from Cloudflare audit log (timestamp of first unrecognized API token use). `$compromise_end` is now (NOW())."
12. **F14 — `mem0-outage.md` flip-flag depends on bridge logic that doesn't exist.** Either add `memory_provider` field to ORCHESTRATION.md §2D spec schema + bridge logic to read `mem0:fallback_active` KV flag, OR remove the flag mechanism and document fallback as "Routines themselves detect Mem0 errors and fall back to Anthropic Memory Tool inline." **Recommendation: the inline fallback is simpler.** Update `mem0-outage.md` accordingly.
13. **F15 — `anthropic-outage.md` "escalate" with no target.** Replace "If persists, escalate" with "If persists 30 min: Telegram-ping Adam P0; manual Anthropic Status check; consider declaring full outage."
14. **F16 — `supabase-corruption.md` Vercel deploy ordering race.** Add: "Confirm MAINTENANCE_MODE deploy is live in Vercel dashboard BEFORE applying deploy lock. Verify via `curl https://beamixai.com/api/health` returns 503."
15. **F17 — `secret-rotation.md` 4-day stagger has no per-day smoke-test list.** Add a per-day verification table mapping which secrets rotated → which paths to smoke-test that day.
16. **F18 — Friday Retro lacks `supabase` MCP grant** so it cannot read `audit_log` to discover incidents the runbooks tagged. **Update ORCHESTRATION.md §2E Routine #6** (Friday Retro) MCP grants to add `supabase`. Errata footer.

**Revision:**
- Apply 16 mechanical fixes above to the 7 runbook files.
- Add explicit Wrangler CLI commands wherever a "set KV key" instruction appears.
- Add per-runbook "Pre-flight checklist" (token still valid, Anthropic Status reachable, Supabase up) so commanders can verify their tools before starting.
- Update ORCHESTRATION.md §2D to add `memory_provider` field IF Adam picks the bridge-flag mitigation (Q?), OR keep schema unchanged if inline-fallback path chosen.
- Add `supabase` MCP grant to Friday Retro Routine in ORCHESTRATION.md §2E (errata).

**Status:** PROPOSED → mechanical on Adam approval (no separate Q needed).

---

## R5 [M] — DR coverage gaps (3 missing runbooks)

**Source critic:** DR §Coverage gaps

**Findings:**
1. **No Inngest outage runbook.** The fan-in barrier and parent-ticket-expiry-watcher both run on Inngest. Auto-Unblock fires via Inngest. A full Inngest outage = no automatic recovery path.
2. **No Vercel outage runbook.** The `/war-room` page lives on Vercel; production observability gone if Vercel is down. Routines may still run.
3. **No Telegram bot failure runbook.** Every existing runbook's first action is "Telegram-ping Adam." If Telegram is down or the bot is blocked, all incident notifications fail simultaneously.

**Revision (Q6 default = ship now):**
- Write 3 additional runbooks at `docs/07-history/runbooks/`:
  - `inngest-outage.md` — P1. Detection: Inngest Status page + audit_log shows zero new `complete` rows from fan-in-watcher in 30 min. Mitigation: Routines continue running; fan-in synth manually triggered by Adam reading `audit_log` for `status: fired` rows without paired `complete`. Recovery: when Inngest returns, dead-letter queue replays.
  - `vercel-outage.md` — P1. Detection: Vercel Status + `/war-room` page returns 5xx + Helicone dashboard inaccessible. Mitigation: Routines continue running on Anthropic Routines (independent of Vercel); Adam observes via `claude_progress` Supabase queries directly via Supabase MCP. Recovery: redeploy when Vercel returns.
  - `telegram-failure.md` — P1. Detection: bot send returns 4xx/5xx OR Adam reports "no notifications." Mitigation: fall back to Linear comment alerts (every runbook also opens a Linear ticket); if Linear is also down → email via Resend. Recovery: rotate bot token if account-flagged; see `secret-rotation.md` row #4.

**Status:** PROPOSED. **Q6 — write all 3 runbooks now (Adam already approved this in plan), or defer 1-2?** Default per plan: write all 3.

---

## R6 [H] — Alert calibration

**Source critic:** cost F4, F8, F9, F11, F13

**Findings:**
1. **F4 — $5/h cost-watchdog false-positives** on every Friday Retro and every Full-tier fan-out (normal Opus burst easily $4-5/h transient).
2. **F8 — $0.50/h silent-loop blind spot.** A runaway at $0.50/h × 24h × 30d = $360/mo is below the $5/h watchdog threshold and below the $1/insert runaway-watcher trigger. Invisible until monthly burn-down.
3. **F9 — No webhook-storm (ingress) alert.** A Linear webhook-spam scenario burns the 15/day `/fire` cap quickly without any alert (each fire costs <$1 so cost-watchdog doesn't fire).
4. **F11 — Cloudflare Durable Object burst-latency cliff** unlisted (not a billing cliff, a latency cliff under simultaneous bursts).
5. **F13 — Vercel function execution hours unmonitored** (1,000 GB-hr/mo limit; cost-watchdog only sees Anthropic spend).

**Revision:**
- **Raise $5/h threshold to $8/h** for the cost-watchdog Telegram P2 alert (gives Friday Retro + 1 concurrent Routine headroom); this is a tuning, not a redesign.
- **Add a "running-Routine cost-rate" anomaly check**: Inngest function fires every 15 min; if a single live `claude_progress` session has `cost_usd / runtime_minutes` > 2× the Routine's $-cap projected rate, fire P3 Telegram. This catches the $0.50/h silent-loop scenario.
- **Add webhook-storm ingress alert**: Cloudflare Worker counter `webhook_in_per_hour`; if >100/hour (10× normal solo volume), Telegram P2.
- **Add DO burst-latency probe**: a synthetic `/health` endpoint that the bridge fires every 5 min, measuring DO acquire-release round-trip. Alert if p95 >100ms over 1h.
- **Add Vercel function execution hours line** to monthly burn-down report (§3D.2). Trigger Telegram P3 if usage >70% of plan.
- **Update §3D.3 alert threshold matrix** with these new rows; document each threshold's source-of-truth.

**Status:** PROPOSED. **Q7 — accept threshold strategy as proposed (raise to $8/h + 4 new alert types), or reduce scope?**

---

## R7 [H] — Goodhart anti-guard insufficient

**Source critic:** cost F5

**Finding:** The `$/feature_shipped` KPI's anti-Goodhart guard is "QA Lead PASS required for the ticket to count toward denominator." Two bypasses:
1. **Docs-only PRs trivially pass QA** (no code to review). A documentation PR adding a DECISIONS.md entry counts as a "feature shipped."
2. **`$/decision finalized` sub-KPI has no QA-Lead guard at all.** Agents can split one decision into N sub-decisions to inflate the denominator.

**Revision:**
- **Update §3D.1 KPI definition:**
  - Filter the denominator: a ticket counts toward `$/feature_shipped` only if its merged PR has **>20 LOC of code change in `apps/web/src/**` excluding `*.md` and `*.test.ts`**. Documentation-only PRs are tracked separately as `$/doc_published` (a different KPI).
  - For `$/decision finalized` sub-KPI: require Adam approval comment AND the `decision_type` Linear label to be one of `architectural | strategic | vendor` (excludes trivial decisions). Add an Adam-only review gate: weekly auto-summary of decisions tagged this week, Adam can mark "real" vs "noise."
- **Add a "decision splitting" detection**: if 3+ DECISIONS.md entries land in one week with `parent_audit_log_id` pointing to a single CEO Routine session, flag for Adam review (likely artificial split).

**Status:** PROPOSED → mechanical.

---

## R8 [H] — Procurement compliance gaps

**Source critic:** Adversary F1-F12 (every High finding is procurement-grade; this is the cluster Adam cannot defer past first paying customer)

**Findings (high-impact):**
1. **F1 — ZDR unconfirmed.** The §procurement section defers ZDR confirmation; the `/security` page (DECISIONS.md 2026-04-28 row 15) cannot publish the no-training-on-customer-content claim until verified. Anthropic Max is consumer-tier; ZDR is typically Enterprise. **Adam must verify with Anthropic Sales.**
2. **F2 — Sub-processor list does not exist.** 11 sub-processors named in BOM; standard procurement day-1 ask. **Q2 (priority).**
3. **F3 — Right-to-erasure cascade incomplete.** Mem0, Anthropic Memory Tool, OpenAI embeddings, Helicone, R2, KV all need erasure procedures. Each sub-processor has a separate path.
4. **F4 — No incident response SLA / 72h GDPR notification path.** None of the 7 runbooks address breach assessment / declaration / notification.
5. **F5 — Single-human-PoF.** Adam-only owner with no deputy named for break-glass during a 72h-window incident.
6. **F6 — Mem0 cloud cross-border transfer.** US-resident; SCC required for EU customers; not documented.
7. **F7 — Anthropic concentration risk.** No customer-facing SLA for product uptime during Anthropic outage. Scale-tier $25K/incident indemnification is uncapped exposure on upstream outages.
8. **F8 — Cloudflare DO regional pinning.** Default US; EU residency not configured.
9. **F9 — No cyber liability / E&O insurance.** $25K/incident indemnification (DPA) is unenforceable if uninsured.
10. **F10 — Backup encryption / KMS ownership undocumented.**
11. **F11 — No GDPR Article 30 ROPA.**
12. **F12 — No pen-test cadence; no right-to-audit clauses.**

**Revision (split into 3 categories — pre-MVP, pre-first-Scale-customer, post-MVP):**

### Pre-MVP (block MVP launch on these):
- **F1 ZDR** — Adam confirms with Anthropic Sales. If Max doesn't include ZDR: budget for Anthropic Enterprise upgrade (price TBD; document the dollar range as Q4 input). DO NOT publish `/security` page until verified.
- **F2 Sub-processor list** — Write `docs/security/sub-processors.md` now (DPA status per row, cross-border notes, deletion contact). 1-2 hours of work.
- **F4 IR SLA** — Write `docs/security/incident-response-procedure.md` defining: breach criteria, declaration authority (Adam today, deputy in Q5), 24h customer notification SLA, 72h supervisory authority procedure.
- **F5 Deputy** — **Q5.** Adam names a human or accepts the single-PoF risk explicitly in writing.

### Pre-first-Scale-customer (block first $499/mo deal):
- **F3 Erasure cascade** — `docs/security/erasure-procedure.md` with per-sub-processor procedure.
- **F6 Mem0 SCC** — Mem0 cloud DPA review + SCC documentation. (Or accelerate WS1F to remove Mem0 cloud entirely — folds into Q1.)
- **F8 Cloudflare DO regional** — configure EU-region DOs OR exclude EU customers from Scale tier explicitly.
- **F9 Cyber liability insurance** — quote and bind. ~$50-150/mo for the coverage scale matching $25K/incident commitment. **Q3.**
- **F11 ROPA** — `docs/security/ropa.md` per GDPR Article 30 template.

### Post-MVP, before scale-up:
- **F7 Anthropic SLA carve-out** — Update Scale-tier DPA to exclude upstream vendor outages from indemnification. Or commit to a customer-facing "best-effort" uptime claim with degradation discount (50% credit for >24h outage, etc.).
- **F10 Backup encryption** — Document Supabase PITR encryption + key ownership.
- **F12 Pen-test + right-to-audit** — annual pen-test budget line item; right-to-audit clauses on Cloudflare/Supabase/Anthropic DPA addendums.

**Revision actions:**
- Update TECH-STACK.md §procurement: replace "TBD" entries with concrete owner-action mappings + the pre-MVP/pre-Scale/post-MVP framework.
- Add a `docs/security/` directory with: `sub-processors.md`, `incident-response-procedure.md`, `erasure-procedure.md`, `ropa.md`. (These are 1-2 page docs each at MVP scale; flesh out at scale.)
- Update DECISIONS.md with a new entry: "WS3 Procurement Compliance Triage" mapping which gaps are pre-MVP / pre-Scale / post-MVP.

**Status:** PROPOSED. **Q2 — accept the 3-tier prioritization (pre-MVP / pre-Scale / post-MVP) or push more items pre-MVP / less items pre-MVP?** **Q3 — bind cyber liability insurance now (~$50-150/mo) or document accepted-exposure and gate Scale-tier sales until insured?** **Q4 — Adam to confirm with Anthropic Sales whether Max includes ZDR; if not, budget for Enterprise upgrade?**

---

## R9 [H] — Owner accountability — single-human-PoF

**Source critics:** BOM F14 + Adversary F5 (cluster-confirmed)

**Findings:** Adam is sole owner of every credential, every account, every decision authority, every secret rotation responsibility. For a P0 emergency rotation (e.g., leaked `BRIDGE_HMAC_SECRET`) outside business hours, there is no documented deputy or escalation path. For an enterprise customer evaluation, this is a contract-blocker.

**Revision (depends on Q5):**

**Option A — Adam names a deputy now:**
- Identify a trusted advisor (technical, ideally already a contractor or close friend with engineering background).
- Provision break-glass credentials: shared password manager vault (1Password / Bitwarden) with emergency access; deputy holds GitHub Org admin, Cloudflare account access, Anthropic Console emergency access, Supabase project owner.
- Document deputy in `docs/security/incident-response-procedure.md`.
- Test the break-glass path semi-annually (Adam initiates a "deputy drill" — deputy logs in, performs a benign rotation, logs out).

**Option B — Accept single-PoF, gate Scale tier:**
- Document the risk in writing in `docs/security/limitations.md`.
- Scale tier sales explicitly disclose the operator concentration.
- 90-day rotation reminder runbook explicitly says "Adam must be available; if not, defer rotation up to 7 days max."
- This option likely loses enterprise deals at the first procurement pass.

**Status:** PROPOSED. **Q5 — Option A (name deputy) or Option B (accept-and-document)?**

---

## R10 [M] — DPA / sub-processor inventory enforcement

**Source critics:** BOM F6 + Adversary F2 (cluster-confirmed)

**Findings:**
1. Resend DPA is not mentioned anywhere; Resend transacts customer PII.
2. Mem0 cloud DPA is "Adam to confirm before first paying customer" with no enforcement gate.
3. Sub-processor list at `docs/security/sub-processors.md` does not exist.

**Revision:**
- Folded into R8 actions (sub-processor list creation).
- Add an enforcement gate: Inngest function `dpa-status-check` runs weekly, scans `docs/security/sub-processors.md` for any row with `dpa_status: unconfirmed` or `dpa_status: pending`. Posts a Linear ticket to Strategy/Signals if any unconfirmed rows exist 7 days before MVP launch (or before first paying customer, whichever is sooner).
- Resend DPA review explicitly added to the pre-MVP checklist.

**Status:** PROPOSED → mechanical (bundled with R8).

---

## R11 [M-L] — BOM minor corrections

**Source critic:** BOM F2, F4, F5, F8, F9, F10, F11, F12, F13

**Revisions:**
- **F2 — Cloudflare CPU 50ms claim:** Replace "well above current need" with: "CPU time = 50ms on Workers Paid (Bundled) / 30s on Workers Unbound. **The Haiku tier classifier is a network round-trip (300-1500ms typical), which counts as wall-clock time NOT CPU time.** CPU time is consumed by the JavaScript executing in the Worker, not by waiting on Anthropic API. We use Workers Unbound binding for the bridge to give 30s wall-clock headroom." Verify this binding choice in WS4.
- **F4 — Vercel Pro per-MEMBER:** Update §3A.5 product stack table note: "Vercel Pro = $20/mo per team member. Solo today; +$20/mo per non-Adam team member added." Add a 'first hire' cliff at the top of §3F: "Adam hires first contractor → +$20/mo Vercel."
- **F5 — Anthropic Max replacement candidate misleading:** Reword §3A.1 Anthropic Claude Max replacement section: "Replacement candidates: (a) Anthropic API direct on `ANTHROPIC_API_KEY` (Console-billed; same vendor, different billing surface; 1 day to swap). (b) OpenAI Assistants API or other LLM platforms — **NOT a quality-equivalent replacement at this scale.** Migration would require redesigning every trust-mode spec, MCP grant, audit-log integration, and agent prompt for a different paradigm. Estimate: 3-5 weeks engineering plus quality regression. Treat as a **disaster-recovery option, not a planned-swap option**." Move the OpenAI mention to a "what we'd consider in extremis" footnote.
- **F8 — KV limits placeholder:** Replace "much higher limits" with the actual numbers: "Workers Paid KV: 1B reads/mo, 1M writes/mo (per Cloudflare pricing as of mid-2026). Verify quarterly."
- **F9 — GitHub Actions estimate:** Replace "~50 min/mo currently" with: "Pre-war-room: ~50 min/mo. Projected with `qa-lead-pass` on every PR + nightly QA cron: ~200-400 min/mo. Cliff: free 2,000 min/mo, comfortable through ~10 PRs/day."
- **F10 — Supabase replacement understatement:** Add to §3A.2 Supabase Pro replacement section: "**Coupling note:** Mem0 OSS Phase 2 is locked to run on this Supabase Postgres+pgvector (DECISIONS.md 2026-05-06). Replacing Supabase = replacing Mem0 OSS host = doubling migration scope. Estimate: 2-3 weeks engineering."
- **F11 — SHORTCUT_SECRET in rotation scope:** Add `SHORTCUT_SECRET` (and `BRIDGE_HMAC_SECRET`, `LINEAR_WEBHOOK_SECRET`, `TELEGRAM_BOT_TOKEN`) to `secret-rotation.md` 90-day cycle. The runbook actually does include them in the inventory table (rows #2-5); the BOM critic was correct that the BOM's §3A.1 narrative cites only "per-Routine bearer tokens" — fix the narrative to refer to the full inventory.
- **F12 — OpenRouter status:** Add a DECISIONS.md entry: "OpenRouter: deprecation status TBD. Current state — used for product scan engines + agent execution per DECISIONS.md 2026-03-06; reviewed for replacement when Beamix product migrates to direct Anthropic + Helicone path. Until that migration, OpenRouter remains active and a Helicone-equivalent monitoring approach (per-provider cost surface) must include OpenRouter."
- **F13 — R2 reversibility EASY → MEDIUM:** Update §lockin matrix: "Cloudflare R2 — MEDIUM (S3-compatible API but Cloudflare-specific lifecycle rules + bucket event notifications must be recreated)."

**Status:** PROPOSED → mechanical.

---

## Anti-revisions (critics surfaced but we will NOT change)

These are findings where the critic raised a valid concern, but the right answer is to acknowledge the limitation rather than redesign. Documenting here so future workstreams don't re-litigate.

| Finding | Critic | Why we don't change |
|---|---|---|
| Adversary F12 (no SOC 2 / pen-test) | Adversary | Pre-MVP solo founder. SOC 2 is multi-month, multi-thousand-dollar process. Defer until first 5 paying customers OR first enterprise deal blocker, whichever first. Document the gap in `limitations.md`. |
| DR coverage gap "Telegram bot blocked" | DR | We address with `telegram-failure.md` (R5) but the runbook's primary mitigation is "fallback to Linear comment" — we explicitly accept the degraded notification path. |
| Cost F8 ($0.50/h silent loop) — propose monthly burn-down review only | Cost | We DO add the per-15-min anomaly check (R6), but we ALSO accept that some patterns require post-hoc review. The new alert gives 15-min detection vs the 24h Anthropic Console hard-cap backstop. Acceptable tier. |
| BOM F12 (OpenRouter "legacy") | BOM | Don't aggressively retire OpenRouter — it's actively used in product scan engines per DECISIONS.md 2026-03-06. R11 above adds a clarifying DECISIONS.md entry but does not deprecate. |
| Adversary cross-cutting "all critical findings deferred" | Adversary | We accept the framing. The R8 3-tier prioritization is the answer: pre-MVP for the vendor-misrepresentation-risk items (F1 ZDR, F2 sub-processor, F4 IR SLA, F5 deputy), pre-first-Scale-customer for the deal-blockers (F3, F6, F8, F9, F11), post-MVP for the scale-up items. This is how a solo founder makes the tradeoff. |

---

## Adam decision questions (Q1-Q8)

| Q | Question | Default if unanswered |
|---|---|---|
| **Q1** | Mem0 Day-1 cliff — accept $19/mo Mem0 Starter as Day-1 line item, OR (a) reduce Routine memory write frequency, (b) accelerate WS1F Phase 2 OSS, (c) defer Mem0 entirely until WS1F? | (a) — adopt Starter at MVP, $19/mo |
| **Q2** | Procurement compliance triage — accept 3-tier (pre-MVP / pre-Scale / post-MVP) priority, or shift items between tiers? | Accept proposed tiers |
| **Q3** | Cyber liability insurance — bind quote now (~$50-150/mo) for $25K/incident DPA backing, OR document accepted-exposure and gate Scale tier until insured? | Bind quote (Scale tier needs it) |
| **Q4** | ZDR — Adam to confirm with Anthropic Sales. Budget Anthropic Enterprise upgrade (~$??? — TBD) if Max doesn't include ZDR? | Adam confirms; budget reserved pending answer |
| **Q5** | Deputy — name a human deputy with break-glass credentials NOW, OR document single-PoF risk and gate Scale tier? | Name deputy (Scale tier needs it) |
| **Q6** | DR coverage — write all 3 missing runbooks (Inngest, Vercel, Telegram) in this WS3 lock, or defer 1-2? | Write all 3 (already approved in plan) |
| **Q7** | Alert calibration — accept threshold strategy (raise watchdog $5/h → $8/h, add 4 new alert types: anomaly check, webhook-storm, DO burst, Vercel function hours) or reduce scope? | Accept proposal |
| **Q8** | Inngest Pro price — Adam verifies current pricing via inngest.com/pricing. Lock the actual price ($75 or $150) and update DECISIONS.md 2026-04-27 entry. | Adam verifies |

---

## What happens after Adam answers

1. Apply revisions R1, R2 (after Q8 answer), R3 (after Q1), R4, R5 (assuming Q6 default), R6 (assuming Q7 default), R7, R8 (after Q2/Q3/Q4 answers), R9 (after Q5), R10, R11 — unilaterally to TECH-STACK.md and the 7 runbooks. Add 3 new runbooks per R5. Add `docs/security/` files per R8.
2. Update DECISIONS.md with WS3 LOCKED entry citing this revisions doc.
3. Patch ORCHESTRATION.md errata footer (R1 enum, R2 board-meeting cost, R3 Mem0 Starter, R4 Friday Retro MCP grant, R6 alert thresholds).
4. Write session file at `docs/08-agents_work/sessions/2026-05-08-ceo-ws3-locked.md`.
5. Halt at phase gate (Adam-locked default): "WS3 LOCKED. Want me to start WS4? Reply yes or pause."

---

## Cost so far this session

| Item | Cost |
|---|---|
| Pre-flight + branch sync | $0.20 |
| TECH-STACK.md v0 + 7 DR runbooks | $5 |
| 4 parallel Sonnet critics | ~$15 |
| This synthesis (Opus, dense) | ~$2.50 |
| **Subtotal** | **~$22-23** |
| Plain-language version (technical-writer Sonnet, next step) | ~$3-4 (estimated) |
| Apply revisions + DECISIONS.md + session file | ~$2 |
| **WS3 phase total projection** | **~$28-30** (within $30 cap) |

---

*End of WS3 Critique & Revisions. Plain-language version to follow at `WS3-CRITIQUE-FOR-HUMANS.md` via technical-writer subagent.*
