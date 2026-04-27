# Audit Consolidated — All 3 Reports Synthesized
Date: 2026-04-27
Reports:
- `2026-04-27-AUDIT-1-consistency.md` (cross-spec consistency)
- `2026-04-27-AUDIT-2-feasibility.md` (build feasibility)
- `2026-04-27-AUDIT-3-customer-journey.md` (customer experience)

## Headline numbers

- **19 BLOCKERS** total (must resolve before build)
- **27 SHOULD-FIX** items (build can begin, but must address before launch)
- **12 customer questions with no spec'd answer**
- **5 originally-flagged conflicts** (some now superseded by deeper audit findings)

## The 19 BLOCKERS — grouped by theme

### Theme A: Missing canonical schemas (4 BLOCKERS)
The single most critical gap. Engineering cannot start without these.

1. **Brief canonical schema** — referenced in 7 specs with mismatched chip lists. No JSON/Zod definition. *Source: Audit 1 + Audit 2.*
2. **EvidenceCard data shape canonical** — 4 specs use 4 different shapes. *Source: Audit 2.*
3. **House Memory semantic split** — conflates 3 systems (Artifact Ledger / Margin Notes / Agent Memory). Each needs separate schema + read/write contract. *Source: Audit 2.*
4. **Truth File schema contradiction** — PRD F3 says vertical-specific; Onboarding §2.4 specs one shared schema. *Source: Audit 3.*

### Theme B: Agent / catalog inconsistency (2 BLOCKERS)
5. **Agent count chaos: 5/6/8/11/18 across specs.** PRD says 6 MVP, /crew + /home + /onboarding + Design System say 18, /inbox + /scans say 11, Marketplace says both 5 and 11. Need single canon. *Source: Audit 1.*
6. **Workflow Builder ship date contradiction** across 3 specs (PRD: Year 1, CREW: MVP, MARKETPLACE: MVP-1.5). *Source: Audit 3.*

### Theme C: Customer journey seams (5 BLOCKERS)
7. **Free-scan → tier-pick handoff undesigned** — highest-conversion funnel moment. *Source: Audit 3.*
8. **Lead Attribution Step 2 leads with phone** — wrong for SaaS; should lead with UTM. *Source: Audit 3.*
9. **Brief has no escape hatch when vertical KG misclassifies** — 20% misclass rate per PRD Risk 3. *Source: Audit 3.*
10. **Day 1-6 silence** — sign Tuesday → 6 days until Monday Digest. No email cadence designed for this gap. *Source: Audit 3.*
11. **Anti-anxiety pattern is /home-only** — score-drop weeks read alarmist in Monday Digest + Monthly Update. *Source: Audit 3.*

### Theme D: Infrastructure decisions (4 BLOCKERS)
12. **Real-time "agent acting" channel transport undecided** — Supabase Realtime vs WebSocket vs SSE. /home and /crew specs disagree. *Source: Audit 2.*
13. **L2 site-integration mode at launch undecided** — biggest gap: how do agents actually push schema/FAQ to customer's WordPress/Shopify? *Source: Audit 2. Recommendation: MVP=manual paste, MVP-1.5=WordPress/Shopify plugin, MVP-2=Edge Worker.*
14. **Inngest contract + quotas + 60s+ run support** undefined. *Source: Audit 2.*
15. **Brief chip-slot extraction algorithm** — product gap, not engineering. How does Beamix derive the chip-editable values from a free-form scan? *Source: Audit 2.*

### Theme E: Locked decisions overridden / inconsistent (3 BLOCKERS)
16. **Default-public Monthly Update permalink override** vs Adam's default-private lock. *Source: original flag + Audit 1 + Audit 3.*
17. **/crew card-grid vs table-grammar** — Senior Designer C explicitly rejected Master Designer's grid; but /crew §1 still calls it a yearbook. Internal contradiction within /crew spec itself. *Source: Audit 1.*
18. **White-label digest signature contradiction** — PRD F14 mandates "Beamix"; Editorial §2 white-label uses agency name. *Source: Audit 3.*

### Theme F: Voice drift (1 BLOCKER)
19. **Voice drift across surfaces** — "Schema Doctor did X" (/home) / "Beamix did X" (digest) / "your crew" (onboarding seal). No canonical voice model. *Source: Audit 3.*

## The 27 SHOULD-FIX items — grouped by theme

