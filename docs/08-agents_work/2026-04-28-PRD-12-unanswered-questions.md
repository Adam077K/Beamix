# Beamix — PRD Amendment: 12 Unanswered Customer Questions

**Date:** 2026-04-28
**Status:** CANONICAL — supplements PRD v3 (2026-04-28). Adds F32–F43.
**Author:** Product Lead
**Authority:** Responds to Audit 3 (Customer Journey Coherence Review, 2026-04-27) §5 — "Decisions the customer faces with no spec'd answer."
**Locked by:** Audit 3 blockers + Board Meeting Synthesis locked decisions (2026-04-27). Does NOT relitigate any of the 23 locked decisions.

> All new features numbered F32 onward. No feature here duplicates or contradicts F1–F31. Features in this document are additive.

---

## Q1: Can I undo Brief approval?

**Customer pain:** Sarah approves her Brief Tuesday morning. By Thursday she realizes the Brief mischaracterized her tier positioning — it framed her as a cost-leader when she sells premium. She now wants to walk back the approval, not just edit a chip. There is currently no spec'd path for undoing a Brief signature or requesting a re-author, either immediately after signing or 6 months later when the business has pivoted. For Marcus, whose renewal anchor is attribution-loop ROI, a badly-framed Brief left in place means agents optimize for the wrong queries for months.

**Decision:** SHIP-AT-MVP

**PRD addition:**

### Feature F32: Brief Re-author and Undo Window

**Feature ID:** F32
**Surface:** /settings → Brief tab; onboarding post-Seal confirmation; /crew → per-client Brief tab (Yossi)

**What it does:**
Immediately after Brief approval, a 10-minute undo window is available. During the window, a small top-of-page banner reads: *"Your Brief was signed just now. Change your mind? You have N minutes to reopen it."* After the window closes, re-authoring is available at any time via /settings → Brief tab (non-destructive — always creates a new version, never deletes prior versions). Brief versions are retained in full and surfaced in an audit view. Quarterly re-reading (F24) already in PRD triggers the re-authorization flow; F32 fills the ad-hoc case.

**Voice and microcopy:**
- Undo banner: *"Your Brief was signed just now. Reopen it if anything needs correcting — you have 9 minutes."*
- /settings re-author: *"Your Brief is the foundation everything is built on. Edit it carefully — changes take effect at the next weekly cycle."*
- Confirmation after re-sign: *"Brief updated and signed. Beamix will apply the new direction in the next cycle."*

**User story:** As Marcus, I want to reopen my Brief within minutes of approving it so that I don't let a misclassification bake into weeks of agent work.

**Acceptance criteria:**
- [ ] 10-minute undo window: after Seal lands in onboarding, a banner counts down. Clicking "Reopen Brief" returns to Step 3 with Brief in edit state; Seal must be re-stamped to proceed.
- [ ] After 10-minute window closes, re-author available at /settings → Brief tab → "Edit Brief" button. Editing restores the chip editor UX from onboarding Step 3.
- [ ] Every Brief re-sign creates a new Brief version (Brief_version table, append-only). Old versions are never deleted.
- [ ] Brief audit log accessible in /settings → Brief tab → "Version history" — shows timestamp, diff of changes, who signed (always the account owner), and which agent actions were authorized under each version.
- [ ] Agents authorized under a previous Brief version retain their version reference in provenance envelope (brief_version_id). The customer can see which version authorized which action.
- [ ] When Brief is actively being edited, agents are paused for that client — a /home banner reads: *"Brief editing in progress. Beamix is paused until you save."*
- [ ] Re-author flow includes "This is still wrong about my business" escape hatch back to Step 1's industry combobox — same mechanic as onboarding (already locked in F2 acceptance criteria; this confirms it also applies in the /settings re-author flow).
- [ ] Brief re-sign in /settings requires Seal animation (540ms stamp, same ceremony as onboarding). Not a simple "Save" button.
- [ ] Per F24 (quarterly Brief Re-Reading): if customer clicks "Edit Brief" at the quarterly prompt, they enter the same re-author flow specified here.

**Build effort:** S — touches Brief table, brief_versions table (new), onboarding post-Seal state, /settings Brief tab. No new backend services.

**Edge cases:**
1. Customer edits Brief mid-agent-run: agent is already mid-execution when the Brief changes. The in-flight run completes under the prior version (brief_version_id is snapshotted at run-start, per Tier 0 item 12). The next run picks up the new version.
2. Yossi edits Brief for client 3 while client 7's agents are running: each client has an independent brief_version_id. Cross-client isolation is complete.
3. Customer re-opens Step 1 industry combobox, switches vertical from SaaS to E-commerce: this changes their vertical Knowledge Graph, Truth File required fields, and Brief template. Trigger a Truth File completeness check after re-sign; if required new fields are missing, route customer to /settings → Business Facts to fill them before agents resume.

---

## Q2: How do I add a teammate to my Beamix account?

**Customer pain:** Marcus's growth hire Leila is now the day-to-day Beamix operator — she runs /inbox approvals every morning, monitors the Monday Digest, and reviews /workspace. Marcus is the buyer but Leila is the user. Currently there is no spec'd way to give Leila access, define her permissions (can she approve agent runs? can she cancel the subscription?), or remove her if she leaves the company. For Yossi, adding a part-timer to help with /inbox across 12 clients is a business-survival feature.

**Decision:** SHIP-AT-MVP

**PRD addition:**

### Feature F33: Team Seats and Role Permissions

**Feature ID:** F33
**Surface:** /settings → Team tab (new tab); /inbox approval actions; /settings → Billing

**What it does:**
Multi-seat access with two roles. Seat allotments: Discover = 1 seat (owner only), Build = 2 seats (owner + 1), Scale = 5 seats. Each invite is email-based. Roles: Owner (full access, billing, cancel, Brief re-sign) and Editor (can approve/reject /inbox items, view all data, cannot cancel, cannot re-sign Brief, cannot change billing). No Viewer role at MVP (deferred to MVP-1.5 — the edge case of read-only access is low frequency at wedge-launch scale).

**Voice and microcopy:**
- Invite button: *"Invite a teammate"*
- Role picker: *"Owner — full access, including billing"* / *"Editor — approve, review, and monitor. No billing access."*
- Invite email subject: *"[Name] invited you to manage [Business Name] on Beamix"*
- No AI labels in invite email — reads as human invitation.

**User story:** As Marcus, I want to add Leila as an Editor so that she can handle daily /inbox approvals without having access to billing or the ability to re-sign the Brief.

