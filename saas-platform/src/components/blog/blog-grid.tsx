import Link from 'next/link'
import type { BlogPost } from '@/lib/blog'
import { formatDate } from '@/lib/blog'

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="bg-white rounded-[20px] border border-stone-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col"
        >
          {/* Image / placeholder */}
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 h-48 flex items-center justify-center">
            {post.cover_image_url ? (
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center">
                <span className="text-lg font-[family-name:var(--font-outfit)] font-bold">B</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-stone-400 capitalize">
                {(post.category ?? '').replace(/-/g, ' ')}
              </span>
              <span className="text-xs text-stone-300">&middot;</span>
              <span className="text-xs text-stone-400">
                {post.reading_time_minutes} min
              </span>
            </div>

            <h3 className="font-[family-name:var(--font-outfit)] font-bold text-lg text-[#141310] mb-2 group-hover:text-[#06B6D4] transition-colors leading-snug">
              {post.title}
            </h3>

            <p className="text-sm text-stone-500 leading-relaxed mb-4 flex-1 line-clamp-3">
              {post.excerpt}
            </p>

            <div className="text-xs text-stone-400">
              {post.published_at ? formatDate(post.published_at) : 'Draft'}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
