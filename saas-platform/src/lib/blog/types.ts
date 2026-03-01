export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  author_id: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  category: string
  tags: string[]
  seo_title: string | null
  seo_description: string | null
  og_image_url: string | null
  reading_time_minutes: number
  view_count: number
  created_at: string
  updated_at: string
}

export type BlogCategory = 'all' | 'geo' | 'ai-search' | 'smb-tips' | 'case-studies'

export const BLOG_CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'geo', label: 'GEO' },
  { value: 'ai-search', label: 'AI Search' },
  { value: 'smb-tips', label: 'SMB Tips' },
  { value: 'case-studies', label: 'Case Studies' },
]
