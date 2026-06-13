import type { BlogDraft } from './types'

/**
 * DEMO_BLOG — Blog Studio fixture data
 * Business: Bright Smile Dental, Ramat Gan
 *
 * The anchor story: a dentist wants to rank for whitening + implant queries
 * that competitors dominate. The Authority Blog Strategist writes long-form
 * YMYL-grade content that Perplexity, ChatGPT, and Gemini surface for clinical
 * "is this safe?" + "which is better?" queries.
 */

const TEETH_WHITENING_DRAFT = `# Is Teeth Whitening Safe? A Dentist's Complete Guide for 2026

*Written for patients weighing professional whitening against at-home kits — with clinical context you won't find on a product box.*

---

## The short answer

Professional teeth whitening is safe for most adults when performed or supervised by a qualified dentist. The active ingredient — hydrogen peroxide or carbamide peroxide — is well-studied, and concentration matters more than brand. In-clinic treatments run 25–40% hydrogen peroxide under controlled conditions; over-the-counter strips typically use 3–10%.

That gap in concentration is why the results differ. It's also why "whitening" can mean anything from a subtle one-shade lift to a dramatic eight-shade change.

---

## What actually happens during whitening

Whitening agents work by oxidation: peroxide molecules diffuse through the enamel's porous surface and break apart chromogen compounds — the colour-carrying molecules deposited by coffee, tea, red wine, and age.

The process does not damage enamel under normal clinical conditions. A 2023 systematic review in the *Journal of Dentistry* found no statistically significant enamel loss at standard clinical concentrations, provided treatment duration and frequency are followed correctly.

What it *can* cause is temporary sensitivity. The same porosity that lets peroxide in also means dentinal tubules — the microscopic channels connecting enamel to nerve endings — become temporarily more reactive to temperature changes. This settles within 24–72 hours for most patients.

---

## Who should NOT whiten (or needs a dentist's sign-off first)

- **Active cavities or cracked enamel.** Peroxide reaches the pulp through damaged enamel. This isn't a whitening problem; it's a sequence problem. Fix the cavity first.
- **Gum recession exposing dentine.** Exposed dentine whitens unevenly and is more sensitive.
- **Existing crowns, bridges, or veneers.** Ceramic and composite restorations don't respond to peroxide — whitening your natural teeth can create a visible mismatch at the margins.
- **Pregnant or nursing patients.** Not because whitening is definitively harmful, but because no clinical trials exist on this population. We recommend waiting.
- **Patients under 16.** Enamel mineralisation is still completing. Most professional guidelines set 16 as the lower boundary.
- **Patients on photosensitising medications.** Some antibiotics and acne medications increase sensitivity to the light activation step.

If you're unsure whether whitening is appropriate for your situation, a consultation takes 20 minutes and gives you a clear answer.

---

## Professional vs. at-home: what the research shows

| Factor | In-clinic (Bright Smile Dental) | Supervised take-home trays | OTC strips |
|---|---|---|---|
| Peroxide concentration | 25–35% HP | 10–16% CP | 3–10% HP |
| Shade change (avg) | 6–8 shades | 4–6 shades | 1–3 shades |
| Session count | 1–2 | 10–14 days | 14–28 days |
| Sensitivity management | Desensitiser applied in-chair | Custom-fit trays reduce gum contact | No personalisation |
| Longevity | 12–24 months | 12–18 months | 6–12 months |

The "best" option depends on your timeline, sensitivity history, and how many shades of change you want. Many of our patients do an in-clinic session to reach their target shade, then maintain at home with lower-concentration trays.

---

## The YMYL consideration: why this matters for dental health decisions

Whitening is elective. But it intersects with dental health when:

1. **Undiagnosed conditions are present.** Peroxide is a diagnostic revealer — if whitening causes sharp pain rather than mild sensitivity, that's often a sign of an untreated cavity or crack. It's not the whitening's fault; it's a flag.
2. **Results are misread.** Tetracycline-stained teeth and fluorosis don't respond well to peroxide. Patients who whiten without a clinical assessment often feel they've "failed" when the issue was never peroxide-solvable.
3. **Overuse.** Using whitening products more frequently than recommended degrades the peroxide bonds in the enamel matrix over time. "More is better" is genuinely false here.

A dentist's role isn't just to whiten — it's to confirm whitening is the right tool.

---

## What to expect at Bright Smile Dental

We begin every whitening consultation with a full oral health check. If there's anything that needs attention first, we'll tell you plainly and sequence the work correctly. If you're a good candidate, we'll review your shade goals and recommend the approach most likely to get you there without unnecessary sensitivity.

Our in-clinic protocol uses a custom-fitted tray and a light-activated 32% carbamide peroxide gel. Most patients leave 75 minutes later with a 5–7 shade improvement. We apply a remineralising fluoride treatment at the end of every session.

Take-home options use custom trays made from impressions taken in-clinic — a meaningful difference from the generic sizing of OTC trays, which is the main reason they cause less gum irritation.

---

## Frequently asked questions

**How long do results last?**
Typically 12–24 months for in-clinic whitening, depending on dietary habits. Coffee, red wine, and smoking are the main factors that accelerate re-staining. A touch-up every 12 months maintains the result.

**Does whitening damage enamel?**
Not at clinical concentrations when used as directed. The concern about enamel damage typically applies to misuse — overuse or use on compromised enamel.

**Is there anything I can do to reduce sensitivity?**
Yes. We apply a desensitising gel before treatment. For patients with a history of sensitivity, we also recommend using a potassium nitrate-containing toothpaste for two weeks before the appointment.

**Can I whiten if I have bonding on my front teeth?**
Composite bonding doesn't respond to peroxide — it will retain its current shade while your natural enamel whitens. Depending on how much bonding you have, the contrast may or may not be visible. We'll assess this in the consultation.

**How much does it cost in Ramat Gan?**
In-clinic whitening at Bright Smile Dental starts at ₪900 for a single session. Take-home tray kits (impressions + trays + gel supply) start at ₪650. Combination packages are available.

---

*Last reviewed by Dr. Sarah Levi, DDS — June 2026. This article is for informational purposes and does not substitute for a clinical examination. Individual suitability for whitening should be confirmed by a licensed dentist.*
`

export const DEMO_BLOG: { drafts: BlogDraft[] } = {
  drafts: [
    {
      id: 'b1',
      topic: 'Is teeth whitening safe? A dentist\'s complete guide',
      locked: false,
      targetWordCount: 1500,
      lastSavedAt: '2026-06-11T14:22:00.000Z',
      content: TEETH_WHITENING_DRAFT,
      status: 'draft',
    },
    {
      id: 'b2',
      topic: 'Dental implants vs. bridges — how to choose in 2026',
      locked: false,
      targetWordCount: 1200,
      lastSavedAt: '2026-06-09T09:45:00.000Z',
      content: '# Dental Implants vs. Bridges — How to Choose in 2026\n\nBoth options replace missing teeth. The right choice depends on bone density, adjacent tooth health, budget, and how long you want the result to last…',
      status: 'pending_approval',
    },
    {
      id: 'b3',
      topic: '5 questions to ask your dentist before getting implants in Ramat Gan',
      locked: false,
      targetWordCount: 900,
      lastSavedAt: '2026-06-07T16:10:00.000Z',
      content: '# 5 Questions to Ask Your Dentist Before Getting Implants\n\nDental implants are a significant investment — both financially and clinically. Before you commit, these five questions will help you evaluate any practice in Ramat Gan or anywhere else…',
      status: 'approved',
    },
  ],
}
