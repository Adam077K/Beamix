import { createClient } from '@/lib/supabase/server'
import type { BlogPost } from './types'
import { SEED_POSTS } from './seed-posts'

export async function getPublishedPosts(category?: string): Promise<BlogPost[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      return filterSeedPosts(category)
    }

    return data as unknown as BlogPost[]
  } catch {
    return filterSeedPosts(category)
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !data) {
      return SEED_POSTS.find((p) => p.slug === slug) ?? null
    }

    return data as unknown as BlogPost
  } catch {
    return SEED_POSTS.find((p) => p.slug === slug) ?? null
  }
}

export async function getRelatedPosts(
  category: string,
  excludeSlug: string,
  limit: number = 3
): Promise<BlogPost[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .eq('category', category)
      .neq('slug', excludeSlug)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error || !data || data.length === 0) {
      return SEED_POSTS
        .filter((p) => p.category === category && p.slug !== excludeSlug)
        .slice(0, limit)
    }

    return data as unknown as BlogPost[]
  } catch {
    return SEED_POSTS
      .filter((p) => p.category === category && p.slug !== excludeSlug)
      .slice(0, limit)
  }
}

export async function getAllPublishedSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published')

    if (error || !data || data.length === 0) {
      return SEED_POSTS.map((p) => ({ slug: p.slug, updated_at: p.updated_at }))
    }

    return data as { slug: string; updated_at: string }[]
  } catch {
    return SEED_POSTS.map((p) => ({ slug: p.slug, updated_at: p.updated_at }))
  }
}

function filterSeedPosts(category?: string): BlogPost[] {
  if (!category || category === 'all') {
    return SEED_POSTS
  }
  return SEED_POSTS.filter((p) => p.category === category)
}
