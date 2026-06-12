import type {
  DemoShopping,
  ShoppingSku,
  ShoppingDrillRow,
} from './types'

/**
 * DEMO_SHOPPING — Shopping / Ecommerce surface fixture
 * Business: Bright Smile Dental, Ramat Gan — online dental-product shop
 *
 * Story arc: the clinic runs an adjacent e-commerce shop selling dental care
 * products. AI shopping visibility is at 58% overall. Two SKUs have incorrect
 * attribute claims in AI responses (flagged in violet with correct-this anchors).
 * The Whitening Kit Pro has an incorrect price claim; the Night Guard has a
 * wrong specs claim. Both link to the agent intent URL.
 */

// ---------------------------------------------------------------------------
// SKUs
// ---------------------------------------------------------------------------

const skus: ShoppingSku[] = [
  {
    id: 'sku-whitening-kit',
    name: 'Whitening Kit Pro',
    aiVisibility: 74,
    position: 2,
    aiRevenue: 8420,
    attributeMatrix: {
      price: {
        correct: false,
        claimedValue: '₪149',
        actualValue: '₪179',
        claimId: 'shop-claim-1',
        correctHref: '/agents/new?intent=correct_attribute&claim_id=shop-claim-1',
      },
      specs: {
        correct: true,
        claimedValue: '10 × 2ml syringes, LED accelerator, 14-day kit',
        actualValue: '10 × 2ml syringes, LED accelerator, 14-day kit',
      },
      availability: {
        correct: true,
        claimedValue: 'In stock',
        actualValue: 'In stock',
      },
    },
    shopperSentiment: { positive: 81, neutral: 14, negative: 5 },
  },
  {
    id: 'sku-sonic-brush',
    name: 'Sonic Electric Brush',
    aiVisibility: 61,
    position: 4,
    aiRevenue: 5840,
    attributeMatrix: {
      price: {
        correct: true,
        claimedValue: '₪229',
        actualValue: '₪229',
      },
      specs: {
        correct: true,
        claimedValue: '38,000 strokes/min, 3 modes, 4-week battery',
        actualValue: '38,000 strokes/min, 3 modes, 4-week battery',
      },
      availability: {
        correct: true,
        claimedValue: 'In stock',
        actualValue: 'In stock',
      },
    },
    shopperSentiment: { positive: 76, neutral: 18, negative: 6 },
  },
  {
    id: 'sku-aligner-foam',
    name: 'Aligner Care Foam',
    aiVisibility: 55,
    position: 6,
    aiRevenue: 3210,
    attributeMatrix: {
      price: {
        correct: true,
        claimedValue: '₪69',
        actualValue: '₪69',
      },
      specs: {
        correct: true,
        claimedValue: '50ml, alcohol-free, Invisalign compatible',
        actualValue: '50ml, alcohol-free, Invisalign compatible',
      },
      availability: {
        correct: true,
        claimedValue: 'In stock',
        actualValue: 'In stock',
      },
    },
    shopperSentiment: { positive: 69, neutral: 24, negative: 7 },
  },
  {
    id: 'sku-night-guard',
    name: 'Night Guard — Custom Fit',
    aiVisibility: 48,
    position: 9,
    aiRevenue: 2190,
    attributeMatrix: {
      price: {
        correct: true,
        claimedValue: '₪349',
        actualValue: '₪349',
      },
      specs: {
        correct: false,
        claimedValue: 'Universal fit, 2mm EVA',
        actualValue: 'Custom-impression fit, 3mm dual-layer EVA',
        claimId: 'shop-claim-2',
        correctHref: '/agents/new?intent=correct_attribute&claim_id=shop-claim-2',
      },
      availability: {
        correct: true,
        claimedValue: 'Ships in 7–10 business days',
        actualValue: 'Ships in 7–10 business days',
      },
    },
    shopperSentiment: { positive: 63, neutral: 28, negative: 9 },
  },
  {
    id: 'sku-sensitivity-toothpaste',
    name: 'Sensitivity Relief Toothpaste',
    aiVisibility: 41,
    position: 12,
    aiRevenue: 1380,
    attributeMatrix: {
      price: {
        correct: true,
        claimedValue: '₪42',
        actualValue: '₪42',
      },
      specs: {
        correct: true,
        claimedValue: '75ml, 5% potassium nitrate, fluoride',
        actualValue: '75ml, 5% potassium nitrate, fluoride',
      },
      availability: {
        correct: true,
        claimedValue: 'In stock',
        actualValue: 'In stock',
      },
    },
    shopperSentiment: { positive: 72, neutral: 21, negative: 7 },
  },
]

// ---------------------------------------------------------------------------
// Per-SKU drill rows
// ---------------------------------------------------------------------------

const drill: ShoppingDrillRow[] = [
  {
    skuId: 'sku-whitening-kit',
    engine: 'ChatGPT',
    queriesTested: [
      'best teeth whitening kit Israel',
      'at-home whitening kit dentist recommended Israel',
      'LED whitening kit cost Israel',
    ],
    positionTrend: [5, 4, 3, 3, 2],
    topCitedCompetitor: 'DentalStore.co.il',
  },
  {
    skuId: 'sku-sonic-brush',
    engine: 'Gemini',
    queriesTested: [
      'sonic electric toothbrush Israel',
      'best electric toothbrush for sensitivity Israel',
      'electric brush dentist recommended Ramat Gan',
    ],
    positionTrend: [7, 6, 5, 4, 4],
    topCitedCompetitor: 'Smile-Shop.co.il',
  },
  {
    skuId: 'sku-night-guard',
    engine: 'Perplexity',
    queriesTested: [
      'night guard for teeth grinding Israel',
      'custom dental night guard buy online Israel',
      'bruxism night guard cost Israel',
    ],
    positionTrend: [14, 12, 11, 10, 9],
    topCitedCompetitor: 'DentalStore.co.il',
  },
]

// ---------------------------------------------------------------------------
// Top-level export
// ---------------------------------------------------------------------------

export const DEMO_SHOPPING: DemoShopping = {
  aiAttributedRevenue: 21040,
  aiShoppingVisibility: 58,
  skus,
  drill,
}
