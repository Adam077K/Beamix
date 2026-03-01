'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Clock, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { BeamixNav } from '@/components/landing/beamix-nav'
import { BeamixFooter } from '@/components/landing/beamix-footer'
import type { BlogPost, BlogCategory } from '@/lib/blog/types'
import { BLOG_CATEGORIES } from '@/lib/blog/types'

interface BlogIndexProps {
  initialPosts: BlogPost[]
}

function categoryLabel(category: string): string {
  const found = BLOG_CATEGORIES.find((c) => c.value === category)
  return found?.label ?? category
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-[20px] border border-[#E7E5E4] overflow-hidden
                 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="aspect-[16/9] bg-gradient-to-br from-cyan-50 to-stone-100 flex items-center justify-center">
        <span className="text-4xl text-stone-300 font-[family-name:var(--font-outfit)] font-bold">
          B
        </span>
      </div>
      <div className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-cyan-50 text-cyan-700 border-0 text-xs font-medium"
          >
            {categoryLabel(post.category)}
          </Badge>
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.reading_time_minutes} min read
          </span>
        </div>
        <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-lg text-[#141310] leading-snug group-hover:text-cyan-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between pt-2">
          <time className="text-xs text-stone-400" dateTime={post.published_at ?? ''}>
            {post.published_at
              ? format(new Date(post.published_at), 'MMM d, yyyy')
              : 'Draft'}
          </time>
          <span className="text-sm font-medium text-cyan-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Read more <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function FeaturedPostHero({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-[20px] border border-[#E7E5E4] overflow-hidden
                 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="grid md:grid-cols-2 gap-0">
        <div className="aspect-[16/9] md:aspect-auto bg-gradient-to-br from-cyan-100 to-stone-100 flex items-center justify-center min-h-[280px]">
          <span className="text-7xl text-stone-200 font-[family-name:var(--font-outfit)] font-bold">
            B
          </span>
        </div>
        <div className="p-8 md:p-10 flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="bg-cyan-50 text-cyan-700 border-0 text-xs font-medium"
            >
              {categoryLabel(post.category)}
            </Badge>
            <span className="text-xs text-stone-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.reading_time_minutes} min read
            </span>
          </div>
          <h2 className="font-[family-name:var(--font-outfit)] font-bold text-2xl md:text-3xl text-[#141310] leading-tight group-hover:text-cyan-600 transition-colors">
            {post.title}
          </h2>
          <p className="text-stone-500 leading-relaxed">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-4 pt-2">
            <time className="text-sm text-stone-400" dateTime={post.published_at ?? ''}>
              {post.published_at
                ? format(new Date(post.published_at), 'MMM d, yyyy')
                : 'Draft'}
            </time>
            <span className="text-sm font-semibold text-cyan-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Read article <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function BlogIndex({ initialPosts }: BlogIndexProps) {
  const [activeCategory, setActiveCategory] = useState<BlogCategory>('all')

  const filteredPosts =
    activeCategory === 'all'
      ? initialPosts
      : initialPosts.filter((p) => p.category === activeCategory)

  const featuredPost = filteredPosts[0] ?? null
  const remainingPosts = filteredPosts.slice(1)

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <BeamixNav />

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl text-[#141310] mb-4">
            Blog
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto">
            Insights on AI search visibility, GEO strategy, and growing your business in the age of AI.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.value
                  ? 'bg-[#141310] text-white'
                  : 'bg-white text-stone-600 border border-[#E7E5E4] hover:border-stone-300 hover:text-[#141310]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-400 text-lg">No posts in this category yet.</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && <FeaturedPostHero post={featuredPost} />}

            {/* Grid */}
            {remainingPosts.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {remainingPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <BeamixFooter />
    </div>
  )
}
