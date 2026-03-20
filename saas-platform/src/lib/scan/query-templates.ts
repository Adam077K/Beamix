/**
 * Industry-specific query templates for AI visibility scanning.
 *
 * Generates 2 natural, UNBRANDED queries per scan:
 *   Query 1 (broad):   "best [industry] in [location]"
 *   Query 2 (specific): "[customer problem] [service] in [location]"
 *
 * Business name is NOT included — we test organic visibility,
 * not whether an engine responds when directly asked about a brand.
 */

interface IndustryTemplate {
  /** Customer problems / needs (for specific query) */
  problems: string[]
  /** Service terms customers search for */
  services: string[]
  /** Optional broad query overrides */
  broadPrefixes?: string[]
}

const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  // Home services
  plumbing: { problems: ['emergency pipe repair', 'clogged drain fix', 'water heater installation'], services: ['plumber', 'plumbing service'] },
  electrical: { problems: ['electrical panel upgrade', 'outlet installation', 'emergency electrician'], services: ['electrician', 'electrical contractor'] },
  hvac: { problems: ['air conditioning repair', 'furnace installation', 'HVAC maintenance'], services: ['HVAC company', 'heating and cooling service'] },
  cleaning: { problems: ['deep house cleaning', 'move-out cleaning', 'office cleaning service'], services: ['cleaning company', 'maid service'] },
  landscaping: { problems: ['lawn care service', 'garden design', 'tree removal'], services: ['landscaper', 'landscaping company'] },
  roofing: { problems: ['roof repair after storm', 'roof replacement cost', 'roof leak fix'], services: ['roofing company', 'roofer'] },
  pest_control: { problems: ['termite treatment', 'bed bug removal', 'rodent control'], services: ['pest control company', 'exterminator'] },
  moving: { problems: ['local moving company', 'long distance movers', 'packing service'], services: ['moving company', 'movers'] },

  // Health & wellness
  dental: { problems: ['teeth cleaning appointment', 'dental implants cost', 'emergency dentist'], services: ['dentist', 'dental clinic'] },
  medical: { problems: ['family doctor accepting patients', 'urgent care clinic', 'annual checkup'], services: ['doctor', 'medical clinic', 'healthcare provider'] },
  therapy: { problems: ['anxiety therapist', 'couples counseling', 'child psychologist'], services: ['therapist', 'mental health counselor'] },
  chiropractic: { problems: ['back pain treatment', 'spine adjustment', 'sports injury chiropractor'], services: ['chiropractor', 'chiropractic clinic'] },
  veterinary: { problems: ['pet vaccination', 'emergency vet', 'dog dental cleaning'], services: ['veterinarian', 'vet clinic', 'animal hospital'] },
  fitness: { problems: ['personal trainer', 'gym membership deals', 'yoga classes'], services: ['gym', 'fitness center', 'personal training'] },
  spa: { problems: ['deep tissue massage', 'facial treatment', 'couples spa package'], services: ['spa', 'massage therapy', 'wellness center'] },

  // Food & hospitality
  restaurant: { problems: ['best dinner spot', 'restaurant with outdoor seating', 'group dining reservation'], services: ['restaurant', 'dining'] },
  catering: { problems: ['wedding catering', 'corporate lunch catering', 'event food service'], services: ['caterer', 'catering company'] },
  bakery: { problems: ['custom birthday cake', 'fresh bread delivery', 'gluten-free bakery'], services: ['bakery', 'cake shop'] },
  cafe: { problems: ['best coffee shop to work from', 'specialty coffee', 'brunch spot'], services: ['cafe', 'coffee shop'] },
  hotel: { problems: ['boutique hotel booking', 'hotel with pool', 'affordable accommodation'], services: ['hotel', 'accommodation', 'lodging'] },

  // Professional services
  legal: { problems: ['business lawyer consultation', 'contract review attorney', 'divorce lawyer'], services: ['lawyer', 'law firm', 'attorney'] },
  accounting: { problems: ['small business tax filing', 'bookkeeping service', 'CPA for startups'], services: ['accountant', 'CPA', 'accounting firm'] },
  insurance: { problems: ['business insurance quote', 'health insurance broker', 'auto insurance comparison'], services: ['insurance agent', 'insurance broker'] },
  real_estate: { problems: ['homes for sale', 'commercial property lease', 'real estate agent'], services: ['realtor', 'real estate agency'] },
  consulting: { problems: ['business strategy consultant', 'management consulting', 'IT consulting'], services: ['consultant', 'consulting firm'] },
  financial: { problems: ['financial advisor for retirement', 'investment planning', 'wealth management'], services: ['financial advisor', 'financial planner'] },

  // Technology
  software: { problems: ['custom software development', 'mobile app development', 'SaaS platform'], services: ['software company', 'software development agency'] },
  web_design: { problems: ['website redesign', 'ecommerce website development', 'WordPress developer'], services: ['web design agency', 'web developer'] },
  it_services: { problems: ['managed IT services', 'cybersecurity for small business', 'cloud migration'], services: ['IT company', 'IT support', 'MSP'] },
  marketing: { problems: ['digital marketing for small business', 'SEO agency', 'social media management'], services: ['marketing agency', 'digital marketing company'] },
  ai: { problems: ['AI tools for business', 'AI automation for SMB', 'AI search visibility'], services: ['AI company', 'AI platform', 'AI tool'], broadPrefixes: ['top', 'leading'] },

  // Automotive
  auto_repair: { problems: ['brake repair near me', 'oil change service', 'check engine light diagnostic'], services: ['auto mechanic', 'car repair shop', 'auto service center'] },
  car_dealer: { problems: ['used cars for sale', 'new car deals', 'certified pre-owned vehicles'], services: ['car dealership', 'auto dealer'] },
  auto_body: { problems: ['car dent repair', 'collision repair', 'paint job estimate'], services: ['auto body shop', 'collision center'] },

  // Education
  tutoring: { problems: ['math tutor for high school', 'SAT prep course', 'online tutoring'], services: ['tutor', 'tutoring service', 'learning center'] },
  school: { problems: ['private school enrollment', 'preschool near me', 'after school program'], services: ['school', 'academy', 'learning center'] },
  training: { problems: ['professional certification course', 'corporate training program', 'skills workshop'], services: ['training center', 'professional development'] },

  // Retail & ecommerce
  retail: { problems: ['gift ideas local shop', 'best deals near me', 'unique local products'], services: ['store', 'shop', 'retailer'] },
  ecommerce: { problems: ['buy online with fast shipping', 'best online store', 'product reviews'], services: ['online store', 'ecommerce shop'] },
  jewelry: { problems: ['engagement ring custom design', 'jewelry repair service', 'gold buyer'], services: ['jeweler', 'jewelry store'] },

  // Construction & trades
  construction: { problems: ['home renovation contractor', 'kitchen remodel estimate', 'general contractor'], services: ['construction company', 'contractor', 'builder'] },
  painting: { problems: ['house painting estimate', 'interior painter', 'commercial painting service'], services: ['painter', 'painting company'] },
  flooring: { problems: ['hardwood floor installation', 'tile flooring cost', 'carpet replacement'], services: ['flooring company', 'floor installer'] },

  // Creative & media
  photography: { problems: ['wedding photographer booking', 'corporate headshots', 'product photography'], services: ['photographer', 'photography studio'] },
  design: { problems: ['logo design service', 'brand identity design', 'graphic designer'], services: ['design agency', 'graphic designer'] },
  video: { problems: ['promotional video production', 'corporate video', 'video editing service'], services: ['video production company', 'videographer'] },

  // Events & entertainment
  events: { problems: ['event planner for corporate events', 'birthday party venue', 'conference organizer'], services: ['event planner', 'event management company'] },
  dj: { problems: ['wedding DJ booking', 'party DJ hire', 'event entertainment'], services: ['DJ', 'entertainment service'] },
  florist: { problems: ['wedding flowers arrangement', 'flower delivery same day', 'sympathy flowers'], services: ['florist', 'flower shop'] },
}

/** Fallback for industries not in the lookup */
const GENERAL_TEMPLATE: IndustryTemplate = {
  problems: ['recommended service provider', 'top rated company', 'affordable professional service'],
  services: ['company', 'service provider', 'business'],
}

/**
 * Generate 2 natural search queries for a visibility scan.
 * Returns [broadQuery, specificQuery].
 */
export function generateScanQueries(
  industry: string,
  location?: string | null,
): [string, string] {
  const key = industry.toLowerCase().replace(/[\s-]+/g, '_')
  const template = INDUSTRY_TEMPLATES[key] ?? GENERAL_TEMPLATE

  const locationClause = location ? ` in ${location}` : ''

  // Pick a random service term and problem for variety
  const service = template.services[Math.floor(Math.random() * template.services.length)]
  const problem = template.problems[Math.floor(Math.random() * template.problems.length)]
  const prefix = template.broadPrefixes
    ? template.broadPrefixes[Math.floor(Math.random() * template.broadPrefixes.length)]
    : 'best'

  const broadQuery = `${prefix} ${service}${locationClause}`
  const specificQuery = `${problem}${locationClause}`

  return [broadQuery, specificQuery]
}
