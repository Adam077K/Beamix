---
name: Beamie character deferred to post-base-product
description: The persistent companion character (Beamie) is NOT in MVP scope. Animations and flow-visualizations YES; persistent character NO.
type: project
originSessionId: db5e93be-788d-4f63-a3d4-670ed396697e
---
## Decision (2026-04-25)

Beamie (persistent companion character with face, drag, click-to-chat, gaze-not-glow rule) is **deferred** until after the base product is done. Adam's words: *"Bemi because it's not going to be created now"* and *"we can definitely do Bemi in the future. In, like, a couple of weeks. After we have the base done."*

**What IS in scope right now:**
- Hand-drawn / pencil-style animations distributed across pages (Claude-style)
- Flow-chart visualizations of agent work (circles + arrows + steps, side panel)
- URL input → scan-reveal animations (15s+, sequential, can be chained to look continuous)
- Per-page animation strategy (onboarding, scan, workspace, results)
- Subtle environment animations to translate technical work into something non-technical SMBs can understand

**What is NOT in scope (deferred to post-base):**
- Persistent companion character anywhere on screen
- Rive-rigged character file
- Drag mechanics, gaze-not-glow, inline chat with companion
- 12 behavior rules
- Cast of characters (Kavan/Fetch/Sofer/Matza/Roni)

**How to apply:** When designing animations or flows, do NOT assume a character is on screen. Use objects, flows, illustrations, scribble drawings — but no recurring personified entity. When the base product is shipped and validated, revisit Beamie as a layered addition.
