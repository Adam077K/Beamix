import type { PromptRow, PromptDrawerData } from './types'

/**
 * DEMO_PROMPTS — Prompt/Query Explorer fixture data
 * Business: Bright Smile Dental, Ramat Gan, Israel
 *
 * 10 rich dental prompts covering: branded, non-branded, local, procedure-specific.
 * Engines: ChatGPT, Gemini, Perplexity.
 * Tone: real Israeli dental market language (Hebrew/English queries).
 */
export const DEMO_PROMPTS = {
  /** Sparkline points for the ContextStat — tracked prompt count over last 5 runs */
  sparklinePoints: [6, 7, 8, 8, 10] as number[],

  rows: [
    {
      id: 'p1',
      query: 'best teeth whitening Ramat Gan',
      frequency: 54,
      competitorEngines: ['ChatGPT', 'Gemini', 'Perplexity'],
      coCitations: 4,
      intent: 'transactional',
      covered: false,
    },
    {
      id: 'p2',
      query: 'invisalign cost israel 2026',
      frequency: 47,
      competitorEngines: ['ChatGPT', 'Perplexity'],
      coCitations: 3,
      intent: 'informational',
      covered: false,
    },
    {
      id: 'p3',
      query: 'emergency dentist Ramat Gan night',
      frequency: 38,
      competitorEngines: ['Perplexity'],
      coCitations: 1,
      intent: 'transactional',
      covered: true,
    },
    {
      id: 'p4',
      query: 'dental implants price Tel Aviv area',
      frequency: 33,
      competitorEngines: ['Gemini', 'Perplexity'],
      coCitations: 2,
      intent: 'informational',
      covered: false,
    },
    {
      id: 'p5',
      query: 'family dentist near Ramat Gan',
      frequency: 29,
      competitorEngines: ['ChatGPT', 'Gemini'],
      coCitations: 3,
      intent: 'transactional',
      covered: false,
    },
    {
      id: 'p6',
      query: 'Bright Smile Dental reviews',
      frequency: 26,
      competitorEngines: [],
      coCitations: 0,
      intent: 'navigational',
      covered: true,
    },
    {
      id: 'p7',
      query: 'root canal treatment Ramat Gan cost',
      frequency: 21,
      competitorEngines: ['Perplexity'],
      coCitations: 1,
      intent: 'informational',
      covered: false,
    },
    {
      id: 'p8',
      query: 'pediatric dentist Gush Dan english speaking',
      frequency: 18,
      competitorEngines: ['ChatGPT'],
      coCitations: 2,
      intent: 'transactional',
      covered: false,
    },
    {
      id: 'p9',
      query: 'teeth cleaning appointment same day Tel Aviv',
      frequency: 15,
      competitorEngines: [],
      coCitations: 0,
      intent: 'transactional',
      covered: true,
    },
    {
      id: 'p10',
      query: 'dental crown vs bridge which is better',
      frequency: 12,
      competitorEngines: ['Gemini', 'ChatGPT'],
      coCitations: 2,
      intent: 'informational',
      covered: false,
    },
  ] as PromptRow[],

  /** Per-prompt drawer data keyed by prompt id */
  drawerData: {
    p1: {
      promptId: 'p1',
      query: 'best teeth whitening Ramat Gan',
      tree: [
        {
          engine: 'ChatGPT',
          citations: [
            {
              domain: 'smile-center-rg.co.il',
              title: 'Smile Center Ramat Gan — Teeth Whitening',
              snippet:
                'Professional in-chair whitening and take-home kits available. Results visible after one session.',
            },
            {
              domain: 'dentalplus-il.co.il',
              title: 'Dental Plus Ramat Gan',
              snippet:
                'ZOOM whitening from ₪790. Evening and weekend appointments.',
            },
          ],
        },
        {
          engine: 'Gemini',
          citations: [
            {
              domain: 'smile-center-rg.co.il',
              title: 'Smile Center Ramat Gan — Whitening Treatments',
              snippet:
                'Rated 4.9 on Google. Whitening packages from ₪650 with follow-up kit.',
            },
            {
              domain: 'whitesmile-dental.co.il',
              title: 'White Smile Dental — Ramat Gan',
              snippet:
                'Boutique whitening clinic. Laser and tray systems, certified Opalescence providers.',
            },
          ],
        },
        {
          engine: 'Perplexity',
          citations: [
            {
              domain: 'smile-center-rg.co.il',
              title: 'Best Teeth Whitening Clinics in Ramat Gan 2026',
              snippet:
                'Smile Center tops local rankings for whitening. Consistent patient reviews note lasting results.',
            },
            {
              domain: 'dentalplus-il.co.il',
              title: 'Dental Plus — Top Whitening Provider Ramat Gan',
              snippet:
                'Dental Plus cited in multiple local guides for affordable ZOOM whitening with no-wait scheduling.',
            },
            {
              domain: 'zap.co.il',
              title: 'Dentists Ramat Gan — Whitening Services',
              snippet:
                'Aggregated listing: 6 clinics offering whitening in Ramat Gan; Bright Smile absent from this list.',
            },
          ],
        },
      ],
      intent: 'transactional',
      gapDescription:
        'No page on your site specifically targets "teeth whitening Ramat Gan" as a landing page. Competitors own this query across all three engines. A dedicated whitening service page with local pricing and booking CTA would close this gap.',
    } as PromptDrawerData,

    p2: {
      promptId: 'p2',
      query: 'invisalign cost israel 2026',
      tree: [
        {
          engine: 'ChatGPT',
          citations: [
            {
              domain: 'smiledirect-il.co.il',
              title: 'Invisalign Israel — Pricing Guide 2026',
              snippet:
                'Full Invisalign treatment starts at ₪8,500 in Israel. Lite cases from ₪5,200.',
            },
            {
              domain: 'ortho-center-tlv.co.il',
              title: 'Orthodontic Center Tel Aviv — Invisalign Costs',
              snippet:
                'Certified Invisalign provider. Free consultation, treatment plans start at ₪7,800.',
            },
          ],
        },
        {
          engine: 'Perplexity',
          citations: [
            {
              domain: 'smiledirect-il.co.il',
              title: 'How much does Invisalign cost in Israel?',
              snippet:
                'Average cost ₪8,000–₪12,000 depending on case complexity. Interest-free payment plans available at most clinics.',
            },
            {
              domain: 'doctor-il.com',
              title: 'Find Invisalign Providers Near You — Israel',
              snippet:
                'Directory of 43 certified Invisalign providers in Israel. Filter by location, price, and availability.',
            },
          ],
        },
      ],
      intent: 'informational',
      gapDescription:
        'Your Invisalign service page lacks a pricing section and does not appear in any aggregated directory for this query. Adding a transparent pricing range and registering on doctor-il.com and similar directories would significantly improve visibility for this high-volume query.',
    } as PromptDrawerData,

    p3: {
      promptId: 'p3',
      query: 'emergency dentist Ramat Gan night',
      tree: [
        {
          engine: 'Perplexity',
          citations: [
            {
              domain: 'brightsmile-dental.co.il',
              title: 'Emergency Dental Care in Ramat Gan — Bright Smile Dental',
              snippet:
                'After-hours dental slots Monday and Thursday mornings. Severe pain and knocked-out teeth seen same-day.',
            },
          ],
        },
      ],
      intent: 'transactional',
      gapDescription: null,
    } as PromptDrawerData,

    p4: {
      promptId: 'p4',
      query: 'dental implants price Tel Aviv area',
      tree: [
        {
          engine: 'Gemini',
          citations: [
            {
              domain: 'implant-center-tlv.co.il',
              title: 'Dental Implants Tel Aviv — Complete Price Guide',
              snippet:
                'Single implant + crown from ₪4,200. All-on-4 packages from ₪28,000. Israeli brands available.',
            },
            {
              domain: 'teudat-bri-ut-il.gov.il',
              title: 'Ministry of Health — Dental Implant Standards',
              snippet:
                'Certified implant procedures must meet ISO 14801. Average market cost ₪4,500–₪6,500 per implant.',
            },
          ],
        },
        {
          engine: 'Perplexity',
          citations: [
            {
              domain: 'implant-center-tlv.co.il',
              title: 'Best Dental Implant Clinics in the Tel Aviv Area',
              snippet:
                'ImplantCenter rated #1 in Gush Dan for implant procedures. Multi-unit discounts available.',
            },
            {
              domain: 'zap.co.il',
              title: 'Dental Implants Near Ramat Gan — Compare Prices',
              snippet:
                'Compare 14 clinics for implants in the Ramat Gan area. Price range ₪3,900–₪7,200 per implant.',
            },
          ],
        },
      ],
      intent: 'informational',
      gapDescription:
        'Your implants service page does not include pricing information or case examples. Competitors who publish transparent pricing ranges dominate this query. Adding a "How much do implants cost?" section with a realistic range and financing options would capture high-intent research traffic.',
    } as PromptDrawerData,

    p5: {
      promptId: 'p5',
      query: 'family dentist near Ramat Gan',
      tree: [
        {
          engine: 'ChatGPT',
          citations: [
            {
              domain: 'smile-center-rg.co.il',
              title: 'Family Dentistry Ramat Gan — Smile Center',
              snippet:
                'Treating patients from 2 years old. Family packages available with combined hygiene appointments.',
            },
            {
              domain: 'dental-kids-il.co.il',
              title: 'Family and Pediatric Dentist Ramat Gan',
              snippet:
                'Specialised in anxious children and teens. Hebrew, English, Russian-speaking staff.',
            },
          ],
        },
        {
          engine: 'Gemini',
          citations: [
            {
              domain: 'smile-center-rg.co.il',
              title: 'Smile Center — Family Dental Practice',
              snippet:
                'Comprehensive family care: routine check-ups, orthodontics referrals, emergency slots.',
            },
            {
              domain: 'yelp.co.il',
              title: 'Best Family Dentists in Ramat Gan — Yelp Reviews',
              snippet:
                'Top 5 family dentists in Ramat Gan based on 780+ reviews. Bright Smile not listed.',
            },
          ],
        },
      ],
      intent: 'transactional',
      gapDescription:
        'Bright Smile Dental does not appear in Yelp IL and other review aggregators for "family dentist" searches. Competitors with Yelp and Zap profiles consistently rank for this query. Optimising your Yelp IL listing and adding a Family Dentistry service page would address both gaps.',
    } as PromptDrawerData,

    p6: {
      promptId: 'p6',
      query: 'Bright Smile Dental reviews',
      tree: [
        {
          engine: 'ChatGPT',
          citations: [
            {
              domain: 'brightsmile-dental.co.il',
              title: 'Bright Smile Dental — Patient Reviews',
              snippet:
                '4.8 average rating across 214 reviews. Patients highlight Dr. Cohen and the welcoming environment.',
            },
          ],
        },
        {
          engine: 'Gemini',
          citations: [
            {
              domain: 'brightsmile-dental.co.il',
              title: 'Bright Smile Dental Ramat Gan — About Us',
              snippet:
                'Established 2011. Board-certified general and cosmetic dentistry in a modern clinic.',
            },
          ],
        },
        {
          engine: 'Perplexity',
          citations: [
            {
              domain: 'brightsmile-dental.co.il',
              title: 'Bright Smile Dental Ramat Gan',
              snippet:
                'Verified dental practice with strong online presence. Consistently cited in local dental searches.',
            },
          ],
        },
      ],
      intent: 'navigational',
      gapDescription: null,
    } as PromptDrawerData,

    p7: {
      promptId: 'p7',
      query: 'root canal treatment Ramat Gan cost',
      tree: [
        {
          engine: 'Perplexity',
          citations: [
            {
              domain: 'dental-cost-il.co.il',
              title: 'Root Canal Cost in Israel 2026',
              snippet:
                'Root canal in Israel: front tooth ₪800–₪1,200, molar ₪1,400–₪2,000. Most clinics in Ramat Gan fall within this range.',
            },
          ],
        },
      ],
      intent: 'informational',
      gapDescription:
        'No content on your site discusses root canal pricing or the procedure. This high-anxiety query (patients fearing cost surprises) is entirely owned by generic cost guides. A dedicated FAQ page addressing "how much does a root canal cost in Ramat Gan" would capture this traffic.',
    } as PromptDrawerData,

    p8: {
      promptId: 'p8',
      query: 'pediatric dentist Gush Dan english speaking',
      tree: [
        {
          engine: 'ChatGPT',
          citations: [
            {
              domain: 'dental-kids-il.co.il',
              title: 'English-Speaking Pediatric Dentist Tel Aviv & Gush Dan',
              snippet:
                'English-speaking team. Specialised in anxious children and first-time visits. Online booking.',
            },
            {
              domain: 'expatangels.co.il',
              title: 'English Dentists in the Tel Aviv Area — Expat Guide',
              snippet:
                'Vetted list of English-speaking dental practices in Ramat Gan, Tel Aviv, and Herzliya.',
            },
          ],
        },
      ],
      intent: 'transactional',
      gapDescription:
        'Your site does not mention that staff speak English, which is a key filter for English-speaking expat families searching for pediatric care. Adding "English-speaking staff" to your About page and a contact page note would surface you for this underserved query in the expat community.',
    } as PromptDrawerData,

    p9: {
      promptId: 'p9',
      query: 'teeth cleaning appointment same day Tel Aviv',
      tree: [],
      intent: 'transactional',
      gapDescription: null,
    } as PromptDrawerData,

    p10: {
      promptId: 'p10',
      query: 'dental crown vs bridge which is better',
      tree: [
        {
          engine: 'Gemini',
          citations: [
            {
              domain: 'webmd.com',
              title: 'Dental Crown vs. Bridge: Which Is Right for You?',
              snippet:
                'Crowns protect a damaged tooth; bridges replace a missing one. Choice depends on bone health and adjacent teeth condition.',
            },
            {
              domain: 'healthline.com',
              title: 'Dental Crown vs Bridge — Healthline Guide',
              snippet:
                'A bridge typically requires preparing adjacent healthy teeth. Implants are often preferred for single-tooth replacement.',
            },
          ],
        },
        {
          engine: 'ChatGPT',
          citations: [
            {
              domain: 'ada.org',
              title: 'American Dental Association — Crowns and Bridges',
              snippet:
                'Crowns last 5–15 years with proper care. Bridges require the grinding of adjacent healthy teeth.',
            },
            {
              domain: 'brightsmile-dental.co.il',
              title: 'Dental Crown vs Bridge — Bright Smile Dental',
              snippet:
                'We help patients in Ramat Gan choose between crowns, bridges, and implants based on their specific situation.',
            },
          ],
        },
      ],
      intent: 'informational',
      gapDescription:
        'Your article on this topic ranks on ChatGPT but is missing from Gemini, which cites global health publications instead. Strengthening the article with clinical data citations, a local pricing comparison, and a clear recommendation structure would improve its Gemini ranking.',
    } as PromptDrawerData,
  } as Record<string, PromptDrawerData>,

  /**
   * Uncited gap list — prompts that competitors own but Bright Smile doesn't appear for.
   * Shown in the drawer rail and as a dedicated section in the empty state.
   */
  uncitedGaps: [
    {
      id: 'gap-1',
      query: 'teeth whitening price comparison Ramat Gan',
      volume: 'High',
      ownedBy: ['Smile Center', 'Dental Plus'],
    },
    {
      id: 'gap-2',
      query: 'invisalign vs braces cost israel',
      volume: 'High',
      ownedBy: ['SmileDirect IL', 'Ortho Center TLV'],
    },
    {
      id: 'gap-3',
      query: 'best dentist for anxiety patients Gush Dan',
      volume: 'Medium',
      ownedBy: ['Dental Kids IL'],
    },
    {
      id: 'gap-4',
      query: 'dental financing options Israel 0 interest',
      volume: 'Medium',
      ownedBy: ['Implant Center TLV'],
    },
    {
      id: 'gap-5',
      query: 'kids first dentist visit Ramat Gan',
      volume: 'Medium',
      ownedBy: ['Smile Center', 'Dental Kids IL'],
    },
  ],
} as const
