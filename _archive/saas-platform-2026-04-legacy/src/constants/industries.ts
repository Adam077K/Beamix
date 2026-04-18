export interface Industry {
  value: string
  label: string
  heLabel: string
}

export const INDUSTRIES = [
  { value: 'insurance', label: 'Insurance', heLabel: 'ביטוח' },
  { value: 'legal', label: 'Legal / Law Firm', heLabel: 'משרד עורכי דין' },
  { value: 'real_estate', label: 'Real Estate', heLabel: 'נדל"ן' },
  { value: 'healthcare', label: 'Healthcare / Medical', heLabel: 'רפואה / בריאות' },
  { value: 'finance', label: 'Finance / Accounting', heLabel: 'פיננסים / ראיית חשבון' },
  { value: 'moving', label: 'Moving & Relocation', heLabel: 'הובלות ומעבר דירה' },
  { value: 'restaurant', label: 'Restaurant / Food', heLabel: 'מסעדות / אוכל' },
  { value: 'beauty', label: 'Beauty & Wellness', heLabel: 'יופי וטיפוח' },
  { value: 'tech', label: 'Technology / Software', heLabel: 'טכנולוגיה' },
  { value: 'education', label: 'Education / Tutoring', heLabel: 'חינוך' },
  { value: 'construction', label: 'Construction & Renovation', heLabel: 'בנייה ושיפוצים' },
  { value: 'automotive', label: 'Automotive', heLabel: 'רכב' },
  { value: 'retail', label: 'Retail / E-commerce', heLabel: 'קמעונאות' },
  { value: 'hospitality', label: 'Hotel & Hospitality', heLabel: 'מלונאות ואירוח' },
  { value: 'marketing', label: 'Marketing & Advertising', heLabel: 'שיווק ופרסום' },
  { value: 'accounting', label: 'Accounting & Tax', heLabel: 'חשבונאות ומיסים' },
  { value: 'cleaning', label: 'Cleaning Services', heLabel: 'שירותי ניקיון' },
  { value: 'photography', label: 'Photography & Events', heLabel: 'צילום ואירועים' },
  { value: 'fitness', label: 'Fitness & Sports', heLabel: 'כושר וספורט' },
  { value: 'childcare', label: 'Childcare & Education', heLabel: 'חינוך ילדים' },
  { value: 'security', label: 'Security Services', heLabel: 'שירותי אבטחה' },
  { value: 'logistics', label: 'Logistics & Transport', heLabel: 'לוגיסטיקה והובלה' },
  { value: 'dental', label: 'Dental Practice', heLabel: 'רפואת שיניים' },
  { value: 'veterinary', label: 'Veterinary', heLabel: 'וטרינרי' },
  { value: 'other', label: 'Other', heLabel: 'אחר' },
] as const

export type IndustryValue = (typeof INDUSTRIES)[number]['value']

export const INDUSTRY_PROMPTS: Record<string, string[]> = {
  insurance: [
    'What are the best insurance companies in {location}?',
    'Which insurance agent should I use in {location}?',
    'Top rated insurance brokers near {location}',
  ],
  legal: [
    'Best law firms in {location}',
    'Top lawyers for business in {location}',
    'Recommended attorneys near {location}',
  ],
  real_estate: [
    'Best real estate agents in {location}',
    'Top property agents near {location}',
    'Who to use for buying a home in {location}',
  ],
  healthcare: [
    'Best doctors in {location}',
    'Top medical clinics in {location}',
    'Recommended healthcare providers near {location}',
  ],
  finance: [
    'Best financial advisors in {location}',
    'Top accounting firms in {location}',
    'Recommended financial planners near {location}',
  ],
  moving: [
    'Best moving companies in {location}',
    'Top rated movers near {location}',
    'Recommended relocation services in {location}',
  ],
  restaurant: [
    'Best restaurants in {location}',
    'Top rated dining in {location}',
    'Where to eat in {location}',
  ],
  beauty: [
    'Best beauty salons in {location}',
    'Top rated spa and wellness near {location}',
    'Recommended beauty treatments in {location}',
  ],
  tech: [
    'Best software companies in {location}',
    'Top IT services providers in {location}',
    'Recommended tech companies near {location}',
  ],
  education: [
    'Best tutoring services in {location}',
    'Top rated educational centers near {location}',
    'Recommended learning programs in {location}',
  ],
  construction: [
    'Best construction companies in {location}',
    'Top rated renovation contractors near {location}',
    'Recommended builders in {location}',
  ],
  automotive: [
    'Best car repair shops in {location}',
    'Top rated auto mechanics near {location}',
    'Recommended car dealers in {location}',
  ],
  retail: [
    'Best shops in {location}',
    'Top rated stores near {location}',
    'Where to shop in {location}',
  ],
  hospitality: [
    'Best hotels in {location}',
    'Top rated accommodation near {location}',
    'Where to stay in {location}',
  ],
  marketing: [
    'Best marketing agencies in {location}',
    'Top advertising firms near {location}',
    'Recommended digital marketing in {location}',
  ],
  accounting: [
    'Best accountants in {location}',
    'Top rated tax advisors near {location}',
    'Recommended bookkeeping services in {location}',
  ],
  cleaning: [
    'Best cleaning services in {location}',
    'Top rated house cleaners near {location}',
    'Recommended cleaning companies in {location}',
  ],
  photography: [
    'Best photographers in {location}',
    'Top rated event photography near {location}',
    'Recommended photography studios in {location}',
  ],
  fitness: [
    'Best gyms in {location}',
    'Top rated fitness centers near {location}',
    'Recommended personal trainers in {location}',
  ],
  childcare: [
    'Best daycare centers in {location}',
    'Top rated childcare providers near {location}',
    'Recommended preschools in {location}',
  ],
  security: [
    'Best security companies in {location}',
    'Top rated security services near {location}',
    'Recommended security firms in {location}',
  ],
  logistics: [
    'Best logistics companies in {location}',
    'Top rated transport services near {location}',
    'Recommended delivery companies in {location}',
  ],
  dental: [
    'Best dentists in {location}',
    'Top rated dental clinics near {location}',
    'Recommended dental care in {location}',
  ],
  veterinary: [
    'Best veterinary clinics in {location}',
    'Top rated vets near {location}',
    'Recommended animal hospitals in {location}',
  ],
  other: [
    'Best {industry} services in {location}',
    'Top rated {industry} providers near {location}',
    'Recommended {industry} companies in {location}',
  ],
}

