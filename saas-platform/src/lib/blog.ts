import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/types/database.types'

export type BlogPost = Tables<'blog_posts'>

export const BLOG_CATEGORIES = [
  { slug: 'all', label: 'All Posts' },
  { slug: 'geo-strategy', label: 'GEO Strategy' },
  { slug: 'ai-search', label: 'AI Search' },
  { slug: 'case-studies', label: 'Case Studies' },
  { slug: 'product-updates', label: 'Product Updates' },
  { slug: 'guides', label: 'Guides' },
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]['slug']

export async function getBlogPosts(category?: string): Promise<BlogPost[]> {
  const supabase = await createClient()
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
  return data ?? []
}

export async function getFeaturedPost(): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) return null
  return data
}

export async function getRelatedPosts(
  currentSlug: string,
  category: string,
  limit = 3
): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data ?? []
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('is_published', true)

    if (error) return []
    return (data ?? []).map(p => p.slug)
  } catch {
    return []
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
