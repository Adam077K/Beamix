# Beamix — Blog Infrastructure Spec

> **Last synced:** March 2026 — aligned with 03-system-design/

**Version:** 1.1
**Date:** 2026-02-28
**Last Updated:** 2026-03-06 — synced with System Design v2.1
**Status:** Updated — Blog is built (Phase 11 complete). List page, [slug] page, 4 seed posts, markdown rendering.

> Goal: Drive organic SEO traffic. Publish manually + AI-generated + programmatic SEO content.
> Blog is planned but **not built in MVP**. This spec defines the full architecture to build from when ready.

---

## URL Structure

```
/blog                         — Index: featured post hero + grid + category tabs
/blog/[slug]                  — Individual post
/blog/category/[cat]          — Category filtered index
/blog/tag/[tag]               — Tag filtered index
/blog/sitemap.xml             — Auto-generated from published posts
```

---

## Database — `blog_posts` Table

```sql
CREATE TABLE public.blog_posts (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                 TEXT NOT NULL,
    slug                  TEXT NOT NULL UNIQUE,
    excerpt               TEXT,
    content               TEXT NOT NULL,          -- Markdown
    cover_image_url       TEXT,
    author_id             UUID REFERENCES public.user_profiles(id),
    status                TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'published', 'archived')),
    published_at          TIMESTAMPTZ,
    category              TEXT,
    tags                  TEXT[] DEFAULT '{}',
    seo_title             TEXT,
    seo_description       TEXT,
    og_image_url          TEXT,
    reading_time_minutes  INT GENERATED ALWAYS AS (
                            GREATEST(1, CEIL(
                              ARRAY_LENGTH(STRING_TO_ARRAY(content, ' '), 1)::FLOAT / 200
                            )::INT)
                          ) STORED,
    view_count            BIGINT NOT NULL DEFAULT 0,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX blog_posts_status_published_at_idx ON public.blog_posts(status, published_at DESC);
CREATE INDEX blog_posts_slug_idx ON public.blog_posts(slug);
CREATE INDEX blog_posts_category_idx ON public.blog_posts(category) WHERE status = 'published';
CREATE INDEX blog_posts_tags_idx ON public.blog_posts USING GIN(tags);
```

**RLS:**
```sql
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public: read published posts only
CREATE POLICY "blog_posts: public read published"
    ON public.blog_posts
    FOR SELECT
    USING (status = 'published');

-- Authenticated admin: full access (check is_admin on user_profiles)
CREATE POLICY "blog_posts: admin full access"
    ON public.blog_posts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
```

---

## Content Sources

### 1. Manual
Write in the CMS at `/dashboard/blog`. Markdown editor, preview pane, SEO fields, publish button.

### 2. AI-Generated (BlogAgent)
`BlogAgent` creates a full draft based on a topic prompt + relevant scan queries found in customer data.
- Draft saved to `blog_posts` with `status = 'draft'`
- Human reviews in `/dashboard/blog` → approves → publishes
- Agent context: industry trends, queries that real users ask AI engines, competitor content gaps

### 3. Programmatic SEO
Templates with variable injection. Each template = one function that generates Markdown from variables.
Batch-create posts for [Engine × Industry × City] permutations.

---

## Programmatic SEO Templates

### Template 1: `geo-ranking-engine-industry-city`
**Pattern:** "How [Engine] Ranks [Industry] Businesses in [City]"
**Target keywords:** `chatgpt local [industry] [city]`, `how gemini ranks [industry]`
**Variables:** `engine`, `industry`, `city`, `year`
**Structure:**
1. H1: How [Engine] Ranks [Industry] Businesses in [City] ([Year] Guide)
2. What is AI search ranking (brief, 100 words)
3. How [Engine] specifically evaluates [industry] businesses
4. Top 5 ranking factors for [industry] in [city]
5. Case study: before/after (anonymized)
6. CTA: "See how your [industry] business ranks on [engine] →"

### Template 2: `geo-audit-industry-city`
**Pattern:** "GEO Audit: [Industry] in [City] — Who Wins on AI Search"
**Variables:** `industry`, `city`, `competitors[]` (top 5 from public data)
**Structure:**
1. H1: GEO Audit: [Industry] Businesses in [City] on AI Search
2. Methodology (how we tested)
3. Results table (business name, engines mentioned, score range)
4. What the winners do differently (3 patterns)
5. How to improve your ranking
6. CTA: "Get your free GEO audit →"

### Template 3: `invisible-engine-industry`
**Pattern:** "Why [Engine] Never Mentions Your [Industry] Business (And How to Fix It)"
**Variables:** `engine`, `industry`, `fix_steps[]`
**Structure:**
1. H1: Why [Engine] Never Mentions Your [Industry] Business
2. How [engine] selects which businesses to recommend
3. The 3 most common reasons [industry] businesses are invisible
4. Step-by-step fix (each step = one `fix_step`)
5. CTA: "Check if [engine] knows your business exists →"

### Template 4: `vs-competitor-ai-search`
**Pattern:** "[Business A] vs [Business B] — Who Wins on AI Search?"
**Variables:** `business_a`, `business_b`, `city`, `industry`
**Note:** Only use for non-controversial, publicly visible comparisons.

### Template 5: `ai-search-guide-industry`
**Pattern:** "The Complete Guide to AI Search Visibility for [Industry] Businesses"
**Variables:** `industry`, `city`, `engine_list[]`
**Structure:** Comprehensive 2000+ word guide. High intent, high value.

---

## Next.js Implementation