export const INDUSTRY_COMPETITORS: Record<string, string[]> = {
  insurance: ['Harel Insurance', 'Phoenix Group', 'Migdal Insurance', 'AIG Israel', 'Clal Insurance'],
  legal: ['Goldfarb Gross Seligman', 'Herzog Fox & Neeman', 'Shibolet & Co', 'Fisher Behar Chen Well', 'Yigal Arnon & Co'],
  real_estate: ['ReMax', 'Keller Williams', 'Engel & Volkers', 'Sothebys Realty', 'Coldwell Banker'],
  healthcare: ['Maccabi Health', 'Clalit Health', 'Meuhedet', 'Leumit Health', 'Assuta Medical'],
  finance: ['Deloitte', 'PwC', 'KPMG', 'Ernst & Young', 'BDO'],
  moving: ['Movex', 'Moovers', 'Top Movers', 'City Moving', 'Express Relocations'],
  restaurant: ["McDonald's", "Domino's Pizza", 'Pizza Hut', 'Burger King', 'Subway'],
  beauty: ['Be Salon', 'Glam Studio', 'Pure Beauty', 'La Belle', 'Beauty Bar'],
  tech: ['Wix', 'Monday.com', 'Check Point', 'CyberArk', 'Fiverr'],
  education: ['Kumon', 'Sylvan Learning', 'Mathnasium', 'Tutor Doctor', 'Club Z'],
  construction: ['Shikun & Binui', 'Ashtrom', 'Electra', 'Minrav', 'Shapir'],
  automotive: ['Toyota', 'Hyundai', 'Kia', 'Mazda', 'Honda'],
  retail: ['IKEA', 'H&M', 'Zara', 'Shufersal', 'Rami Levy'],
  hospitality: ['Dan Hotels', 'Fattal Hotels', 'Isrotel', 'Atlas Hotels', 'Brown Hotels'],
  marketing: ['Publicis', 'McCann', 'Gitam BBDO', 'ACW Grey', 'Saatchi & Saatchi'],
  accounting: ['Kesselman & Kesselman', 'Somekh Chaikin', 'Brightman Almagor', 'Ernst & Young Israel', 'BDO Ziv Haft'],
  cleaning: ['Clean House', 'Sparkle Clean', 'Fresh Start', 'ProClean', 'Crystal Clear'],
  photography: ['Studio One', 'Lens Masters', 'Click Studio', 'Photo Art', 'Moment Studios'],
  fitness: ['Holmes Place', 'Gym City', 'CrossFit', 'Planet Fitness', 'Gold Gym'],
  childcare: ['KinderCare', 'Bright Horizons', 'Goddard School', 'Primrose Schools', 'Learning Tree'],
  security: ['G4S', 'Securitas', 'Mikud', 'Hashmira', 'Modi\'in Ezrahi'],
  logistics: ['DHL', 'FedEx', 'UPS', 'Elta', 'Baldar'],
  dental: ['Dental Care', 'SmileClinic', 'DentaPlan', 'Oral Health', 'TeethFirst'],
  veterinary: ['VetPet', 'Animal Care', 'PetVet', 'Happy Tails', 'AllPets'],
  other: [],
}

export function getIndustryLabel(value: string, lang: 'en' | 'he' = 'en'): string {
  const industry = INDUSTRIES.find((i) => i.value === value)
  if (!industry) return value
  return lang === 'he' ? industry.heLabel : industry.label
}

export function getIndustryPrompts(value: string, location: string): string[] {
  const templates = INDUSTRY_PROMPTS[value] ?? INDUSTRY_PROMPTS.other
  return templates.map((t) => t.replace('{location}', location).replace('{industry}', value))
}
