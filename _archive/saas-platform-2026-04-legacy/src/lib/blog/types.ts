export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  author_id: string | null
  author_name: string
  author_avatar_url: string | null
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  published_at: string | null
  category: string | null
  tags: string[] | null
  lang: string
  meta_description: string | null
  canonical_url: string | null
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  structured_data: Record<string, unknown> | null
  reading_time_minutes: number | null
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
