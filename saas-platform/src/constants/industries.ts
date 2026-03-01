export interface Industry {
  id: string
  label: string
  labelHe: string
  icon: string
}

export const INDUSTRIES: Industry[] = [
  { id: 'restaurants', label: 'Restaurants & Cafes', labelHe: 'מסעדות ובתי קפה', icon: 'UtensilsCrossed' },
  { id: 'beauty', label: 'Beauty & Wellness', labelHe: 'יופי ובריאות', icon: 'Sparkles' },
  { id: 'fitness', label: 'Fitness & Sports', labelHe: 'כושר וספורט', icon: 'Dumbbell' },
  { id: 'healthcare', label: 'Healthcare & Medical', labelHe: 'בריאות ורפואה', icon: 'Heart' },
  { id: 'legal', label: 'Legal Services', labelHe: 'שירותים משפטיים', icon: 'Scale' },
  { id: 'accounting', label: 'Accounting & Finance', labelHe: 'הנהלת חשבונות ופיננסים', icon: 'Calculator' },
  { id: 'real-estate', label: 'Real Estate', labelHe: 'נדל"ן', icon: 'Building2' },
  { id: 'home-services', label: 'Home Services', labelHe: 'שירותי בית', icon: 'Wrench' },
  { id: 'auto', label: 'Automotive', labelHe: 'רכב', icon: 'Car' },
  { id: 'education', label: 'Education & Tutoring', labelHe: 'חינוך והוראה', icon: 'GraduationCap' },
  { id: 'retail', label: 'Retail & Shopping', labelHe: 'קמעונאות וקניות', icon: 'ShoppingBag' },
  { id: 'technology', label: 'Technology & IT', labelHe: 'טכנולוגיה ומחשוב', icon: 'Laptop' },
  { id: 'marketing', label: 'Marketing & Advertising', labelHe: 'שיווק ופרסום', icon: 'Megaphone' },
  { id: 'travel', label: 'Travel & Tourism', labelHe: 'תיירות ונסיעות', icon: 'Plane' },
  { id: 'photography', label: 'Photography & Video', labelHe: 'צילום ווידאו', icon: 'Camera' },
  { id: 'events', label: 'Events & Entertainment', labelHe: 'אירועים ובידור', icon: 'PartyPopper' },
  { id: 'construction', label: 'Construction & Renovation', labelHe: 'בנייה ושיפוצים', icon: 'HardHat' },
  { id: 'pet-services', label: 'Pet Services', labelHe: 'שירותי חיות מחמד', icon: 'PawPrint' },
  { id: 'cleaning', label: 'Cleaning Services', labelHe: 'שירותי ניקיון', icon: 'SprayCan' },
  { id: 'consulting', label: 'Consulting', labelHe: 'ייעוץ', icon: 'Briefcase' },
  { id: 'insurance', label: 'Insurance', labelHe: 'ביטוח', icon: 'Shield' },
  { id: 'food-delivery', label: 'Food & Delivery', labelHe: 'מזון ומשלוחים', icon: 'Truck' },
  { id: 'fashion', label: 'Fashion & Apparel', labelHe: 'אופנה וביגוד', icon: 'Shirt' },
  { id: 'other', label: 'Other', labelHe: 'אחר', icon: 'MoreHorizontal' },
] as const

export type IndustryId = (typeof INDUSTRIES)[number]['id']

export function getIndustryById(id: string): Industry | undefined {
  return INDUSTRIES.find((industry) => industry.id === id)
}

export function getIndustryLabel(id: string, lang: 'en' | 'he' = 'en'): string {
  const industry = getIndustryById(id)
  if (!industry) return id
  return lang === 'he' ? industry.labelHe : industry.label
}
