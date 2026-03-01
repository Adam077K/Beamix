import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ category: string }>
}

export default async function BlogCategoryPage({ params }: Props) {
  const { category } = await params
  redirect(`/blog?category=${encodeURIComponent(category)}`)
}