**Acceptance criteria:**
- [ ] /settings → Team tab shows current seats, available seats for tier, and invite form (email address + role selector).
- [ ] Invitation: Resend email with a 72-hour expiry link. Recipient creates Beamix account (or logs in) and is added to the account.
- [ ] Owner role: full access to all surfaces including Brief re-sign, billing, cancel, seat management, white-label config.
- [ ] Editor role: can view all data, approve/reject/request-changes in /inbox, view /workspace, trigger manual agent runs. Cannot: re-sign Brief, access Billing tab, cancel subscription, manage other seats, change white-label config.
- [ ] Seat limit enforced: Discover 1, Build 2, Scale 5. Attempting to invite beyond limit shows an upgrade prompt.
- [ ] Owner can remove a seat at any time. Removed Editor immediately loses access (next page load).
- [ ] Only one Owner per account. Owner transfer is available (under /settings → Team) — requires email confirmation from both current Owner and new Owner.
- [ ] Yossi context: per-client white-label config is in the client-switcher context. An Editor added to a Scale account can see all clients and approve /inbox items across all clients — same as the Owner. Per-client access restriction is MVP-1.5 (requires per-client role scoping).
- [ ] Audit log entry created on: invite sent, invite accepted, seat removed, Owner transferred.
- [ ] Paddle billing: seats are not separately billed at MVP. The tier price includes the seat allotment. Scale's 5 seats are included in the $499/mo.

**Build effort:** M — new `account_members` table, invite flow (Resend), role-based UI gates on Brief re-sign and Billing tab, seat-count enforcement.

**Edge cases:**
1. Editor approves an /inbox item that the Owner later reverses via rollback: both the Editor's approval and the Owner's rollback appear in the audit log with the actor's name.
2. Invited user already has a Beamix account on a different email: they accept the invite with their existing login. The invite is linked to the email address, not to a Beamix account ID — allow the recipient to choose which Beamix account to use when accepting.
3. Account reaches seat limit and tries to add another seat during a multi-client sprint: the upgrade prompt appears with one-click upgrade to next tier. If already on Scale: the prompt offers to contact sales for custom seat expansion (MVP-1.5 feature — at MVP, Scale is the ceiling).

---

## Q3: Where do I see my Twilio phone numbers if I lose track?

**Customer pain:** Dani provisioned three Twilio numbers — one for her main product, one she tested for a seasonal campaign, one she isn't sure she set up. They exist in the Lead Attribution Loop (F12), but she cannot find a single inventory page that shows all her numbers, their status (placed on site? receiving calls?), their assignment per client (for Yossi), and whether they're still active.

**Decision:** EXISTING-FEATURE-F13 — AMENDED

The existing /settings → Lead Attribution tab (F13 acceptance criteria) already surfaces Twilio numbers. This question becomes a spec gap: the tab is named inconsistently ("Lead Attribution" vs "Phone numbers") and the spec doesn't define what the tab shows when there are multiple numbers. Amendment below resolves this without creating a new feature.

**Amendment to F13 /settings:**

The /settings → Lead Attribution tab is the single source of truth. Rename the tab in the spec consistently: **"Lead Attribution"** (the Board Meeting Synthesis §5 amendment table lists "Phone numbers" as an alternate name — retire that alternate; "Lead Attribution" is canonical).

The Lead Attribution tab must display:
- [ ] All provisioned Twilio numbers for this account (or per-client context for Yossi), shown as a table: Number / Label / Placed on domain? (verified/unverified) / Last call / Status (active/inactive)
- [ ] UTM URLs generated, shown as a second table: URL / Campaign label / Clicks last 30 days / Status
- [ ] "Add another number" button (respects tier limits if any)
- [ ] "Release number" action (with confirmation — releases the Twilio number back to pool, cannot be undone)
- [ ] 72-hour verification status badge: "Detected on your domain" (green) / "Not yet detected — check placement" (amber) with a link to the developer snippet
- [ ] Search field when number count > 3

**Voice and microcopy:**
- Unverified badge: *"Not yet detected on your site. Paste the snippet your developer received, or resend instructions."*
- No separate page needed — this is tab-level disambiguation, not a new route.

**Build effort:** XS — tab column additions to existing /settings Lead Attribution UI.

**Edge cases:**
1. Yossi switches client context — the Lead Attribution tab refreshes to show only the selected client's numbers. A "View all clients" toggle shows cross-client number inventory (read-only aggregate, no bulk actions).
2. Customer accidentally released an active Twilio number that was live on their website: release confirmation modal includes *"This number is receiving calls. Releasing it will break call tracking on your site. Are you sure?"* (detected from last-call timestamp < 72h).
3. Customer at Discover tier (no Twilio): tab shows UTM section only. Twilio section is grayed with an upgrade CTA.

---

## Q4: Can I export my data?

