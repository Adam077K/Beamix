# Aria — CTO Buyer Simulator
Date: 2026-04-28
Author: Aria simulator (4th canonical persona alongside Marcus / Dani / Yossi)
Surface reviewed: `/security` v1 spec (`docs/08-agents_work/2026-04-28-DESIGN-security-page-v1.md`)
Context: Marcus (cofounder, CEO of Acme SaaS, $1.8M ARR) Slacked the link and wants Beamix onboarded as a Scale-tier vendor by month-end. Aria has 6 minutes between Linear standups.

---

## 1. The 6-second read

Cream paper, left rail with section numbers, dateline top-right (`SECURITY · v1.0 · LAST REVIEWED APR 27 2026`). I see eleven section headings, a six-stat ribbon, a closing seal. No badge wall. No "Trusted by Fortune 500." No SOC 2 logo at the top.

That's a tell — both ways. The cream-paper-with-dateline frame is the fingerprint of an adult company that knows the difference between marketing and disclosure (Stripe Press, Anthropic /trust, Linear /security live in this register). But the *absence of a SOC 2 badge in the hero* is the second tell, and it's the one that matters: either they don't have one yet, or they have one and they're being weirdly modest about it. Six seconds in, I already have my first procurement question. Good page. Good architecture. We'll see if the substance carries the frame.

## 2. The 60-second skim

I scan the H2s: Storage, Retention, GDPR/DSAR, Encryption, Audit logs, No-training, Twilio, Sub-processors, Pre-publication validation, Incident response, Contact. That's the right order. Storage and retention first — that's the procurement reviewer's first two questions. DSAR third — that's mine for any vendor touching customer-of-customer data. Encryption fourth — fine. Sub-processors at eight — slightly buried but findable from the rail. The crypto-primitive section at nine is the one I'm here for.

**SOC 2 status** — I scan the page and find one mention buried in §5 Audit logs as `SOC 2 Type II target Year 1 Q4`. That's a footnote, not an answer. There is no compliance section. There is no Trust Center. There is no auditor name. For a Scale-tier B2B SaaS vendor at $499/mo asking me to onboard them, "target Q4" is an honest answer but it's incomplete — I need to know who the auditor is, what gap-assessment they've passed, whether they're in observation period, whether they have ISO 27001 in flight as a parallel track. None of that is on the page. **First gap.**

**Sub-processors table** — present, complete-looking, ten vendors listed (Supabase, Anthropic, OpenAI, Google, Perplexity, Twilio, Paddle, Resend, Inngest, Vercel). Each row has data category, region, "View DPA →" link. Last-updated stamp. Subscribe-to-changes link. 30-day pre-notification window for new sub-processors disclosed in the heading note. **This is right.** The procurement reviewer at our German enterprise customer will screenshot this and close the tab. One thing missing: no sub-processor is marked as "controller" vs "processor" vs "joint controller" — Paddle is implied as controller but it's parenthetical, not structured. Fixable.

**Encryption claims** — `AES-256 at rest. TLS 1.3 in transit. No exceptions.` That's the lede. Body says "AES-256, key-managed by Supabase and AWS KMS." OK, but they don't name the AES mode (GCM? CBC? CTR?), they don't name the password hashing algorithm, they don't name the TLS cipher suites, they don't name the key-rotation cadence on application-level keys, and they punt KMS to "we rely on Supabase + AWS KMS." That's the right delegation but it's a wave of the hand. **I want primitives spelled out.**

**DSAR section** — four-row table for Articles 15, 17, 20, 33. "Wired to endpoints, not promises." The phrasing is good. The substance is OK — `/settings → Privacy → Export my data` runs an Inngest job, signed S3 URL valid 7 days. Article 17 says hard delete in 30 days, audit log retains hashed pointers, disclosed in DPA. Article 33 says <72h breach notification with a public incident page at `beamix.tech/incidents/[YYYY-MM-DD]-[slug]`. I keep this section. I screenshot it.