### Token / design-system inconsistencies (8 items)
- /inbox max-width 880 (Design System) vs 1280 (/inbox spec)
- Purple hexes for agents (#6366F1, #8B5CF6) vs Design System §7's explicit ban on AI-purple
- Seal-on-hover on buttons contradicts Design System §2.3 ("never on buttons")
- /home Evidence Strip uses non-canonical 4px Margin (not 24px)
- Lead Attribution Step 2 in /onboarding vs PRD's "Step 4.5"
- Marketplace install gates Build (per Marketplace) vs /crew assumes Scale for locked agents
- Review-debt thresholds: PRD count-only (5/10) vs /inbox count+days (3+/5+)
- Discover "3 engines" never specified — which 3?

### Missing email cadence (3 items)
- Event-triggered emails listed in PRD F12 but not designed
- Quarterly emails in Frame 5 cadence but absent from Editorial spec
- Annual emails in Frame 5 cadence but absent from Editorial spec

### Animation / performance feasibility (5 items)
- /workspace walking figure: defer gait animation to MVP-1.5, ship static at MVP
- /competitors path-draw race: defer cross-coloring polygon, ship single-color
- React-PDF Fraunces variable axes (WONK axis may not work) — 1-day spike
- Vercel OG / Satori compatibility for Rough.js seal — 1-day spike
- Twilio: provision 1 number sync; rest async (can't fit 3 in 1300ms animation)

### Lead Attribution gaps (3 items)
- Form attribution requires JS snippet on customer site (not spec'd how that gets installed)
- Engine→call/form linking mechanics not spec'd
- Twilio/UTM placement is dev work but specs only speak to the founder

### Yossi gaps (5 items)
- Subsequent-client onboarding skips Brief — direct contradiction with onboarding §5.6
- 12 Truth Files × 90s = 18 min of typing, no batch UI
- Multi-client switcher specified only on /crew, missing from /home /inbox /scans
- White-label per-client compose flow has no UI design
- Workflow Builder ship date contradicts (already a BLOCKER above)

### Other (3 items)
- 4 lenses should be action-tags on every action, not agent-attribution buckets (since 4/8 referenced agents are deferred)
- Brand Voice Fingerprint algorithm not spec'd
- Per-customer scan cost ceiling instrumentation missing

## 12 customer questions with no spec'd answer

1. Can I undo Brief approval?
2. How do I add a teammate to my Beamix account?
3. Where do I see my Twilio phone numbers if I lose track?
4. Can I export my data?
5. What happens if I cancel?
6. Can I share my Monthly Update without making it public?
7. How do I migrate my domain (e.g., business rebrand)?
8. What's the data privacy/storage policy?
9. The /reports route is referenced — what is it? (Never spec'd)
10. How do I pause my subscription?
11. How do I remove a Beamix-detected competitor I don't care about?
12. (one omitted; see Audit 3)

## Critical synthesis insight

Per Audit 3: **"The specs are unusually strong on peak moments and weak on seams — the gaps between specs, between days, and between personas."**

The peaks are great:
- /scan public 10-frame storyboard
- Brief approval Seal-draw ceremony
- Activity Ring on /home
- Rivalry Strip path-draw race

The seams are weak:
- Day 1-6 silence
- Free-scan → tier-pick
- Yossi's per-client subsequent flows
- Voice consistency across surfaces
- Cross-spec data shape agreement
- Schema definitions between PM and design specs

**The next CEO's most important job is closing seams.**

## Recommended order of operations for the next CEO

### Phase 1 — Adam locks (15 minutes max)
Surface to Adam in chat, get rapid yes/no:
1. Default-private Monthly Update? (resolve override)
2. /crew table grammar (resolve internal contradiction)
3. White-label signature: "Beamix" or agency name?
4. Truth File: vertical-specific or shared?
5. Workflow Builder ship date: MVP / MVP-1.5 / Year 1?
6. Marketplace top-10 rev share: 80% / 75% / 85%?
7. Marketplace grant pool: $50K / other?
8. Discover marketplace: read-only browse / hidden?

### Phase 2 — Schema + canon definition (1-2 days of focused agent work)
- Dispatch backend-developer or general-purpose agent to write canonical:
  - Brief schema (JSON/Zod, versioned)
  - EvidenceCard data shape
  - House Memory split (3 separate schemas)
  - Truth File schema (per Adam's resolution)
  - Provenance envelope canonical
- Lock agent count canon (probably 18 internal, 6 active at MVP)
- Lock voice model: "Beamix" everywhere customer-facing; agent names ONLY on /crew

### Phase 3 — Seam-close design specs (4-6 hours of agent work)
- Free-scan → tier-pick handoff design
- Day 1-6 silence: "first 7 days" email cadence design (3 emails)
- Yossi's subsequent-client onboarding flow
- Anti-anxiety pattern extension to email surfaces
- 12 customer-question answers (mostly /settings additions; /support page; basic FAQs)

### Phase 4 — Infrastructure decisions (Adam + Build Lead, 30 min)
- Real-time channel: Supabase Realtime (recommended)
- L2 site-integration mode for MVP: manual paste / WordPress plugin / Edge Worker
- Inngest contract + quotas

### Phase 5 — Build Lead dispatch
With Phases 1-4 complete, the spec set is build-ready. Build Lead can dispatch worker streams.

### Estimated time
- Phase 1: 15 min (Adam decisions)
- Phase 2: 1-2 days agent work
- Phase 3: 4-6 hours agent work
- Phase 4: 30 min Adam + Build Lead
- Phase 5: build-phase begins

**Total: ~3 days from now to first worker dispatched.**

## Lessons reinforced

- Specs produced in parallel without explicit cross-references will contradict each other. Next time, dispatch a "spec contracts" agent FIRST to define interfaces between specs.
- Page specs always under-spec the seams between pages. Audit-by-journey is high-leverage.
- Animation specs always over-promise feasibility. Audit-by-feasibility is essential.
- "Done at 83K words" doesn't mean "ready for build."

---

*End of consolidated audit. Next CEO: pick up from Phase 1 with Adam.*