**Customer pain:** Aria (Marcus's CTO co-founder) asks before month 3: "If we ever leave, what data do we take with us?" This is also GDPR Article 20 (data portability). For Yossi's agency clients, export is an SLA obligation — if a client leaves Yossi's agency, Yossi needs to hand over the client's full Beamix history. No export flow is currently spec'd beyond a partial mention in PRD F3 (Truth File exported on cancel) and /crew §6 (audit log CSV/JSON/PDF).

**Decision:** SHIP-AT-MVP

**PRD addition:**

### Feature F34: Customer Data Export (DSAR + Self-Service)

**Feature ID:** F34
**Surface:** /settings → Privacy & Data tab (new tab); /security page (already spec'd — links to this flow)

**What it does:**
Self-service export from /settings. Customer selects which data categories to include, requests the package, and receives a download link via email within 24 hours. For simple single-account exports the download is ready immediately (< 1s for accounts under 12 months). For agency-scale exports (Yossi, 12 clients) the export is queued and delivered within 4 hours. GDPR Article 20 right to portability is satisfied by this feature.

**Data categories available for export:**
- **Scans** — all scan results, per-engine data, historical scores (JSON + CSV)
- **Brief** — all Brief versions with timestamps (JSON + PDF)
- **Truth File** — full Truth File JSONB with version history (JSON)
- **Recommendations** — all generated recommendations with status (approved/rejected/pending) (CSV)
- **Agent actions** — full action ledger with provenance envelopes, Brief clause references, before/after diffs (JSON)
- **Lead Attribution** — call log, UTM click log (CSV)
- **Monthly Updates** — PDF archive of all Monthly Update PDFs generated
- **Account metadata** — account created date, tier history, billing summary (not payment card data)

**Voice and microcopy:**
- Tab label: *"Privacy & Data"*
- Export button: *"Export my data"*
- Confirmation: *"Your export is being prepared. You'll receive a download link at [email] within 24 hours."* (Or: *"Your export is ready. Download now."* for instant-ready cases.)
- GDPR note on page: *"Under GDPR Article 20, you have the right to receive your data in a portable format. This export satisfies that right."*
- No AI labels on any export content.

**User story:** As Marcus (and Aria), I want to export all of my Beamix data in standard formats so that I can verify what's stored and retain it if we ever switch tools.

**Acceptance criteria:**
- [ ] /settings → Privacy & Data tab present for all tiers.
- [ ] Customer can select one or more data categories and click "Export selected."
- [ ] Export package is a ZIP file containing the selected categories in their specified formats.
- [ ] Accounts under 12 months of data with < 500 agent actions: export is synchronous (ready on page, no email needed). Larger exports: Inngest job, email delivery within 4 hours.
- [ ] Monthly Update PDFs included as individual files (not re-rendered — use the stored PDFs from /reports).
- [ ] Export download link is a signed URL (expires 48 hours). Customer can re-request at any time.
- [ ] GDPR DSAR flow: customer can also submit a formal DSAR request from this page, which generates a support ticket with 30-day SLA. /security page documents the DSAR endpoint and SLA.
- [ ] Yossi on Scale: export is per-client (client-switcher context). "Export all clients" option generates one ZIP per client, delivered in a single archive. Scoped to that agency's data only.
- [ ] Agent actions export includes: action_id, agent_name, brief_clause_ref, brief_clause_text_at_time, before_state, after_state, validation_outcome, customer_decision (approved/rejected), timestamp.
- [ ] Truth File exported in JSON Schema-conformant format (already in F3 acceptance criteria — this feature wires the UI to that export function).
- [ ] Export does NOT include: payment card data (Paddle-held), other customers' data, internal Beamix operational logs.

**Build effort:** M — Inngest export job, ZIP assembly, signed URL delivery via Resend, per-category serializers (most data is already stored in structured tables).

**Edge cases:**
1. Customer requests export during an active agent run: export is queued; the agent run completes before export captures the final state. Brief export captures the version active at time of request.
2. Customer exports, then cancels, then re-activates: export history (the list of prior export requests) is retained in /settings even during the cancellation period (see F35 for cancellation data retention policy).
3. Yossi exports one client's data to hand off to that client directly: the export ZIP contains no cross-client data. Yossi receives the ZIP and forwards it. Beamix does not send it directly to the end-client (no relationship with end-client contact; that is Yossi's responsibility).

---

## Q5: What happens if I cancel?

**Customer pain:** Marcus decides to pause his subscription during a 2-month company pivot. He wants to know: can he still log in? For how long? Is his Brief and scan history gone? Are his live Twilio numbers (on his website) still routing calls? Are his UTM URLs broken? Does his Monthly Update permalink (which he shared with the board) still load? The current PRD F13 says "gracious cancel flow, one click, here's how to export" — but the post-cancel state is completely unspecced.

**Decision:** SHIP-AT-MVP

**PRD addition:**

### Feature F35: Graceful Cancellation and Data Retention

**Feature ID:** F35
**Surface:** /settings → Billing tab (cancel flow); post-cancel state of all product routes; Paddle webhook handler

**What it does:**
Cancellation is one click, no dark patterns (already in F13). What this feature adds is the full spec of the post-cancel state. Cancel takes effect at the end of the current billing period (Paddle subscription cancel behavior). During the wind-down period (from cancel click to period end), all agents continue running normally. After period end, the account enters **Read-only mode** for 90 days. After 90 days of inactivity, the account enters **Archive mode** indefinitely.

**Post-cancel state table:**

| Feature | Wind-down (to period end) | Read-only (90 days) | Archive (90+ days) |
|---|---|---|---|
| Login | Full access | Full access — read-only UI | Login permitted; data accessible via export request only |
| /home | Full | Data visible, no new agent runs | Redirect to reactivation page |
| /inbox | Full | Visible, no new approvals needed | Not accessible |
| Scheduled agent runs | Run normally | Cancelled immediately | N/A |
| Twilio numbers | Active | Retained + active (calls log to /settings, no new triggers) | Released after 90 days |
| UTM URLs | Active | Active (clicks log, no new agents react) | URLs return 404 |
| Monthly Update permalinks | Public/private per setting | Remain accessible per privacy setting | Removed from public CDN after 90 days |
| Brief, Truth File, scan history | Full | Readable | Export available via DSAR for 2 years |
| Per-client data (Yossi) | Full | Readable | Same as above |

**Voice and microcopy:**
- Cancel confirmation: *"Your subscription will end on [date]. Until then, everything continues as normal. After that, your data remains readable for 90 days."*
- Read-only mode banner: *"Your Beamix subscription ended on [date]. Your data is still here. Reactivate to resume agent work."*
- Reactivation CTA: *"Pick up where you left off — your Brief, history, and data are waiting."* (Not "start fresh" — continuity framing.)
- Twilio release notice at 90 days: *"Your Twilio numbers will be released in 7 days. Update your website before then to avoid broken call tracking."*

**User story:** As Marcus, I want to know that if I cancel and come back in 3 months, my Brief, my scan history, and my attribution numbers are all still there, so that reactivation feels like resuming, not starting over.

**Acceptance criteria:**
- [ ] Cancel flow: one click from /settings → Billing. No dark patterns. No "are you sure × 3" loops. One confirmation modal with cancel date and data retention summary.
- [ ] Paddle webhook: on `subscription.cancelled`, set `subscription_status = 'cancelled'`, set `cancel_effective_date` to period end.
- [ ] Scheduled agent runs: paused immediately when `cancel_effective_date` is reached (Inngest job checks subscription status before each run).
- [ ] Twilio numbers: retained in read-only mode. Released (Twilio API) 90 days after cancel effective date. Customer receives a 7-day advance email warning before release.
- [ ] UTM URLs: continue to log clicks in read-only mode. No new agent reactions to UTM click events.
- [ ] Monthly Update permalinks: honor per-report privacy setting during read-only mode. Removed from public CDN at 90-day archive transition.
- [ ] Brief, Truth File, scan history, agent action ledger: readable during 90-day read-only period. Not deleted. Accessible via data export (F34) for 2 years post-cancel.
- [ ] Reactivation: customer picks any tier, Paddle restores subscription. Account state is immediately restored to last active state — no re-onboarding required.
- [ ] If customer reactivates within 90-day read-only period: agents resume from current state. Brief is in force. No new onboarding.
- [ ] If customer reactivates after 90-day archive period: account state restored from archive. Customer sees a "Review your Brief before we resume" prompt (Brief Re-reading flow from F32) — the Brief may be stale after a long gap.
- [ ] Monthly Update permalink copies: PDFs that were emailed remain in recipients' inboxes — email delivery is not retractable. Only the hosted permalink is removed.

**Build effort:** S — Paddle webhook handler amendment, scheduled Twilio release job (Inngest), read-only mode UI gate, reactivation path.

**Edge cases:**
1. Customer cancels but their dev hasn't removed the Twilio number from the website yet when the 90-day release fires: Beamix sends a 7-day advance email and a 48-hour advance email. If the number is still receiving calls at release time, the release proceeds (Beamix cannot control what is on the customer's website). The /settings Lead Attribution tab shows "Number released" with the release date.
2. Yossi (agency Scale) cancels: all 12 client accounts enter the same read-only → archive lifecycle simultaneously. Per-client export (F34) is available during the 90-day read-only window.
3. Customer requests GDPR deletion before the 2-year retention period: DSAR deletion requests are honored — account enters immediate deletion. Monthly Update PDFs that were emailed remain in recipients' inboxes (outside Beamix's control, and are the customer's property). Beamix's stored copies are deleted.