What I did NOT find that I expected:
- **No SOC 2 / ISO 27001 / Trust Center section.** There's nothing called "Compliance" or "Certifications."
- **No vulnerability disclosure policy.** No `security.txt`. No bug-bounty program (even a $500-minimum one would matter).
- **No pen-test cadence.** Annual? Continuous? Last test by whom? Silent.
- **No employee-access controls section.** Who at Beamix can see customer data? Under what conditions? With what logging? Silent.
- **No SDLC / supply-chain section.** Dependency scanning, SBOM, Dependabot, signed releases? Silent. For a company built on Anthropic + OpenAI APIs running customer data through LLMs, supply-chain is non-trivial.
- **No business continuity / RTO-RPO numbers.** §10 has incident timelines but nothing about disaster recovery — what's the RPO if Supabase US-East-1 goes hard down for a week?
- **No data-classification policy.** Are emails classified the same as Truth File contents? Silent.

That's seven gaps in 60 seconds. The page is *structurally right* and *substantively incomplete.* Common pattern for early-stage. Fixable. None of these gaps are deal-breakers if they show up by month-end as Trust Center additions; all of them are deal-breakers if they're hand-waved.

## 3. The 6-minute deep read

### §1 Storage and region
- Tells me: US-East-1 default, Supabase Postgres, EU residency at MVP-1.5, SCCs Module 2.
- Trust signal: SCCs Module 2 named correctly, DPA disclosed as processor, retention lengths spelled out (7y audit, 2y cold scan, 30d everything else).
- Missing: cross-region failover posture. If US-East-1 has a multi-AZ failure, what's the RTO/RPO? Supabase has Read Replicas + PITR — are they enabled? At what cadence? What's the longest possible data loss window? Silent.

### §2 Retention
- Tells me: cancel → 30d grace → 30d export window → 30d hard delete = 90d total. Audit log 7y immutable.
- Trust: the cascade is named precisely. Hashed pointers in audit log under legitimate-interest carve-out is the right framing.
- Missing: legal hold posture. If a customer-of-customer subpoenas, what overrides the deletion cascade? Silent. Also: can a customer accelerate the 90d window if a regulator requires faster erasure? Implicit no, but say so.

### §3 GDPR / DSAR
- Tells me: real endpoints in the product UI, signed S3 URL for export, 7d delivery target / 30d legal SLA.
- Trust: Article 12's 30-day legal ceiling cited correctly. JSON Schema-conformant export named explicitly as anti-lock-in. The phrase "wired to endpoints, not promises" is the right register — but it's the kind of phrase that has to be *true*, not just published.
- Missing: I cannot verify these are real endpoints without a staging environment. There's no "test in sandbox" link. There's no example payload of an Article 15 export. There's no auth model spelled out (does the export use the customer's session, or do they re-auth with TOTP?). DSARs from B2B customers are often *for* the customer's own end-user (right of the data subject) — does Beamix support an end-user-of-customer DSAR flow, or only the customer-account DSAR? Silent.

### §4 Encryption
- Tells me: AES-256 at rest, TLS 1.3 default, TLS 1.2 fallback, no own KMS.
- Trust: TLS 1.2 named as fallback-only is the right answer. KMS delegation to Supabase + AWS is the right answer at this stage.
- Missing: **mode of operation not specified.** AES-256-CBC, AES-256-GCM, and AES-256-CTR are all "AES-256" and they are not the same animal. Application-level encryption (envelope encryption for sensitive fields like API keys, OAuth tokens, Twilio credentials)? Silent. Password hashing for Supabase auth — Argon2id? bcrypt? Default Supabase (which is bcrypt last I checked)? Silent. **This is the section where the failure to name primitives becomes load-bearing.**

