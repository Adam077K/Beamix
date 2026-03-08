import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Clock, ArrowRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { getPostBySlug, getRelatedPosts } from '@/lib/blog/queries'
import { Badge } from '@/components/ui/badge'
import { BeamixNav } from '@/components/landing/beamix-nav'
import { BeamixFooter } from '@/components/landing/beamix-footer'
import { BLOG_CATEGORIES } from '@/lib/blog/types'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found — Beamix' }
  }

  return {
    title: post.og_title ?? `${post.title} — Beamix Blog`,
    description: post.meta_description ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.og_title ?? post.title,
      description: post.og_description ?? post.excerpt ?? undefined,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      images: post.og_image_url ? [{ url: post.og_image_url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.og_title ?? post.title,
      description: post.og_description ?? post.excerpt ?? undefined,
    },
    alternates: {
      canonical: post.canonical_url ?? `/blog/${post.slug}`,
    },
  }
}

function categoryLabel(category: string): string {
  const found = BLOG_CATEGORIES.find((c) => c.value === category)
  return found?.label ?? category
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.category, post.slug, 3)

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <BeamixNav />

      <article className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-[#141310] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Badge
              variant="secondary"
              className="bg-cyan-50 text-cyan-700 border-0 text-xs font-medium"
            >
              {categoryLabel(post.category ?? '')}
            </Badge>
          </div>

          <h1 className="font-[family-name:var(--font-outfit)] font-bold text-3xl md:text-4xl lg:text-[42px] text-[#141310] leading-tight mb-5">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-stone-400">
            <span className="font-medium text-stone-600">Beamix Team</span>
            <span className="w-1 h-1 rounded-full bg-stone-300" />
            <time dateTime={post.published_at ?? ''}>
              {post.published_at
                ? format(new Date(post.published_at), 'MMMM d, yyyy')
                : 'Draft'}
            </time>
            <span className="w-1 h-1 rounded-full bg-stone-300" />
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.reading_time_minutes} min read
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-stone prose-lg max-w-none
          prose-headings:font-[family-name:var(--font-outfit)] prose-headings:text-[#141310]
          prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
          prose-p:text-stone-600 prose-p:leading-relaxed
          prose-a:text-cyan-600 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[#141310]
          prose-li:text-stone-600
          prose-blockquote:border-l-cyan-500 prose-blockquote:text-stone-500
          prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-stone-900 prose-pre:text-stone-100
          prose-hr:border-stone-200
        ">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-cyan-50 to-stone-50 rounded-[20px] border border-cyan-100 p-8 md:p-10 text-center">
          <h3 className="font-[family-name:var(--font-outfit)] font-bold text-2xl text-[#141310] mb-3">
            Want to rank like this?
          </h3>
          <p className="text-stone-500 mb-6 max-w-lg mx-auto">
            See how AI search engines see your business. Get a free visibility scan in under 2 minutes.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-[#06B6D4] hover:bg-cyan-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Try Beamix Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-xl text-[#141310] mb-6">
            Related Articles
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                href={`/blog/${related.slug}`}
                className="group block bg-white rounded-[20px] border border-[#E7E5E4] overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-cyan-50 to-stone-100 flex items-center justify-center">
                  <span className="text-3xl text-stone-300 font-[family-name:var(--font-outfit)] font-bold">
                    B
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <Badge
                    variant="secondary"
                    className="bg-cyan-50 text-cyan-700 border-0 text-xs font-medium"
                  >
                    {categoryLabel(related.category ?? '')}
                  </Badge>
                  <h4 className="font-[family-name:var(--font-outfit)] font-semibold text-[#141310] leading-snug group-hover:text-cyan-600 transition-colors">
                    {related.title}
                  </h4>
                  <p className="text-sm text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {related.reading_time_minutes} min read
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <BeamixFooter />
    </div>
  )
}
