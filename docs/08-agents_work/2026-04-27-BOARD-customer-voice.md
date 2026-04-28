# Customer Voice — Marcus, Dani, Yossi
Date: 2026-04-27
Author: Customer Voice composite

## Q1: Monthly Update permalink default

### Marcus
Public by default? No. Hard no. Look — this PDF has my lead attribution numbers on it. "47 developers found Acme through Claude." That's not a brag, that's competitive intel. If a competitor scrapes my permalink off LinkedIn after my co-founder forwards it to a board member who tweets a screenshot, now they know exactly which AI engines I'm winning on. I would never let that happen with my Mixpanel dashboard, why would I let it happen here? Make the share an explicit click. I want a "Generate share link" button that produces an unguessable URL with optional expiry. The PDF in the email IS the forward mechanic — my CTO reads PDFs, my board reads PDFs, nobody asks for a URL. The default-public framing was designed for marketing-team SaaS where the report IS the marketing. My report is operational. Default-private. Period.

### Dani
Honestly, I don't care that much, but lean private. My Monthly Update says "47 calls and 12 form submissions through Beamix this month" — that's literally the number my Meta media buyer would kill to see for our paid funnel, and it's the number I'd never share with another DTC operator at a dinner. I'm not running a public Twitter account about my supplements brand's ROAS. The forwarding I actually do: I AirDrop the PDF to my husband (who's the CFO), I email it to my Shopify-plus account manager, occasionally I screenshot ONE number for a podcast guest spot. None of that needs a public URL. And if I ever DO want to brag, I want a deliberate "make this one shareable" button so I know what I'm doing. Default-public turns a financial document into a tweet. Don't.

### Yossi
תכל'ס — for me Scale tier, white-label client reports, default MUST be private. If my client's Monthly Update is public-by-default and a competitor agency Googles `site:reports.yossiagency.com` and finds my whole client roster's monthly numbers, I'm fired. Twelve times. I bill my clients $3,000-$15,000/mo and the report is *inside the agency relationship* — leaking it is a fire-the-vendor moment. Editorial spec saying "designed to be forwarded" is wrong about agency reality. Forwarding happens via the PDF in the email, period. If you want viral, give me a "Make this client testimonial public" toggle that strips numbers and keeps the narrative — that's actually shareable. The raw monthly: never public by default. Don't make me explain to a client why their data was on the open web.

### Recommendation
**Private by default. Explicit "Generate share link" button creates an unguessable URL with optional expiry.** All three personas converge — Marcus on competitive-intel grounds, Dani on financial-document instincts, Yossi on agency-liability grounds. The editorial spec's "designed to be forwarded" intuition is correct but the forwarding mechanic is the PDF attached to the delivery email, NOT a public URL. Scale tier white-label MUST be private — anything else is malpractice for Yossi's clients.

---

## Q2: /crew layout — Stripe-style table vs yearbook (card grid)

### Marcus
Table. 100%. I live in Linear, Stripe Dashboard, Vercel. I scan rows. A card grid for 18 agents is 6 rows of 3 cards = visual chunking I have to mentally re-stitch. Give me one column of 18 rows, sortable by "this week action count" descending, and I find what I need in 4 seconds. The yearbook framing is cute but cute is the enemy of operational. That said — keep the monogram in column 1. The 16×16 Rough.js mark is what makes the table NOT-Stripe — it has personality without performing personality. Don't fight that. The thing I actually want on /crew that no one's promising: an "explain to me what this agent did and why" button per agent, in plain English, that I can paste into a Slack message to my growth hire. Make the table dense, make the row-expand show a 4-line "what I do" first-person blurb, done. Yearbook is for people who visit /crew once. I visit weekly.

### Dani
Whatever Marcus said but softer. I'm not going to /crew often — Beamix is supposed to do the work, not be configured. When I go, I want to see "is everything running?" green/yellow/red at a glance. A table of 18 rows works for that as long as the State column reads at scan-speed. The card grid would actually be nicer for ME because the cards make the agents feel like *people*, which is the brand promise. But I'm not the primary user of this page — my SEO contractor and my paid media manager will both poke at it more than I will. They want table. Listen to them. Caveat: the locked-agent section at the bottom ("Available on Scale") needs to look slightly aspirational — that IS the upgrade moment for me from $189 to $499. Don't let it disappear into gray. Make those rows beautiful enough that I want them.

### Yossi
Table. Not even a question. I have 12 clients. When I switch into client X's /crew, I need to see all 18 agents, sort by error state, find the one that broke this week. Card grid for 18 agents × 12 clients = 216 cards. I'd quit. Stripe-grade table density is the only way this scales for me. I want column-sort on every column (state, this-week count, success rate, last action), I want sticky header on scroll, I want bulk-select with a checkbox column for "pause these 4 agents on this client temporarily." None of that exists in a card grid. Yearbook framing belongs on /crew/[agent-id] — the per-agent detail page CAN be portrait-style and warm. Roster is operational. Detail page is character. Two different jobs, two different surfaces. Don't conflate them.

### Recommendation
**Table for the roster. Yearbook DNA preserved through the Margin monogram column + first-person "what I do" copy in row-expand.** All three converge. Marcus and Yossi are operational table users; Dani is a low-frequency visitor whose contractors will use the surface — she defers to operator preference. The yearbook impulse is right but belongs on `/crew/[agent-id]` per-agent detail pages, where personality is the JTBD. CREW spec §2.5 already calls this correctly — confirm it.

---

## Q3: White-label digest signature — Beamix only / agency name only / both (tier-gated)

### Marcus
I'm not Yossi, I don't care about white-label for my own use. But putting on my "if I were a Beamix investor" hat: tier-gated both is obvious. Default Beamix on Discover and Build — that's brand presence on the most-forwarded artifact, and on $189 you don't get to strip the badge. Scale unlocks white-label because at $499 you ARE the agency, and Beamix becomes the wholesale infrastructure. Standard SaaS pattern: Notion does this, Linear does this, Loom does this. The only nuance: even on Scale white-label, keep an OPTIONAL "Powered by Beamix" footer link that defaults ON, with a one-click toggle to turn off. Yossi will turn it off for some clients and leave it on for others (the ones where being a Beamix agency is a credential). Don't force the choice. And whatever you do, don't put "Powered by Beamix" front-and-center where it embarrasses Yossi's client relationship — footer link, 11px, ink-3, done.

### Dani
This question isn't really about me, but I'll say: when I forward my Monthly Update to my husband, I love that it's signed *— Beamix*. That's the brand I'm endorsing by forwarding. If it were unsigned or signed by some random agency I never heard of, I'd be confused. So default Beamix is right for my tier. The thing I'd flag from my own gut: when Beamix gets big, I want to KNOW I'm using Beamix the way I know I'm using Klaviyo or Triple Whale. Don't strip the brand from artifacts customers see. Yossi is one persona; the 95% of Build-tier customers like me are the ones who give Beamix word-of-mouth. Keep the signature visible for us. Tier-gated both, with Build forced to Beamix-signed, is the cleanest answer.

### Yossi
Both, tier-gated, with the Scale unlock being TRUE white-label — agency wordmark replaces, agency colors replace, agency seal replaces. *Optional* "Powered by Beamix" footer link that I can toggle per-client. I have clients where I'm proud to say "we use Beamix infrastructure" — those get the footer ON. I have clients who think they're getting bespoke agency work and would freak if they realized I'm reselling — footer OFF. Both must be available. The thing the editorial spec gets wrong: it implies the Scale white-label is a setting in /settings/whitelabel for the whole account. NO. It needs to be per-client. Each of my 12 clients has different brand colors, different voice, different relationship. /settings/whitelabel needs to be per-client config, accessed from the multi-client switcher. Get this wrong and Scale isn't worth $499 — get it right and I'm a $5,988/year customer who refers three more agencies.

### Recommendation
**Tier-gated both. Discover/Build = Beamix-signed (non-removable). Scale = full per-client white-label config with optional "Powered by Beamix" footer link toggleable per-client (default ON).** Marcus validates the SaaS-standard pattern. Dani confirms Beamix-signed is the brand-building default for the 95%. Yossi requires per-client config (NOT per-account) — this is the load-bearing requirement and the editorial spec needs to update from `/settings/whitelabel` (single config) to per-client config in the client switcher.

---

## Q4: Workspace + Workflow Builder + Marketplace tier-gating

### Marcus
Here's how I'd want it priced from the buyer side:

- **Discover ($79):** Workspace YES (read-only "watch agents work" — this is the magic-moment feel that makes me want to upgrade; gating it would kill conversion). Workflow Builder NO. Marketplace browse YES, install NO. Discover is "see the magic, want more."
- **Build ($189):** Workspace YES (full). Workflow Builder NO at MVP — but give me a "see what Scale can do" preview where I click `+ Workflow` and get a beautiful upsell modal showing 3 example workflows. Marketplace install YES (pre-built workflows from the catalog), publish NO. Build is "use the magic at scale."
- **Scale ($499):** Everything. Workspace, Workflow Builder, Marketplace install + publish.

The reason Workflow Builder is Scale-only: it's a power-user feature. 80% of $189 customers will never use it. Putting it on Build dilutes the Scale upsell story. The 20% of Build customers who DO want it are exactly the customers who should upgrade to Scale. Make the upgrade prompt beautiful — that's the company's path from $189 to $499 ARR. And Workspace on Discover is non-negotiable because watching the courier-flow animation is what makes Discover feel alive — without it, $79 buys you a digest.

### Dani
I'm a Build customer. I do not want to build workflows. I want to NOT think about workflows. So Workflow Builder = Scale-only is fine by me, I'll never click it. But — Marketplace INSTALL on Build is critical. If there's a pre-built "DTC e-commerce supplements pack" workflow in the marketplace that someone like me built and shared, I want to one-click install it on Build tier. That's exactly the value — I'm getting another operator's wisdom without configuring anything. So: Build = install pre-built workflows from marketplace YES, build my own NO. That's the right line. Workspace on Discover yes, all tiers actually — the moment I lose visibility into what agents are doing, I lose trust, and that kills retention faster than anything. Make Workspace available to everyone, including the free trial. Workspace IS the product feeling alive.

### Yossi
Scale gets EVERYTHING. Workspace, Workflow Builder full DAG editor, marketplace browse + install + publish. Without the Workflow Builder, Scale isn't worth $499 to me. The whole reason I pay 2.6× Build is the workflow automation — "if competitor X publishes Y, run Citation Fixer on client Z's matching page, route diff to Slack channel client-Z-alerts." That's $499 of value per month *per client*, easy. Without it, I'm paying for "more engines" which I don't actually need at this scale.

Build needs MORE than Marcus thinks. Hear me out: Build customers who hit the Workflow Builder gate and see "upgrade to Scale" will convert at maybe 5%. But Build customers who get to INSTALL a pre-built marketplace workflow that *I published* — they convert higher AND they make my published workflow valuable AND they create the data that justifies my Scale subscription. So Build = install from marketplace YES is structurally important even if rewards are on hold. The marketplace IS the rewards system, in a sense — if Build customers can install my packs, my packs get used, I get prestige (no leaderboard needed, just install counts visible on `/crew/workflows`).

Discover: Workspace yes (or no one upgrades). Marketplace browse yes, install no. Workflow Builder no. That's right.

### Recommendation
**Tier matrix:**

| Feature | Discover ($79) | Build ($189) | Scale ($499) |
|---|---|---|---|
| Workspace (watch agents work) | YES (read-only) | YES (full) | YES (full + multi-client switcher) |
| Marketplace browse | YES | YES | YES |
| Marketplace install pre-built workflows | NO | YES | YES |
| Workflow Builder (DAG editor) | NO | NO (with beautiful upsell modal on `+ Workflow` click) | YES (full + per-client config) |
| Marketplace publish | NO | NO | YES |

**Why this works:** Workspace on every tier protects the magic-moment feel (Dani is right — gating it kills retention). Marketplace install on Build is structurally important per Yossi (creates demand-side for Scale-published workflows even without the rewards system). Workflow Builder Scale-only preserves the $189→$499 upsell story (Marcus's logic). Marketplace publish Scale-only because publishing is creator-economy work, not consumer work.

---

## Cross-cutting observations

### Voice canon

The right model is **(b): /home + /crew name agents internally; all email + PDF + permalink + Monthly Update use "Beamix"**. The product surfaces (where the customer is logged in and inside the operator metaphor) get to name the crew — Schema Doctor, Citation Fixer, FAQ Agent — because that's where the org-chart-of-AI-employees mental model adds value. Marcus said it cleanest: *"I want to see how the sausage is made when I'm INSIDE the product. I don't want my CEO to read 'Schema Doctor did X' on a forwarded PDF — that sounds like a Saturday-morning cartoon."* Dani agreed — the Monday Digest signed "— Beamix" feels like a serious vendor; signed "— Schema Doctor" feels like a toy. Yossi has the cleanest test: *"Whatever shows up outside the customer's logged-in session must say Beamix. Anything you can only see while logged in can say agent names. That's the whole rule."* The current state (PRD F14 says Beamix-only on emails, but /home + /crew name agents) is already model (b) — keep it. The drift problem is /home Evidence Card copy that says "Schema Doctor: Added FAQ schema" being inconsistent with Monday Digest copy. Standardize: external-facing surfaces use Beamix; in-product surfaces (/home, /crew, /workspace, /inbox) name agents.

### Agent-count canon

Mismatch will confuse all three personas. Marcus expects "what you said is what I get" — if /home tier badge says "8 agents" and /crew shows 18, he'll feel deceived even though it's tier-locked rows. Cleanest mental model: **show all 18 monograms on /crew always (with locked rows visibly tier-gated and aspirational), but the tier badge on /home and the marketing-site copy says "your active crew: N" where N is the customer's tier-active count (3 on Discover, 8 on Build, 18 on Scale).** PRD's "6 ship MVP" is a build-state fact, not a customer-facing fact — the customer should never see "6 agents" anywhere; they see their tier's count + the locked roster. Yossi's read: *"18 monograms on /crew is the aspiration ladder. Don't hide it. Don't ship MVP with only 6 visible — show 6 active + 12 'coming soon' in a third row treatment, otherwise the upgrade story is invisible."* This is right. At MVP, surface 6 active + 12 with a "coming soon Q3 2026" treatment, NOT locked-by-tier — locked is for tier-gated, "coming soon" is for not-yet-built.

### What this round revealed

The biggest takeaway: **all three personas treat default privacy as table stakes, and the editorial spec's "designed to be forwarded → public default" instinct is the single most dangerous drift in the current spec set.** Adam should hold the line on private-by-default everywhere — including Monthly Update — and design the share gesture as deliberate. Second takeaway: Yossi's per-client white-label requirement is the load-bearing Scale-tier feature, and the current spec treats white-label as account-level config. This needs to flip to per-client before build starts. Third: Workspace on every tier (including Discover) is the unanimous retention move — gating it would feel like the product went dark, which kills the magic-moment thesis the entire onboarding ceremony is designed to deliver.
