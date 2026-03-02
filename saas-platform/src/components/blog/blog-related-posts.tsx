import Link from 'next/link'
import type { BlogPost } from '@/lib/blog'
import { formatDate } from '@/lib/blog'

export function BlogRelatedPosts({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="border-t border-stone-200 pt-12">
      <h3 className="font-[family-name:var(--font-outfit)] font-bold text-2xl text-[#141310] mb-8">
        Related Articles
      </h3>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="bg-white rounded-[20px] border border-stone-200 p-6 hover:shadow-md transition-shadow group"
          >
            <span className="text-xs font-medium text-stone-400 capitalize mb-2 block">
              {(post.category ?? '').replace(/-/g, ' ')}
            </span>
            <h4 className="font-[family-name:var(--font-outfit)] font-bold text-lg text-[#141310] mb-2 group-hover:text-[#06B6D4] transition-colors leading-snug">
              {post.title}
            </h4>
            <p className="text-sm text-stone-500 leading-relaxed mb-3 line-clamp-2">
              {post.excerpt}
            </p>
            <span className="text-xs text-stone-400">
              {post.published_at ? formatDate(post.published_at) : 'Draft'}{' '}
              &middot; {post.reading_time_minutes} min read
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