### §5 Audit logs
- Tells me: append-only Postgres, S3 Object Lock compliance mode 7y, INSERT-only DB role, MFA + dual-eng break-glass.
- Trust: **this is the strongest section on the page.** Object Lock compliance mode (not governance mode) is the right choice — even root can't override compliance mode. INSERT-only role enforced at the DB level, not in the app, is the right architecture. Dual-engineer break-glass with self-logging is the right ceremony. SHA-256 for `values_hash` is named. This is the section that tells me they've thought about this.
- Missing: who reviews the audit log? Frequency? On what trigger? Anomaly detection or human eyeballs? The break-glass workflow is named but not documented (is there a runbook link?). An audit log nobody reads is theatre; this is fixable with one sentence.

### §6 We do not train on your content
- Tells me: explicit DPA clause quoted, sub-processor LLM APIs are zero-retention/no-training, advance written notice required if posture changes.
- Trust: the clause is *quoted*, not paraphrased. That's the right move. "Right to terminate without penalty" if posture changes is the right contractual hook.
- Missing: name the specific Anthropic / OpenAI / Google / Perplexity contracts being used. Anthropic has Zero Data Retention (ZDR) — say so. OpenAI has the Enterprise API with no-training-by-default — say so. Google's Gemini API on the Cloud tier is ZDR — say so. Perplexity is the question mark here — Perplexity's enterprise terms are less clear; explicitly state the contractual posture. Right now the page says "operate under their respective enterprise APIs with zero-data-retention or no-training contracts in place — listed in Section 8." Section 8 lists "Prompts only, zero retention" in a table cell. That's fine but it's not the contract terms; **publish or link the actual ZDR contract terms.**

### §7 Twilio call recordings
- Tells me: metadata-only at MVP, 30d Twilio retention default, two-party-consent pushed to customer's existing posture.
- Trust: explicit "we don't sleepwalk into biometric data" framing is the right philosophical signal.
- Missing: the two-party-consent pass-through to the customer's existing posture is *legally defensible* but it's also a customer-side burden. The page should explicitly state which states' two-party-consent laws apply (CA, FL, IL, MA, MT, NV, NH, PA, WA — the all-party-consent states) and whether Beamix's TOS captures the customer's representation that they're handling consent. It says "documented in Terms of Service" — link that ToS clause directly from this page.

### §8 Sub-processors
- See §5 of this report. Mostly right. One key gap: **no controller/processor/joint-controller column.** Paddle is implied as a controller (they own the merchant relationship for billing card data) but it's not flagged structurally.

### §9 Pre-publication validation
- Tells me: server-side validator, 5 rules, HMAC-SHA-256 signed token with 60s TTL bound to SHA-256(draft_payload), publish endpoint requires sig + fresh TTL + hash match. No `publish()` API that bypasses.
- Trust: see §4 of this report. Mostly the right answer. Some gaps.
- Missing: see §4 below.

### §10 Incident response
- Tells me: Sev-1/2/3 classification, ≤24h detection, ≤1h containment, ≤2h restoration, Sev-1 customer phone call within 2h, 14d post-mortem.
- Trust: **the phone-call commitment is the load-bearing trust signal of this section.** Naming Replit's 2024 incident as the negative exemplar is the kind of move that comes from someone who's actually thought about this. The TF integrity tripwire (>50% field loss in 24h → Sev-1) is the kind of specific tripwire that tells me they've war-gamed corruption scenarios.
- Missing: incident page has zero entries at launch. The page says "empty at launch is honest, not damning" — fine, but make sure the empty state explicitly confirms the page exists and will be populated. No vendor SLA for resolution time (only detection/containment/restoration). No customer-side compensation policy on Sev-1.

