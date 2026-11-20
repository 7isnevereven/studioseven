import { getCoverUrl, NewsItem, Project, isNewsScheduled, isProjectScheduled } from '@/data/projects'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import NewsPageClient from './NewsPageClient'
import { supabase } from '@/utils/supabase'
import { NEWS as SEED_NEWS, PROJECTS as SEED_PROJECTS } from '@/data/seedData'

export const dynamic = 'force-dynamic'

async function getNewsItem(id: string): Promise<NewsItem | null> {
  try {
    const { data, error } = await supabase.from('news').select('*').eq('id', id).single()
    if (!error && data) {
      return {
        id: data.id,
        headline: data.headline,
        preview: data.preview || '',
        body: data.body,
        date: data.date,
        projectId: data.project_id || undefined,
        url: data.url || undefined,
        image: data.image || undefined,
      }
    }
  } catch (err) {
    console.warn(`[getNewsItem] Supabase query failed for ${id}, falling back:`, err)
  }
  const fallback = SEED_NEWS.find(n => n.id === id)
  return fallback || null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const item = await getNewsItem(id)

  if (item && item.headline) {
    if (isNewsScheduled(item)) {
      return { title: 'Not Found — studioseven' }
    }
    return {
      title: `${item.headline} — studioseven`,
      description: item.preview || item.headline,
    }
  }

  return { title: 'Newsroom — studioseven' }
}

export default async function NewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getNewsItem(id)

  if (!item) {
    notFound()
  }

  // If item is scheduled for future release, it is not yet posted publicly
  if (isNewsScheduled(item)) {
    notFound()
  }

  let project: Project | undefined = undefined
  if (item.projectId) {
    try {
      const { data: pData } = await supabase.from('projects').select('*').eq('id', item.projectId).single()
      if (pData && !isProjectScheduled(pData)) {
        project = {
          id: pData.id,
          title: pData.title,
          subtitle: pData.subtitle || '',
          description: pData.description || '',
          releasedAt: pData.released_at || '',
          releaseLabel: pData.release_label || '',
          artistId: pData.artist_id || '',
          coverFile: pData.cover_file || '',
          accentColor: pData.accent_color || '#38bdf8',
          accentSoft: pData.accent_soft || '#0284c7',
          spotifyUrl: pData.spotify_url || undefined,
          youtubeUrl: pData.youtube_url || undefined,
          tracks: Array.isArray(pData.tracks) ? pData.tracks : [],
          history: Array.isArray(pData.history) ? pData.history : [],
        }
      }
    } catch {}
    if (!project) {
      project = SEED_PROJECTS.find(p => p.id === item.projectId && (!isProjectScheduled(p) || p.allowPreview))
    }
  }

  const imageUrl = item.image ? getCoverUrl(item.image) : (project ? getCoverUrl(project.coverFile) : '')

  return <NewsPageClient item={item} project={project} imageUrl={imageUrl} />
}
