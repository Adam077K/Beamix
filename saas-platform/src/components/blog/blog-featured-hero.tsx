import Link from 'next/link'
import type { BlogPost } from '@/lib/blog'
import { formatDate } from '@/lib/blog'

export function BlogFeaturedHero({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block bg-white rounded-[20px] border border-stone-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-12 group"
    >
      <div className="grid md:grid-cols-2 gap-0">
        {/* Image / placeholder */}
        <div className="bg-gradient-to-br from-cyan-50 to-stone-100 min-h-[280px] flex items-center justify-center">
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-[family-name:var(--font-outfit)] font-bold">B</span>
              </div>
              <p className="text-sm text-stone-400 font-medium">Featured Post</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
              Featured
            </span>
            <span className="text-xs font-medium text-stone-400 capitalize">
              {post.category.replace(/-/g, ' ')}
            </span>
          </div>

          <h2 className="font-[family-name:var(--font-outfit)] font-bold text-2xl md:text-3xl text-[#141310] mb-3 group-hover:text-[#06B6D4] transition-colors">
            {post.title}
          </h2>

          <p className="text-stone-500 leading-relaxed mb-6">{post.excerpt}</p>

          <div className="flex items-center gap-4 text-sm text-stone-400">
            <span>{post.author_name}</span>
            <span>&middot;</span>
            <span>{post.published_at ? formatDate(post.published_at) : 'Draft'}</span>
            <span>&middot;</span>
            <span>{post.reading_time_minutes} min read</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
