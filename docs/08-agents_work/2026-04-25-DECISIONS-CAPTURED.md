# Adam's Decisions — 2026-04-25

Captured during board-meeting decision round. These supersede the synthesizer's recommendations in `2026-04-24-BOARD-MEETING-MINUTES.md` where they conflict.

---

## The meta-vision

**Beamix is a CATEGORY-LEADING COMPANY, not a SaaS tool.**

Past-MVP framing. We are building the full product, not a minimum viable version. Quality + completeness > shipping speed.

Adam's exact words: *"My biggest vision, I see a full company just been it's leading the industry."*

---

## Key decisions

### Beamie (persistent companion character) — DEFERRED
Not in MVP scope. Revisit after base product is shipped and right. Adam: *"It's a bit too complicated for now... we can definitely do Bemi in the future. In, like, a couple of weeks. After we have the base done."*

### Animations & illustrations — YES (full immersive layer)
Hand-drawn / pencil / Claude-style. Distributed across pages. Different animation per page (onboarding has one, URL entry has one, scan has one, workspace has one, results have one).

**Animation philosophy** (in Adam's words):
- "Not the main thing in the page"
- "Giving customers another ability to understand what is happening in a special way without being aware of all the technical details"
- "Unique point of view for our product"
- "Doesn't need to be very complicated or complex or super beautiful"
- "Simple hand drawing animation like Claude's"
- Purpose: immersive feel, getting users inside the loop

**Concrete examples Adam gave:**
- Scan flow: "outlining the scan and the URL → logo of companies → loading + search around it → going back to scanning page → showing results with blocks outline without any content"
- Workspace agent activity: "circle with our logo or face drawing pencil drawing of an agent like a team member that is actually agent that is walking around with tools — researching, asking model, remembering"
- Side flow chart: "show the flow that he is now doing the research, then he's going to find the materials, then gonna think more — show it one step at a time with circles and arrows like a flow chart on the side"

### Scan animation specifics
- Average scan = ~2 minutes (current assumption, optimize later)
- Animation = 15+ seconds, can be **sequential / chained** so it visually feels continuous even if technically separate animations one after another
- Position: half-page or around the main page on scan-running screen
- Different animation for: onboarding URL entry, scan running, workspace, agent execution, results reveal

### Hebrew / RTL — YES, both languages, English stays primary
Adam: *"the product will work on Hebrew too. It's really important. We should definitely add this to the product that we're creating now because we are past the MVP. For now, we're creating the full product... I still want to keep English the main language. But Hebrew would definitely be a big play because we are here in the Israeli market."*

Treat Hebrew + RTL as a first-class requirement, not an addendum. Includes: Hebrew display font (Inter Display doesn't support Hebrew — need Rubik Display / Assistant / Heebo or equivalent), RTL UI mirror, Hebrew copywriting voice, Hebrew content output for content agents.

### Framer marketing site — DEFERRED
After the product is right and people actually want to use it. Talk later.

### Timeline — IGNORE
Adam: *"You shouldn't worry about this... I'm using an army of AI agents to do all of that. So time is not really important because I can ship what company ships in two months I can ship in three hours."*

Plan by scope + dependency + quality bar. No weeks, no sprints, no days.

### Product design philosophy
- "Fit for the customer" everywhere
- "It should be as much as possible for the customers"
- "All the flows and all the features and all the buttons should feel like it's the right place where the customers will need them"
- "They are not super technical, and they're not super 'you need to know what you're doing'"
- "The app will guide you. The app will help you. Beamix will help you."
- "Like a platform [where] every type of user can use it. If you want the very complex, you have it. And if you want the very simplicity, you have it also."
- "About the product designing and the flows and the subtle animations and all the environment that we are creating"

### What we're rejecting
> *"What it is now. It's just a basic SaaS product AI sloppish. We're gonna create a new environment in a new perspective to help those customers."*

---

## What's next (Adam's stated order)

1. ✅ Discuss decisions (this document)
2. **Now:** Deploy reference team — find specific products / patterns / animations we will follow
3. **After references land:** Create Beamix Vision Document — design + product design unified, page by page, flow by flow

---

## Decisions still effectively open (deferred or not addressed)

- Memory layer for Beamie (when Beamie returns)
- Shareable Scan Card (defer; revisit when product is right)
- Public GEO Index `beamix.tech/check-my-site` (defer; revisit when product is right)
- State of GEO newsletter (defer; revisit when product is right)
- Cast of 5 characters (defer with Beamie)

These are all deferred-not-killed. Architect for them, ship without them.