### File Structure
```
app/
  blog/
    page.tsx                    — /blog index
    [slug]/
      page.tsx                  — /blog/[slug] post
    category/
      [cat]/
        page.tsx                — /blog/category/[cat]
    tag/
      [tag]/
        page.tsx                — /blog/tag/[tag]
    sitemap.xml/
      route.ts                  — dynamic sitemap
  dashboard/
    blog/
      page.tsx                  — CMS list view
      new/
        page.tsx                — create post
      [id]/
        edit/
          page.tsx              — edit post
```

### Static Generation (ISR)
```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')
  return data?.map(({ slug }) => ({ slug })) ?? []
}

export const revalidate = 3600  // Revalidate every hour
```

**On-demand ISR:** When a post is published/updated in the CMS:
```typescript
// In publish API route:
await fetch(`/api/revalidate?path=/blog/${slug}&secret=${REVALIDATE_SECRET}`)
```

### Markdown Rendering
```typescript
// Use: next-mdx-remote + remark-gfm
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'

<MDXRemote
  source={post.content}
  options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
/>
```

### Images
Stored in Supabase Storage bucket: `blog-images/`
```typescript
// Upload via Supabase Storage API
// Public URL: process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/blog-images/' + filename
```

---

## Pages Spec

### `/blog` — Index Page

**Layout:**
```
[Featured Post — full-width hero card]
[Category tabs: All | GEO | AI Search | Local SEO | Case Studies]
[Post grid — 3 columns desktop, 1 mobile]
[Pagination — 12 posts per page]
```

**SEO:**
```typescript
export const metadata = {
  title: 'Beamix Blog — AI Search Visibility for Local Businesses',
  description: 'Learn how to rank on ChatGPT, Gemini, Perplexity, and more.',
  openGraph: { ... }
}
```

---

### `/blog/[slug]` — Post Page

**Layout:**
```
[Breadcrumb: Home > Blog > Category > Post Title]
[Cover image]
[Title + Author + Date + Reading time]
[Table of Contents — auto-generated from H2/H3 headings]
[Article body — Markdown rendered]
  ... after ~500 words ...
  [Mid-article CTA block]
  ... continues ...
[End-of-article CTA block]
[Related posts — 3 cards, same category]
[Social share: Twitter/X, LinkedIn, Copy link]
```

**CTA Blocks (injected automatically, not in Markdown):**
```tsx
// Mid-article CTA
<div className="my-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
  <p className="font-semibold">See where your business ranks on AI search</p>
  <p className="text-sm text-gray-600">Free scan — no credit card required</p>
  <a href="/" className="btn-primary mt-3">Check My AI Visibility →</a>
</div>

// End CTA
<div className="mt-12 rounded-xl bg-gray-900 p-8 text-white">
  <h3>Ready to rank on ChatGPT, Gemini, and Perplexity?</h3>
  <a href="/" className="btn-white mt-4">Get Your Free Scan →</a>
</div>
```

**Structured Data:**
```typescript
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.seo_title ?? post.title,
  description: post.seo_description ?? post.excerpt,
  datePublished: post.published_at,
  dateModified: post.updated_at,
  author: { '@type': 'Person', name: authorName },
  publisher: {
    '@type': 'Organization',
    name: 'Beamix',
    logo: { '@type': 'ImageObject', url: 'https://beamix.io/logo.png' }
  },
  image: post.og_image_url ?? post.cover_image_url,
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beamix.io' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://beamix.io/blog' },
    { '@type': 'ListItem', position: 3, name: post.category, item: `https://beamix.io/blog/category/${post.category}` },
    { '@type': 'ListItem', position: 4, name: post.title },
  ]
}
```

**`generateMetadata()`:**
```typescript
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt,
    openGraph: {
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      images: [{ url: post.og_image_url ?? post.cover_image_url }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.excerpt,
      images: [post.og_image_url ?? post.cover_image_url],
    },
    alternates: { canonical: `https://beamix.io/blog/${post.slug}` },
  }
}
```

---

### `/blog/sitemap.xml`

```typescript
// app/blog/sitemap.xml/route.ts
export async function GET() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  const urls = posts?.map(p => `
    <url>
      <loc>https://beamix.io/blog/${p.slug}</loc>
      <lastmod>${new Date(p.updated_at).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>
  `).join('') ?? ''

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://beamix.io/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${urls}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}
```

---

## CMS — `/dashboard/blog`

**List view:**
- Table: Title | Status | Category | Published Date | Views | Actions
- Filters: All / Draft / Published / Archived
- Search by title
- "New Post" button → `/dashboard/blog/new`

**Create/Edit view:**
- Left: Markdown editor (CodeMirror with syntax highlighting)
- Right: Live preview + SEO fields panel
  - SEO Title (character count, 60 char limit)
  - SEO Description (160 char limit)
  - OG Image upload
  - Tags (comma-separated)
  - Category dropdown
  - Slug (auto-generated, editable)
- Bottom bar: Save Draft | Preview | Publish | Schedule

**Publish flow:**
1. Click "Publish" → sets `status = 'published'`, `published_at = now()`
2. API triggers on-demand ISR revalidation
3. Post appears on `/blog` within seconds

---

## `robots.txt`

```
User-agent: *
Allow: /blog
Allow: /blog/
Disallow: /dashboard/blog
Disallow: /api/
```

---

## Implementation Priority

When ready to build blog:

1. DB: `blog_posts` table + RLS (already in db-schema-spec.md)
2. CMS: `/dashboard/blog` create/edit (basic Markdown editor)
3. Public pages: `/blog` index + `/blog/[slug]` post page
4. SEO: `generateMetadata()` + sitemap + structured data
5. Programmatic SEO: Template functions + batch-create script
6. BlogAgent integration: auto-draft from agent output

**Dependencies:** Auth system, Dashboard layout, Supabase setup
