import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlogPost, getRelatedPosts, formatDate } from '@/lib/blog'
import { BlogMarkdown } from '@/components/blog/blog-markdown'
import { BlogRelatedPosts } from '@/components/blog/blog-related-posts'
import { BeamixNav } from '@/components/landing/beamix-nav'
import { BeamixFooter } from '@/components/landing/beamix-footer'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return { title: 'Post Not Found | Beamix Blog' }

  return {
    title: post.seo_title || `${post.title} | Beamix Blog`,
    description: post.seo_description || post.excerpt,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: [post.author_name],
      ...(post.cover_image ? { images: [post.cover_image] } : {}),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()

  const relatedPosts = await getRelatedPosts(slug, post.category)

  return (
    <>
      <BeamixNav />
      <main className="min-h-screen bg-[#FAFAF8] pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-stone-400 mb-8">
            <Link href="/blog" className="hover:text-[#141310] transition-colors">
              Blog
            </Link>
            <span>/</span>
            <Link
              href={`/blog?category=${post.category}`}
              className="hover:text-[#141310] transition-colors capitalize"
            >
              {post.category.replace(/-/g, ' ')}
            </Link>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full capitalize">
                {post.category.replace(/-/g, ' ')}
              </span>
              <span className="text-xs text-stone-400">
                {post.reading_time_minutes} min read
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl text-[#141310] leading-tight mb-4">
              {post.title}
            </h1>

            <p className="text-lg text-stone-500 mb-6">{post.excerpt}</p>

            <div className="flex items-center gap-3 pb-8 border-b border-stone-200">
              <div className="w-10 h-10 rounded-full bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center font-[family-name:var(--font-outfit)] font-bold text-sm">
                {post.author_name
                  .split(' ')
                  .map(w => w[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#141310]">
                  {post.author_name}
                </p>
                <p className="text-xs text-stone-400">
                  {post.published_at ? formatDate(post.published_at) : 'Draft'}
                </p>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-stone prose-lg max-w-none mb-16">
            <BlogMarkdown content={post.content} />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12 pb-12 border-b border-stone-200">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* End CTA */}
          <div className="bg-[#141310] rounded-[20px] p-8 md:p-12 text-center mb-16">
            <h3 className="font-[family-name:var(--font-outfit)] font-bold text-2xl md:text-3xl text-white mb-3">
              See where your business stands on AI search
            </h3>
            <p className="text-stone-400 mb-6 max-w-lg mx-auto">
              Run a free scan across ChatGPT, Gemini, Perplexity, and Claude.
              Results in 60 seconds.
            </p>
            <Link
              href="/scan"
              className="inline-block bg-[#06B6D4] hover:bg-cyan-600 text-white font-semibold px-8 py-3 rounded-full transition-colors"
            >
              Start Free Scan &rarr;
            </Link>
          </div>
        </article>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-6xl mx-auto px-6">
            <BlogRelatedPosts posts={relatedPosts} />
          </section>
        )}
      </main>
      <BeamixFooter />
    </>
  )
}
