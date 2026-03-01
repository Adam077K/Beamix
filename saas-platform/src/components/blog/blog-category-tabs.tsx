'use client'
import Link from 'next/link'
import type { BLOG_CATEGORIES } from '@/lib/blog'

type Props = {
  categories: typeof BLOG_CATEGORIES
  activeCategory: string
}

export function BlogCategoryTabs({ categories, activeCategory }: Props) {
  return (
    <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map(cat => {
        const isActive = cat.slug === activeCategory
        return (
          <Link
            key={cat.slug}
            href={cat.slug === 'all' ? '/blog' : `/blog?category=${cat.slug}`}
            className={`whitespace-nowrap text-sm font-medium px-4 py-2 rounded-full transition-colors ${
              isActive
                ? 'bg-[#141310] text-white'
                : 'bg-white text-stone-500 hover:text-[#141310] border border-stone-200'
            }`}
          >
            {cat.label}
          </Link>
        )
      })}
    </div>
  )
}
