import type { Metadata } from 'next'
import { getPublishedPosts } from '@/lib/blog/queries'
import { BlogIndex } from './blog-index'

export const metadata: Metadata = {
  title: 'Blog — Beamix',
  description:
    'Learn about AI search visibility, GEO, and how to make your business findable by ChatGPT, Gemini, and other AI engines.',
  openGraph: {
    title: 'Blog — Beamix',
    description:
      'Learn about AI search visibility, GEO, and how to make your business findable by AI engines.',
    type: 'website',
  },
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return <BlogIndex initialPosts={posts} />
}
