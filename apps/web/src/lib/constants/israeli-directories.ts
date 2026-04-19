/**
 * Israeli directory seed list — for Off-Site Presence Builder agent reference.
 * Source: Board decisions 2026-04-15.
 */
export interface IsraeliDirectory {
  name: string
  url: string
  category: 'general' | 'reviews' | 'marketplace' | 'local'
  priority: 'high' | 'medium'
}

export const ISRAELI_DIRECTORIES: IsraeliDirectory[] = [
  {
    name: 'd.co.il',
    url: 'https://d.co.il',
    category: 'general',
    priority: 'high',
  },
  {
    name: 'Easy.co.il',
    url: 'https://easy.co.il',
    category: 'local',
    priority: 'high',
  },
  {
    name: 'Rest.co.il',
    url: 'https://rest.co.il',
    category: 'reviews',
    priority: 'high',
  },
  {
    name: 'Bizmap / B144',
    url: 'https://b144.co.il',
    category: 'general',
    priority: 'high',
  },
  {
    name: 'Zap.co.il',
    url: 'https://zap.co.il',
    category: 'marketplace',
    priority: 'medium',
  },
]

export const ISRAELI_DIRECTORY_NAMES = ISRAELI_DIRECTORIES.map((d) => d.name)
