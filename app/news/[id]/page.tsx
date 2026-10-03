import { NEWS, PROJECTS, getCoverUrl, formatTimeAgo, NewsItem } from '@/data/projects'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import NewsPageClient from './NewsPageClient'

export async function generateStaticParams() {
  return NEWS.map((item) => ({ id: item.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const item = NEWS.find((n) => n.id === id)
  if (!item) return { title: 'Not Found' }
  return {
    title: `${item.headline} — studioseven`,
    description: item.preview,
  }
}

export default async function NewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = NEWS.find((n) => n.id === id)
  if (!item) notFound()

  const project = PROJECTS.find((p) => p.id === item!.projectId)
  const imageUrl = item!.image ? getCoverUrl(item!.image) : (project ? getCoverUrl(project.coverFile) : '')

  return <NewsPageClient item={item!} project={project} imageUrl={imageUrl} />
}
