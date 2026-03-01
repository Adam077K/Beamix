import { Metadata } from 'next'
import { getBlogPosts, getFeaturedPost, BLOG_CATEGORIES } from '@/lib/blog'
import { BlogFeaturedHero } from '@/components/blog/blog-featured-hero'
import { BlogGrid } from '@/components/blog/blog-grid'
import { BlogCategoryTabs } from '@/components/blog/blog-category-tabs'
import { BeamixNav } from '@/components/landing/beamix-nav'
import { BeamixFooter } from '@/components/landing/beamix-footer'

export const metadata: Metadata = {
  title: 'Blog | Beamix — AI Search Visibility Insights',
  description:
    'Learn about Generative Engine Optimization, AI search trends, and strategies to improve your business visibility on ChatGPT, Gemini, and Perplexity.',
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const category = params.category || 'all'
  const [featuredPost, posts] = await Promise.all([
    getFeaturedPost(),
    getBlogPosts(category),
  ])

  const nonFeaturedPosts =
    category === 'all' && featuredPost
      ? posts.filter(p => p.slug !== featuredPost.slug)
      : posts

  return (
    <>
      <BeamixNav />
      <main className="min-h-screen bg-[#FAFAF8] pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">
              Blog
            </p>
            <h1 className="font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl text-[#141310] mb-4">
              AI Visibility Insights
            </h1>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">
              Strategies, case studies, and guides to help your business get
              found on AI search engines.
            </p>
          </div>

          {/* Featured hero - only on "all" tab */}
          {category === 'all' && featuredPost && (
            <BlogFeaturedHero post={featuredPost} />
          )}

          {/* Category tabs */}
          <BlogCategoryTabs
            categories={BLOG_CATEGORIES}
            activeCategory={category}
          />

          {/* Post grid */}
          {nonFeaturedPosts.length > 0 ? (
            <BlogGrid posts={nonFeaturedPosts} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                <span className="text-2xl text-stone-400">&#9997;</span>
              </div>
              <h3 className="font-[family-name:var(--font-outfit)] font-bold text-xl text-[#141310] mb-2">
                No posts yet in this category
              </h3>
              <p className="text-stone-500 text-sm max-w-sm">
                We are working on new content. Check back soon or explore other
                categories.
              </p>
            </div>
          )}
        </div>
      </main>
      <BeamixFooter />
    </>
  )
}