### §11 Contact
- `security@beamix.tech`, mailto link, 4-business-hour SLA, PGP key on request, vulnerability disclosures get 60-min pager.
- Trust: PGP key existing matters. 60-min pager for vuln disclosures matters. The "we have a real security inbox, not a Zendesk queue" framing is right.
- Missing: **no published `security.txt`** at `/.well-known/security.txt` (RFC 9116). This is a 30-second fix and it's how vuln researchers find disclosure contacts. **No bug-bounty.** Even a $500-minimum HackerOne or self-hosted bounty would be a strong signal that they treat external research as a real input. Aria reads "PGP key on request" and thinks: real, but fragile. Aria reads "we run a $500-$5K bounty on HackerOne" and thinks: this is a security org.

## 4. The cryptographic primitive paragraph (§9 — the moment of truth)

The 100-word engineer-readable paragraph is the section Marcus simulator predicted I'd say *"OK these people actually know what they're doing"* on. Let me read it word-for-word:

> *"Every agent output passes through a server-side validator before it can publish. The validator runs five rules: claim verification against your Truth File, brand voice match (cosine ≥ 0.85), prohibited-term scan, vertical-specific rules, and a sensitive-topic classifier. On success the validator returns a signed token (HMAC-SHA-256, 60-second TTL, bound to the SHA-256 hash of the draft). The publishing endpoint requires (a) a valid signature, (b) a fresh TTL, and (c) a hash match. A cached token from a prior validate fails on hash mismatch. There is no `publish()` API that bypasses this. The signed token is the cryptographic primitive that makes 'the SDK cannot publish' mechanically true, not aspirational."*

**Verdict: 70% there.** The lines that work:
- `HMAC-SHA-256` (correct primitive — not just "HMAC")
- `60-second TTL` (specific, defensible)
- `bound to the SHA-256 hash of the draft` (the binding is named — this is the actual cryptographic claim)
- `cached token from a prior validate fails on hash mismatch` (the replay-prevention property is named explicitly)
- `there is no publish() API that bypasses this` (the architectural commitment, not just a runtime check)
- `cannot publish — mechanically true, not aspirational` (the right register)

The lines that fail / are missing:
- **HMAC key management.** A signed token is only as trustworthy as the signing key. Where is the HMAC key stored? AWS KMS? Supabase Vault? Application env var? Rotated how often? Dual-key window during rotation — yes, the spec block says "quarterly key rotation, dual-key window," which is right — but the *paragraph* doesn't say it. The spec block does. OK, partial credit.
- **Token format.** Is this a JWT? A custom HMAC-signed envelope? A PASETO? Naming the format matters because format choice has known weaknesses (JWT alg=none, JWT confused-deputy). If they're hand-rolling, say so and say why.
- **Replay window vs replay prevention.** A 60s TTL is a replay *window*. The hash-binding is the replay *prevention*. The paragraph conflates them slightly. Reword: "Hash-binding prevents replay; TTL bounds blast radius."
- **What happens when the validator fails open?** If the validator service is down, does the SDK refuse to publish (closed) or does it queue (open)? The paragraph implies closed but doesn't say. Closed is the only correct answer; say it.
- **Static analysis at deploy time.** The body mentions "static analysis at deploy fails the build on any SDK-bypass code." That's a real claim. Name the tool. Semgrep? Custom AST check? An eslint rule? "Static analysis" without a name is theatre.

**The version that would actually make me forward this to Marcus with "these people know what they're doing":**

> *Every agent output passes a server-side validator before it can publish. The validator runs five rules — claim verification, brand-voice cosine ≥ 0.85, prohibited-term scan, vertical rules, sensitive-topic classifier — and returns a signed envelope: HMAC-SHA-256 over a payload `{draft_sha256, agent_id, customer_id, expires_at}`. The signing key is stored in AWS KMS, rotated quarterly with a 14-day dual-key overlap. The publishing endpoint enforces three checks in order: (1) HMAC verifies under the current or prior key, (2) `expires_at` ≥ now (60s TTL bounds replay blast radius), (3) `sha256(draft_payload)` equals the hash inside the envelope (hash-binding prevents replay-with-mutation). Validator unavailable = publish fails closed; there is no degraded mode. The format is a custom envelope, not JWT — we do not accept `alg`-negotiation. Static analysis (Semgrep + custom AST rules) fails the build on any SDK code path that constructs a publish request without a fresh validator round-trip. Runtime telemetry asserts every published action has a corresponding validate-span within the prior 60 seconds; missing → action quarantined, on-call paged.*

