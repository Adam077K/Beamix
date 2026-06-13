import type { ContentDoc, ContentDiff } from './types'

/**
 * DEMO_CONTENT — Content Editor fixture data
 * Business: Bright Smile Dental, Ramat Gan
 *
 * Three tabs (Optimize / Refresh / FAQ), each with a full ContentDoc
 * and a rich ContentDiff reflecting real dental GEO content work.
 *
 * Content tone follows DEMO_APPROVALS whitening/insurance FAQ style:
 * warm, specific, local, no jargon.
 */
export const DEMO_CONTENT: {
  docs: ContentDoc[]
  diffs: Record<string, ContentDiff>
  faqItems: { question: string; answer: string; targetQuery: string }[]
  pageLockConflictDoc: ContentDoc
} = {
  docs: [
    {
      id: 'c1',
      url: 'https://brightsmile-dental.co.il/services/whitening',
      title: 'Teeth Whitening — Bright Smile Dental',
      tab: 'optimize',
      wordCount: 412,
      daysSinceUpdate: 47,
      visibilityScore: 31,
      pageLocked: false,
    },
    {
      id: 'c2',
      url: 'https://brightsmile-dental.co.il/services/implants',
      title: 'Dental Implants — Bright Smile Dental',
      tab: 'refresh',
      wordCount: 638,
      daysSinceUpdate: 92,
      visibilityScore: 18,
      pageLocked: false,
    },
    {
      id: 'c3',
      url: 'https://brightsmile-dental.co.il/faq',
      title: 'FAQ — Bright Smile Dental',
      tab: 'faq',
      wordCount: 280,
      daysSinceUpdate: 14,
      visibilityScore: 44,
      pageLocked: false,
    },
    {
      // A genuinely DISTINCT optimize-target page — NOT a duplicate of c1.
      // Carries the page-lock demo scenario (a run is already active here).
      id: 'c4',
      url: 'https://brightsmile-dental.co.il/services/veneers',
      title: 'Porcelain Veneers — Bright Smile Dental',
      tab: 'optimize',
      wordCount: 521,
      daysSinceUpdate: 63,
      visibilityScore: 22,
      pageLocked: true, // demo page-lock scenario
    },
  ] as ContentDoc[],

  /**
   * pageLockConflictDoc — a doc that is currently page-locked by another run.
   * Used to show the page-lock conflict error state. Points to the distinct
   * locked optimize page (c4 — Porcelain Veneers).
   */
  pageLockConflictDoc: {
    id: 'c4',
    url: 'https://brightsmile-dental.co.il/services/veneers',
    title: 'Porcelain Veneers — Bright Smile Dental',
    tab: 'optimize',
    wordCount: 521,
    daysSinceUpdate: 63,
    visibilityScore: 22,
    pageLocked: true,
  } as ContentDoc,

  diffs: {
    // Optimize — whitening page full diff
    c1: {
      docId: 'c1',
      before: `## Teeth Whitening at Bright Smile Dental

We offer professional teeth whitening at our clinic in Ramat Gan. Our treatments are safe and effective.

**Services include:**
- In-clinic whitening
- Take-home trays

Contact us to book your appointment.`,
      after: `## Teeth Whitening in Ramat Gan — Results in One Visit

Professional teeth whitening in Ramat Gan starts from ₪600 and delivers visible results in a single 60-minute in-clinic session. At Bright Smile Dental we offer both power whitening (in-clinic) and custom take-home trays for touch-ups.

**How much does teeth whitening cost in Ramat Gan?**
In-clinic power whitening: ₪600–₪900 depending on degree of staining. Take-home trays: ₪350–₪500 including custom molds. Most patients see 4–8 shades of improvement after one session.

**Is teeth whitening safe?**
Yes — all treatments use clinically approved hydrogen peroxide concentrations. Mild sensitivity for 24–48 hours is normal and resolves on its own.

**Book a whitening consultation** — slots available Monday through Friday. Call 03-XXX-XXXX or use our online booking form.`,
      diffLines: [
        { type: 'removed', content: '## Teeth Whitening at Bright Smile Dental' },
        { type: 'added', content: '## Teeth Whitening in Ramat Gan — Results in One Visit' },
        { type: 'unchanged', content: '' },
        { type: 'removed', content: 'We offer professional teeth whitening at our clinic in Ramat Gan. Our treatments are safe and effective.' },
        { type: 'added', content: 'Professional teeth whitening in Ramat Gan starts from ₪600 and delivers visible results in a single 60-minute in-clinic session. At Bright Smile Dental we offer both power whitening (in-clinic) and custom take-home trays for touch-ups.' },
        { type: 'unchanged', content: '' },
        { type: 'removed', content: '**Services include:**' },
        { type: 'removed', content: '- In-clinic whitening' },
        { type: 'removed', content: '- Take-home trays' },
        { type: 'removed', content: '' },
        { type: 'removed', content: 'Contact us to book your appointment.' },
        { type: 'added', content: '**How much does teeth whitening cost in Ramat Gan?**' },
        { type: 'added', content: 'In-clinic power whitening: ₪600–₪900 depending on degree of staining. Take-home trays: ₪350–₪500 including custom molds. Most patients see 4–8 shades of improvement after one session.' },
        { type: 'added', content: '' },
        { type: 'added', content: '**Is teeth whitening safe?**' },
        { type: 'added', content: 'Yes — all treatments use clinically approved hydrogen peroxide concentrations. Mild sensitivity for 24–48 hours is normal and resolves on its own.' },
        { type: 'added', content: '' },
        { type: 'added', content: '**Book a whitening consultation** — slots available Monday through Friday. Call 03-XXX-XXXX or use our online booking form.' },
      ],
    } as ContentDiff,

    // Refresh — implants page, stale at 92 days
    c2: {
      docId: 'c2',
      before: `## Dental Implants

Dental implants are a permanent solution for missing teeth. They look and feel like natural teeth.

Our clinic offers implant placement using modern techniques. Recovery takes several months.

Call us for a consultation.`,
      after: `## Dental Implants in Ramat Gan — Permanent, Natural-Looking Results

Dental implants replace missing teeth with titanium roots and ceramic crowns that look, feel, and function like your natural teeth. At Bright Smile Dental we use same-day scanning and digital planning to shorten total treatment time.

**How long does the implant process take?**
Initial placement: 45–60 minutes under local anesthetic. Osseointegration (healing): 6–12 weeks depending on bone density. Final crown fitting: 2 weeks after healing. Many patients are fully functional within 3 months.

**How much do dental implants cost in Ramat Gan?**
Single implant (titanium root + ceramic crown): ₪6,500–₪9,500. Full-mouth rehabilitation pricing available on consultation. Most major health funds cover partial costs — we can help you check your eligibility.

**Am I a candidate for implants?**
Most adults with healthy gums are candidates. Bone grafting may be needed if there has been significant bone loss — our 3D CBCT scan assesses this at the first consultation at no extra charge.`,
      diffLines: [
        { type: 'removed', content: '## Dental Implants' },
        { type: 'added', content: '## Dental Implants in Ramat Gan — Permanent, Natural-Looking Results' },
        { type: 'unchanged', content: '' },
        { type: 'removed', content: 'Dental implants are a permanent solution for missing teeth. They look and feel like natural teeth.' },
        { type: 'added', content: 'Dental implants replace missing teeth with titanium roots and ceramic crowns that look, feel, and function like your natural teeth. At Bright Smile Dental we use same-day scanning and digital planning to shorten total treatment time.' },
        { type: 'unchanged', content: '' },
        { type: 'removed', content: 'Our clinic offers implant placement using modern techniques. Recovery takes several months.' },
        { type: 'removed', content: '' },
        { type: 'removed', content: 'Call us for a consultation.' },
        { type: 'added', content: '**How long does the implant process take?**' },
        { type: 'added', content: 'Initial placement: 45–60 minutes under local anesthetic. Osseointegration (healing): 6–12 weeks depending on bone density. Final crown fitting: 2 weeks after healing. Many patients are fully functional within 3 months.' },
        { type: 'added', content: '' },
        { type: 'added', content: '**How much do dental implants cost in Ramat Gan?**' },
        { type: 'added', content: 'Single implant (titanium root + ceramic crown): ₪6,500–₪9,500. Full-mouth rehabilitation pricing available on consultation. Most major health funds cover partial costs — we can help you check your eligibility.' },
        { type: 'added', content: '' },
        { type: 'added', content: '**Am I a candidate for implants?**' },
        { type: 'added', content: 'Most adults with healthy gums are candidates. Bone grafting may be needed if there has been significant bone loss — our 3D CBCT scan assesses this at the first consultation at no extra charge.' },
      ],
    } as ContentDiff,

    // FAQ — generated FAQ items rendered via faqItems below
    c3: {
      docId: 'c3',
      before: `## Frequently Asked Questions

**Do you accept Clalit health insurance?**
Yes, we accept Clalit.

**What are your opening hours?**
Sunday to Thursday, 8am–7pm.`,
      after: `## Frequently Asked Questions

**How much does teeth whitening cost in Ramat Gan?**
Professional teeth whitening in Ramat Gan typically costs between ₪600–₪1,200 depending on the method chosen. At Bright Smile Dental, we offer both in-clinic power whitening and take-home trays — book a consultation to find the right fit for your goals and budget.

**What should I do in a dental emergency at night in Ramat Gan?**
If you experience severe pain, a knocked-out tooth, or a cracked crown outside of office hours, call the Maccabi after-hours dental line at *3555. For a knocked-out tooth: keep it moist (milk or saline), do not scrub it, and reach emergency care within 30 minutes for the best chance of reimplantation.

**Do you accept Clalit health insurance?**
Yes, we accept Clalit. We also work with Maccabi, Meuhedet, and Leumit. Bring your health fund card to your first appointment and we'll confirm your coverage on the spot.

**What are your opening hours?**
Sunday to Thursday, 8am–7pm. Emergency slots are available Monday and Thursday mornings — call ahead to secure one.

**How long does a dental implant procedure take?**
The initial placement takes 45–60 minutes under local anesthetic. Healing (osseointegration) takes 6–12 weeks, followed by a 2-week crown-fitting phase. Most patients are fully functional within 3 months.`,
      diffLines: [
        { type: 'unchanged', content: '## Frequently Asked Questions' },
        { type: 'unchanged', content: '' },
        { type: 'added', content: '**How much does teeth whitening cost in Ramat Gan?**' },
        { type: 'added', content: 'Professional teeth whitening in Ramat Gan typically costs between ₪600–₪1,200 depending on the method chosen. At Bright Smile Dental, we offer both in-clinic power whitening and take-home trays — book a consultation to find the right fit for your goals and budget.' },
        { type: 'added', content: '' },
        { type: 'added', content: '**What should I do in a dental emergency at night in Ramat Gan?**' },
        { type: 'added', content: 'If you experience severe pain, a knocked-out tooth, or a cracked crown outside of office hours, call the Maccabi after-hours dental line at *3555. For a knocked-out tooth: keep it moist (milk or saline), do not scrub it, and reach emergency care within 30 minutes for the best chance of reimplantation.' },
        { type: 'added', content: '' },
        { type: 'removed', content: '**Do you accept Clalit health insurance?**' },
        { type: 'removed', content: 'Yes, we accept Clalit.' },
        { type: 'added', content: '**Do you accept Clalit health insurance?**' },
        { type: 'added', content: 'Yes, we accept Clalit. We also work with Maccabi, Meuhedet, and Leumit. Bring your health fund card to your first appointment and we\'ll confirm your coverage on the spot.' },
        { type: 'unchanged', content: '' },
        { type: 'removed', content: '**What are your opening hours?**' },
        { type: 'removed', content: 'Sunday to Thursday, 8am–7pm.' },
        { type: 'added', content: '**What are your opening hours?**' },
        { type: 'added', content: 'Sunday to Thursday, 8am–7pm. Emergency slots are available Monday and Thursday mornings — call ahead to secure one.' },
        { type: 'added', content: '' },
        { type: 'added', content: '**How long does a dental implant procedure take?**' },
        { type: 'added', content: 'The initial placement takes 45–60 minutes under local anesthetic. Healing (osseointegration) takes 6–12 weeks, followed by a 2-week crown-fitting phase. Most patients are fully functional within 3 months.' },
      ],
    } as ContentDiff,
  },

  /**
   * faqItems — the FAQ Builder output rendered as individual cards
   * before the user approves. These are the generated FAQs shown in the
   * populated state of the FAQ tab.
   */
  faqItems: [
    {
      question: 'How much does teeth whitening cost in Ramat Gan?',
      answer:
        'Professional teeth whitening in Ramat Gan typically costs between ₪600–₪1,200 depending on the method chosen. At Bright Smile Dental, we offer both in-clinic power whitening and take-home trays — book a consultation to find the right fit for your goals and budget.',
      targetQuery: 'teeth whitening cost Ramat Gan',
    },
    {
      question: 'What should I do in a dental emergency at night in Ramat Gan?',
      answer:
        'If you experience severe pain, a knocked-out tooth, or a cracked crown outside of office hours, call the Maccabi after-hours dental line at *3555. For a knocked-out tooth: keep it moist (milk or saline), do not scrub it, and reach emergency care within 30 minutes for the best chance of reimplantation. At Bright Smile Dental, we hold emergency slots on Monday and Thursday mornings — call ahead to secure one.',
      targetQuery: 'dental emergency Ramat Gan night',
    },
    {
      question: 'How long does a dental implant procedure take in Ramat Gan?',
      answer:
        'The initial implant placement takes 45–60 minutes under local anesthetic. Osseointegration (healing) takes 6–12 weeks depending on bone density. The final crown fitting takes around 2 weeks after healing is confirmed. Most patients at Bright Smile Dental are fully functional within 3 months of starting treatment.',
      targetQuery: 'dental implant procedure time Ramat Gan',
    },
  ],
}