---

## Q6: Can I share my Monthly Update without making it public?

**Customer pain:** Marcus wants to forward his Month 3 Monthly Update to his board chair and his co-founder Aria. The Monthly Update contains his AI visibility score, attribution numbers, and competitor intelligence — data he does not want indexed by Google or visible to competitors. PRD v3 (locked in Board Meeting decision 1) correctly sets Monthly Update permalinks to **PRIVATE by default**. However, EDITORIAL §3.3 had previously specified a "per-report privacy switch in /reports settings." The /reports route is never spec'd (see Q9 below). This question resolves the private share UX for the locked private-default decision.

**Decision:** EXISTING-FEATURE (Board Decision #1 already locks private-by-default). AMENDS /reports spec gap and adds the private-share-link mechanism.

**Amendment to F14 (Email infrastructure) + new /reports section:**

The Monthly Update email always includes the PDF as an attachment (F14 acceptance criteria already spec this). The PDF can be forwarded freely — it is a file in the recipient's email client, and Beamix has no control over it after delivery. This is the primary share mechanism and requires no privacy mechanism.

For the hosted permalink (the web-viewable version):
- [ ] Monthly Update permalink is private by default (Board Decision #1 — already locked).
- [ ] "Generate share link" button (matching the /scan model in F1) generates a time-limited signed URL (7-day expiry, renewable). Recipients do not need a Beamix account to view.
- [ ] The signed share link is NOT indexed (X-Robots-Tag: noindex on these routes).
- [ ] Customer can revoke a share link from /reports (invalidates the signed URL immediately).
- [ ] Share links for Monthly Updates are generated per-report, not per-account. Sharing one Monthly Update does not expose others.
- [ ] No "auth-required" share link at MVP (requires recipient auth infrastructure beyond MVP scope). The signed URL expiry (7 days) is the privacy mechanism. MVP-1.5 can add recipient-authenticated links if demand is validated.

**Voice and microcopy:**
- Share button: *"Generate a share link — expires in 7 days"*
- Copy confirmation: *"Link copied. Share it privately — it expires in 7 days and can be revoked here."*
- Revoke: *"Link revoked. The recipient can no longer view this report."*

**Build effort:** XS — signed URL generation (nanoid + expiry, same pattern as scan permalinks in F1), revoke action on /reports.

---

## Q7: How do I migrate my domain?

**Customer pain:** Sarah's SaaS company rebrands from "Acme" to "Acme Cloud" mid-contract. Her domain changes from `acme-saas.com` to `acme.dev`. Her Brief references her old domain. Her scan history is bound to the old domain. Her Twilio numbers and UTM URLs are live on the old domain. Her Truth File contains `acme-saas.com` as the `domain` field. All agent actions are authorized under a Brief that references the wrong domain. Currently there is no spec'd path for domain migration.

**Decision:** SHIP-AT-MVP

**PRD addition:**

### Feature F36: Domain Migration Flow

**Feature ID:** F36
**Surface:** /settings → Profile tab → Domain field; migration wizard (full-screen flow, modal-style)

**What it does:**
Customer initiates a domain change from /settings → Profile. A guided 4-step migration wizard runs:
1. **Confirm new domain** — customer enters new domain, Beamix runs a quick ownership check (DNS TXT record or meta-tag verification, same pattern as Twilio verification).
2. **Review what changes** — Beamix shows a plain-English diff: "Your Brief will be updated to reference acme.dev. Your 47 scan results will remain in history labeled as acme-saas.com. Your Twilio number is placed on acme-saas.com — you'll need to update it."
3. **Update Brief** — customer reviews Brief with new domain inline, re-signs (Seal ceremony). Brief gets a new version under F32 versioning.
4. **Update Lead Attribution** — customer is shown a fresh developer snippet for the new domain. "Send to your developer" button (same as onboarding Step 2) fires the new snippet email.

**Scan history merge policy:** Historical scans under the old domain are retained in /scans, labeled "Old domain (acme-saas.com)." New scans run against the new domain. The two series are displayed together in /scans with a domain-change marker at the inflection date.

**Sub-processor notification:** Beamix updates its sub-processor records. No customer-facing action needed for this.

**Agent retraining:** On next scheduled scan cycle after domain migration, all 6 MVP agents re-run their baseline analysis against the new domain. Citation Fixer and FAQ Agent use new domain URLs in all future outputs.

**Voice and microcopy:**
- Settings trigger: *"Changing your domain? This takes 3 minutes and keeps your full history."*
- Wizard step 2: *"Here's what migrates automatically and what needs your attention."*
- Post-migration confirmation: *"Domain updated to acme.dev. Your Brief has been re-signed and Beamix is preparing a fresh analysis of your new domain."*

**User story:** As Sarah (rebranding to Acme Cloud), I want to migrate my domain without losing my scan history or having to start onboarding over so that my attribution numbers and Brief remain continuous.

**Acceptance criteria:**
- [ ] Domain field in /settings → Profile is editable. Clicking "Change domain" opens the migration wizard.
- [ ] Domain ownership verification: DNS TXT record or HTML meta-tag method. Customer has 72 hours to complete verification. Wizard paused (not blocked) until verified.
- [ ] Step 2 plain-English diff shows: Brief domain references, number of historical scans (labeled old), Twilio placement status, UTM URL status.
- [ ] Brief re-sign required (Seal ceremony, same spec as F32 re-author). Migration cannot complete without re-signed Brief.
- [ ] Old domain scans retained in /scans history, labeled with old domain. Domain-change marker appears as a divider row at the inflection date.
- [ ] Agent Memory (`agent_memory` table) entries linked to old domain: retained for provenance. New agent runs write to new domain context.
- [ ] Twilio numbers are NOT automatically moved to the new domain — customer must update their website. Developer snippet email is re-sent with new domain context.
- [ ] Inngest job queued after migration completion: runs all 6 MVP agents on new domain baseline. Customer sees "Beamix is analyzing your new domain" on /home for up to 30 minutes.
- [ ] If customer abandons wizard mid-flow (closes modal): domain is NOT changed. Wizard state is saved for 24 hours so they can resume.
- [ ] One domain migration permitted per 90 days (prevents abuse). If limit hit: customer sees a message to contact support.

**Build effort:** M — migration wizard UI, DNS verification service (reuse Twilio verification pattern), Brief re-version trigger, scan history labeling, Inngest post-migration baseline job.

**Edge cases:**
1. Customer migrates domain but the new domain scan finds the score is dramatically worse than the old domain: the Brief re-sign ceremony is followed immediately by the post-migration baseline run. /home shows the new score with a "Domain migration: fresh start" explanatory note. Anti-anxiety copy applies (same as score-drop pattern in F5).
2. Yossi migrates one client's domain while 11 other clients are running normally: migration is fully per-client. Other clients are unaffected.
3. Customer has a Twilio number active on the old domain and never updates their website after migrating: the old number continues to log calls under the old domain label in Lead Attribution history. These calls are labeled "Old domain" in /settings → Lead Attribution, not silently dropped.

---

## Q8: What is the data privacy and storage policy in-product?

**Customer pain:** Aria (Marcus's CTO co-founder) asks before signing off on Build: "Where is the data physically stored? Is it encrypted in transit and at rest? Do you train on our data?" PRD F20 (/security public page) answers this for the public website. But the question also arises inside the product — inside /settings, the customer should be able to find a clear answer without leaving the app. Additionally, the /security page specifies the posture at a moment in time; the in-product setting surfaces the customer's specific data context (their region, their retention settings).

**Decision:** SHIP-AT-MVP (partial) + amends F20 and F13

**Amendment to F13 (/settings) and F20 (/security):**

The new /settings → Privacy & Data tab (F34 adds this tab) serves as the in-product privacy surface. No additional feature needed — this is a tab-level scope clarification. The Privacy & Data tab must include:

- [ ] Storage region statement: *"Your data is stored in [Supabase region — e.g., Europe West 1]. This is set at account creation and cannot be changed."* (Region is a Beamix infrastructure decision, not per-customer configurable at MVP.)
- [ ] Encryption statement: *"All data is encrypted in transit (TLS 1.2+) and at rest (AES-256)."*
- [ ] Training opt-out: *"Beamix does not use your content or your customers' data to train AI models. This is a contractual commitment in our DPA."* Link to /security page for full DPA.
- [ ] Data retention summary: Brief and Truth File retained indefinitely while account is active; scan results retained 24 months (rolling); agent action ledger retained 24 months; Monthly Update PDFs retained 24 months. After account cancellation: see F35 (90 days read-only, 2 years export-available for DSAR).
- [ ] Sub-processors list: link to /security page sub-processors section (already spec'd in F20).
- [ ] DSAR request link: *"Request a copy or deletion of your data"* — triggers the F34 DSAR flow.
- [ ] "Powered by Beamix" footer on white-label emails: toggleable per-client (already in F13 acceptance criteria).

**Voice and microcopy:**
- Section header on Privacy & Data tab: *"Your data, on your terms."*
- No technical jargon — "encrypted in transit" is acceptable; cipher suite strings are not.

**Build effort:** XS — static content additions to the F34 Privacy & Data tab. No new backend work beyond what F34 already specifies.

---

## Q9: The /reports route is referenced — what is it?

**Customer pain:** EDITORIAL §3.3 references a "per-report privacy switch in /reports settings." PRD F1 references "files itself into /reports." PRD F13 references "Monthly Update /reports index." The /reports route is named in at least 4 places across the specs but is never spec'd as a route. Yossi's entire monthly workflow ("12 drafts to review and send") depends on /reports. This is a load-bearing unspecced route.

**Decision:** SHIP-AT-MVP

**PRD addition:**

### Feature F37: /reports — Monthly Update Archive and Review

**Feature ID:** F37
**Surface:** /reports route; mobile nav (not in the bottom 4 items — accessible from sidebar or "more" overflow)

**What it does:**
/reports is the archive and staging area for all Monthly Update PDFs. It is not a general analytics dashboard — it is specifically the Monthly Update management surface. For Yossi, it is also the bulk-review-and-send surface for 12 client reports per month.

**Page structure:**

**Primary view:** Table of Monthly Updates, reverse-chronological.
- Columns: Client (Scale only — single row otherwise) / Month / Status (Draft / Reviewed / Sent) / Attribution headline (one-line preview) / Privacy (Private / Share link active) / Actions
- Row actions: Preview (opens PDF in a modal), Edit (opens the draft in a text editor — same chip-editing UX as Brief), Approve and send, Generate share link, Revoke share link

**Draft state:** Monthly Updates in "Draft" status are those generated by the Reporter agent (F7) but not yet reviewed. For Discover/Build single-client accounts: a /home Receipt-That-Prints card (F25) appears when the draft is ready. Customer clicks through to /reports to review.

**For Yossi (Scale multi-client):** A "This month" filter shows all 12 drafts for the current month in one view. Status column shows which are ready to send, which need review, which have been sent. Per-draft "Always send automatically" toggle (suppresses the manual review step for that client — customer explicitly opts in per-client).

**Privacy controls:** The privacy settings for each Monthly Update are managed per-row in this table (matching the "Generate share link" mechanic from Q6/F35 amendment). No separate /reports/settings sub-page — the table row is the control surface.

**User story:** As Yossi, I want a single /reports page that shows all 12 of my clients' Monthly Update drafts so that I can review, edit, and send each one without clicking through 12 separate client contexts.

**Acceptance criteria:**
- [ ] /reports route accessible from product sidebar. Not in mobile bottom nav (bottom 4 reserved for /home, /inbox, /scans, /crew per F5 acceptance criteria).
- [ ] Table shows all Monthly Updates for the account (or per-client context on Scale). Reverse-chronological.
- [ ] Status column: Draft / Reviewed / Sent. Draft = generated, not yet reviewed. Reviewed = customer opened and read. Sent = delivered to email(s) + permalink live.
- [ ] "Preview" opens Monthly Update PDF in a modal (not a new tab). PDF is the React-PDF render (same artifact as emailed version).
- [ ] "Edit" opens a structured editor: the Monthly Update is composed of sections (attributed results, top fixes, competitor moves, "What Beamix Did Not Do" line). Each section is editable as text. Re-signing not required (Monthly Update is editorial, not constitutional like the Brief).
- [ ] "Approve and send": triggers Resend delivery of the email + PDF attachment. Sets status = Sent.
- [ ] For Scale tier: "This month" filter groups all client drafts. J/K keyboard navigation through drafts (same pattern as /inbox).
- [ ] Per-client "Always send automatically" toggle in /reports: opts that client into automatic send without manual review. Default: OFF (manual review required). Customer explicitly opts in per-client.
- [ ] Generate/revoke share link per Monthly Update row (per Q6/F35 amendment spec).
- [ ] Receipt-That-Prints card on /home (F25) deep-links to the relevant /reports row.
- [ ] /reports route: Brief binding line present per F31 specification.
- [ ] Yossi context: in /reports, bulk "Approve and send all reviewed" button sends all Monthly Updates with status = Reviewed in one click. Does not affect status = Draft items.

**Build effort:** M — new /reports route, table with status management, PDF modal renderer, per-client "auto-send" toggle, bulk-send action. React-PDF already in place (F14 dependency).

**Edge cases:**
1. Reporter agent generates a Monthly Update draft with a factual error (attribution number appears off): customer edits the draft in /reports. The edit history is logged. The sent version may differ from the agent-generated draft — this is by design (customer is the author; agent provides the first draft).
2. Customer has "Always send automatically" toggled ON for a client, but that month's Monthly Update has an attribution number of zero (no calls, no UTM clicks): the Reporter agent does not auto-send zero-attribution reports (it escalates to /reports → Draft for manual review, overriding the auto-send toggle). This prevents the embarrassing edge case of sending a client a Monthly Update saying nothing happened.
3. Customer deletes a Monthly Update from /reports: deletion removes the hosted permalink (if any) and the record from /reports. The PDF in the customer's email client is not retrievable by Beamix. This is an intentional design — once sent, email is the customer's artifact.

---

## Q10: How do I pause my subscription?

**Customer pain:** Dani's skincare brand does 80% of annual revenue in October–January. February through May she's running at half the team. She wants to pause her Beamix subscription for 3 months, not cancel it. Cancel implies "I'm done"; pause implies "I'll be back." Without a pause option, Dani's only choices are cancel (with 90-day read-only risk) or keep paying for an underutilized service. Either way, Beamix loses.

**Decision:** SHIP-AT-MVP

**PRD addition:**

### Feature F38: Subscription Pause

**Feature ID:** F38
**Surface:** /settings → Billing tab → "Pause subscription" option (distinct from "Cancel")

**What it does:**
Customer can pause their subscription for 1 or 3 months. During a pause: no billing, no agent runs, no Monday Digest, no new inbox items. The account enters a "Paused" state — functionally similar to read-only mode from F35, but with a defined resume date and no data retention countdown (data is fully intact, not on a deletion clock).

**Paddle API support:** Paddle supports subscription pauses via their subscription management API. Pause creates a `pause_collection` on the subscription with a resume date. At resume date, billing resumes automatically on the existing plan. No new checkout required.

**During pause:**
- Login: full access (read-only — browse historical data)
- Scheduled agent runs: suspended
- Monday Digest: suspended
- Lead Attribution: Twilio numbers remain active, calls log (but no agent reactions)
- UTM URLs: active, clicks log (no agent reactions)
- Brief + Truth File + scan history: fully accessible
- /inbox: visible (shows items from before pause), no new items

**On resume:**
- Billing resumes on the resume date
- First agent run scheduled within 24 hours of resume
- Day 0 T+10min welcome email does NOT resend (not a new customer)
- A "Welcome back" email fires: *"Beamix is back at work. Your first scan since your pause will run tonight."*
- No re-onboarding required

**Voice and microcopy:**
- Pause option: *"Take a break — pause for 1 or 3 months. Your data stays intact. Billing pauses. Agents rest."*
- Confirm modal: *"Beamix will pause on [date] and resume on [resume date]. You'll be billed again then."*
- Pause active banner on /home: *"Beamix is paused until [date]. Your data is safe — resume early anytime."*
- Resume email: *"Beamix is back at work."*

**User story:** As Dani, I want to pause my subscription during my slow season so that I'm not paying for a service my team isn't using, without losing my history or having to re-onboard in October.

**Acceptance criteria:**
- [ ] /settings → Billing tab shows "Pause subscription" as a secondary option below "Cancel subscription."
- [ ] Pause options: 1 month or 3 months (radio buttons). Resume date calculated and shown before confirmation.
- [ ] Paddle API: `POST /subscriptions/{id}/pause` with `resume_at` timestamp. On Paddle-side resume, standard billing cycle resumes.
- [ ] During pause: all scheduled Inngest jobs for this account are suspended (check subscription_status before each run). Twilio numbers remain active and logging.
- [ ] "Resume early" button in /settings during pause: fires Paddle `POST /subscriptions/{id}/resume` immediately. Billing resumes from current date (prorated).
- [ ] On automatic resume date: Inngest job triggers first post-pause scan within 24 hours. "Welcome back" email fires within 15 minutes of resume.
- [ ] No Day 1-6 cadence emails on resume (not a new customer). Only the "Welcome back" email.
- [ ] Yossi context: pause is per-account, not per-client. All 12 client accounts pause simultaneously. (Per-client pause would require per-client billing, which is MVP-1.5.)
- [ ] Maximum 2 pauses per 12 months (prevents pause abuse as a substitute for cancellation).
- [ ] Pause is not available during trial period (not applicable at MVP — trial is 14-day money-back, not a free trial account state).

**Build effort:** S — Paddle pause API integration, subscription_status = 'paused' state handling, Inngest subscription-status check on every job, "Welcome back" email template, Billing tab UI additions.

**Edge cases:**
1. Customer pauses, then their pause period overlaps with a Monthly Update generation date: the Reporter agent does not run during pause. The Monthly Update for the paused month is skipped. No retroactive catch-up on resume — the Monthly Update simply does not exist for that month (this is noted in /reports with status "Paused — not generated").
2. Customer resumes early on the same day a Monday Digest was scheduled: the Monday Digest fires on the next Monday (not same-day — Inngest job checks if the current day is Monday and whether a digest has already sent this week before firing).
3. Customer on annual plan pauses: Paddle pause on annual subscription pauses the next renewal date accordingly. Annual billing is not prorated for a mid-year pause — the pause extends the subscription end date by the pause duration. Confirm this behavior with Paddle's API documentation before shipping.

---

## Q11: How do I remove a Beamix-detected competitor I don't care about?

**Customer pain:** Beamix's vertical Knowledge Graph pre-populates 5 competitors (per F10 acceptance criteria: "5 vertical-KG-pre-populated + up to 5 customer-added"). One of those pre-populated competitors is wrong — it's a company in an adjacent space that does not actually compete with Sarah's product. She wants it gone. If it's not gone, Citation Fixer and FAQ Agent will keep generating content designed to displace a competitor that isn't one, wasting credits and polluting her Brief context. The audit flagged this as a partial spec gap — /competitors lets her add custom competitors but gives no mechanism to remove a KG-detected one.

**Decision:** SHIP-AT-MVP

**PRD addition:**

### Feature F39: Competitor Removal and False-Positive Management

**Feature ID:** F39
**Surface:** /competitors → per-row action; competitor detail panel

**What it does:**
Extends the existing /competitors table (F10) with a "Remove" action on any competitor row — both KG-detected and customer-added. Removing a competitor removes it from the active set, logs the removal in the audit log, and instructs all relevant agents to exclude it from future work.

**Removal flow:**
1. Customer clicks "Remove" on a competitor row (or opens the competitor detail panel and clicks "Remove competitor").
2. A confirmation modal appears: *"Remove [Competitor Name]? Beamix will stop tracking them and won't mention them in future content. This does not undo past agent work."*
3. On confirm: competitor is moved to a "Removed" list (not deleted — retained for audit/rollback). The competitor no longer appears in the main /competitors table. All 6 MVP agents receive an updated exclusion list.
4. Removed competitors are visible in a collapsed "Removed" section at the bottom of /competitors — customer can "Restore" a removed competitor at any time.

**Agent retraining:** On next scan cycle after removal, Citation Fixer and FAQ Agent read the exclusion list and do not generate content targeting removed competitors. Schema Doctor and other agents that don't target specific competitors are unaffected.

**Audit log:** Removal is logged in the agent action ledger with: customer_id, removed_competitor_domain, removal_reason (optional free-text), timestamp, actor (Owner or Editor per F33).

**Voice and microcopy:**
- Remove button: *"Remove competitor"*
- Confirmation modal: *"Remove [Name]? Beamix stops tracking them and won't mention them in future recommendations. Past work isn't affected."*
- Restored badge: *"You removed this competitor on [date]."* (shown in restored row)
- No AI labels on any confirmation copy.

**User story:** As Sarah, I want to remove a competitor that Beamix auto-detected but that isn't actually my competitor so that agents don't waste credits generating content targeting the wrong company.

**Acceptance criteria:**
- [ ] "Remove" action available on every row in /competitors table — both KG-detected ("Beamix detected" badge rows) and customer-added rows.
- [ ] Removal moves competitor to a `removed` state (not deletion). Removed list accessible via "Show removed" toggle at bottom of /competitors.
- [ ] Confirmation modal: shows competitor name, one-sentence plain-English explanation of what changes. Optional free-text "Reason for removing" field (not required).
- [ ] On removal: agent exclusion list updated. All future Inngest agent runs read exclusion list before generating any competitor-targeting content.
- [ ] Removal does NOT roll back past agent work. Past /inbox items approved for competitors that were later removed remain in the action ledger as-is.
- [ ] "Restore" action on removed competitors: moves competitor back to active. Agents re-include them on next cycle. No re-confirmation needed.
- [ ] Removing a KG-detected competitor does NOT affect the KG itself (global Beamix data). It only removes the competitor from this customer's active set.
- [ ] Audit log entry on removal and on restore: actor, timestamp, competitor domain, reason (if provided).
- [ ] If customer removes all 5 KG-detected competitors and adds 0 custom competitors: /competitors shows "No competitors tracked" empty state with a prompt to add custom competitors.
- [ ] Brief grounding citation (F30) on the removal confirmation: not applicable (removal is a user action, not an agent action — no Brief clause citation needed).

**Build effort:** XS — additional row action in /competitors table, exclusion_list field on agent context, status column on competitors table (active/removed), audit log entry.

**Edge cases:**
1. Customer removes a competitor, then a new scan re-detects them via the KG (because the KG is run on every scan for competitor discovery): the KG-detected competitor does NOT automatically re-add to the active list if it's in the customer's exclusion list. The exclusion list takes precedence over KG discovery. This is a hard rule.
2. Customer removes a competitor and later sees that competitor in a Monday Digest (because the Digest template referenced the competitor in historical context): the Monday Digest should not reference removed competitors in new paragraphs. Historical lines that were already generated are not retroactively edited — but the Reporter agent's next generation will not include removed competitors.
3. Yossi removes a competitor for Client A but that same competitor is valid for Client B: competitor exclusion lists are per-client. Removing a competitor in Client A's context has no effect on Client B's competitor tracking.

---

## Q12: Multi-domain Scale tier pricing details

**Customer pain:** Yossi signs up to Scale ($499/mo) expecting to manage 12 client domains. He wants to know: how many domains are included? Is there a per-domain cost above the included count? Where does he configure per-client white-label (already locked: per-CLIENT, not per-account)? The PRD specs Yossi's multi-client cockpit and per-client Brief ceremonies, but the pricing model for multi-domain Scale is unspecified.

**Decision:** SHIP-AT-MVP (pricing and packaging decision + UI spec)

**PRD addition:**

### Feature F40: Multi-Domain Scale Tier — Seat and Domain Model

**Feature ID:** F40
**Surface:** Pricing page (Framer — out of this repo, but pricing model must be documented); /settings → Billing tab; client onboarding flow (abbreviated); multi-client cockpit

**Pricing model decision (locked in this document):**

| Tier | Domains included | Add-on domains | Notes |
|---|---|---|---|
| Discover $79 | 1 | N/A | Single domain, owner-only |
| Build $189 | 1 | N/A | Single domain, 2 seats (F33) |
| Scale $499 | 5 domains | $49/domain/month | Yossi's entry point; 12-client agency buys 5 included + 7 add-ons = $499 + 7×$49 = $842/mo |

**Rationale for this model:** Scale at $499 with unlimited domains would undermine per-domain value. A $49/domain add-on is lower than Beamix's per-domain cost of service at scale (scan engine cost + agent compute) and well below what Yossi bills clients (₪9,000–₪15,000/month per client). This model aligns incentives: Yossi pays proportionally as he grows.

**White-label per-client config (locked by Board Decision #16 — not relitigated):**
Each domain on Scale has its own white-label config slot. Config is accessed from the multi-client cockpit → select client → "Brand settings." Not from /settings account-level. The existing F13 acceptance criteria cover this — F40 adds the pricing model that governs how many such slots exist.

**Multi-client cockpit:**
The multi-client cockpit (referenced in PRD §1 Persona C, Yossi section) is the Scale-tier /home equivalent for agency operators. It is a table view, not the standard /home rings-and-evidence layout.

**Cockpit columns:** Client name / Domain / AI Score (delta vs last week) / /Inbox count / Agents in error (0 is green) / Monthly Update status (Draft/Sent/Overdue) / Attribution headline (one-line)

**Cockpit row actions:** Open client dashboard (switches client context), Approve all pending /inbox items (single-client bulk-approve, already in F6), Trigger manual scan.

**User story:** As Yossi, I want a single table showing all 12 of my clients' current status so that my morning review takes 5 minutes, not 25.

**Acceptance criteria:**
- [ ] Scale tier includes 5 domains. Each additional domain is $49/month, billed via Paddle add-on product.
- [ ] /settings → Billing tab shows: current domain count, included domains (5), add-on domains purchased, per-domain add-on price, "Add a domain" button.
- [ ] "Add a domain" button: triggers Paddle add-on checkout for $49/month, then routes to abbreviated 2-step domain onboarding (Step 1: business profile + Step 4: Truth File only, per §4.4 of onboarding spec — every client gets full Brief ceremony and Truth File, no shortcuts).
- [ ] Wait — conflict with PRD §4.4 note: "Every client account gets full Brief ceremony, full Truth File, full Lead Attribution setup — no shortcut flow" (F2 last acceptance criterion). Abbreviated flow mentioned in §4.4 (from Audit 3 context) is OVERRIDDEN by the F2 lock. Resolution: every new domain added on Scale gets the full 4-step onboarding ceremony (including Brief signing). The "abbreviated 2-step" language from the old onboarding spec is retired. Full ceremony for every client.
- [ ] Multi-client cockpit: visible on Scale tier at /home when multi-client context is detected (2+ domains active). Single-domain Scale accounts see standard /home.
- [ ] Cockpit shows: Client name / Score delta / Inbox count / Agents in error / Monthly Update status / Attribution headline.
- [ ] Per-client white-label config accessible from cockpit → client row → "Brand settings." Not from top-level /settings.
- [ ] "Powered by Beamix" footer (Geist Mono 9pt, --color-ink-4) default ON per-client, toggleable.
- [ ] Domain deletion: Scale customer can remove a domain from their account. The domain's data enters read-only mode (same as F35 cancellation model, 90 days). The $49/month add-on is cancelled via Paddle at next billing cycle.
- [ ] Cockpit Brief binding line (F31): present at cockpit footer, rotating through clauses of whichever client is most recently active.

**Build effort:** M — Paddle add-on product ($49/domain), multi-client cockpit view (new table view of /home for Scale multi-domain), domain count enforcement, per-domain onboarding trigger.

**Edge cases:**
1. Yossi's client count drops from 12 to 8 (3 clients leave): he cancels 4 add-on domains via Paddle. The 4 removed domains enter 90-day read-only mode per F35. At-domain-limit enforcement is checked at next billing cycle.
2. Scale customer with 1 domain upgrades to multi-client: they add their first additional domain via "Add a domain." The cockpit view activates automatically once the second domain is onboarded.
3. Two Yossi-type agencies are both Scale customers: there is no cross-account visibility. Each agency's client data is fully isolated behind Supabase RLS. White-label configs are per-client within the agency's account, not shared across accounts.

---

## Numbering — F32–F43 Added to PRD v3

The following features are added by this document. PRD v4 should incorporate them into the §2 MVP Feature Scope table.

| Feature ID | Summary | Decision | Build Effort |
|---|---|---|---|
| **F32** | Brief Re-author and Undo Window — 10-min undo post-signing + permanent /settings re-author flow with version history | SHIP-AT-MVP | S |
| **F33** | Team Seats and Role Permissions — email invite, Owner/Editor roles, seat limits per tier | SHIP-AT-MVP | M |
| **F34** | Customer Data Export (DSAR + self-service) — ZIP export by category, GDPR Article 20 portability | SHIP-AT-MVP | M |
| **F35** | Graceful Cancellation and Data Retention — wind-down / 90-day read-only / 2-year archive lifecycle | SHIP-AT-MVP | S |
| **F36** | Domain Migration Flow — 4-step wizard, ownership verification, Brief re-sign, scan history merge | SHIP-AT-MVP | M |
| **F37** | /reports route — Monthly Update archive, draft review, per-report send, share-link management | SHIP-AT-MVP | M |
| **F38** | Subscription Pause — 1 or 3 month pause via Paddle API, "Welcome back" resume flow | SHIP-AT-MVP | S |
| **F39** | Competitor Removal — false-positive removal, exclusion list, agent retraining, audit log | SHIP-AT-MVP | XS |
| **F40** | Multi-Domain Scale Tier — 5 included + $49/domain add-on, multi-client cockpit view, per-client Brand settings | SHIP-AT-MVP | M |

**Notes on Q3, Q6, Q8 (resolved without new feature IDs):**
- Q3 (Twilio numbers inventory): resolved as amendment to F13. No new feature ID.
- Q6 (private Monthly Update share): resolved as amendment to F14 + F37 (share-link mechanics in /reports). No separate feature ID beyond F37.
- Q8 (in-product data privacy): resolved as content addition to the Privacy & Data tab created by F34. No separate feature ID.

**Total new features added: F32–F40 (9 features)**
**Total features in PRD: F1–F40**

---

*End of PRD Amendment — 12 Unanswered Customer Questions.*
*Written by Product Lead in response to Audit 3 Customer Journey Coherence Review, 2026-04-27.*
*Supplements PRD-wedge-launch-v3.md without superseding any of the 23 locked Board decisions or any F1–F31 acceptance criteria.*