That paragraph names the primitive (HMAC-SHA-256), names the storage (AWS KMS), names the rotation cadence (quarterly with 14-day overlap), names the format choice (custom envelope, not JWT) and *why* (no `alg`-negotiation), names the failure mode (closed), names the static analysis (Semgrep + custom AST rules), and orders the three checks correctly. *That's* the paragraph I forward.

The current paragraph is close enough that I don't block. But I do reply-all to Marcus saying "ask them to spell out the HMAC key storage and rotation, and the validator failure mode."

## 5. The sub-processors table

What's there: 10 vendors, data category, region, "View DPA →" link. Last-updated stamp. 30d pre-notification window. Subscribe-to-changes link. CSV download.

**What our procurement reviewer (Acme's COO running vendor onboarding) will demand that's missing:**

1. **Controller / processor / joint-controller column.** Required to map our DPA chain. Paddle is a controller for billing card data — that needs to be structured, not parenthetical. Anthropic / OpenAI / Google / Perplexity are processors. Vercel is a processor (hosting). Resend is a processor. Inngest is a processor. Twilio is a processor. Supabase is a processor. **Add the column.**

2. **Sub-processor-of-sub-processor disclosure.** Supabase runs on AWS. Vercel runs on AWS. Inngest runs on... AWS or GCP? Resend runs on AWS. The actual cloud underneath these is AWS-heavy, but the page never says so. Add a column: "Underlying cloud" → `aws-us-east-1` for most. The procurement reviewer will ask.

3. **Certification status per sub-processor.** Supabase has SOC 2 Type II — say so. Anthropic has SOC 2 Type II — say so. OpenAI has SOC 2 Type II + ISO 27001 — say so. Vercel has SOC 2 Type II — say so. Add a column: "Compliance" → `SOC 2 Type II, ISO 27001`. **This is the column that makes the table worth screenshotting.**

4. **DPA URL must be a real URL, not "View DPA →" placeholder.** Right now the spec says `View DPA →` — I'd want to click and get the actual public DPA page (or the customer-portal-gated one). If the DPA isn't published yet, say "DPA available on request" and don't fake the link.

5. **Last-audited-by-Beamix date per sub-processor.** When did Beamix last verify each sub-processor's compliance status? "We last reviewed Supabase's SOC 2 report on 2026-03-12" is the kind of column that turns a sub-processor list from a list-of-vendors into an active-vendor-management posture. Add.

Five columns to add. Doable in a deploy.

## 6. The DPA / indemnification clause

I can't grade what I can't read. The page references the DPA but doesn't link it. **Gap: no DPA published or linked from /security.** A Scale-tier vendor at $499/mo asking me to onboard MUST have a public DPA at `beamix.tech/legal/dpa`, accessible without sales contact. Stripe has it. Vercel has it. Linear has it. Anthropic has it. Beamix should have it.

Without seeing the DPA, the questions I'll ask procurement to push back on:

**Liability cap.** Standard B2B SaaS: 12 months of fees paid. At $499/mo × 12 = $6,000 cap. **For Acme at $1.8M ARR, that's not enough.** A breach affecting our customer base could cost us 6-figure remediation easily. We'd push for: (a) 2x annual fees for general liability, (b) **uncapped for breach of confidentiality, willful misconduct, IP infringement, and data-protection-law violations** (these are standard carve-outs to the cap), (c) at minimum, $5M cyber-liability insurance coverage on Beamix's side as a separate enforcement mechanism. The page does not state Beamix's cyber-liability coverage. **Add it.**

**IP indemnification.** Beamix is using Anthropic + OpenAI + Google + Perplexity output to publish *on our customers' websites and on our customers' behalf*. If Anthropic generates content that infringes a copyright and Beamix publishes it as our voice, the IP indemnification chain matters. Anthropic's enterprise terms include IP indemnification. Beamix needs to flow that downstream. **The DPA must contain an IP indemnification clause covering AI-generated content.** Silent on the page.

**Breach notification SLA.** The page says <72h. **GDPR Article 33 says 72h to the supervisory authority — but customer notification under most B2B DPAs is "without undue delay" or "promptly," which courts have read as 24-48h.** I'd push for 48h customer notification (separate from the 72h regulator notification). Sev-1 phone call within 2h is great but the contractual SLA must match.

**Sub-processor pre-notification window.** Page says 30d with right to object. **30d is the standard.** Right to object is the standard. Right to *terminate without penalty* if you object and Beamix proceeds anyway — that's what I want. Not stated.

**Threshold for Acme:** liability cap ≥ $50K with carve-outs, IP indemnification flowed-through, 48h customer breach notification, 30d pre-notification with terminate-without-penalty on unresolved objection. **Beamix's stated posture meets the breach-notification threshold but is silent on liability cap and IP indemnification.** Two of four. Not blocking, but pushable.

## 7. The DSAR endpoints

Are they implementable enough that I'd vouch for it?

- **Self-serve API endpoints?** Yes, per the page. `/settings → Privacy → Export my data` and `/settings → Privacy → Delete my account`. **But:** these are described as UI flows, not API endpoints. There's no documented `POST /api/v1/privacy/export` or `DELETE /api/v1/account`. For a B2B SaaS, *programmatic* DSAR endpoints matter — our customer-of-customer integration may need to invoke them via API. Ship API endpoints, document them, and the UI flows wrap the API. Not the other way around.

- **Documented with example payloads?** No. There's no example JSON of an Article 15 export bundle. That should be in the page's appendix or in a separate `/legal/dsar-schema` page. A signed S3 URL with no schema documentation is "trust me" — I want the schema.

- **Verifiable in staging?** Not from this page. **Add a sentence: "Customers on a paid plan can request a sandbox account to test DSAR endpoints end-to-end before production."** Or, better: ship a public dummy-account where the export endpoint returns a sample payload.

- **30-day Article 12 SLA enforcement?** The page says "30 days" but doesn't say *how it's enforced operationally.* Do they have an SLA dashboard? An on-call rotation? A queue with paging? Silent. I'd write: "DSAR queue depth and time-to-completion are monitored via PagerDuty; oldest unfulfilled DSAR triggers an alert at day 21, escalates at day 27." That sentence makes the SLA real.

**Net: implementable enough that I'd vouch IF (a) API endpoints exist alongside the UI flows, (b) export schema is documented, (c) a sandbox is offered. Two of those are zero engineering cost — they're documentation. The third is small. Pushable.**

## 8. The "cannot publish" frame

`Beamix cannot publish without Brief grounding` — not `refuses to publish.` Round 1 designers (Ive specifically) caught this and corrected it.

Does it actually feel like a structural commitment, or marketing?

**It feels like a structural commitment IF §9 carries it.** The phrase `cannot` is only as strong as the cryptographic primitive that makes it mechanically true. The page says: "There is no `publish()` API that bypasses this. The signed token is the cryptographic primitive that makes 'the SDK cannot publish' mechanically true, not aspirational." That sentence — that *exact* sentence — is what carries the word.

The risk: "cannot" becomes marketing if the primitive is hand-waved. Aria reading "AES-256 at rest" without the mode and "HMAC-SHA-256" without the key storage will read "cannot" as marketing. **The word `cannot` is carried by the precision of §9, not by §9's existence.**

Current state: §9 is 70% precise. The word `cannot` is 70% earned. Push the spec to 95%, and `cannot` becomes the load-bearing trust word on the page.

## 9. My verdict

**OK with caveats — get them to fix the following list.**

I do not block Marcus's vendor onboarding. The page is structurally right, in the right register, written by someone who has read RFCs and not just marketing copy. The audit-log section is genuinely strong. The DSAR table is screenshot-able and procurement-friendly. The no-training contractual quote is the right move. The phone-call-within-2h Sev-1 commitment is the kind of operational specificity that signals real ops thinking.

But I do not forward Marcus a one-line "Beamix is solid." I send a list. I want the list addressed before we sign Scale-tier annual. I am OK signing Scale-tier monthly while the list resolves — the page is good enough that I trust the trajectory, not the current state.

## 10. The 2-3 (actually 5) specific things that move me from "OK with caveats" to "Beamix is solid — sign annual"

1. **Spell out the cryptographic primitives in §9.** Name HMAC key storage (AWS KMS / Supabase Vault), rotation cadence (quarterly + 14d overlap), failure mode (closed), token format (custom envelope, not JWT, with reason), and static-analysis tool (Semgrep + custom AST). See my rewritten paragraph in §4 above.

2. **Add a Compliance section with SOC 2 / ISO 27001 status, auditor name, and observation-period start date.** Even pre-certification, name the auditor (e.g., "We are in observation period with [Drata + Prescient Assurance], targeting Type II report Q4 2026") and link a public Trust Center (Drata Trust Center, Vanta, or self-hosted). The current "target Year 1 Q4" footnote in §5 is the wrong place and the wrong depth.

3. **Add a Vulnerability Disclosure Policy + bug-bounty program.** Publish `/.well-known/security.txt` (RFC 9116) with `Contact: security@beamix.tech` and `Encryption: <PGP key URL>`. Run a public bounty on HackerOne with a $500 minimum / $5K maximum at MVP — that's $20K/year ceiling, cheaper than one breach. Right now the page has a security email; that's a contact, not a program. The presence of a bounty signals "we treat external research as input, not threat" — that's the maturity inflection.

4. **Publish the DPA at `/legal/dpa` (no gating) with: liability cap, IP indemnification covering AI-generated content, 48h breach-notification SLA, 30d sub-processor pre-notification with terminate-without-penalty on unresolved objection, and Beamix's cyber-liability insurance coverage stated.** Without the DPA, the page is a marketing document for a legal posture I can't verify.

5. **Add the missing sub-processor table columns:** controller/processor/joint-controller, underlying cloud, SOC 2 / ISO 27001 status per sub-processor, last-audited-by-Beamix date, and a real DPA link per sub-processor (or "Available on request" if not yet public). Five columns. One deploy.

If those five are addressed, **I write Marcus a one-line "Beamix is solid — sign annual."** Until then, monthly with a fix-list attached to the contract as a side-letter commitment.

---

## Aria's actual Slack reply to Marcus (verbatim, ≤120 words)

> Read the /security page. Adult company. Cream paper, real dateline, audit log section is right (S3 Object Lock compliance mode, INSERT-only role, dual-eng break-glass — they've thought about it). The phone-call-within-2h Sev-1 commitment is the kind of thing Replit didn't do.
>
> But: no SOC 2 status, no DPA published, no bug-bounty, sub-processors table missing 5 columns, and §9 (their "cannot publish" claim) doesn't name HMAC key storage, rotation, or failure mode. The word "cannot" is only as strong as the primitive behind it.
>
> OK with monthly Scale while we get them to fix the list. Don't sign annual yet. I'll send the fix list and we revisit in 30 days. Five things. Most are documentation.
>
> — A.

---

*~2,950 words. Aria locked as 4th canonical persona alongside Marcus / Dani / Yossi. Reusable for procurement flows, audit trails, integration security, DPA review, and any future B2B-vendor-facing surface.*
